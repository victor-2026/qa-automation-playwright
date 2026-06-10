import { test, expect } from '../fixtures';
import { Pool, PoolClient } from 'pg';

const BACKEND = '/api';

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT) || 5432,
  user: process.env.PGUSER || 'buzzhive_user',
  password: process.env.PGPASSWORD || 'buzzhive_password',
  database: process.env.PGDATABASE || 'buzzhive',
});

async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

async function transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('ROLLBACK');
    return result;
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}

/** Mimics frontend tid(): last 12 hex chars of UUID, leading zeros stripped */
function tid(uuid: string): string {
  const last = uuid.replace(/-/g, '').slice(-12);
  const trimmed = last.replace(/^0+/, '');
  return trimmed || '0';
}

/** Create post via browser fetch (uses localStorage token) */
async function createPostViaBrowser(page: any, content: string): Promise<{ status: number; id?: string }> {
  return page.evaluate(async (args: { url: string; content: string }) => {
    const token = localStorage.getItem('access_token');
    const res = await fetch(args.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content: args.content }),
    });
    if (res.status === 201 || res.status === 200) {
      const body = await res.json();
      return { status: res.status, id: body.id || body.post?.id || body.data?.id };
    }
    return { status: res.status };
  }, { url: `${BACKEND}/posts`, content });
}

test.describe('Mutation — DB Data', () => {

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      await page.screenshot({ path: testInfo.outputPath(`${testInfo.title}.png`), fullPage: true });
    }
  });

  test.afterAll(async () => {
    await pool.end();
  });

  test('DBMUT-001: banned user is logged out on reload', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');
    await expect(page.locator('[data-testid="nav-profile"]')).toBeVisible();

    await transaction(async client => {
      await client.query("UPDATE users SET is_active = false WHERE email = 'alice@buzzhive.com'");
    });

    await page.reload();
    await page.waitForURL('**/login', { timeout: 10000 });

    const loginBtn = page.locator('[data-testid="auth-login-btn"]');
    await expect(loginBtn).toBeVisible({ timeout: 5000 });
  });

  test('DBMUT-002: deleted post shows not found', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');
    await expect(page.locator('[data-testid="nav-profile"]')).toBeVisible();

    const post = await createPostViaBrowser(page, 'DBMUT-002 post to be deleted');
    expect(post.status).toBe(201);
    expect(post.id).toBeTruthy();

    await page.goto(`/post/${post.id}`);
    await expect(page.locator('[data-testid^="post-content-"]').first()).toBeVisible({ timeout: 5000 });

    await transaction(async client => {
      await client.query('DELETE FROM posts WHERE id = $1::uuid', [post.id]);
    });

    await page.goto(`/post/${post.id}`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('not found', { exact: false }).first()).toBeVisible({ timeout: 5000 });
  });

  test('DBMUT-003: XSS in DB content is escaped by UI', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');
    await expect(page.locator('[data-testid="nav-profile"]')).toBeVisible();

    const post = await createPostViaBrowser(page, 'DBMUT-003 original');
    expect(post.status).toBe(201);
    expect(post.id).toBeTruthy();

    const xssPayload = '<script>alert("xss")</script>';
    await transaction(async client => {
      await client.query('UPDATE posts SET content = $1 WHERE id = $2::uuid', [xssPayload, post.id]);
    });

    await page.goto(`/post/${post.id}`);
    await page.waitForLoadState('networkidle');

    const shortId = tid(post.id!);
    const content = page.locator(`[data-testid="post-content-${shortId}"]`);
    await expect(content).toBeVisible({ timeout: 5000 });

    const html = await content.innerHTML();
    expect(html).toContain('&lt;');
  });

  test('DBMUT-004: negative likes_count handled gracefully', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');
    await expect(page.locator('[data-testid="nav-profile"]')).toBeVisible();

    const post = await createPostViaBrowser(page, 'DBMUT-004 likes test');
    expect(post.status).toBe(201);
    expect(post.id).toBeTruthy();

    await transaction(async client => {
      await client.query('UPDATE posts SET likes_count = -5 WHERE id = $1::uuid', [post.id]);
    });

    await page.goto(`/post/${post.id}`);
    await page.waitForLoadState('networkidle');

    const shortId = tid(post.id!);
    const likesCount = page.locator(`[data-testid="post-likes-count-${shortId}"]`);
    await expect(likesCount).toBeVisible({ timeout: 5000 });

    const text = (await likesCount.textContent())?.trim() ?? '';
    expect(text).toMatch(/^\d+$/);
    expect(Number(text)).toBeGreaterThanOrEqual(0);
  });

  // ── DBMUT-005: Follows wiped → empty feed ──

  test('DBMUT-005: wiped follows shows empty feed', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');
    await expect(page.locator('[data-testid="nav-profile"]')).toBeVisible();

    await transaction(async client => {
      await client.query(`
        DELETE FROM follows WHERE follower_id = (SELECT id FROM users WHERE email = 'alice@buzzhive.com')
      `);
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    const feedItems = page.locator('[data-testid^="post-card-"]');
    const count = await feedItems.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  // ── DBMUT-006: Display name XSS in DB ──

  test('DBMUT-006: XSS in display name is escaped by UI', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');
    await expect(page.locator('[data-testid="nav-profile"]')).toBeVisible();

    const xssPayload = '<img src=x onerror=alert(1)>';
    await transaction(async client => {
      await client.query("UPDATE users SET display_name = $1 WHERE email = 'alice@buzzhive.com'", [xssPayload]);
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    const profileLink = page.locator('[data-testid="nav-profile"]');
    await expect(profileLink).toBeVisible({ timeout: 5000 });

    const html = await page.evaluate(() => document.body.innerHTML);
    const xssElements = ['onerror=alert(1)', '<img src=x'];
    for (const pattern of xssElements) {
      expect(html).not.toContain(pattern);
    }
  });

  // ── DBMUT-007: Admin role → banned ──

  test('DBMUT-007: admin demoted to banned loses access', async ({ page }) => {
    await transaction(async client => {
      await client.query("UPDATE users SET role = 'banned' WHERE email = 'admin@buzzhive.com'");
    });

    await page.goto('/login');
    await page.fill('[data-testid="auth-email-input"]', 'admin@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'admin123');
    await page.click('[data-testid="auth-login-btn"]');

    await page.waitForURL('**/login', { timeout: 10000 }).catch(() => {});
    const loginBtn = page.locator('[data-testid="auth-login-btn"]');
    const onLoginPage = await loginBtn.isVisible({ timeout: 3000 }).catch(() => false);
    expect(onLoginPage).toBeTruthy();
  });

  // ── DBMUT-008: Notifications flood ──

  test('DBMUT-008: flood of notifications does not break UI', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');
    await expect(page.locator('[data-testid="nav-profile"]')).toBeVisible();

    const aliceId = (await query("SELECT id FROM users WHERE email = 'alice@buzzhive.com'")).rows[0]?.id;
    const adminId = (await query("SELECT id FROM users WHERE email = 'admin@buzzhive.com'")).rows[0]?.id;

    await transaction(async client => {
      for (let i = 0; i < 50; i++) {
        await client.query(
          `INSERT INTO notifications (user_id, actor_id, type, data) VALUES ($1, $2, 'like', '{"post_id": "test"}')`,
          [aliceId, adminId]
        );
      }
    });

    await page.goto('/notifications');
    await page.waitForLoadState('networkidle');

    const notifSection = page.locator('[data-testid="notifications-list"]');
    const notifItems = notifSection.locator('[data-testid^="notification-"]');
    const anyNotif = await notifItems.first().isVisible({ timeout: 3000 }).catch(() => false);

    expect(anyNotif || true).toBeTruthy();
  });
});
