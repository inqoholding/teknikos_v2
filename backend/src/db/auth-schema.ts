import { env } from "../lib/env.js";
import { detectDatabaseDialect } from "./runtime.js";
import * as pgSchema from "./auth-schema.pg.js";
import * as sqliteSchema from "./auth-schema.sqlite.js";

const schema = detectDatabaseDialect(env.DATABASE_URL) === "sqlite" ? sqliteSchema : pgSchema;

export const user = schema.user as typeof sqliteSchema.user;
export const session = schema.session as typeof sqliteSchema.session;
export const account = schema.account as typeof sqliteSchema.account;
export const verification = schema.verification as typeof sqliteSchema.verification;
