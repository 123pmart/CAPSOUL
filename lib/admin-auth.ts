import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import path from "path";

import { ensureDatabaseReady, getDatabaseClient } from "@/lib/database";
import { readOptionalLegacyJson } from "@/lib/legacy-import";
import { canUseLegacyMutableFallback, getInitialAdminPassword, getSessionSecret, hasPersistentDatabase } from "@/lib/server-env";
import { DATA_ROOT, readJsonFile, writeJsonFile } from "@/lib/storage";

export type AdminUserRecord = {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
};

export type PublicAdminUser = {
  id: string;
  username: string;
  updatedAt: string;
};

export type AdminProfileUpdateInput = {
  username?: string;
  currentPassword: string;
  newPassword?: string;
};

export class AdminAuthConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminAuthConfigurationError";
  }
}

const ADMIN_USERS_FILE = path.join(DATA_ROOT, "admin-users.json");
export const ADMIN_SESSION_COOKIE = "capsoul_admin_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 7;
const persistentAdminSeedKey = Symbol.for("capsoul.persistent-admin-seed");

type PersistentAdminRow = {
  id: string;
  username: string;
  password_hash: string;
  created_at: string | Date;
  updated_at: string | Date;
};

function toIsoString(value: string | Date) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function normalizeUsername(username: string) {
  return username.trim();
}

function toPublicAdmin(user: AdminUserRecord): PublicAdminUser {
  return {
    id: user.id,
    username: user.username,
    updatedAt: user.updatedAt,
  };
}

function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  const derivedKey = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

function verifyPassword(password: string, passwordHash: string) {
  const [salt, storedHash] = passwordHash.split(":");

  if (!salt || !storedHash) {
    return false;
  }

  const derivedKey = scryptSync(password, salt, 64);
  const storedBuffer = Buffer.from(storedHash, "hex");

  if (storedBuffer.length !== derivedKey.length) {
    return false;
  }

  return timingSafeEqual(storedBuffer, derivedKey);
}

function signValue(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

export function getSessionTokenFromCookieHeader(cookieHeader: string | null) {
  return (
    cookieHeader
      ?.split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${ADMIN_SESSION_COOKIE}=`))
      ?.slice(`${ADMIN_SESSION_COOKIE}=`.length) ?? null
  );
}

function createDefaultAdmins(): AdminUserRecord[] {
  const timestamp = new Date().toISOString();
  const initialPassword = getInitialAdminPassword();

  return [
    {
      id: "admin-1",
      username: "admin1",
      passwordHash: hashPassword(initialPassword),
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "admin-2",
      username: "admin2",
      passwordHash: hashPassword(initialPassword),
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];
}

export function assertAdminLoginConfiguration() {
  try {
    getSessionSecret();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "CAPSOUL_SESSION_SECRET is required.";
    throw new AdminAuthConfigurationError(message);
  }

  // Production auth must use persistent storage on Vercel. We keep the legacy
  // JSON fallback available only for local development workspaces.
  if (hasPersistentDatabase()) {
    return;
  }

  if (process.env.NODE_ENV === "production") {
    throw new AdminAuthConfigurationError(
      "Persistent database storage is required for admin login in production.",
    );
  }

  if (!canUseLegacyMutableFallback()) {
    throw new AdminAuthConfigurationError("Admin storage is not configured.");
  }
}

async function listLegacyAdminUsers() {
  const existingUsers = await readJsonFile<AdminUserRecord[]>(ADMIN_USERS_FILE, []);

  if (existingUsers.length > 0) {
    return existingUsers;
  }

  const defaultUsers = createDefaultAdmins();
  await writeJsonFile(ADMIN_USERS_FILE, defaultUsers);
  return defaultUsers;
}

async function ensurePersistentAdminsSeeded() {
  if (!hasPersistentDatabase()) {
    return;
  }

  const globalState = globalThis as unknown as typeof globalThis &
    Record<PropertyKey, Promise<void> | undefined>;

  if (!globalState[persistentAdminSeedKey]) {
    globalState[persistentAdminSeedKey] = (async () => {
      await ensureDatabaseReady();
      const sql = getDatabaseClient();
      const existingRows = await sql<{ id: string; username: string }[]>`
        SELECT id, username
        FROM admins
      `;

      const legacyUsers =
        (await readOptionalLegacyJson<AdminUserRecord[]>("admin-users.json")) ?? createDefaultAdmins();
      const existingIds = new Set(existingRows.map((row) => row.id));
      const existingUsernames = new Set(
        existingRows.map((row) => row.username.trim().toLowerCase()),
      );

      for (const user of legacyUsers) {
        if (
          existingIds.has(user.id) ||
          existingUsernames.has(user.username.trim().toLowerCase())
        ) {
          continue;
        }

        await sql`
          INSERT INTO admins (id, username, password_hash, created_at, updated_at)
          VALUES (${user.id}, ${user.username}, ${user.passwordHash}, ${user.createdAt}, ${user.updatedAt})
          ON CONFLICT (id) DO NOTHING
        `;
      }
    })();
  }

  await globalState[persistentAdminSeedKey];
}

function mapPersistentAdmin(row: PersistentAdminRow): AdminUserRecord {
  return {
    id: row.id,
    username: row.username,
    passwordHash: row.password_hash,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

export async function listAdminUsers() {
  if (hasPersistentDatabase()) {
    await ensurePersistentAdminsSeeded();
    const sql = getDatabaseClient();
    const rows = await sql<PersistentAdminRow[]>`
      SELECT id, username, password_hash, created_at, updated_at
      FROM admins
      ORDER BY created_at ASC
    `;

    return rows.map(mapPersistentAdmin);
  }

  if (canUseLegacyMutableFallback()) {
    return listLegacyAdminUsers();
  }

  throw new AdminAuthConfigurationError("Admin storage is not configured.");
}

export async function authenticateAdmin(username: string, password: string) {
  assertAdminLoginConfiguration();
  const normalizedUsername = normalizeUsername(username).toLowerCase();
  const users = await listAdminUsers();

  if (users.length === 0) {
    throw new AdminAuthConfigurationError("No admin accounts are available.");
  }

  const match = users.find((user) => user.username.toLowerCase() === normalizedUsername);

  if (!match || !verifyPassword(password, match.passwordHash)) {
    return null;
  }

  return toPublicAdmin(match);
}

export function createAdminSessionToken(userId: string) {
  const payload = Buffer.from(
    JSON.stringify({
      userId,
      expiresAt: Date.now() + ADMIN_SESSION_MAX_AGE * 1000,
    }),
  ).toString("base64url");

  return `${payload}.${signValue(payload)}`;
}

function parseAdminSessionToken(token: string) {
  const [payload, signature] = token.split(".");

  if (!payload || !signature || signature !== signValue(payload)) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      userId?: string;
      expiresAt?: number;
    };

    if (!parsed.userId || !parsed.expiresAt || parsed.expiresAt < Date.now()) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function getCurrentAdminFromSessionToken(token?: string | null) {
  if (!token) {
    return null;
  }

  const session = parseAdminSessionToken(token);

  if (!session?.userId) {
    return null;
  }

  const users = await listAdminUsers();
  const match = users.find((user) => user.id === session.userId);

  return match ? toPublicAdmin(match) : null;
}

export async function getCurrentAdminFromCookieStore(cookieStore: {
  get(name: string): { value: string } | undefined;
}) {
  return getCurrentAdminFromSessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function updateAdminProfile(userId: string, input: AdminProfileUpdateInput) {
  if (hasPersistentDatabase()) {
    await ensurePersistentAdminsSeeded();
    const sql = getDatabaseClient();
    const normalizedUsername = normalizeUsername(input.username ?? "");
    const nextPassword = input.newPassword?.trim() ?? "";

    const users = await sql<PersistentAdminRow[]>`
      SELECT id, username, password_hash, created_at, updated_at
      FROM admins
      WHERE id = ${userId}
      LIMIT 1
    `;

    const targetUser = users[0];

    if (!targetUser) {
      throw new Error("Admin account not found.");
    }

    if (!verifyPassword(input.currentPassword, targetUser.password_hash)) {
      throw new Error("Current password is incorrect.");
    }

    const effectiveUsername = normalizedUsername || targetUser.username;

    if (!effectiveUsername) {
      throw new Error("Username cannot be empty.");
    }

    const conflictingUsers = await sql<{ id: string }[]>`
      SELECT id
      FROM admins
      WHERE LOWER(username) = LOWER(${effectiveUsername})
        AND id <> ${userId}
      LIMIT 1
    `;

    if (conflictingUsers.length > 0) {
      throw new Error("That username is already in use.");
    }

    if (nextPassword && nextPassword.length < 6) {
      throw new Error("New password must be at least 6 characters.");
    }

    const updatedPasswordHash = nextPassword
      ? hashPassword(nextPassword)
      : targetUser.password_hash;
    const updatedAt = new Date().toISOString();

    const updatedRows = await sql<PersistentAdminRow[]>`
      UPDATE admins
      SET username = ${effectiveUsername},
          password_hash = ${updatedPasswordHash},
          updated_at = ${updatedAt}
      WHERE id = ${userId}
      RETURNING id, username, password_hash, created_at, updated_at
    `;

    const updatedUser = updatedRows[0];

    if (!updatedUser) {
      throw new Error("Unable to update the admin account.");
    }

    return toPublicAdmin(mapPersistentAdmin(updatedUser));
  }

  if (!canUseLegacyMutableFallback()) {
    throw new Error("Persistent admin storage is not configured.");
  }

  const users = await listAdminUsers();
  const userIndex = users.findIndex((entry) => entry.id === userId);

  if (userIndex === -1) {
    throw new Error("Admin account not found.");
  }

  const targetUser = users[userIndex];

  if (!verifyPassword(input.currentPassword, targetUser.passwordHash)) {
    throw new Error("Current password is incorrect.");
  }

  const nextUsername = normalizeUsername(input.username ?? targetUser.username);
  const nextPassword = input.newPassword?.trim() ?? "";

  if (!nextUsername) {
    throw new Error("Username cannot be empty.");
  }

  const usernameTaken = users.some(
    (entry, index) =>
      index !== userIndex && entry.username.toLowerCase() === nextUsername.toLowerCase(),
  );

  if (usernameTaken) {
    throw new Error("That username is already in use.");
  }

  if (nextPassword && nextPassword.length < 6) {
    throw new Error("New password must be at least 6 characters.");
  }

  const updatedUser: AdminUserRecord = {
    ...targetUser,
    username: nextUsername,
    passwordHash: nextPassword ? hashPassword(nextPassword) : targetUser.passwordHash,
    updatedAt: new Date().toISOString(),
  };

  users[userIndex] = updatedUser;
  await writeJsonFile(ADMIN_USERS_FILE, users);

  return toPublicAdmin(updatedUser);
}
