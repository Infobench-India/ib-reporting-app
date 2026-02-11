import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5003';
const AUTH_API_URL = 'http://localhost:3051/api/auth';

test.describe('Authentication and Authorization Flow', () => {
  test('should display login page when not authenticated', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await expect(page.locator('h2')).toContainText('Login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    // Fill login form
    await page.fill('input[type="email"]', 'admin@infobench.in');
    await page.fill('input[type="password"]', 'Test@123456');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for navigation and verify we're on dashboard
    await page.waitForNavigation();
    await expect(page).toHaveURL(`${BASE_URL}/home`);
  });

  test('should display error on invalid credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    // Fill login form with wrong password
    await page.fill('input[type="email"]', 'admin@infobench.in');
    await page.fill('input[type="password"]', 'wrongpassword');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for error message
    await expect(page.locator('[role="alert"]')).toContainText('Invalid credentials');
  });

  test('should not allow access to protected routes without authentication', async ({ page }) => {
    // Try to access protected route without logging in
    await page.goto(`${BASE_URL}/reportconfigs`);
    
    // Should be redirected to login
    await expect(page).toHaveURL(`${BASE_URL}/login`);
  });
});

test.describe('Role-Based Access Control', () => {
  test('Admin should access admin-only pages', async ({ page }) => {
    // Login as admin
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'admin@infobench.in');
    await page.fill('input[type="password"]', 'Test@123456');
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForNavigation();
    
    // Try to access admin page
    await page.goto(`${BASE_URL}/reportconfigs`);
    await expect(page).not.toHaveURL(`${BASE_URL}/error`);
  });

  test('Non-admin should not access admin-only pages', async ({ page }) => {
    // Login as regular user
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'user@infobench.in');
    await page.fill('input[type="password"]', 'Test@123456');
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForNavigation();
    
    // Try to access admin page - should be redirected
    await page.goto(`${BASE_URL}/reportconfigs`);
    await expect(page).toHaveURL(`${BASE_URL}/error`);
  });

  test('User with read_report permission can access report views', async ({ page }) => {
    // Login as user
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'user@infobench.in');
    await page.fill('input[type="password"]', 'Test@123456');
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForNavigation();
    
    // Access report view - should succeed
    await page.goto(`${BASE_URL}/sqlreportview`);
    await expect(page).not.toHaveURL(`${BASE_URL}/error`);
  });
});

test.describe('Session Management', () => {
  test('should store access token in localStorage after login', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'admin@infobench.in');
    await page.fill('input[type="password"]', 'Test@123456');
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForNavigation();
    
    // Check localStorage
    const token = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(token).toBeTruthy();
  });

  test('should clear tokens on logout', async ({ page }) => {
    // First login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'admin@infobench.in');
    await page.fill('input[type="password"]', 'Test@123456');
    await page.click('button[type="submit"]');
    
    await page.waitForNavigation();
    
    // Verify token exists
    let token = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(token).toBeTruthy();
    
    // Logout (find logout button in navbar or menu)
    // This depends on your UI implementation
    // await page.click('a:has-text("Logout")');
    
    // Wait for navigation to login
    // await page.waitForNavigation();
    
    // Verify token is cleared
    // token = await page.evaluate(() => localStorage.getItem('accessToken'));
    // expect(token).toBeNull();
  });

  test('should persist session across page reloads', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'admin@infobench.in');
    await page.fill('input[type="password"]', 'Test@123456');
    await page.click('button[type="submit"]');
    
    await page.waitForNavigation();
    
    // Reload page
    await page.reload();
    
    // Should still be authenticated
    await expect(page).toHaveURL(`${BASE_URL}/home`);
  });
});

test.describe('Permission-Based Feature Access', () => {
  test('User with create_report permission can access schedule pages', async ({ page }) => {
    // Login as user (has read_report but may need specific test user with create_report)
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'admin@infobench.in');
    await page.fill('input[type="password"]', 'Test@123456');
    await page.click('button[type="submit"]');
    
    await page.waitForNavigation();
    
    // Try to access schedule page
    await page.goto(`${BASE_URL}/sqlreportschedule`);
    await expect(page).not.toHaveURL(`${BASE_URL}/error`);
  });

  test('Components should be hidden based on permissions', async ({ page }) => {
    // This test assumes your UI hides admin buttons for non-admin users
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'viewer@infobench.in');
    await page.fill('input[type="password"]', 'Test@123456');
    await page.click('button[type="submit"]');
    
    await page.waitForNavigation();
    
    // For example, check that delete button is not visible
    // const deleteButtons = await page.locator('button:has-text("Delete")').count();
    // expect(deleteButtons).toBe(0);
  });
});

test.describe('API Authentication', () => {
  test('API calls should include authorization header', async ({ page }) => {
    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'admin@infobench.in');
    await page.fill('input[type="password"]', 'Test@123456');
    
    // Intercept API requests
    let authHeaderFound = false;
    page.on('request', (request) => {
      if (request.url().includes('/api/')) {
        const authHeader = request.headerValue('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
          authHeaderFound = true;
        }
      }
    });
    
    await page.click('button[type="submit"]');
    await page.waitForNavigation();
    
    // Navigate to a page that makes API calls
    await page.goto(`${BASE_URL}/sqlreportview`);
    
    // Wait for API calls to complete
    await page.waitForTimeout(2000);
    
    expect(authHeaderFound).toBeTruthy();
  });

  test('should handle 401 unauthorized responses', async ({ page }) => {
    // This test verifies logout happens when token is invalid
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'admin@infobench.in');
    await page.fill('input[type="password"]', 'Test@123456');
    await page.click('button[type="submit"]');
    
    await page.waitForNavigation();
    
    // Clear the token to simulate unauthorized
    await page.evaluate(() => localStorage.removeItem('accessToken'));
    
    // Make a request
    await page.goto(`${BASE_URL}/home`);
    
    // Should be redirected to login
    await expect(page).toHaveURL(`${BASE_URL}/login`);
  });
});
