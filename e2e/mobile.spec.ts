import { test, expect, devices } from '@playwright/test';

const BASE_URL = 'http://192.168.1.210:3000';

test.describe('iPhone 15 Pro Tests', () => {
  
  test('homepage loads on iPhone 15 Pro', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const viewport = page.viewportSize();
    console.log(`Viewport: ${viewport?.width}x${viewport?.height}`);
    
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    const loginButton = page.locator('button').filter({ hasText: /login|sign in/i });
    await expect(loginButton.first()).toBeVisible({ timeout: 5000 });
  });

  test('login page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    const emailInput = page.locator('[data-testid="auth-email-input"]');
    const passwordInput = page.locator('[data-testid="auth-password-input"]');
    
    await expect(emailInput).toBeVisible({ timeout: 5000 });
    await expect(passwordInput).toBeVisible({ timeout: 5000 });
  });

  test('touch gestures work', async ({ page }) => {
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

test.describe('iPhone 15 Pro Max Tests', () => {
  
  test('homepage loads on iPhone 15 Pro Max', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const viewport = page.viewportSize();
    console.log(`Viewport: ${viewport?.width}x${viewport?.height}`);
    
    const loginButton = page.locator('button').filter({ hasText: /login|sign in/i });
    await expect(loginButton.first()).toBeVisible({ timeout: 5000 });
  });

  test('login page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    const emailInput = page.locator('[data-testid="auth-email-input"]');
    await expect(emailInput).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Android Pixel 5 Tests', () => {
  
  test('homepage loads on Android', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const viewport = page.viewportSize();
    console.log(`Android Viewport: ${viewport?.width}x${viewport?.height}`);
    
    const loginButton = page.locator('button').filter({ hasText: /login|sign in/i });
    await expect(loginButton.first()).toBeVisible({ timeout: 5000 });
  });

  test('touch gestures work on Android', async ({ page }) => {
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
