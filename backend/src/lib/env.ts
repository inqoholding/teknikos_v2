import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().default("./teknikos.db"),
  BETTER_AUTH_SECRET: z.string().min(16),
  BETTER_AUTH_URL: z.string().url(),
  FRONTEND_URL: z.string().url(),
  DEMO_OWNER_EMAIL: z.string().email().default("budi@example.com"),
  DEMO_OWNER_PASSWORD: z.string().min(8).default("password123"),
  ADMIN_EMAIL: z.string().email().default("admin@teknikos.id"),
  ADMIN_PASSWORD: z.string().min(8).default("Admin12345!"),
  MODERATOR_EMAIL: z.string().email().default("moderator@teknikos.id"),
  MODERATOR_PASSWORD: z.string().min(8).default("Moderator123!"),
  WAHA_URL: z.string().url().optional(),
  WAHA_API_KEY: z.string().min(16).optional(),
  WAHA_SESSION_NAME: z.string().default("default"),
});

export const env = envSchema.parse(process.env);
