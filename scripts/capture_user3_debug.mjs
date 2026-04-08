import { chromium } from 'playwright';
import path from 'path';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto('https://coreveta.com/auth/sign-in', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'scripts/debug_signin.png' });
  
  console.log("Debug image saved at scripts/debug_signin.png");
  await browser.close();
})();
