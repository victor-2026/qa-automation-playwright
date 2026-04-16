import { test, expect, devices } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Mobile Browser Tests', () => {
  
  test('iPhone 12: homepage loads and shows mobile layout', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const viewport = page.viewportSize();
    console.log(`Viewport: ${viewport?.width}x${viewport?.height}`);
    
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    const loginButton = page.locator('button').filter({ hasText: /login|sign in/i });
    await expect(loginButton.first()).toBeVisible({ timeout: 5000 });
  });

  test('iPhone 12: login page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    const emailInput = page.locator('[data-testid="auth-email-input"]');
    const passwordInput = page.locator('[data-testid="auth-password-input"]');
    
    await expect(emailInput).toBeVisible({ timeout: 5000 });
    await expect(passwordInput).toBeVisible({ timeout: 5000 });
  });

  test('iPhone 12: viewport dimensions are mobile', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const viewport = page.viewportSize();
    expect(viewport?.width).toBeLessThanOrEqual(390);
    expect(viewport?.height).toBeLessThanOrEqual(844);
  });
});

test.describe('Mobile Chrome (Android) Tests', () => {
  
  test('Pixel 5: homepage loads', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const viewport = page.viewportSize();
    console.log(`Android Viewport: ${viewport?.width}x${viewport?.height}`);
    
    const loginButton = page.locator('button').filter({ hasText: /login|sign in/i });
    await expect(loginButton.first()).toBeVisible({ timeout: 5000 });
  });

  test('Pixel 5: touch gestures work', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    const emailInput = page.locator('[data-testid="auth-email-input"]');
    await expect(emailInput).toBeVisible({ timeout: 5000 });
    
    await emailInput.tap();
    await emailInput.fill('alice@buzzhive.com');
    
    const passwordInput = page.locator('[data-testid="auth-password-input"]');
    await passwordInput.tap();
    await passwordInput.fill('alice123');
    
    const loginBtn = page.locator('[data-testid="auth-login-btn"]');
    await loginBtn.tap();
  });
});
