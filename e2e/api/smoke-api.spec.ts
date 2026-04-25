import { test, expect } from '@playwright/test';
import { TEST_ACCOUNTS } from '../setup/credentials';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:8000/api';

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
    const loginRes = await request.post(`${API_BASE}/auth/login`, {
      data: { email: TEST_ACCOUNTS.user.email, password: TEST_ACCOUNTS.user.password },
    });
    const { access_token } = await loginRes.json();

    const postsRes = await request.get(`${API_BASE}/posts`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    expect(postsRes.status()).toBe(200);
  });

  test('5. Get user profile', async ({ request }) => {
    const loginRes = await request.post(`${API_BASE}/auth/login`, {
      data: { email: TEST_ACCOUNTS.user.email, password: TEST_ACCOUNTS.user.password },
    });
    const { access_token } = await loginRes.json();

    const profileRes = await request.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    expect(profileRes.status()).toBe(200);
    const body = await profileRes.json();
    expect(body.email).toBe(TEST_ACCOUNTS.user.email);
  });

  test('6. Unauthorized access (no token)', async ({ request }) => {
    const postsRes = await request.get(`${API_BASE}/posts`);
    expect(postsRes.status()).toBe(401);
  });
});