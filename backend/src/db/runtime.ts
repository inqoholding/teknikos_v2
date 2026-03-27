import path from "node:path";

const POSTGRES_PROTOCOLS = new Set(["postgres:", "postgresql:"]);

export function detectDatabaseDialect(databaseUrl: string) {
  try {
    const parsed = new URL(databaseUrl);
    return POSTGRES_PROTOCOLS.has(parsed.protocol) ? "pg" : "sqlite";
  } catch {
    return "sqlite";
  }
}

export function resolveSqlitePath(databaseUrl: string) {
  if (!databaseUrl || databaseUrl === ":memory:") {
    return databaseUrl || ":memory:";
  }

  if (databaseUrl.startsWith("file:")) {
    return databaseUrl.slice("file:".length);
  }

  if (path.isAbsolute(databaseUrl)) {
    return databaseUrl;
  }

  return path.resolve(process.cwd(), databaseUrl);
}

