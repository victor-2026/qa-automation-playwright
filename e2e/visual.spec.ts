import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Visual Regression Tests', () => {
  
  test('login page visual snapshot', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await expect(page).toHaveScreenshot('login-page.png', {
      maxDiffPixelRatio: 0.1,
    });
  });

  test('homepage visual snapshot', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveScreenshot('homepage.png', {
      maxDiffPixelRatio: 0.1,
    });
  });

  test('register page visual snapshot', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);
    await expect(page).toHaveScreenshot('register-page.png', {
      maxDiffPixelRatio: 0.1,
    });
  });
});
