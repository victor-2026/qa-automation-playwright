import { test, expect } from '../fixtures';

// Phase 2 control mutants for VerdictGate calibration (2026-09-16).
// E1/E2 change NOTHING observable by construction — suite must stay green.
// Recorded as expected=E (assessed equivalent), excluded from denominators.
test.describe('Mutation — Phase 2 equivalence controls', () => {

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

  test('P2E-001 - null-mutant control (identical payload)', async ({ page }) => {
    await page.route('**/api/posts*', async route => {
      const response = await route.fetch();
      const json = await response.json();
      await route.fulfill({ json }); // byte-identical passthrough: no observable change
    });

    await login(page);
    await page.goto('/');
    const firstPost = page.locator('[data-testid^="post-"]').first();
    await expect(firstPost).toBeVisible({ timeout: 10000 });
  });

  test('P2E-002 - extra ignorable field (debug flag)', async ({ page }) => {
    await page.route('**/api/posts*', async route => {
      const response = await route.fetch();
      const json = await response.json();
      if (json.items) json.items.forEach((p: any) => { p.debug = true; });
      await route.fulfill({ json }); // contracted assertions ignore unknown fields
    });

    await login(page);
    await page.goto('/');
    const firstPost = page.locator('[data-testid^="post-"]').first();
    await expect(firstPost).toBeVisible({ timeout: 10000 });
  });
});
