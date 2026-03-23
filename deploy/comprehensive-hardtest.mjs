import fs from "node:fs/promises";
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL ?? "http://156.67.220.110";
const OWNER_EMAIL = process.env.OWNER_EMAIL ?? "budi@example.com";
const OWNER_PASSWORD = process.env.OWNER_PASSWORD ?? "Owner!0qBaA5ygy28QLzV4";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@teknikos.id";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "Admin!nPeR4BmnYE6FhWaY";
const REPORT_PATH = process.env.REPORT_PATH ?? "/root/teknikos/test-results-final.json";

const results = [];

function record(name, status, details = "") {
  results.push({ name, status, details, at: new Date().toISOString() });
  const extra = details ? ` :: ${details}` : "";
  console.log(`${status.toUpperCase()} ${name}${extra}`);
}

function expect(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function bodyText(page) {
  return ((await page.locator("body").textContent()) ?? "").replace(/\s+/g, " ").trim();
}

async function runTest(name, fn) {
  try {
    await fn();
    record(name, "pass");
  } catch (error) {
    record(name, "fail", error instanceof Error ? error.message : String(error));
  }
}

async function login(page, email, password) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /masuk/i }).click();
  await page.waitForTimeout(1800);
}

async function runApiHarness() {
  return await new Promise((resolve) => {
    const child = spawn(
      "node",
      ["/var/www/teknikos/deploy/hard-test.mjs", "http://127.0.0.1:3001", "/var/www/teknikos/backend/.env"],
      { stdio: ["ignore", "pipe", "pipe"] },
    );

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("close", (code) => {
      resolve({ code, stdout, stderr });
    });
  });
}

const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage();

  await runTest("landing page load", async () => {
    const start = Date.now();
    await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
    const elapsed = Date.now() - start;
    const title = await page.title();
    const text = await bodyText(page);
    expect(title.includes("TeknikOS") || text.includes("TeknikOS"), "Judul landing tidak mengandung TeknikOS.");
    expect(/Coba Gratis|Daftar|Login|WhatsApp/i.test(text), "CTA utama landing tidak ditemukan.");
    expect(elapsed < 3000, `Landing load terlalu lambat: ${elapsed}ms`);
  });

  await runTest("demo owner dashboard", async () => {
    await page.goto(`${BASE_URL}/demo-owner-dashboard`, { waitUntil: "domcontentloaded" });
    const text = await bodyText(page);
    expect(text.includes("Workspace"), "Workspace demo tidak muncul.");
    expect(text.includes("Operations Cockpit"), "Widget demo dashboard tidak muncul.");
  });

  await runTest("demo settings", async () => {
    await page.goto(`${BASE_URL}/demo-owner-dashboard/settings`, { waitUntil: "domcontentloaded" });
    const text = await bodyText(page);
    expect(text.includes("Demo Pengaturan"), "Halaman demo settings tidak muncul.");
    expect(text.includes("Rules WhatsApp"), "Link rules demo tidak muncul.");
  });

  await runTest("demo whatsapp rules", async () => {
    await page.goto(`${BASE_URL}/demo-owner-dashboard/settings/whatsapp-rules`, { waitUntil: "domcontentloaded" });
    const text = await bodyText(page);
    expect(text.includes("Rules WhatsApp"), "Rules WhatsApp demo tidak muncul.");
  });

  await runTest("demo waha connect", async () => {
    await page.goto(`${BASE_URL}/demo-owner-dashboard/settings/whatsapp-connect`, { waitUntil: "domcontentloaded" });
    const text = await bodyText(page);
    expect(text.includes("Menghubungkan ke WAHA"), "Demo WAHA connect tidak muncul.");
    expect(text.includes("Langkah 1") && text.includes("Langkah 2") && text.includes("Langkah 3"), "Stepper demo WAHA tidak lengkap.");
  });

  await runTest("cta sales whatsapp", async () => {
    await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
    const salesLink = page.locator('a[href*="wa.me"], a[href*="api.whatsapp.com"]').first();
    expect((await salesLink.count()) > 0, "CTA WhatsApp sales tidak ditemukan.");
    const href = await salesLink.getAttribute("href");
    expect(Boolean(href?.includes("wa.me") || href?.includes("api.whatsapp.com")), "Href CTA sales tidak valid.");
  });

  await runTest("wrong password error", async () => {
    await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
    await page.getByLabel("Email").fill(OWNER_EMAIL);
    await page.getByLabel("Password").fill("salah-total-123");
    await page.getByRole("button", { name: /masuk/i }).click();
    await page.waitForTimeout(1500);
    const text = await bodyText(page);
    expect(/Invalid email or password|Terjadi kesalahan|password/i.test(text), "Pesan error login salah password tidak tampil.");
  });

  await runTest("register and onboarding", async () => {
    const stamp = Date.now();
    await page.goto(`${BASE_URL}/register`, { waitUntil: "domcontentloaded" });
    await page.getByLabel("Nama lengkap").fill(`Hard Test ${stamp}`);
    await page.getByLabel("Email").fill(`hardtest-${stamp}@teknikos.local`);
    await page.getByLabel("Nomor WhatsApp").fill("081200001111");
    await page.getByLabel("Password").fill("TestPass123!");
    await page.getByLabel("Konfirmasi").fill("TestPass123!");
    await page.getByRole("button", { name: /Buat Akun/i }).click();
    await page.waitForTimeout(1500);
    expect(page.url().includes("/onboarding"), `Register tidak redirect ke onboarding. url=${page.url()}`);
    const text = await bodyText(page);
    expect(text.includes("Setup Bisnis"), "Onboarding tidak tampil.");
    await page.getByRole("button", { name: /Buat Bisnis Saya/i }).click();
    await page.waitForTimeout(2000);
    expect(page.url().includes("/dashboard"), `Onboarding tidak selesai ke dashboard. url=${page.url()}`);
  });

  await runTest("logout flow", async () => {
    const logoutButton = page.getByRole("button", { name: /Keluar/i }).first();
    await logoutButton.scrollIntoViewIfNeeded();
    await logoutButton.click();
    await page.waitForTimeout(1200);
    expect(page.url().includes("/login"), `Logout tidak redirect ke login. url=${page.url()}`);
  });

  await runTest("owner login and dashboard", async () => {
    await login(page, OWNER_EMAIL, OWNER_PASSWORD);
    expect(page.url().includes("/dashboard"), `Owner login tidak masuk dashboard. url=${page.url()}`);
    const text = await bodyText(page);
    expect(text.includes("Operations Cockpit"), "Dashboard owner belum lengkap.");
    expect(text.includes("Quick Billing"), "Quick Billing belum tampil.");
  });

  await runTest("owner settings and whatsapp pages", async () => {
    for (const path of ["/settings", "/settings/whatsapp-rules", "/settings/whatsapp-connect"]) {
      await page.goto(`${BASE_URL}${path}`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1200);
    }
    const text = await bodyText(page);
    expect(text.includes("Menghubungkan ke WAHA"), "Halaman WAHA connect owner tidak tampil.");
  });

  await runTest("owner main modules", async () => {
    const checks = [
      ["/jobs", "Job Order"],
      ["/customers", "Pelanggan"],
      ["/invoices", "Invoice"],
      ["/inventory", "Inventori"],
      ["/contracts", "Kontrak Aktif"],
    ];

    for (const [path, token] of checks) {
      await page.goto(`${BASE_URL}${path}`, { waitUntil: "domcontentloaded" });
      const text = await bodyText(page);
      expect(text.includes(token), `Halaman ${path} tidak memuat token ${token}.`);
    }
  });

  await runTest("job detail page", async () => {
    await page.goto(`${BASE_URL}/jobs`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1200);
    const firstJob = page.locator('a[href^="/jobs/"]').first();
    expect((await firstJob.count()) > 0, "Link detail job tidak ditemukan.");
    await firstJob.click();
    await page.waitForTimeout(1200);
    const text = await bodyText(page);
    expect(text.includes("WhatsApp Otomatis WAHA"), "Panel WAHA pada detail job belum tampil.");
  });

  await runTest("admin login and dashboard", async () => {
    await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
    await page.getByLabel("Email").fill(ADMIN_EMAIL);
    await page.getByLabel("Password").fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: /masuk/i }).click();
    await page.waitForTimeout(1800);
    expect(page.url().includes("/admin"), `Admin login tidak masuk admin page. url=${page.url()}`);
    const text = await bodyText(page);
    expect(text.includes("Inbox Admin"), "Section inbox admin tidak muncul.");
    expect(text.includes("Kalender Semua Jadwal Client"), "Kalender admin tidak muncul.");
  });

  await runTest("responsive smoke", async () => {
    const viewports = [
      { width: 375, height: 812 },
      { width: 768, height: 1024 },
      { width: 1280, height: 800 },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 4);
      expect(!overflow, `Overflow horizontal terdeteksi di ${viewport.width}px.`);
    }
  });

  await page.close();

  await runTest("api CRUD hard test", async () => {
    const api = await runApiHarness();
    expect(api.code === 0, `API harness gagal. stdout=${api.stdout} stderr=${api.stderr}`);
  });
} finally {
  await browser.close();
}

await fs.writeFile(
  REPORT_PATH,
  JSON.stringify(
    {
      baseUrl: BASE_URL,
      generatedAt: new Date().toISOString(),
      totals: {
        total: results.length,
        passed: results.filter((item) => item.status === "pass").length,
        failed: results.filter((item) => item.status === "fail").length,
      },
      results,
    },
    null,
    2,
  ),
);

if (results.some((item) => item.status === "fail")) {
  process.exitCode = 1;
}
