import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

await page.goto("http://156.67.220.110/login", { waitUntil: "domcontentloaded" });
await page.getByLabel("Email").fill("budi@example.com");
await page.getByLabel("Password").fill("Owner!0qBaA5ygy28QLzV4");
await page.getByRole("button", { name: /masuk|login/i }).click();
await page.waitForTimeout(2000);

for (const path of ["/settings/whatsapp-rules", "/settings/whatsapp-connect"]) {
  await page.goto(`http://156.67.220.110${path}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  const text = (await page.locator("body").textContent())?.replace(/\s+/g, " ").trim() ?? "";
  console.log("PATH", path);
  console.log("URL", page.url());
  console.log("TEXT", text.slice(0, 300));
}

await browser.close();
