import { test, expect } from '@playwright/test';

test.describe('TeknikOS Production Regression - user3', () => {
  const BASE_URL = 'http://156.67.220.110';

  test('Module Navigation & Dashboard Audit', async ({ page }) => {
    // 1. Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'user3@gmail.com');
    await page.fill('input[type="password"]', 'Rootpasword');
    await page.click('button[type="submit"]');

    // 2. Dashboard - Verify Stats & WhatsApp Neatness
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
    await expect(page.locator('text=Tugas Hari Ini')).toBeVisible();
    
    // Verify trend badges are hidden if value is 0 (as per the fix)
    const firstStatValue = await page.locator('.stats-card').first().locator('.stats-card__value').innerText();
    if (firstStatValue === '0') {
       await expect(page.locator('.stats-card').first().locator('.badge')).not.toBeVisible();
    }

    // Verify WhatsApp Callout "Neatness"
    await expect(page.locator('.callout--warning')).toBeVisible();
    await expect(page.locator('text=Otomasi WhatsApp Belum Aktif')).toBeVisible();

    // 3. Pesanan Kerja
    await page.click('text=Pesanan Kerja');
    await expect(page).toHaveURL(`${BASE_URL}/jobs`);
    await expect(page.locator('h1:has-text("Pesanan Kerja")')).toBeVisible();

    // 4. Teknisi
    await page.click('text=Teknisi');
    await expect(page).toHaveURL(`${BASE_URL}/technicians`);
    await expect(page.locator('h1:has-text("Teknisi")')).toBeVisible();

    // 5. Pelanggan
    await page.click('text=Pelanggan');
    await expect(page).toHaveURL(`${BASE_URL}/customers`);
    await expect(page.locator('h1:has-text("Pelanggan")')).toBeVisible();

    // 6. Tagihan
    await page.click('text=Tagihan');
    await expect(page).toHaveURL(`${BASE_URL}/invoices`);
    await expect(page.locator('h1:has-text("Tagihan")')).toBeVisible();

    // 7. Stok Suku Cadang
    await page.click('text=Stok Suku Cadang');
    await expect(page).toHaveURL(`${BASE_URL}/stock`);
    await expect(page.locator('h1:has-text("Stok")')).toBeVisible();

    // 8. Kontrak
    await page.click('text=Kontrak');
    await expect(page).toHaveURL(`${BASE_URL}/contracts`);
    await expect(page.locator('h1:has-text("Kontrak")')).toBeVisible();

    console.log('✅ ALL MODULES LOADED SUCCESSFULLY FOR USER3');
  });
});
