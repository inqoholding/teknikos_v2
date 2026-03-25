import { webcrypto } from "node:crypto";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/index.js";
import * as schema from "../db/schema.js";
import { env } from "./env.js";
import { getTrustedOrigins } from "./origins.js";

if (!globalThis.crypto) {
  globalThis.crypto = webcrypto as Crypto;
}

export const auth: ReturnType<typeof betterAuth> = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  basePath: "/api/auth",
  trustedOrigins: getTrustedOrigins(),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  rateLimit: {
    enabled: false,
  },
  advanced: {
    useSecureCookies: env.BETTER_AUTH_URL.startsWith("https://"),
    cookiePrefix: "teknikos",
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "owner",
      },
      businessId: {
        type: "string",
        required: false,
      },
      phone: {
        type: "string",
        required: false,
      },
    },
  },
});
