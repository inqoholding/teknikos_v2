import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

page.on("response", (response) => {
  if (response.status() >= 400) {
    console.log("RESP", response.status(), response.url());
  }
});

page.on("console", (msg) => {
  console.log("CONSOLE", msg.type(), msg.text());
});

await page.goto("http://156.67.220.110/login", { waitUntil: "networkidle" });
await page.fill('input[type="email"]', "budi@example.com");
await page.fill('input[type="password"]', "Owner!0qBaA5ygy28QLzV4");
await page.click('button[type="submit"]');
await page.waitForTimeout(4000);

console.log("URL", page.url());
console.log("BODY", (await page.textContent("body"))?.slice(0, 600) ?? "");

await browser.close();
