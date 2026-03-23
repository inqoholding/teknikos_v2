import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

await page.goto("http://156.67.220.110/login", { waitUntil: "domcontentloaded" });
await page.getByLabel("Email").fill("budi@example.com");
await page.getByLabel("Password").fill("Owner!0qBaA5ygy28QLzV4");
await page.getByRole("button", { name: /masuk/i }).click();
await page.waitForTimeout(1800);

for (const path of ["/contracts", "/jobs"]) {
  await page.goto(`http://156.67.220.110${path}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
  const text = ((await page.locator("body").textContent()) ?? "").replace(/\s+/g, " ").trim();
  console.log("PATH", path, "URL", page.url());
  console.log("TEXT", text.slice(0, 400));
  console.log("JOB_LINKS", await page.locator('a[href^="/jobs/"]').count());
}

await page.goto("http://156.67.220.110/dashboard", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1000);
const logout = page.getByRole("button", { name: /Keluar/i }).first();
console.log("LOGOUT_BOX", await logout.boundingBox());

await page.setViewportSize({ width: 375, height: 812 });
await page.goto("http://156.67.220.110/", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1000);
const mobile = await page.evaluate(() => {
  const nodes = [...document.querySelectorAll("*")];
  const widest = nodes
    .map((el) => {
      const rect = el.getBoundingClientRect();
      return {
        tag: el.tagName,
        cls: typeof (el).className === "string" ? (el).className : "",
        width: rect.width,
        text: (el.textContent || "").trim().slice(0, 80),
      };
    })
    .filter((item) => item.width > window.innerWidth + 4)
    .sort((a, b) => b.width - a.width)[0] ?? null;

  return {
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    widest,
  };
});

console.log("MOBILE", JSON.stringify(mobile));

await browser.close();
