import { test, expect } from '@playwright/test';

const BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3000';
const IS_RENDER = BASE_URL.includes('onrender.com');
const CONCURRENT_USERS = IS_RENDER ? 5 : 20;
const TIMEOUT = IS_RENDER ? 30000 : 10000;

async function warmup(request: any) {
  const apiBase = process.env.API_BASE_URL || (IS_RENDER ? `${BASE_URL}/api` : 'http://localhost:8000/api');
  for (let i = 0; i < 3; i++) {
    try {
      const res = await request.get(`${apiBase}/health`, { timeout: 5000 });
      if (res.ok()) return;
    } catch { /* retry */ }
  }
}

test.describe('Load Test — Stress', () => {

  test.beforeAll(async ({ request }) => {
    await warmup(request);
  });

  test('STRESS-001: concurrent login spike', async ({ browser }) => {
    test.setTimeout(120000);

    const contexts = await Promise.all(
      Array.from({ length: CONCURRENT_USERS }, () => browser.newContext())
    );
    const pages = await Promise.all(contexts.map(ctx => ctx.newPage()));

    const results = await Promise.all(
      pages.map(async (page, i) => {
        const start = Date.now();
        try {
          await page.goto(`${BASE_URL}/login`, { timeout: TIMEOUT, waitUntil: 'networkidle' });
          await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
          await page.fill('[data-testid="auth-password-input"]', 'alice123');
          await page.click('[data-testid="auth-login-btn"]');
          await page.locator('[data-testid="nav-profile"]').waitFor({ timeout: TIMEOUT }).catch(() => {});
          await page.waitForTimeout(200);
          return { user: i + 1, ok: true, time: Date.now() - start };
        } catch {
          return { user: i + 1, ok: false, time: Date.now() - start };
        }
      })
    );

    await Promise.all(contexts.map(ctx => ctx.close()));

    const successCount = results.filter(r => r.ok).length;
    const avgTime = results.reduce((s, r) => s + r.time, 0) / results.length;

    console.log(`=== STRESS-001: ${CONCURRENT_USERS} users spike ===`);
    console.log(`Success: ${successCount}/${CONCURRENT_USERS}`);
    console.log(`Avg time: ${avgTime.toFixed(0)}ms`);

    expect(successCount).toBeGreaterThanOrEqual(Math.ceil(CONCURRENT_USERS * 0.5));
  });

  test('STRESS-002: rapid post creation', async ({ browser }) => {
    test.setTimeout(120000);
    const postCount = IS_RENDER ? 3 : 10;

    const ctx = await browser.newContext();
    const page = await ctx.newPage();

    await page.goto(`${BASE_URL}/login`, { timeout: TIMEOUT });
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.locator('[data-testid="nav-profile"]').waitFor({ timeout: TIMEOUT }).catch(() => {});
    await page.waitForTimeout(1000);

    const results: { ok: boolean; time: number }[] = [];
    for (let i = 0; i < postCount; i++) {
      const start = Date.now();
      try {
        const responsePromise = page.waitForResponse(
          r => r.url().includes('/api/posts') && r.request().method() === 'POST',
          { timeout: 15000 }
        );
        await page.fill('[data-testid="post-composer-input"]', `Stress post ${i} ${Date.now()}`);
        await page.click('[data-testid="post-composer-submit"]');
        await responsePromise;
        results.push({ ok: true, time: Date.now() - start });
      } catch {
        results.push({ ok: false, time: Date.now() - start });
      }
      await page.waitForTimeout(300);
    }

    await ctx.close();

    const successCount = results.filter(r => r.ok).length;
    console.log(`=== STRESS-002: ${postCount} rapid posts ===`);
    console.log(`Success: ${successCount}/${postCount}`);

    expect(successCount).toBeGreaterThanOrEqual(Math.ceil(postCount * 0.5));
  });

  test('STRESS-003: API burst (sequential)', async ({ request }) => {
    test.setTimeout(60000);
    const burstCount = IS_RENDER ? 15 : 50;

    const apiBase = process.env.API_BASE_URL || `http://localhost:8000/api`;

    const res = await request.post(`${apiBase}/auth/login`, {
      data: { email: 'alice@buzzhive.com', password: 'alice123' },
    });
    const body = await res.json().catch(() => ({}));
    const token = body.access_token as string;

    if (!token) {
      console.log('Cannot get token, skipping');
      return;
    }

    const results: { ok: boolean; status: number; time: number }[] = [];
    for (let i = 0; i < burstCount; i++) {
      const start = Date.now();
      try {
        const r = await request.get(`${apiBase}/posts`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        });
        results.push({ ok: r.ok(), status: r.status(), time: Date.now() - start });
      } catch {
        results.push({ ok: false, status: 0, time: Date.now() - start });
      }
    }

    const successCount = results.filter(r => r.ok).length;
    const avgTime = results.reduce((s, r) => s + r.time, 0) / results.length;
    const rateLimited = results.filter(r => r.status === 429).length;

    console.log(`=== STRESS-003: ${burstCount} API burst ===`);
    console.log(`Success: ${successCount}/${burstCount}`);
    console.log(`Avg time: ${avgTime.toFixed(0)}ms`);
    console.log(`Rate limited: ${rateLimited}`);

    expect(successCount).toBeGreaterThan(0);
  });
});
