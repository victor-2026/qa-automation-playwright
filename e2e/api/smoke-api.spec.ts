import { test, expect } from '@playwright/test';
import { TEST_ACCOUNTS } from '../setup/credentials';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:8000/api';

let cachedAccessToken: string | undefined;

async function ensureAuthHeader(request: any) {
  if (!cachedAccessToken) {
    const loginRes = await request.post(`${API_BASE}/auth/login`, {
      data: { email: TEST_ACCOUNTS.user.email, password: TEST_ACCOUNTS.user.password },
    });
    const loginBody = await loginRes.json();
    cachedAccessToken = loginBody.access_token;
  }
  return `Bearer ${cachedAccessToken}`;
}

test.describe('API Smoke Tests - Render', () => {
  test.setTimeout(30000);

  test('1. Health check', async ({ request }) => {
    const res = await request.get(`${API_BASE}/health`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('healthy');
  });

  test('2. Login with user', async ({ request }) => {
    const res = await request.post(`${API_BASE}/auth/login`, {
      data: { email: TEST_ACCOUNTS.user.email, password: TEST_ACCOUNTS.user.password },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.access_token).toBeDefined();
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
    const postsBody = await postsRes.json();
    // Accept both array or object with posts array
    const posts = Array.isArray(postsBody) ? postsBody : (postsBody.posts || postsBody.data || []);
    expect(Array.isArray(posts)).toBeTruthy();
  });

  test('5. Get user profile', async ({ request }) => {
    const authHeader = await ensureAuthHeader(request);
    const profileRes = await request.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: authHeader },
    });
    expect(profileRes.status()).toBe(200);
    const body = await profileRes.json();
    expect(body.email).toBe(TEST_ACCOUNTS.user.email);
  });

  test('6. Unauthorized access (no token)', async ({ request }) => {
    const postsRes = await request.get(`${API_BASE}/posts`);
    // API returns 403 (Forbidden) for missing token
    expect([401, 403]).toContain(postsRes.status());
  });
});