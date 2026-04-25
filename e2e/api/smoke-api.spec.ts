import { test, expect } from '@playwright/test';
import { TEST_ACCOUNTS } from '../setup/credentials';
import { cleanupTestData } from '../teardown/cleanup';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:8000/api';

test.describe('API Smoke Tests - Render', () => {
  test.setTimeout(60000);

  test('1. Health check', async ({ request }) => {
    const res = await request.get(`${API_BASE}/health`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('healthy');
    expect(body.database).toBe('connected');
  });

  test('2. Login with admin', async ({ request }) => {
    const res = await request.post(`${API_BASE}/auth/login`, {
      data: { email: TEST_ACCOUNTS.admin.email, password: TEST_ACCOUNTS.admin.password },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.access_token).toBeDefined();
    expect(body.refresh_token).toBeDefined();
    expect(body.token_type).toBe('bearer');
  });

  test('3. Login with user', async ({ request }) => {
    const res = await request.post(`${API_BASE}/auth/login`, {
      data: { email: TEST_ACCOUNTS.user.email, password: TEST_ACCOUNTS.user.password },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.access_token).toBeDefined();
  });

  test('4. Login with invalid credentials', async ({ request }) => {
    const res = await request.post(`${API_BASE}/auth/login`, {
      data: { email: 'invalid@test.com', password: 'wrong' },
    });
    expect(res.status()).toBe(401);
  });

  test('5. Get posts', async ({ request }) => {
    const res = await request.post(`${API_BASE}/auth/login`, {
      data: { email: TEST_ACCOUNTS.user.email, password: TEST_ACCOUNTS.user.password },
    });
    const { access_token } = await res.json();

    const postsRes = await request.get(`${API_BASE}/posts`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    expect(postsRes.status()).toBe(200);
    const body = await postsRes.json();
    expect(body).toHaveProperty('items');
  });

  test('6. Create post', async ({ request }) => {
    const res = await request.post(`${API_BASE}/auth/login`, {
      data: { email: TEST_ACCOUNTS.user.email, password: TEST_ACCOUNTS.user.password },
    });
    const { access_token } = await res.json();

    const createRes = await request.post(`${API_BASE}/posts`, {
      headers: { Authorization: `Bearer ${access_token}` },
      data: { title: 'Smoke Test Post', content: 'Testing API on Render' },
    });
    expect(createRes.status()).toBe(201);
    const body = await createRes.json();
    expect(body.id).toBeDefined();
  });

  test('7. Get conversations', async ({ request }) => {
    const res = await request.post(`${API_BASE}/auth/login`, {
      data: { email: TEST_ACCOUNTS.user.email, password: TEST_ACCOUNTS.user.password },
    });
    const { access_token } = await res.json();

    const convRes = await request.get(`${API_BASE}/conversations`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    expect(convRes.status()).toBe(200);
  });

  test('8. Get notifications', async ({ request }) => {
    const res = await request.post(`${API_BASE}/auth/login`, {
      data: { email: TEST_ACCOUNTS.user.email, password: TEST_ACCOUNTS.user.password },
    });
    const { access_token } = await res.json();

    const notifRes = await request.get(`${API_BASE}/notifications`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    expect(notifRes.status()).toBe(200);
    const body = await notifRes.json();
    expect(Array.isArray(body.items)).toBe(true);
  });

  test('9. Admin get users', async ({ request }) => {
    const res = await request.post(`${API_BASE}/auth/login`, {
      data: { email: TEST_ACCOUNTS.admin.email, password: TEST_ACCOUNTS.admin.password },
    });
    const { access_token } = await res.json();

    const usersRes = await request.get(`${API_BASE}/admin/users`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    expect(usersRes.status()).toBe(200);
  });

  test('10. Refresh token', async ({ request }) => {
    const loginRes = await request.post(`${API_BASE}/auth/login`, {
      data: { email: TEST_ACCOUNTS.user.email, password: TEST_ACCOUNTS.user.password },
    });
    const { refresh_token } = await loginRes.json();

    const refreshRes = await request.post(`${API_BASE}/auth/refresh`, {
      data: { refresh_token },
    });
    expect(refreshRes.status()).toBe(200);
    const body = await refreshRes.json();
    expect(body.access_token).toBeDefined();
  });

  test('11. Get user profile', async ({ request }) => {
    const res = await request.post(`${API_BASE}/auth/login`, {
      data: { email: TEST_ACCOUNTS.user.email, password: TEST_ACCOUNTS.user.password },
    });
    const { access_token } = await res.json();

    const profileRes = await request.get(`${API_BASE}/users/me`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    expect(profileRes.status()).toBe(200);
    const body = await profileRes.json();
    expect(body.email).toBe(TEST_ACCOUNTS.user.email);
  });

  test('12. Reset database (admin)', async ({ request }) => {
    const res = await request.post(`${API_BASE}/auth/login`, {
      data: { email: TEST_ACCOUNTS.admin.email, password: TEST_ACCOUNTS.admin.password },
    });
    const { access_token } = await res.json();

    const resetRes = await request.post(`${API_BASE}/reset`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    expect(resetRes.status()).toBe(200);
    const body = await resetRes.json();
    expect(body.status).toBe('reset');
  });
});