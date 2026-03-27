import "dotenv/config";
import { defineConfig } from "drizzle-kit";
const databaseUrl = process.env.DATABASE_URL ?? "./teknikos.db";
const isPostgres = /^(postgres|postgresql):/i.test(databaseUrl);
export default defineConfig({
    dialect: isPostgres ? "postgresql" : "sqlite",
    schema: "./src/db/schema.ts",
    out: "./drizzle",
    dbCredentials: {
        url: databaseUrl,
    },
});
