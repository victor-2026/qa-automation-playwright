import { test, expect } from '../fixtures';

test.describe('Mutation — API Response', () => {

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

  // ── MUT-001: likes_count mutations ──

  const LIKES_MUTATIONS = [
    { name: 'zeroed out', value: 0, expected: '0' },
    { name: 'negative', value: -5, expected: '0' },
    { name: 'null', value: null, expected: '0' },
  ];
  for (const { name, value, expected } of LIKES_MUTATIONS) {
    test(`MUT-001: likes_count ${name}`, async ({ page }) => {
      await page.route('**/api/posts*', async route => {
        const response = await route.fetch();
        const json = await response.json();
        if (json.items) json.items.forEach((p: any) => { p.likes_count = value; });
        await route.fulfill({ json });
      });

      await login(page);

      const firstLikes = page.locator('[data-testid^="post-likes-count-"]').first();
      const text = await firstLikes.textContent();
      expect(text?.trim()).toBe(expected);
    });
  }

  // ── MUT-002: author.username → null ──

  test('MUT-002: author.username removed from post', async ({ page }) => {
    await page.route('**/api/posts*', async route => {
      const response = await route.fetch();
      const json = await response.json();
      if (json.items) json.items.forEach((p: any) => { if (p.author) p.author.username = null; });
      await route.fulfill({ json });
    });

    await login(page);

    const firstAuthor = page.locator('[data-testid^="post-author-"]').first();
    await expect(firstAuthor).not.toBeVisible();
  });

  // ── MUT-003: Login error codes ──

  const ERROR_CODES = [
    { status: 400, detail: 'Bad Request' },
    { status: 401, detail: 'Invalid credentials' },
    { status: 403, detail: 'Forbidden' },
    { status: 429, detail: 'Too Many Requests' },
    { status: 500, detail: 'Internal Server Error' },
    { status: 502, detail: 'Bad Gateway' },
    { status: 503, detail: 'Service Unavailable' },
  ];
  for (const { status, detail } of ERROR_CODES) {
    test(`MUT-003: login returns ${status}`, async ({ page }) => {
      await page.route('**/api/auth/login', async route => {
        await route.fulfill({
          status,
          contentType: 'application/json',
          body: JSON.stringify({ detail }),
        });
      });

      await page.goto('/login');
      await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
      await page.fill('[data-testid="auth-password-input"]', 'alice123');
      await page.click('[data-testid="auth-login-btn"]');

      const errorMsg = page.locator('[data-testid="auth-error-message"]');
      await expect(errorMsg).toBeVisible({ timeout: 3000 });
    });
  }

  // ── MUT-004: items → [] empty feed ──

  test('MUT-004: empty posts feed', async ({ page }) => {
    await page.route('**/api/posts*', async route => {
      const response = await route.fetch();
      const json = await response.json();
      json.items = [];
      json.total = 0;
      await route.fulfill({ json });
    });

    await login(page);

    await expect(page.locator('[data-testid^="post-card-"]').first()).not.toBeVisible({ timeout: 3000 });
  });

  // ── MUT-005: is_verified → false ──

  test('MUT-005: user profile shows unverified', async ({ page }) => {
    await page.route('**/api/auth/me', async route => {
      const response = await route.fetch();
      const json = await response.json();
      json.is_verified = false;
      await route.fulfill({ json });
    });

    await login(page);
    await page.goto('/profile/alice_dev');

    const verifiedBadge = page.locator('[data-testid="verified-badge"]');
    await expect(verifiedBadge).not.toBeVisible({ timeout: 3000 });
  });

  // ── MUT-006: avatar_url → null ──

  test('MUT-006: avatar missing falls back to placeholder', async ({ page }) => {
    await page.route('**/api/auth/me', async route => {
      const response = await route.fetch();
      const json = await response.json();
      json.avatar_url = null;
      await route.fulfill({ json });
    });

    await login(page);
    await page.goto('/profile/alice_dev');

    const avatarDiv = page.locator('[data-testid="profile-avatar"]');
    await expect(avatarDiv).toBeVisible();
    const img = avatarDiv.locator('img');
    await expect(img).not.toBeVisible();
  });

  // ── MUT-007: Refresh token invalid → redirect to login ──

  test('MUT-007: auth/me returns 401 after login redirects to login page', async ({ page }) => {
    let callCount = 0;
    await page.route('**/api/auth/me', async route => {
      callCount++;
      if (callCount > 1) {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ detail: 'Not authenticated' }),
        });
      } else {
        const response = await route.fetch();
        const json = await response.json();
        await route.fulfill({ json });
      }
    });

    await page.goto('/login');
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');

    // Reload triggers second /auth/me call → 401 → redirect to /login
    await page.reload();
    await page.waitForLoadState('networkidle');

    const loginBtn = page.locator('[data-testid="auth-login-btn"]');
    await expect(loginBtn).toBeVisible({ timeout: 5000 });
  });

  // ── MUT-008: XSS in post content ──

  const XSS_PAYLOADS = [
    { name: 'img onerror', value: '<img src=x onerror=alert(1)>' },
    { name: 'script tag', value: '<script>alert(1)</script>' },
    { name: 'svg onload', value: '<svg onload=alert(1)>' },
    { name: 'javascript URI', value: 'javascript:alert(1)' },
  ];
  for (const { name, value } of XSS_PAYLOADS) {
    test(`MUT-008: XSS (${name}) is escaped`, async ({ page }) => {
      await page.route('**/api/posts*', async route => {
        const response = await route.fetch();
        const json = await response.json();
        if (json.items && json.items.length > 0) json.items[0].content = value;
        await route.fulfill({ json });
      });

      await login(page);

      await page.waitForLoadState('networkidle');
      const content = page.locator('[data-testid^="post-content-"]').first();
      await expect(content).toBeVisible({ timeout: 5000 });
      const text = await content.textContent();
      expect(text).not.toContain('<script>');
      expect(text).not.toContain('onerror=');
    });
  }
});
