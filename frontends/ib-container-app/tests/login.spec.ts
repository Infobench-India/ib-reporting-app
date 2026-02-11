import { test, expect } from '@playwright/test';

test('container app shows heading and login form', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('IB Container App');
  await expect(page.locator('text=Login')).toBeVisible();
});
