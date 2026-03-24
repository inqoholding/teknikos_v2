import { chromium } from "playwright";

const CANDIDATE_BASES = [
  "http://156.67.220.110",
  "http://127.0.0.1",
];

const OWNER_EMAIL = process.env.OWNER_EMAIL ?? "budi@example.com";
const OWNER_PASSWORD = process.env.OWNER_PASSWORD ?? "Owner!0qBaA5ygy28QLzV4";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@teknikos.id";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "Admin!nPeR4BmnYE6FhWaY";

function log(result, status, message, details = "") {
  result.push({ status, message, details });
}

async function visibleText(page) {
  const body = page.locator("body");
  return (await body.textContent())?.replace(/\s+/g, " ").trim() ?? "";
}

function compact(text, length = 220) {
  return text.length > length ? `${text.slice(0, length)}...` : text;
}

async function tryGoto(page, url) {
  try {
    const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
    await page.waitForTimeout(1200);
    return { ok: true, response };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
}

async function resolveBaseUrl(browser) {
  const page = await browser.newPage();
  for (const baseUrl of CANDIDATE_BASES) {
    const attempt = await tryGoto(page, `${baseUrl}/settings`);
    if (!attempt.ok) {
      continue;
    }
    const text = await visibleText(page);
    if (text.includes("TeknikOS")) {
      await page.close();
      return baseUrl;
    }
  }
  await page.close();
  throw new Error("Tidak menemukan base URL yang bisa diakses untuk browser hard check.");
}

async function checkPublicPages(baseUrl, browser, result) {
  const page = await browser.newPage();
  const publicPaths = [
    { path: "/", checks: ["TeknikOS", "Coba Gratis"] },
    { path: "/demo-owner-dashboard", checks: ["Dashboard", "Workspace", "Operasional live"] },
  ];

  for (const item of publicPaths) {
    const attempt = await tryGoto(page, `${baseUrl}${item.path}`);
    if (!attempt.ok) {
      log(result, "warn", `public ${item.path}`, attempt.error);
      continue;
    }
    const text = await visibleText(page);
    const missing = item.checks.filter((token) => !text.includes(token));
    if (missing.length > 0) {
      log(result, "warn", `public ${item.path}`, `token hilang: ${missing.join(", ")}`);
      continue;
    }
    log(result, "pass", `public ${item.path}`);
  }

  await page.close();
}

async function login(page, baseUrl, email, password) {
  await page.goto(`${baseUrl}/login`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /masuk|login/i }).click();
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(1800);
}

async function safeGoto(page, url) {
  const attempt = await tryGoto(page, url);
  if (!attempt.ok) {
    throw new Error(`Gagal membuka ${url}: ${attempt.error}`);
  }
}

async function checkOwnerFlow(baseUrl, browser, result) {
  const page = await browser.newPage();
  await login(page, baseUrl, OWNER_EMAIL, OWNER_PASSWORD);

  const pages = [
    { path: "/dashboard", checks: ["Operations Cockpit", "Kalender Jadwal", "Quick Billing"] },
    { path: "/jobs", checks: ["Job Order"] },
    { path: "/customers", checks: ["Pelanggan"] },
    { path: "/invoices", checks: ["Invoice"] },
    { path: "/inventory", checks: ["Inventori"] },
    { path: "/contracts", checks: ["Kontrak"] },
    { path: "/settings", checks: ["Rules Penggunaan WhatsApp", "Hubungkan ke WAHA"] },
    { path: "/settings/whatsapp-rules", checks: ["Rules WhatsApp"] },
    { path: "/settings/whatsapp-connect", checks: ["Menghubungkan ke WAHA", "Langkah 1", "Langkah 2", "Langkah 3"] },
  ];

  for (const item of pages) {
    await safeGoto(page, `${baseUrl}${item.path}`);
    const text = await visibleText(page);
    const missing = item.checks.filter((token) => !text.includes(token));
    if (missing.length > 0) {
      log(result, "fail", `owner ${item.path}`, `url=${page.url()} :: token hilang: ${missing.join(", ")} :: body=${compact(text)}`);
    } else {
      log(result, "pass", `owner ${item.path}`);
    }
  }

  await safeGoto(page, `${baseUrl}/jobs`);
  const firstJobLink = page.locator('a[href^="/jobs/"]').first();
  if ((await firstJobLink.count()) > 0) {
    await firstJobLink.click();
    await page.waitForLoadState("domcontentloaded", { timeout: 15000 });
    await page.waitForTimeout(1200);
    const text = await visibleText(page);
    const detailChecks = ["Timeline", "Before / After Photo", "WhatsApp Otomatis WAHA"];
    const missing = detailChecks.filter((token) => !text.includes(token));
    if (missing.length > 0) {
      log(result, "fail", "owner /jobs/:id", `url=${page.url()} :: token hilang: ${missing.join(", ")} :: body=${compact(text)}`);
    } else {
      log(result, "pass", "owner /jobs/:id");
    }
  } else {
    log(result, "warn", "owner /jobs/:id", "tidak menemukan link detail job");
  }

  await page.close();
}

async function checkAdminFlow(baseUrl, browser, result) {
  const page = await browser.newPage();
  await login(page, baseUrl, ADMIN_EMAIL, ADMIN_PASSWORD);
  await safeGoto(page, `${baseUrl}/admin`);
  const text = await visibleText(page);
  const checks = ["Kelola Client", "Kalender Semua Jadwal Client", "Deadline Client"];
  const missing = checks.filter((token) => !text.includes(token));
  if (missing.length > 0) {
    log(result, "fail", "admin /admin", `url=${page.url()} :: token hilang: ${missing.join(", ")} :: body=${compact(text)}`);
  } else {
    log(result, "pass", "admin /admin");
  }
  await page.close();
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox"],
  });
  const result = [];

  try {
    const baseUrl = await resolveBaseUrl(browser);
    log(result, "pass", "baseUrl", baseUrl);
    await checkPublicPages(baseUrl, browser, result);
    await checkOwnerFlow(baseUrl, browser, result);
    await checkAdminFlow(baseUrl, browser, result);
  } finally {
    await browser.close();
  }

  const failures = result.filter((item) => item.status === "fail");
  const warnings = result.filter((item) => item.status === "warn");

  for (const item of result) {
    const extra = item.details ? ` :: ${item.details}` : "";
    console.log(`${item.status.toUpperCase()} ${item.message}${extra}`);
  }

  if (failures.length > 0) {
    process.exitCode = 1;
    return;
  }

  if (warnings.length > 0) {
    process.exitCode = 2;
  }
}

await main();
