import { test, expect } from '../fixtures';

// Phase 2b B2-band batch (2026-09-16): 20 B2 rows exercising the N>=20 band.
// Self-contained: each test mocks its own endpoint (no frontend paths needed),
// fetches it, and asserts. 19 detection (must go red) + 1 designed-weak
// survivor (P2B2-SURV: asserts status only → green = blind spot by design,
// decision=fixed → band: 1/20 = 5%, NOT > 5% → PASS boundary edge).
// Second CSV flips one more row to survived (2/20 = 10% → FAIL).
test.describe('Mutation — Phase 2b B2 band', () => {

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
    await page.waitForURL('**/', { timeout: 15000 });
  }

  async function apiGet(page: any, path: string) {
    return page.evaluate(async (p: string) => {
      const token = localStorage.getItem('access_token');
      const res = await fetch(p, { headers: { Authorization: `Bearer ${token}` } });
      let body: any = null;
      try { body = await res.json(); } catch { body = null; }
      return { ok: res.ok, status: res.status, body };
    }, path);
  }

  const EPS = [
    '/api/notifications',
    '/api/bookmarks',
    '/api/conversations',
    '/api/search',
    '/api/posts/feed',
  ];

  for (const ep of EPS) {
    test(`P2B2-500 ${ep}`, async ({ page }) => {
      await page.route(`**${ep}**`, r => r.fulfill({ status: 500, json: { detail: 'boom' } }));
      await login(page);
      const res: any = await apiGet(page, ep);
      expect(res.ok).toBe(true);
      expect(Array.isArray(res.body?.items ?? res.body)).toBe(true);
    });

    test(`P2B2-empty ${ep}`, async ({ page }) => {
      await page.route(`**${ep}**`, r => r.fulfill({ json: { items: [], total: 0 } }));
      await login(page);
      const res: any = await apiGet(page, ep);
      const items = res.body?.items ?? res.body;
      expect(Array.isArray(items) && items.length > 0).toBe(true);
    });

    test(`P2B2-drop ${ep}`, async ({ page }) => {
      await page.route(`**${ep}**`, r => r.fulfill({ json: {} }));
      await login(page);
      const res: any = await apiGet(page, ep);
      expect(res.ok).toBe(true);
      expect(Array.isArray(res.body?.items ?? res.body)).toBe(true);
    });
  }

  for (const ep of ['/api/notifications', '/api/bookmarks', '/api/conversations', '/api/search']) {
    test(`P2B2-404 ${ep}`, async ({ page }) => {
      await page.route(`**${ep}**`, r => r.fulfill({ status: 404, json: { detail: 'gone' } }));
      await login(page);
      const res: any = await apiGet(page, ep);
      expect(res.ok).toBe(true);
    });
  }

  test('P2B2-SURV bookmarks zeroed, status-only assert', async ({ page }) => {
    await page.route('**/api/bookmarks**', r => r.fulfill({ json: { items: [], total: 0 } }));
    await login(page);
    const res: any = await apiGet(page, '/api/bookmarks');
    expect(res.ok).toBe(true); // designed-weak: content unchecked → green = blind spot
  });

  test('P2B2-SURV2 posts empty, status-only assert', async ({ page }) => {
    await page.route('**/api/posts/feed**', r => r.fulfill({ json: { items: [], total: 0 } }));
    await login(page);
    const res: any = await apiGet(page, '/api/posts/feed');
    expect(res.ok).toBe(true); // designed-weak second survivor for the 2/20 flip file
  });
});
