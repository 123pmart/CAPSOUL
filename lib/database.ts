import postgres from "postgres";

import { getCapsoulDatabaseUrl, hasPersistentDatabase } from "@/lib/server-env";

type DatabaseClient = postgres.Sql<Record<string, unknown>>;

declare global {
  // eslint-disable-next-line no-var
  var __capsoulDbClient__: DatabaseClient | undefined;
}

let databaseInitPromise: Promise<void> | null = null;

function createDatabaseClient() {
  const databaseUrl = getCapsoulDatabaseUrl();

  if (!databaseUrl) {
    throw new Error("Persistent database storage is not configured.");
  }

  return postgres(databaseUrl, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 15,
    prepare: false,
  });
}

export function getDatabaseClient() {
  if (!hasPersistentDatabase()) {
    throw new Error("Persistent database storage is not configured.");
  }

  if (!global.__capsoulDbClient__) {
    global.__capsoulDbClient__ = createDatabaseClient();
  }

  return global.__capsoulDbClient__;
}

async function initializeDatabase() {
  const sql = getDatabaseClient();

  await sql`
    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS admins_username_lower_idx
    ON admins (LOWER(username))
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      region TEXT NOT NULL,
      film_for TEXT NOT NULL,
      relationship TEXT NOT NULL,
      still_living TEXT NOT NULL,
      timeline TEXT NOT NULL,
      story_importance TEXT NOT NULL,
      filming_location TEXT NOT NULL,
      faith_context TEXT NOT NULL,
      extra_notes TEXT NOT NULL,
      status TEXT NOT NULL,
      submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS leads_submitted_at_idx
    ON leads (submitted_at DESC)
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS site_content (
      content_key TEXT PRIMARY KEY,
      content JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS media_slots (
      slot_id TEXT PRIMARY KEY,
      blob_url TEXT NOT NULL,
      blob_pathname TEXT,
      content_type TEXT,
      size_bytes BIGINT,
      original_name TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_by TEXT NOT NULL
    )
  `;
}

export async function ensureDatabaseReady() {
  if (!hasPersistentDatabase()) {
    return false;
  }

  if (!databaseInitPromise) {
    databaseInitPromise = initializeDatabase();
  }

  await databaseInitPromise;
  return true;
}

