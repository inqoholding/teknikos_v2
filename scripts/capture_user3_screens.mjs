import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const outDir = '/Users/nsrr/Documents/teknikos_v2/frontend/public/real-screenshots';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

(async () => {
  console.log('Starting browser...');
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();
  const timestamp = Date.now();

  try {
    console.log('Navigating to login...');
    await page.goto('https://coreveta.com/login', { waitUntil: 'networkidle' });
    
    console.log('Logging in...');
    await page.fill('input[type="email"]', 'user3@gmail.com');
    await page.fill('input[type="password"]', 'RootpasswordPTinqo');
    await page.click('button[type="submit"]');

    console.log('Waiting for dashboard to load...');
    await page.waitForURL('**/dashboard**');
    await page.waitForTimeout(2000);
    
    const dbPath = path.join(outDir, `user3_dashboard_${timestamp}.png`);
    await page.screenshot({ path: dbPath });
    console.log(`Saved ${dbPath}`);

    // Click links in sidebar
    console.log('Navigating to Pesanan Kerja...');
    await page.click('a:has-text("Pesanan Kerja"), a:has-text("Jobs")');
    await page.waitForTimeout(2000);
    const jobsPath = path.join(outDir, `user3_jobs_${timestamp}.png`);
    await page.screenshot({ path: jobsPath });
    console.log(`Saved ${jobsPath}`);

    console.log('Navigating to Manajemen Teknisi...');
    await page.click('a:has-text("Manajemen Teknisi"), a:has-text("Teknisi")');
    await page.waitForTimeout(1500);
    const techPath = path.join(outDir, `user3_technicians_${timestamp}.png`);
    await page.screenshot({ path: techPath });
    console.log(`Saved ${techPath}`);

    console.log('Navigating to Pelanggan...');
    await page.click('a:has-text("Pelanggan"), a:has-text("Database")');
    await page.waitForTimeout(1500);
    const custPath = path.join(outDir, `user3_customers_${timestamp}.png`);
    await page.screenshot({ path: custPath });
    console.log(`Saved ${custPath}`);

    console.log('Navigating to Tagihan...');
    await page.click('a:has-text("Tagihan"), a:has-text("Invoice")');
    await page.waitForTimeout(1500);
    const invPath = path.join(outDir, `user3_invoices_${timestamp}.png`);
    await page.screenshot({ path: invPath });
    console.log(`Saved ${invPath}`);

  } catch (error) {
    console.error('Error during automation:', error);
  } finally {
    await browser.close();
    console.log('Done.');
  }
})();
