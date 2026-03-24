import fs from "node:fs";

const baseUrl = process.argv[2] || "http://127.0.0.1:3001";
const envFile = process.argv[3] || "/var/www/teknikos/backend/.env";
const CSRF_HEADER_NAME = "x-teknikos-csrf";
const CSRF_HEADER_VALUE = "1";

const env = Object.fromEntries(
  fs
    .readFileSync(envFile, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index), line.slice(index + 1)];
    }),
);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function logPass(message) {
  console.log(`PASS ${message}`);
}

function createClient() {
  let cookie = "";

  return {
    async request(path, init = {}) {
      const headers = new Headers(init.headers || {});
      if (!headers.has("Content-Type") && init.body) {
        headers.set("Content-Type", "application/json");
      }
      if (cookie) {
        headers.set("Cookie", cookie);
      }

      const response = await fetch(`${baseUrl}${path}`, { ...init, headers });
      const setCookie = response.headers.get("set-cookie");
      if (setCookie) {
        cookie = setCookie.split(",").map((part) => part.split(";")[0].trim()).join("; ");
      }

      const text = await response.text();
      let json = null;
      try {
        json = text ? JSON.parse(text) : null;
      } catch {
        json = null;
      }

      return { response, text, json };
    },
  };
}

async function login(client, email, password) {
  const result = await client.request("/api/auth/sign-in/email", {
    method: "POST",
    headers: {
      [CSRF_HEADER_NAME]: CSRF_HEADER_VALUE,
    },
    body: JSON.stringify({ email, password }),
  });
  assert(result.response.ok, `Login failed for ${email}: ${result.text}`);
}

async function main() {
  const owner = createClient();
  const admin = createClient();
  const moderator = createClient();

  const noCsrfLogin = await fetch(`${baseUrl}/api/auth/sign-in/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD }),
  });
  assert(noCsrfLogin.status === 403, "Auth without CSRF header should be blocked.");
  logPass("csrf enforced on auth");

  await login(owner, env.DEMO_OWNER_EMAIL, env.DEMO_OWNER_PASSWORD);
  await login(admin, env.ADMIN_EMAIL, env.ADMIN_PASSWORD);
  await login(moderator, env.MODERATOR_EMAIL, env.MODERATOR_PASSWORD);
  logPass("login owner/admin/moderator");

  const ownerAdminRead = await owner.request("/api/admin/subscriptions");
  assert(ownerAdminRead.response.status === 403, "Owner should not access admin subscriptions.");
  logPass("owner blocked from admin read");

  const adminList = await admin.request("/api/admin/subscriptions");
  assert(adminList.response.ok, "Admin should read admin subscriptions.");
  const businessId = adminList.json?.data?.[0]?.id;
  assert(businessId, "Missing business id for admin regression test.");
  logPass("admin read subscriptions");

  const moderatorWrite = await moderator.request(`/api/admin/subscriptions/${businessId}`, {
    method: "PATCH",
    headers: {
      [CSRF_HEADER_NAME]: CSRF_HEADER_VALUE,
    },
    body: JSON.stringify({ subscriptionNotes: "moderator-should-fail" }),
  });
  assert(moderatorWrite.response.status === 403, "Moderator should not patch admin subscription.");
  logPass("moderator blocked from admin write");

  const moderatorReset = await moderator.request("/api/admin/clients/reset-password", {
    method: "POST",
    headers: {
      [CSRF_HEADER_NAME]: CSRF_HEADER_VALUE,
    },
    body: JSON.stringify({ businessId }),
  });
  assert(moderatorReset.response.status === 403, "Moderator should not reset client password.");
  logPass("moderator blocked from password reset");

  console.log("Security regression completed.");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
