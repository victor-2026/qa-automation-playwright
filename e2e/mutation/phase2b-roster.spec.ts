import { test, expect } from '../fixtures';

// Phase 2b roster for VerdictGate calibration (2026-09-16).
// E3/E4: equivalence controls (nothing observable changes).
// O1/O2: observed-designated (suite green + assessor-noted anomaly).
// D1-D3: detection-style (test MUST go red on the mutant; green = genuine blind spot).
test.describe('Mutation — Phase 2b roster', () => {

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      await page.screenshot({ path: testInfo.outputPath(`${testInfo.title}.png`), fullPage: true });
    }
    await page.unrouteAll({ behavior: 'ignoreErrors' });
  });

  async function login(page: any) {
    await page.goto('/login');
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');
  }

  test('P2E-003 - auth payload identical passthrough', async ({ page }) => {
    await page.route('**/api/auth/me', async route => {
      const response = await route.fetch();
      await route.fulfill({ json: await response.json() });
    });
    await login(page);
    await expect(page.locator('[data-testid="nav-feed-link"], [data-testid^="post-"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('P2E-004 - admin stats identical passthrough', async ({ page }) => {
    await page.route('**/api/admin/**', async route => {
      const response = await route.fetch();
      await route.fulfill({ json: await response.json() });
    });
    await login(page);
    await page.goto('/');
    await expect(page.locator('[data-testid^="post-"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('P2O-001 - slow posts API noted but tolerated', async ({ page }) => {
    await page.route('**/api/posts**', async route => {
      await new Promise(r => setTimeout(r, 2500));
      const response = await route.fetch();
      await route.fulfill({ json: await response.json() });
    });
    await login(page);
    await page.goto('/');
    await expect(page.locator('[data-testid^="post-"]').first()).toBeVisible({ timeout: 15000 });
  });

  test('P2O-002 - deprecated header noted but tolerated', async ({ page }) => {
    await page.route('**/api/posts**', async route => {
      const response = await route.fetch();
      const json = await response.json();
      await route.fulfill({ json, headers: { ...response.headers(), 'x-deprecated': 'v1-sunset' } });
    });
    await login(page);
    await page.goto('/');
    await expect(page.locator('[data-testid^="post-"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('P2D-001 - posts 500 breaks feed content', async ({ page }) => {
    await page.route('**/api/posts**', async route => {
      await route.fulfill({ status: 500, json: { detail: 'boom' } });
    });
    await login(page);
    await page.goto('/');
    const firstPost = page.locator('[data-testid^="post-"]').first();
    await expect(firstPost).toBeVisible({ timeout: 10000 });
  });

  test('P2D-002 - login 500 breaks dashboard', async ({ page }) => {
    await page.route('**/api/auth/login', async route => {
      await route.fulfill({ status: 500, json: { detail: 'boom' } });
    });
    await page.goto('/login');
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/', { timeout: 10000 });
  });

  test('P2D-003 - dropped comments break count', async ({ page }) => {
    await page.route('**/api/posts**', async route => {
      const response = await route.fetch();
      const json = await response.json();
      if (json.items) json.items.forEach((p: any) => { p.comments_count = 0; });
      await route.fulfill({ json });
    });
    await login(page);
    await page.goto('/');
    const badge = page.locator('[data-testid*="comments-count"]').first();
    const text = await badge.textContent();
    expect(Number(text?.trim())).toBeGreaterThan(0);
  });
});
