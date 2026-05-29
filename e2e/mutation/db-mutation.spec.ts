import { test, expect } from '../fixtures';
import { Pool } from 'pg';

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
    // Restore DB state if test failed mid-mutation
    if (testInfo.title.includes('DBMUT-001')) {
      await query("UPDATE users SET is_active = true WHERE email = 'alice@buzzhive.com'");
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
    // Frontend calls /auth/me → 403 → clears token → AppLayout redirects to /login
    await page.waitForURL('**/login', { timeout: 10000 });

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

    const post = await createPostViaBrowser(page, 'DBMUT-002 post to be deleted');
    expect(post.status).toBe(201);
    expect(post.id).toBeTruthy();

    await page.goto(`/post/${post.id}`);
    await expect(page.locator('[data-testid^="post-content-"]').first()).toBeVisible({ timeout: 5000 });

    await query('DELETE FROM posts WHERE id = $1::uuid', [post.id]);

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
    await query('UPDATE posts SET content = $1 WHERE id = $2::uuid', [xssPayload, post.id]);

    await page.goto(`/post/${post.id}`);
    await page.waitForLoadState('networkidle');

    const shortId = tid(post.id!);
    const content = page.locator(`[data-testid="post-content-${shortId}"]`);
    await expect(content).toBeVisible({ timeout: 5000 });

    const html = await content.innerHTML();
    expect(html).toContain('&lt;');

    await query('DELETE FROM posts WHERE id = $1::uuid', [post.id]);
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

    await query('UPDATE posts SET likes_count = -5 WHERE id = $1::uuid', [post.id]);

    await page.goto(`/post/${post.id}`);
    await page.waitForLoadState('networkidle');

    const shortId = tid(post.id!);
    const likesCount = page.locator(`[data-testid="post-likes-count-${shortId}"]`);
    await expect(likesCount).toBeVisible({ timeout: 5000 });

    const text = (await likesCount.textContent())?.trim() ?? '';
    expect(text).toMatch(/^\d+$/);
    expect(Number(text)).toBeGreaterThanOrEqual(0);

    await query('DELETE FROM posts WHERE id = $1::uuid', [post.id]);
  });
});
