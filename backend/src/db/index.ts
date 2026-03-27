import Database from "better-sqlite3";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import pg from "pg";
import { env } from "../lib/env.js";
import { detectDatabaseDialect, resolveSqlitePath } from "./runtime.js";
import * as schema from "./schema.js";

const { Pool } = pg;

export const databaseDialect = detectDatabaseDialect(env.DATABASE_URL);

const sqlite = new Database(databaseDialect === "sqlite" ? resolveSqlitePath(env.DATABASE_URL) : ":memory:");
const sqliteDb = drizzleSqlite(sqlite, { schema });

if (databaseDialect === "sqlite") {
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
}

const pool =
  databaseDialect === "pg"
    ? new Pool({
        connectionString: env.DATABASE_URL,
      })
    : null;

const pgDb = pool ? drizzlePg(pool, { schema: schema as any }) : null;

export const db = (databaseDialect === "sqlite" ? sqliteDb : pgDb) as typeof sqliteDb;
