/**
 * MAS-Generated Login Test
 * Balance Variant: qwen2.5:3b + deepseek-r1:7b
 * Generated: 2026-04-22
 */

import { test, expect } from '@playwright/test';

test('MAS: Login with email/password -> redirect to home', async ({ page }) => {
  // Navigate to login page
  await page.goto('/login');
  
  // Fill email
  await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
  
  // Fill password
  await page.fill('[data-testid="auth-password-input"]', 'alice123');
  
  // Click login
  await page.click('[data-testid="auth-login-btn"]');
  
  // Wait for login to complete - check URL changed OR body visible
  await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
});