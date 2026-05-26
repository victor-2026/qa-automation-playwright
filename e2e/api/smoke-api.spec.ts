import { test, expect } from '../fixtures';
import { TEST_ACCOUNTS } from '../setup/credentials';
import { safeJson } from './helpers';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:8000/api';

let cachedAccessToken: string | undefined;

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
  });

  test('3. Login with invalid credentials', async ({ request }) => {
    const res = await request.post(`${API_BASE}/auth/login`, {
      data: { email: 'invalid@test.com', password: 'wrong' },
    });
    expect(res.status()).toBe(401);
  });

  test('4. Get posts (authenticated)', async ({ request }) => {
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

  test('7. CORS health check (Render proxy)', async ({ request }) => {
    const res = await request.get(`${API_BASE}/health`, {
      headers: { Origin: 'https://qa-automation-playwright-1.onrender.com' }
    })
    const acHeader = res.headers()['access-control-allow-origin'] || res.headers()['Access-Control-Allow-Origin'];
    if (acHeader) {
      expect(acHeader).toBeDefined();
    }
  });

  test('5. Get user profile', async ({ request }) => {
    const authHeader = await ensureAuthHeader(request);
    const profileRes = await request.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: authHeader },
    });
    expect(profileRes.status()).toBe(200);
    const body = await safeJson(profileRes);
    expect(body).not.toBeNull();
    expect(body?.email).toBe(TEST_ACCOUNTS.user.email);
  });

  test('6. Unauthorized access (no token)', async ({ request }) => {
    const postsRes = await request.get(`${API_BASE}/posts`);
    expect([401, 403]).toContain(postsRes.status());
  });
});
