import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { detectDatabaseDialect } from "./src/db/runtime";

const databaseUrl = process.env.DATABASE_URL ?? "./teknikos.db";
const dialect = detectDatabaseDialect(databaseUrl);

export default defineConfig({
  dialect: dialect === "sqlite" ? "sqlite" : "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: databaseUrl,
  },
});
