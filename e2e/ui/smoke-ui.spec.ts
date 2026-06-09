import { test, expect } from '../fixtures';
import { TEST_ACCOUNTS } from '../setup/credentials';

const FRONTEND_URL = process.env.APP_BASE_URL || 'http://localhost:3000';

test.describe('UI Smoke Tests - Render', () => {
  test.setTimeout(90000);

  test.beforeAll(async ({ request }) => {
    const maxRetries = 10;
    for (let i = 0; i < maxRetries; i++) {
      const res = await request.get(FRONTEND_URL);
      if (res.status() < 500) return;
      await new Promise(r => setTimeout(r, 5000));
    }
  });

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      await page.screenshot({ path: testInfo.outputPath(`${testInfo.title}.png`), fullPage: true });
    }
  });

  test('UI-1: Homepage loads', async ({ page }) => {
    const res = await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(res?.status() ?? 0).toBeLessThan(500);
    const loginButton = page.locator('button').filter({ hasText: /login|sign in/i });
    await expect(loginButton.first()).toBeVisible({ timeout: 15000 });
  });

  test('UI-2: Login page accessible', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="auth-email-input"]')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('[data-testid="auth-password-input"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="auth-login-btn"]')).toBeVisible({ timeout: 5000 });
  });

  test('UI-3: Login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.fill('[data-testid="auth-email-input"]', TEST_ACCOUNTS.user.email);
    await page.fill('[data-testid="auth-password-input"]', TEST_ACCOUNTS.user.password);
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="nav-profile"]')).toBeVisible({ timeout: 15000 });
  });

  test('UI-4: Login with wrong password shows error', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.fill('[data-testid="auth-email-input"]', TEST_ACCOUNTS.user.email);
    await page.fill('[data-testid="auth-password-input"]', 'wrongpassword');
    await page.click('[data-testid="auth-login-btn"]');
    await expect(page.locator('[data-testid="auth-error-message"]')).toBeVisible({ timeout: 15000 });
  });

  test('UI-5: Logout works', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.fill('[data-testid="auth-email-input"]', TEST_ACCOUNTS.user.email);
    await page.fill('[data-testid="auth-password-input"]', TEST_ACCOUNTS.user.password);
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');
    await page.waitForLoadState('networkidle');

    const logoutBtn = page.locator('[data-testid="auth-logout-btn"]');
    await logoutBtn.click();
    await page.waitForLoadState('networkidle');

    await expect(page.locator('[data-testid="auth-login-btn"]')).toBeVisible({ timeout: 15000 });
  });
});
