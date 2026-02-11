import { test, expect } from '@playwright/test';

test('login and show admin panel', async ({ page }) => {
  await page.goto('/');
  // fill login form
  await page.fill('input[placeholder="Email"]', 'admin@infobench.in').catch(()=>{});
  await page.fill('input[type=password]', 'Test@123456').catch(()=>{});
  // Click login button
  await page.click('button:has-text("Login")');
  // Wait for signed in text
  await page.waitForSelector('text=Signed in as', { timeout: 5000 });
  await expect(page.locator('text=Admin Panel')).toBeVisible();
});
