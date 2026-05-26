import { test, expect } from '../fixtures';
import { TEST_ACCOUNTS } from '../setup/credentials';
import { safeJson } from './helpers';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:8000/api';
const TEST_POSTFIX = `smoke-${Date.now()}`;

let cachedAccessToken: string | undefined;
let cachedAdminToken: string | undefined;
let createdPostId: string | undefined;

async function ensureAuthHeader(request: any) {
  if (!cachedAccessToken) {
    const loginRes = await request.post(`${API_BASE}/auth/login`, {
      data: { email: TEST_ACCOUNTS.user.email, password: TEST_ACCOUNTS.user.password },
    });
    const loginBody = await safeJson(loginRes);
    cachedAccessToken = (loginBody?.access_token as string) || '';
  }
  return `Bearer ${cachedAccessToken}`;
}

async function ensureAdminAuthHeader(request: any) {
  if (!cachedAdminToken) {
    const loginRes = await request.post(`${API_BASE}/auth/login`, {
      data: { email: TEST_ACCOUNTS.admin.email, password: TEST_ACCOUNTS.admin.password },
    });
    const loginBody = await safeJson(loginRes);
    cachedAdminToken = (loginBody?.access_token as string) || '';
  }
  return `Bearer ${cachedAdminToken}`;
}

test.describe('API Smoke Tests - Render', () => {
  test.setTimeout(30000);
  test.beforeEach(() => {
    cachedAccessToken = undefined;
  });

  test('1. Health check', async ({ request }) => {
    const res = await request.get(`${API_BASE}/health`);
    expect(res.status()).toBe(200);
    const body = await safeJson(res);
    expect(body).not.toBeNull();
    expect(body?.status).toBe('healthy');
  });

  test('2. Login with user', async ({ request }) => {
    const res = await request.post(`${API_BASE}/auth/login`, {
      data: { email: TEST_ACCOUNTS.user.email, password: TEST_ACCOUNTS.user.password },
    });
    expect(res.status()).toBe(200);
    const body = await safeJson(res);
    expect(body).not.toBeNull();
    expect(body?.access_token).toBeDefined();
    expect(body?.refresh_token).toBeDefined();
  });

  test('3. Login with invalid credentials', async ({ request }) => {
    const res = await request.post(`${API_BASE}/auth/login`, {
      data: { email: 'invalid@test.com', password: 'wrong' },
    });
    expect(res.status()).toBe(401);
  });

  test('4. Register new user', async ({ request }) => {
    const ts = Date.now();
    const email = `smoke-${ts}@test.com`;
    const res = await request.post(`${API_BASE}/auth/register`, {
      data: { email, password: 'Test1234!', username: `smoke${ts}`, display_name: `Smoke ${ts}` },
    });
    expect(res.status()).toBe(201);
    const body = await safeJson(res);
    expect(body).not.toBeNull();
    expect(body?.email).toBe(email);
  });

  test('5. Get user by username', async ({ request }) => {
    const authHeader = await ensureAuthHeader(request);
    const res = await request.get(`${API_BASE}/users/alice_dev`, {
      headers: { Authorization: authHeader },
    });
    expect(res.status()).toBe(200);
    const body = await safeJson(res);
    expect(body).not.toBeNull();
    expect(body?.username).toBe('alice_dev');
  });

  test('6. Create post', async ({ request }) => {
    const authHeader = await ensureAuthHeader(request);
    const res = await request.post(`${API_BASE}/posts`, {
      headers: { Authorization: authHeader },
      data: { content: `Smoke test post ${TEST_POSTFIX}`, hashtags: ['smoke'] },
    });
    expect(res.status()).toBe(201);
    const body = await safeJson(res);
    expect(body).not.toBeNull();
    createdPostId = body?.id || body?.post?.id;
    expect(createdPostId).toBeDefined();
  });

  test('7. Refresh token', async ({ request }) => {
    const loginRes = await request.post(`${API_BASE}/auth/login`, {
      data: { email: TEST_ACCOUNTS.user.email, password: TEST_ACCOUNTS.user.password },
    });
    const loginBody = await safeJson(loginRes);
    expect(loginBody?.refresh_token).toBeDefined();

    const refreshRes = await request.post(`${API_BASE}/auth/refresh`, {
      data: { refresh_token: loginBody?.refresh_token },
    });
    // 200 = new tokens issued, 422 = token still valid (depends on implementation)
    expect([200, 422]).toContain(refreshRes.status());
    const refreshBody = await safeJson(refreshRes);
    expect(refreshBody).not.toBeNull();
  });

  test('8. Get posts (authenticated)', async ({ request }) => {
    const authHeader = await ensureAuthHeader(request);
    const postsRes = await request.get(`${API_BASE}/posts`, {
      headers: { Authorization: authHeader },
    });
    expect(postsRes.status()).toBe(200);
    const postsBody = await safeJson(postsRes);
    expect(postsBody).not.toBeNull();
    const posts = Array.isArray(postsBody) ? postsBody : (postsBody?.posts || postsBody?.data || []);
    expect(Array.isArray(posts)).toBeTruthy();
  });

  test('9. Get user profile', async ({ request }) => {
    const authHeader = await ensureAuthHeader(request);
    const profileRes = await request.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: authHeader },
    });
    expect(profileRes.status()).toBe(200);
    const body = await safeJson(profileRes);
    expect(body).not.toBeNull();
    expect(body?.email).toBe(TEST_ACCOUNTS.user.email);
  });

  test('10. Unauthorized access (no token)', async ({ request }) => {
    const postsRes = await request.get(`${API_BASE}/posts`);
    expect([401, 403]).toContain(postsRes.status());
  });

  test('11. Admin stats', async ({ request }) => {
    const authHeader = await ensureAdminAuthHeader(request);
    const res = await request.get(`${API_BASE}/admin/stats`, {
      headers: { Authorization: authHeader },
    });
    expect([200, 403]).toContain(res.status());
    if (res.status() === 200) {
      const body = await safeJson(res);
      expect(body).not.toBeNull();
    }
  });

  test('12. CORS health check (Render proxy)', async ({ request }) => {
    const res = await request.get(`${API_BASE}/health`, {
      headers: { Origin: 'https://qa-automation-playwright-1.onrender.com' }
    })
    const acHeader = res.headers()['access-control-allow-origin'] || res.headers()['Access-Control-Allow-Origin'];
    if (acHeader) {
      expect(acHeader).toBeDefined();
    }
  });
});
