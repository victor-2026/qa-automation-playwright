import { test, expect } from '../fixtures';
import { Pool } from 'pg';

const BACKEND = 'http://localhost:8000/api';

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

/** Mimics frontend tid(): last 12 hex chars of UUID, leading zeros stripped */
function tid(uuid: string): string {
  const last = uuid.replace(/-/g, '').slice(-12);
  const trimmed = last.replace(/^0+/, '');
  return trimmed || '0';
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

    await query("UPDATE users SET is_active = false WHERE email = 'alice@buzzhive.com'");

    await page.reload();
    await page.waitForLoadState('networkidle');

    const loginBtn = page.locator('[data-testid="auth-login-btn"]');
    await expect(loginBtn).toBeVisible({ timeout: 5000 });

    await query("UPDATE users SET is_active = true WHERE email = 'alice@buzzhive.com'");
  });

  test('DBMUT-002: deleted post shows not found', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');
    await expect(page.locator('[data-testid="nav-profile"]')).toBeVisible();

    const token = await page.evaluate(() => localStorage.getItem('access_token'));

    const res = await page.request.post(`${BACKEND}/posts`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { content: 'DBMUT-002 post to be deleted' },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    const postId = body.id || body.post?.id || body.data?.id;

    await page.goto(`/post/${postId}`);
    await expect(page.locator('[data-testid^="post-content-"]').first()).toBeVisible({ timeout: 5000 });

    await query('DELETE FROM posts WHERE id = $1::uuid', [postId]);

    await page.goto(`/post/${postId}`);
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

    const token = await page.evaluate(() => localStorage.getItem('access_token'));

    const res = await page.request.post(`${BACKEND}/posts`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { content: 'DBMUT-003 original' },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    const postId = body.id || body.post?.id || body.data?.id;

    const xssPayload = '<script>alert("xss")</script>';
    await query('UPDATE posts SET content = $1 WHERE id = $2::uuid', [xssPayload, postId]);

    await page.goto(`/post/${postId}`);
    await page.waitForLoadState('networkidle');

    const shortId = tid(postId);
    const content = page.locator(`[data-testid="post-content-${shortId}"]`);
    await expect(content).toBeVisible({ timeout: 5000 });

    const html = await content.innerHTML();
    expect(html).toContain('&lt;');

    await query('DELETE FROM posts WHERE id = $1::uuid', [postId]);
  });

  test('DBMUT-004: negative likes_count handled gracefully', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');
    await expect(page.locator('[data-testid="nav-profile"]')).toBeVisible();

    const token = await page.evaluate(() => localStorage.getItem('access_token'));

    const res = await page.request.post(`${BACKEND}/posts`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { content: 'DBMUT-004 likes test' },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    const postId = body.id || body.post?.id || body.data?.id;

    await query('UPDATE posts SET likes_count = -5 WHERE id = $1::uuid', [postId]);

    await page.goto(`/post/${postId}`);
    await page.waitForLoadState('networkidle');

    const shortId = tid(postId);
    const likesCount = page.locator(`[data-testid="post-likes-count-${shortId}"]`);
    await expect(likesCount).toBeVisible({ timeout: 5000 });

    const text = (await likesCount.textContent())?.trim() ?? '';
    expect(text).toMatch(/^\d+$/);
    expect(Number(text)).toBeGreaterThanOrEqual(0);

    await query('DELETE FROM posts WHERE id = $1::uuid', [postId]);
  });
});
