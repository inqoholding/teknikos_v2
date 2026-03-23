import { chromium } from "playwright";

const stamp = Date.now();
const email = `hardtest-${stamp}@teknikos.local`;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

page.on("response", async (response) => {
  if (response.url().includes("/api/") && response.status() >= 400) {
    console.log("RESP", response.status(), response.url(), await response.text());
  }
});

await page.goto("http://156.67.220.110/register", { waitUntil: "domcontentloaded" });
await page.getByLabel("Nama lengkap").fill(`Hard Test ${stamp}`);
await page.getByLabel("Email").fill(email);
await page.getByLabel("Nomor WhatsApp").fill("081200001111");
await page.getByLabel("Password").fill("TestPass123!");
await page.getByLabel("Konfirmasi").fill("TestPass123!");
await page.getByRole("button", { name: /Buat Akun/i }).click();
await page.waitForTimeout(1500);
console.log("AFTER_REGISTER", page.url());
console.log("BODY1", ((await page.locator("body").textContent()) ?? "").replace(/\s+/g, " ").slice(0, 500));

await page.getByRole("button", { name: /Buat Bisnis Saya/i }).click();
await page.waitForTimeout(3000);
console.log("AFTER_ONBOARDING", page.url());
console.log("BODY2", ((await page.locator("body").textContent()) ?? "").replace(/\s+/g, " ").slice(0, 500));

await browser.close();
