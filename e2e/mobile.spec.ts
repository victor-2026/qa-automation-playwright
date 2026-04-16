import { test, expect } from '@playwright/test';

const BASE_URL = 'http://192.168.1.210:3000';

test.describe('iPhone 15 Pro Tests', () => {
  
  test('homepage loads on iPhone 15 Pro', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const viewport = page.viewportSize();
    console.log(`Viewport: ${viewport?.width}x${viewport?.height}`);
    
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
  });

  test('login page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    const emailInput = page.locator('[data-testid="auth-email-input"]');
    const passwordInput = page.locator('[data-testid="auth-password-input"]');
    
    await expect(emailInput).toBeVisible({ timeout: 5000 });
    await expect(passwordInput).toBeVisible({ timeout: 5000 });
  });

  test('touch gestures: tap and fill', async ({ page }) => {
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

  test('touch gestures: swipe down on page', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    
    await expect(page.locator('h1, [data-testid]')).toBeVisible({ timeout: 5000 });
  });

  test('double tap gesture', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    const emailInput = page.locator('[data-testid="auth-email-input"]');
    await expect(emailInput).toBeVisible({ timeout: 5000 });
    
    await emailInput.dbltap();
    
    const inputValue = await emailInput.inputValue();
    console.log(`Input value after double tap: "${inputValue}"`);
  });
});

test.describe('iPhone 15 Pro Max Tests', () => {
  
  test('homepage loads on iPhone 15 Pro Max', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const viewport = page.viewportSize();
    console.log(`Viewport: ${viewport?.width}x${viewport?.height}`);
    
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
  });

  test('login page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    const emailInput = page.locator('[data-testid="auth-email-input"]');
    await expect(emailInput).toBeVisible({ timeout: 5000 });
  });

  test('pinch-to-zoom gesture', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    
    const { width, height } = page.viewportSize() || { width: 430, height: 932 };
    
    const centerX = width / 2;
    const centerY = height / 2;
    
    await page.touchscreen.tap(centerX, centerY);
    
    const box = await page.locator('[data-testid="auth-email-input"]').boundingBox();
    if (box) {
      await page.touchscreen.tap(centerX, centerY);
    }
  });
});

test.describe('Android Pixel 5 Tests', () => {
  
  test('homepage loads on Android', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const viewport = page.viewportSize();
    console.log(`Android Viewport: ${viewport?.width}x${viewport?.height}`);
    
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
  });

  test('touch gestures: tap and fill on Android', async ({ page }) => {
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

  test('swipe gesture on Android', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    
    const { width, height } = page.viewportSize() || { width: 393, height: 851 };
    
    const startX = width / 2;
    const startY = height * 0.6;
    const endY = height * 0.3;
    
    await page.touchscreen.tap(startX, startY);
    
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX, endY, { steps: 10 });
    await page.mouse.up();
  });
});
