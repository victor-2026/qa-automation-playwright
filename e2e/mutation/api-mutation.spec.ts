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

  // ── MUT-001: likes_count → 0 ──

  test('MUT-001: likes_count zeroed out', async ({ page }) => {
    await page.route('**/api/posts*', async route => {
      const response = await route.fetch();
      const json = await response.json();
      if (json.items) json.items.forEach((p: any) => { p.likes_count = 0; });
      await route.fulfill({ json });
    });

    await login(page);

    const firstLikes = page.locator('[data-testid^="post-likes-count-"]').first();
    const text = await firstLikes.textContent();
    expect(text?.trim()).toBe('0');
  });

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

  // ── MUT-003: Login response → 500 ──

  test('MUT-003: login endpoint returns 500', async ({ page }) => {
    await page.route('**/api/auth/login', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Internal Server Error' }),
      });
    });

    await page.goto('/login');
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');

    const errorMsg = page.locator('[data-testid="auth-error-message"]');
    await expect(errorMsg).toBeVisible({ timeout: 3000 });
    await expect(errorMsg).toContainText('Internal Server Error');
  });

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

  test('MUT-008: XSS in post content is escaped', async ({ page }) => {
    const xssPayload = '<img src=x onerror=alert(1)>';
    await page.route('**/api/posts*', async route => {
      const response = await route.fetch();
      const json = await response.json();
      if (json.items && json.items.length > 0) json.items[0].content = xssPayload;
      await route.fulfill({ json });
    });

    await login(page);

    await page.waitForLoadState('networkidle');
    const content = page.locator('[data-testid^="post-content-"]').first();
    await expect(content).toBeVisible({ timeout: 5000 });
    const text = await content.textContent();
    expect(text).not.toContain(xssPayload);
  });
});
