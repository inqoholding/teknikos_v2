import { randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import dotenv from "dotenv";
import { hashPassword } from "better-auth/crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.resolve(__dirname, "..");
const projectRoot = path.resolve(backendDir, "..");
const envPath = path.join(backendDir, ".env");

dotenv.config({ path: envPath });

const requiredKeys = [
  "DATABASE_URL",
  "ADMIN_EMAIL",
  "MODERATOR_EMAIL",
  "DEMO_OWNER_EMAIL",
];

for (const key of requiredKeys) {
  if (!process.env[key]) {
    throw new Error(`Missing required env key: ${key}`);
  }
}

function generatePassword(prefix) {
  return `${prefix}!${randomBytes(12).toString("base64url")}`;
}

function replaceEnvValue(source, key, value) {
  const pattern = new RegExp(`^${key}=.*$`, "m");
  if (!pattern.test(source)) {
    throw new Error(`Env key not found in ${envPath}: ${key}`);
  }

  return source.replace(pattern, `${key}=${value}`);
}

const nextPasswords = {
  ADMIN_PASSWORD: generatePassword("Admin"),
  MODERATOR_PASSWORD: generatePassword("Moderator"),
  DEMO_OWNER_PASSWORD: generatePassword("Owner"),
};

const emailToEnvKey = new Map([
  [process.env.ADMIN_EMAIL, "ADMIN_PASSWORD"],
  [process.env.MODERATOR_EMAIL, "MODERATOR_PASSWORD"],
  [process.env.DEMO_OWNER_EMAIL, "DEMO_OWNER_PASSWORD"],
]);

const db = new Database(process.env.DATABASE_URL);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

const credentialRows = db
  .prepare(
    `
      SELECT u.id AS userId, u.email AS email, a.id AS accountId
      FROM user u
      JOIN account a ON a.user_id = u.id
      WHERE a.provider_id = 'credential'
        AND u.email IN (?, ?, ?)
    `,
  )
  .all(process.env.ADMIN_EMAIL, process.env.MODERATOR_EMAIL, process.env.DEMO_OWNER_EMAIL);

if (credentialRows.length !== 3) {
  throw new Error(`Expected 3 credential users, found ${credentialRows.length}`);
}

const updateAccount = db.prepare("UPDATE account SET password = ?, updated_at = ? WHERE id = ?");
const deleteSessions = db.prepare("DELETE FROM session WHERE user_id = ?");

const updates = [];
for (const row of credentialRows) {
  const envPasswordKey = emailToEnvKey.get(row.email);
  if (!envPasswordKey) {
    throw new Error(`Unexpected email in credential rotation: ${row.email}`);
  }

  updates.push({
    accountId: row.accountId,
    userId: row.userId,
    hashedPassword: await hashPassword(nextPasswords[envPasswordKey]),
  });
}

db.transaction(() => {
  const now = Date.now();
  for (const update of updates) {
    updateAccount.run(update.hashedPassword, now, update.accountId);
    deleteSessions.run(update.userId);
  }
})();

let envSource = fs.readFileSync(envPath, "utf8");
for (const [key, value] of Object.entries(nextPasswords)) {
  envSource = replaceEnvValue(envSource, key, value);
}
fs.writeFileSync(envPath, envSource);

const secretDir = "/root/teknikos-secrets";
fs.mkdirSync(secretDir, { recursive: true, mode: 0o700 });
const timestamp = new Date().toISOString().replace(/[:]/g, "-");
const outputPath = path.join(secretDir, `credentials-${timestamp}.txt`);
const latestPath = path.join(secretDir, "latest-credentials.txt");
const output = [
  `PROJECT_ROOT=${projectRoot}`,
  `BASE_URL=${process.env.FRONTEND_URL ?? ""}`,
  `ADMIN_EMAIL=${process.env.ADMIN_EMAIL}`,
  `ADMIN_PASSWORD=${nextPasswords.ADMIN_PASSWORD}`,
  `MODERATOR_EMAIL=${process.env.MODERATOR_EMAIL}`,
  `MODERATOR_PASSWORD=${nextPasswords.MODERATOR_PASSWORD}`,
  `DEMO_OWNER_EMAIL=${process.env.DEMO_OWNER_EMAIL}`,
  `DEMO_OWNER_PASSWORD=${nextPasswords.DEMO_OWNER_PASSWORD}`,
].join("\n");

fs.writeFileSync(outputPath, `${output}\n`, { mode: 0o600 });
fs.writeFileSync(latestPath, `${output}\n`, { mode: 0o600 });

console.log(`Credentials rotated for 3 users.`);
console.log(`Saved credentials to ${latestPath}`);
