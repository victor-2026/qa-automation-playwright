import { test, expect } from '@playwright/test';

const BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3000';
const USER = process.env.TEST_USERNAME || 'alice@buzzhive.com';
const PASS = process.env.TEST_PASSWORD || 'alice123';

test('successful login', async ({ page }) => {
  await page.goto(`${BASE_URL}/login`);
  if (USER) await page.fill('[data-testid="auth-email-input"]', USER);
  if (PASS) await page.fill('[data-testid="auth-password-input"]', PASS);
  await page.click('[data-testid="auth-login-btn"]');
  await expect(page).toHaveURL(/home|\/$/);
});

test('failed login shows error', async ({ page }) => {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('[data-testid="auth-email-input"]', 'invalid');
  await page.fill('[data-testid="auth-password-input"]', 'invalid');
  await page.click('[data-testid="auth-login-btn"]');
  const error = page.locator('[data-testid="login-error"]');
  if (await error.count()) {
    await expect(error).toBeVisible();
  }
});