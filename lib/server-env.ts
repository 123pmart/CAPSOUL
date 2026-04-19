function readFirstDefined(...values: Array<string | undefined>) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

export function getCapsoulDatabaseUrl() {
  return readFirstDefined(
    process.env.CAPSOUL_DATABASE_URL,
    process.env.POSTGRES_URL,
    process.env.DATABASE_URL,
  );
}

export function hasPersistentDatabase() {
  return Boolean(getCapsoulDatabaseUrl());
}

export function hasBlobStorage() {
  return Boolean(readFirstDefined(process.env.BLOB_READ_WRITE_TOKEN));
}

export function canUseLegacyMutableFallback() {
  return process.env.NODE_ENV !== "production" && !hasPersistentDatabase();
}

export function getSessionSecret() {
  const sessionSecret = readFirstDefined(process.env.CAPSOUL_SESSION_SECRET);

  if (process.env.NODE_ENV === "production" && !sessionSecret) {
    throw new Error("CAPSOUL_SESSION_SECRET is required in production.");
  }

  return sessionSecret ?? "capsoul-dev-session-secret-change-me";
}

export function getInitialAdminPassword() {
  return readFirstDefined(process.env.CAPSOUL_INITIAL_ADMIN_PASSWORD) ?? "password";
}

