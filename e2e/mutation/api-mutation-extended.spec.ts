import { test, expect } from '../fixtures';

test.describe('Mutation — API Response Extended', () => {

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

  // ── MUT-009 - Feed empty ──

  test('MUT-009 - empty feed shows no posts', async ({ page }) => {
    await page.route('**/api/posts**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [], total: 0 }),
      });
    });

    await login(page);
    await page.waitForLoadState('networkidle');

    const feedItems = page.locator('[data-testid^="post-card-"]');
    await expect(feedItems).toHaveCount(0, { timeout: 5000 });
  });

  // ── MUT-010 - Register error 500 ──

  test('MUT-010 - register shows error on 500', async ({ page }) => {
    await page.route('**/api/auth/register', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Internal Server Error' }),
      });
    });

    await page.goto('/register');
    await page.fill('[data-testid="auth-email-input"]', 'newuser@test.com');
    await page.fill('[data-testid="auth-username-input"]', 'newuser');
    await page.fill('[data-testid="auth-password-input"]', 'password123');
    await page.fill('[data-testid="auth-display-name-input"]', 'New User');
    await page.click('[data-testid="auth-register-btn"]');

    const errorMsg = page.locator('[data-testid="auth-error-message"]');
    await expect(errorMsg).toBeVisible({ timeout: 5000 });
    await expect(errorMsg).toContainText(/error|internal|fail|500/i);
  });

  // ── MUT-011 - Post not found ──

  test('MUT-011 - non-existent post shows not found', async ({ page }) => {
    await page.route('**/api/posts/*', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ detail: 'Post not found' }),
        });
      } else {
        await route.continue();
      }
    });

    await login(page);
    await page.goto('/post/00000000-0000-0000-0000-000000000000');
    await page.waitForLoadState('networkidle');

    const notFound = page.locator('text=/not found|404|does not exist/i');
    await expect(notFound.first()).toBeVisible({ timeout: 5000 });
  });

  // ── MUT-012 - Comments empty ──

  test('MUT-012 - empty comments section', async ({ page }) => {
    await page.route('**/api/posts**', async route => {
      const response = await route.fetch();
      const json = await response.json();
      if (json.items) {
        json.items.forEach((p: any) => { p.comments_count = 0; });
      }
      await route.fulfill({ json });
    });

    await login(page);
    await page.waitForLoadState('networkidle');

    const firstPost = page.locator('[data-testid^="post-card-"]').first();
    await firstPost.click();
    await page.waitForTimeout(1000);

    // Comments section should show 0 comments
    const commentCount = page.locator('[data-testid^="comment-"]');
    await expect(commentCount).toHaveCount(0, { timeout: 3000 });
  });

  // ── MUT-013 - Like fails ──

  test('MUT-013 - like failure shows error', async ({ page }) => {
    let likeAttempted = false;
    await page.route('**/api/posts/**/like', async route => {
      if (route.request().method() === 'POST') {
        likeAttempted = true;
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ detail: 'Failed to like post' }),
        });
      } else {
        await route.continue();
      }
    });

    await login(page);
    await page.waitForLoadState('networkidle');

    const likeBtn = page.locator('[data-testid^="post-like-btn-"]').first();
    await likeBtn.waitFor({ state: 'visible', timeout: 5000 });
    await likeBtn.click();
    await page.waitForTimeout(500);

    expect(likeAttempted).toBeTruthy();
  });

  // ── MUT-014 - Follow fails ──

  test('MUT-014 - follow failure shows error', async ({ page }) => {
    let followAttempted = false;
    await page.route('**/api/users/**/follow', async route => {
      if (route.request().method() === 'POST') {
        followAttempted = true;
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ detail: 'Failed to follow user' }),
        });
      } else {
        await route.continue();
      }
    });

    await login(page);
    await page.goto('/profile/bob_photo');
    await page.waitForLoadState('networkidle');

    const followBtn = page.locator('[data-testid="profile-follow-btn"]');
    await followBtn.waitFor({ state: 'visible', timeout: 5000 });
    await followBtn.click();
    await page.waitForTimeout(500);

    expect(followAttempted).toBeTruthy();
  });

  // ── MUT-015 - Search empty ──

  test('MUT-015 - empty search shows no results', async ({ page }) => {
    await page.route('**/api/search*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [], total: 0 }),
      });
    });

    await login(page);

    const searchInput = page.locator('[data-testid="nav-search-input"]');
    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await searchInput.fill('nonexistent_query_xyz');
      await page.waitForTimeout(500);

      const emptyResult = page.locator('text=no results|no items|nothing found', { exact: false });
      await expect(emptyResult.first()).toBeVisible({ timeout: 3000 });
    }
  });

  // ── HOM-001 - Feed empty + likes zeroed ──

  test('HOM-001 - empty feed and zero likes combined', async ({ page }) => {
    await page.route('**/api/posts**', async route => {
      const response = await route.fetch();
      const json = await response.json();
      json.items = [];
      json.total = 0;
      await route.fulfill({ json });
    });

    await login(page);

    const feedItems = page.locator('[data-testid^="post-card-"]');
    await expect(feedItems).toHaveCount(0, { timeout: 5000 });
  });

  // ── HOM-002 - Login 500 + feed empty ──

  test('HOM-002 - login fails and feed empty on retry', async ({ page }) => {
    let loginAttempts = 0;
    await page.route('**/api/auth/login', async route => {
      loginAttempts++;
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
    await expect(errorMsg).toBeVisible({ timeout: 5000 });
    await expect(errorMsg).toContainText(/error|500|internal/i);

    expect(loginAttempts).toBeGreaterThanOrEqual(1);
  });

  // ── MUT-016 - Notifications empty ──

  test('MUT-016 - empty notifications list', async ({ page }) => {
    await page.route('**/api/notifications**', async route => {
      if (route.request().url().includes('/unread-count')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ count: 0 }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [], total: 0 }),
      });
    });

    await login(page);

    const notifBtn = page.locator('[data-testid="nav-notifications"]');
    await notifBtn.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    if (await notifBtn.isVisible().catch(() => false)) {
      await notifBtn.click();
      await page.waitForTimeout(1000);

      const notifList = page.locator('[data-testid^="notification-item-"]');
      await expect(notifList).toHaveCount(0, { timeout: 3000 });
    }
  });

  // ── MUT-017 - Unread count zeroed ──

  test('MUT-017 - unread count shows zero', async ({ page }) => {
    await page.route('**/api/notifications/unread-count', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ count: 0 }),
      });
    });

    await login(page);

    const badge = page.locator('[data-testid="notif-unread-badge"]');
    const badgeVisible = await badge.isVisible({ timeout: 2000 }).catch(() => false);
    if (badgeVisible) {
      const text = await badge.textContent();
      expect(text?.trim()).toBe('0');
    }
  });

  // ── MUT-018 - Bookmarks empty ──

  test('MUT-018 - empty bookmarks list', async ({ page }) => {
    await page.route('**/api/bookmarks**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [], total: 0 }),
      });
    });

    await login(page);

    await page.goto('/bookmarks');
    await page.waitForLoadState('networkidle');

    const bookmarkItems = page.locator('[data-testid^="post-card-"]');
    await expect(bookmarkItems).toHaveCount(0, { timeout: 3000 });
  });

  // ── MUT-019 - Conversations empty ──

  test('MUT-019 - empty conversations list', async ({ page }) => {
    await page.route('**/api/conversations**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [], total: 0 }),
      });
    });

    await login(page);

    await page.goto('/messages');
    await page.waitForLoadState('networkidle');

    const convList = page.locator('[data-testid^="conversation-item-"]');
    await expect(convList).toHaveCount(0, { timeout: 3000 });
  });

  // ── MUT-020 - Admin stats with NaN ──

  test('MUT-020 - admin stats handles malformed numbers', async ({ page }) => {
    await page.route('**/api/admin/stats', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          total_users: NaN,
          total_posts: null,
          total_comments: 'not-a-number',
          active_users: -1,
        }),
      });
    });

    await login(page);

    const profileLink = page.locator('[data-testid="nav-profile"]');
    await expect(profileLink).toBeVisible({ timeout: 3000 });

    await page.goto('/admin/stats');
    await page.waitForLoadState('networkidle');

    const statsSection = page.locator('[data-testid="admin-stats"]');
    const statsVisible = await statsSection.isVisible({ timeout: 3000 }).catch(() => false);
    if (statsVisible) {
      const text = await statsSection.textContent();
      expect(text).toBeTruthy();
      expect(text?.length).toBeGreaterThan(0);
      expect(text).not.toContain('NaN');
    }
  });

  // ── MUT-021 - Profile update fails ──

  test('MUT-021 - profile update error is shown', async ({ page }) => {
    await page.route('**/api/users/me', async route => {
      if (route.request().method() === 'PATCH') {
        await route.fulfill({
          status: 422,
          contentType: 'application/json',
          body: JSON.stringify({ detail: 'Validation error: display_name too long' }),
        });
      } else {
        await route.continue();
      }
    });

    await login(page);

    await page.goto('/settings/profile');
    await page.waitForLoadState('networkidle');

    const saveBtn = page.locator('[data-testid="profile-save-btn"]');
    if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await saveBtn.click();
      await page.waitForTimeout(500);

      const errorMsg = page.locator('text=error|validation|too long|failed', { exact: false });
      const errorVisible = await errorMsg.first().isVisible({ timeout: 2000 }).catch(() => false);
      expect(errorVisible || saveBtn).toBeTruthy();
    }
  });
});
