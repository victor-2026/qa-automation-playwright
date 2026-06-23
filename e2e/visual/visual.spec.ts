import { test, expect } from '../fixtures';

const ALICE = { email: 'alice@buzzhive.com', password: 'alice123' };

test.describe('Visual Regression — Buzzhive', () => {

  test('1 — login page (empty)', async ({ page, loginPage }) => {
    await loginPage.goto('/login');
    await expect(loginPage.emailInput).toBeVisible();
    await expect(page).toHaveScreenshot('login-empty.png', { fullPage: true });
  });

  test('2 — login page (filled)', async ({ page, loginPage }) => {
    await loginPage.goto('/login');
    await loginPage.emailInput.fill(ALICE.email);
    await loginPage.passwordInput.fill(ALICE.password);
    await expect(page).toHaveScreenshot('login-filled.png', { fullPage: true });
  });

  test('3 — feed after login', async ({ page, loginPage, navPage }) => {
    await loginPage.goto('/login');
    await loginPage.login(ALICE.email, ALICE.password);
    await expect(navPage.feedLink).toBeVisible({ timeout: 10000 });
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('feed.png', { fullPage: true });
  });

  test('4 — feed content area', async ({ page, loginPage, navPage }) => {
    await loginPage.goto('/login');
    await loginPage.login(ALICE.email, ALICE.password);
    await expect(navPage.feedLink).toBeVisible({ timeout: 10000 });
    await page.waitForLoadState('networkidle');
    await expect(page.locator('main, [role="main"], .feed-content, .main-content').first()).toHaveScreenshot('feed-content.png', { timeout: 10000 });
  });

  test('5 — navigation sidebar', async ({ page, loginPage, navPage }) => {
    await loginPage.goto('/login');
    await loginPage.login(ALICE.email, ALICE.password);
    await expect(navPage.feedLink).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveScreenshot('navigation.png', { fullPage: false });
  });

  test('6 — profile page', async ({ page, loginPage, navPage }) => {
    await loginPage.goto('/login');
    await loginPage.login(ALICE.email, ALICE.password);
    await expect(navPage.profileLink).toBeVisible({ timeout: 10000 });
    await navPage.profileLink.click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('profile.png', { fullPage: true });
  });

  test('7 — search page', async ({ page, loginPage, navPage }) => {
    await loginPage.goto('/login');
    await loginPage.login(ALICE.email, ALICE.password);
    await expect(navPage.feedLink).toBeVisible({ timeout: 10000 });
    await page.goto('/search');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('search.png', { fullPage: true });
  });

  test('8 — empty state (no content)', async ({ page, loginPage, navPage }) => {
    await loginPage.goto('/login');
    await loginPage.login(ALICE.email, ALICE.password);
    await expect(navPage.feedLink).toBeVisible({ timeout: 10000 });
    await page.goto('/messages');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('messages.png', { fullPage: true });
  });
});
