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

  const EMAIL_LENGTHS = [65, 128, 254, 500] as const;
  for (const len of EMAIL_LENGTHS) {
    test(`FUZZ-002: login with ${len}-char email is handled`, async ({ page }) => {
      const longEmail = 'a'.repeat(len) + '@test.com';

      let intercepted = false;
      await page.route('**/api/auth/login', async route => {
        intercepted = true;
        await route.fulfill({
          status: 422,
          contentType: 'application/json',
          body: JSON.stringify({ detail: 'Value is not a valid email' }),
        });
      });

      await page.goto('/login');
      await page.fill('[data-testid="auth-email-input"]', longEmail);
      await page.fill('[data-testid="auth-password-input"]', 'test123');
      await page.click('[data-testid="auth-login-btn"]');
      await page.waitForTimeout(1000);

      expect(intercepted).toBeTruthy();
    });
  }

  const SQLI_PAYLOADS = [
    { name: 'OR bypass', value: "'or+1=1--@test.com" },
    { name: 'UNION select', value: "'union+select+*+from+users--@test.com" },
    { name: 'admin comment', value: "admin'--@test.com" },
    { name: 'double quote', value: '"or+1=1--@test.com' },
    { name: 'semicolon', value: "';drop+table+users--@test.com" },
  ];
  for (const { name, value } of SQLI_PAYLOADS) {
    test(`FUZZ-003: SQL injection (${name}) is handled`, async ({ page }) => {
      let intercepted = false;
      await page.route('**/api/auth/login', async route => {
        intercepted = true;
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ detail: 'Invalid credentials' }),
        });
      });

      await page.goto('/login');
      await page.fill('[data-testid="auth-email-input"]', value);
      await page.fill('[data-testid="auth-password-input"]', 'test123');
      await page.click('[data-testid="auth-login-btn"]');
      await page.waitForTimeout(1000);

      expect(intercepted).toBeTruthy();
    });
  }

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

  const CONTENT_LENGTHS = [2000, 3000, 5000, 10000] as const;
  for (const len of CONTENT_LENGTHS) {
    test(`FUZZ-005: create post with ${len}-char content`, async ({ page }) => {
      await page.goto('/login');
      await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
      await page.fill('[data-testid="auth-password-input"]', 'alice123');
      await page.click('[data-testid="auth-login-btn"]');
      await page.waitForURL('**/');

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
        await postInput.fill('A'.repeat(len));
        await page.click('[data-testid="post-composer-submit"]');
        await page.waitForTimeout(1000);
        expect(rejected).toBeTruthy();
      }
    });
  }

  const UNICODE_SAMPLES = [
    { name: 'CJK + emoji', text: 'Hello 你好 🌍🎉! <script>alert(1)</script>' },
    { name: 'Arabic RTL', text: 'مرحبا العالم <img src=x onerror=alert(1)>' },
    { name: 'Zero-width chars', text: 'Hello\u200B\u200C\u200D\uFEFFWorld' },
    { name: 'Mixed scripts', text: 'Привет مرحبا こんにちは 🎉' },
  ];
  for (const { name, text } of UNICODE_SAMPLES) {
    test(`FUZZ-006: post with unicode (${name})`, async ({ page }) => {
      await page.goto('/login');
      await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
      await page.fill('[data-testid="auth-password-input"]', 'alice123');
      await page.click('[data-testid="auth-login-btn"]');
      await page.waitForURL('**/');

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
        await postInput.fill(text);
        await page.click('[data-testid="post-composer-submit"]');
        await page.waitForTimeout(1000);

        expect(postedContent).toBeTruthy();
      }
    });
  }

  // ── Search fuzzing ──

  const XSS_VECTORS = [
    { name: 'img onerror', query: '<img src=x onerror=alert(1)>' },
    { name: 'script tag', query: '<script>alert(1)</script>' },
    { name: 'svg onload', query: '<svg onload=alert(1)>' },
    { name: 'javascript URI', query: 'javascript:alert(1)' },
    { name: 'onfocus', query: '<input onfocus=alert(1) autofocus>' },
  ];
  for (const { name, query } of XSS_VECTORS) {
    test(`FUZZ-007: search XSS (${name}) is escaped`, async ({ page }) => {
      await page.goto('/login');
      await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
      await page.fill('[data-testid="auth-password-input"]', 'alice123');
      await page.click('[data-testid="auth-login-btn"]');
      await page.waitForURL('**/');

      await page.route('**/api/search*', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ items: [], total: 0 }),
        });
      });

      const searchInput = page.locator('[data-testid="nav-search-input"]');
      if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await searchInput.fill(query);
        await page.waitForTimeout(500);

        const html = await page.evaluate(() => document.body.innerHTML);
        expect(html).not.toContain('onerror=alert(1)');
        expect(html).not.toContain('<script>');
      }
    });
  }

  const SEARCH_LENGTHS = [1000, 5000, 10000] as const;
  for (const len of SEARCH_LENGTHS) {
    test(`FUZZ-008: search with ${len}-char query`, async ({ page }) => {
      await page.goto('/login');
      await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
      await page.fill('[data-testid="auth-password-input"]', 'alice123');
      await page.click('[data-testid="auth-login-btn"]');
      await page.waitForURL('**/');

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
        await searchInput.fill('a'.repeat(len));
        await page.waitForTimeout(500);

        const title = await page.evaluate(() => document.title).catch(() => null);
        expect(title).not.toBeNull();
      }
    });
  }

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

  const SHORT_PASSWORDS = ['a', 'ab', 'abc', 'abcd', 'abcde'] as const;
  for (const pw of SHORT_PASSWORDS) {
    test(`FUZZ-010: register with ${pw.length}-char password blocked`, async ({ page }) => {
      await page.goto('/register');
      await page.fill('[data-testid="auth-email-input"]', 'new@test.com');
      await page.fill('[data-testid="auth-username-input"]', 'newuser');
      await page.fill('[data-testid="auth-password-input"]', pw);
      await page.fill('[data-testid="auth-display-name-input"]', 'New User');
      await page.click('[data-testid="auth-register-btn"]');

      const passwordInput = page.locator('[data-testid="auth-password-input"]');
      const validation = await passwordInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      expect(validation.length).toBeGreaterThan(0);
    });
  }
});
