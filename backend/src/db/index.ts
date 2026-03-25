import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { env } from "../lib/env.js";

const { Pool } = pg;
const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

export const db = drizzle(pool);
