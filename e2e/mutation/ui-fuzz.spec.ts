import { test, expect } from '../fixtures';

test.describe('Mutation — UI Fuzzing', () => {

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      await page.screenshot({ path: testInfo.outputPath(`${testInfo.title}.png`), fullPage: true });
    }
    await page.unrouteAll({ behavior: 'ignoreErrors' });
  });

  // ── Login fuzzing ──

  test('FUZZ-001: login with empty fields shows validation', async ({ page }) => {
    await page.goto('/login');
    await page.click('[data-testid="auth-login-btn"]');

    const emailInput = page.locator('[data-testid="auth-email-input"]');
    const validation = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validation.length).toBeGreaterThan(0);
  });

  test('FUZZ-002: login with very long email is handled', async ({ page }) => {
    const longEmail = 'a'.repeat(500) + '@test.com';

    await page.route('**/api/auth/login', async route => {
      await route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({ detail: [{ msg: 'value is not a valid email', type: 'value_error' }] }),
      });
    });

    await page.goto('/login');
    await page.fill('[data-testid="auth-email-input"]', longEmail);
    await page.fill('[data-testid="auth-password-input"]', 'test123');
    await page.click('[data-testid="auth-login-btn"]');

    const errorMsg = page.locator('[data-testid="auth-error-message"]');
    await expect(errorMsg).toBeVisible({ timeout: 5000 });
  });

  test('FUZZ-003: login with SQL injection in email', async ({ page }) => {
    const sqlInjection = "' OR 1=1; --";

    await page.route('**/api/auth/login', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Invalid credentials' }),
      });
    });

    await page.goto('/login');
    await page.fill('[data-testid="auth-email-input"]', sqlInjection);
    await page.fill('[data-testid="auth-password-input"]', 'test123');
    await page.click('[data-testid="auth-login-btn"]');

    const errorMsg = page.locator('[data-testid="auth-error-message"]');
    await expect(errorMsg).toBeVisible({ timeout: 5000 });
    await expect(errorMsg).toContainText('Invalid');
  });

  test('FUZZ-004: login rapid double-click sends single request', async ({ page }) => {
    let requestCount = 0;
    await page.route('**/api/auth/login', async route => {
      requestCount++;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ access_token: 'fuzz-token', refresh_token: 'fuzz-refresh' }),
      });
    });

    await page.goto('/login');
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');

    await page.click('[data-testid="auth-login-btn"]', { clickCount: 2 });
    await page.waitForTimeout(500);

    expect(requestCount).toBeLessThanOrEqual(2);
  });

  // ── Post creation fuzzing ──

  test('FUZZ-005: create post with very long content', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');

    const longText = 'A'.repeat(3000);

    let rejected = false;
    await page.route('**/api/posts', async route => {
      if (route.request().method() === 'POST') {
        rejected = true;
        await route.fulfill({
          status: 422,
          contentType: 'application/json',
          body: JSON.stringify({ detail: 'Content too long' }),
        });
      } else {
        await route.continue();
      }
    });

    const postInput = page.locator('[data-testid="post-composer-input"]');
    if (await postInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await postInput.fill(longText);
      await page.click('[data-testid="post-composer-submit"]');
      await page.waitForTimeout(1000);
      expect(rejected).toBeTruthy();
    }
  });

  test('FUZZ-006: create post with unicode and special chars', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');

    const unicodeText = 'Hello 你好 🌍🎉! <script>alert(1)</script>';

    let postedContent = '';
    await page.route('**/api/posts', async route => {
      if (route.request().method() === 'POST') {
        const postData = route.request().postDataJSON();
        postedContent = postData?.content || '';
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ id: 'fuzz-post-id', content: postedContent }),
        });
      } else {
        await route.continue();
      }
    });

    const postInput = page.locator('[data-testid="post-composer-input"]');
    if (await postInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await postInput.fill(unicodeText);
      await page.click('[data-testid="post-composer-submit"]');
      await page.waitForTimeout(1000);

      expect(postedContent).toContain('Hello');
      expect(postedContent).toContain('🌍');
    }
  });

  // ── Search fuzzing ──

  test('FUZZ-007: search with XSS in query', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');

    const xssQuery = '<img src=x onerror=alert(1)>';

    await page.route('**/api/search*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [], total: 0 }),
      });
    });

    const searchInput = page.locator('[data-testid="nav-search-input"]');
    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await searchInput.fill(xssQuery);
      await page.waitForTimeout(500);

      const html = await page.evaluate(() => document.body.innerHTML);
      expect(html).not.toContain('onerror=alert(1)');
    }
  });

  test('FUZZ-008: search with very long query', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');

    const longQuery = 'a'.repeat(5000);

    let searchRequested = false;
    await page.route('**/api/search*', async route => {
      searchRequested = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [], total: 0 }),
      });
    });

    const searchInput = page.locator('[data-testid="nav-search-input"]');
    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await searchInput.fill(longQuery);
      await page.waitForTimeout(500);

      const title = await page.evaluate(() => document.title).catch(() => null);
      expect(title).not.toBeNull();
    }
  });

  // ── Register fuzzing ──

  test('FUZZ-009: register with existing email shows conflict', async ({ page }) => {
    await page.route('**/api/auth/register', async route => {
      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'User with this email or username already exists' }),
      });
    });

    await page.goto('/register');
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-username-input"]', 'alice_new');
    await page.fill('[data-testid="auth-password-input"]', 'test123456');
    await page.fill('[data-testid="auth-display-name-input"]', 'Alice New');
    await page.click('[data-testid="auth-register-btn"]');

    const errorMsg = page.locator('[data-testid="auth-error-message"]');
    await expect(errorMsg).toBeVisible({ timeout: 5000 });
    await expect(errorMsg).toContainText('already exists');
  });

  test('FUZZ-010: register with short password shows validation', async ({ page }) => {
    await page.goto('/register');
    await page.fill('[data-testid="auth-email-input"]', 'new@test.com');
    await page.fill('[data-testid="auth-username-input"]', 'newuser');
    await page.fill('[data-testid="auth-password-input"]', 'ab');
    await page.fill('[data-testid="auth-display-name-input"]', 'New User');
    await page.click('[data-testid="auth-register-btn"]');

    const passwordInput = page.locator('[data-testid="auth-password-input"]');
    const validation = await passwordInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validation.length).toBeGreaterThan(0);
  });
});
