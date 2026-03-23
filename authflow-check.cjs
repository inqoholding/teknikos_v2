const { chromium } = require('playwright');

(async () => {
  const email = `herman.${Date.now()}@gmail.com`;
  const password = 'Herman12345!';
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const logs = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') logs.push(`console:${msg.text()}`);
  });
  page.on('pageerror', (err) => logs.push(`pageerror:${String(err)}`));

  await page.goto('http://localhost:5173/register', { waitUntil: 'networkidle' });
  await page.getByLabel('Nama lengkap').fill('Herman');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Nomor WhatsApp').fill('081355551111');
  await page.getByLabel('Password').fill(password);
  await page.getByLabel('Konfirmasi').fill(password);
  await page.getByRole('button', { name: 'Buat Akun' }).click();
  await page.waitForTimeout(2500);

  const afterRegister = {
    url: page.url(),
    body: (await page.locator('body').textContent()).slice(0, 400),
  };

  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
  const loginState = {
    url: page.url(),
    hasEmail: await page.getByLabel('Email').count(),
    body: (await page.locator('body').textContent()).slice(0, 500),
  };

  console.log(JSON.stringify({ email, afterRegister, loginState, logs }, null, 2));
  await browser.close();
})();
