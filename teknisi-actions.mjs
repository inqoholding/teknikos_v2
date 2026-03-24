import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 2200 } });
const log = [];

async function record(label, fn) {
  try {
    const result = await fn();
    log.push({ label, ok: true, result });
  } catch (error) {
    log.push({ label, ok: false, result: String(error) });
  }
}

await page.goto('http://156.67.220.110/login', { waitUntil: 'domcontentloaded' });
await page.getByLabel('Email').fill('budi@example.com');
await page.getByLabel('Password').fill('Owner!0qBaA5ygy28QLzV4');
await page.getByRole('button', { name: /masuk/i }).click();
await page.waitForTimeout(2200);
await page.goto('http://156.67.220.110/technicians', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(1800);

await record('buka-kalender-second', async () => {
  await page.getByRole('button', { name: 'Buka Kalender' }).nth(1).click();
  await page.waitForTimeout(500);
  return await page.locator('h3').last().textContent();
});

await record('edit-second', async () => {
  await page.getByRole('button', { name: 'Edit' }).nth(1).click();
  await page.waitForTimeout(500);
  return await page.locator('h3').filter({ hasText: 'Edit Teknisi' }).first().textContent();
});

await record('lihat-job-second', async () => {
  await page.getByRole('button', { name: 'Lihat Job' }).nth(1).click();
  await page.waitForTimeout(1200);
  const url = page.url();
  await page.goBack({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  return url;
});

await record('paksa-logout-active', async () => {
  const target = page.getByRole('button', { name: 'Paksa Logout' }).first();
  await target.click();
  await page.waitForTimeout(1200);
  return await page.locator('.callout.callout--success').first().textContent();
});

await record('nonaktifkan-akun-active', async () => {
  const target = page.getByRole('button', { name: 'Nonaktifkan Akun' }).first();
  await target.click();
  await page.waitForTimeout(1200);
  return await page.locator('.callout.callout--success').first().textContent();
});

console.log(JSON.stringify(log, null, 2));
await page.screenshot({ path: '/tmp/technicians-actions.png', fullPage: true });
await browser.close();
