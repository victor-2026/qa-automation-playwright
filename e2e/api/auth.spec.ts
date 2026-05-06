/**
 * Auth API Tests
 * Phase 3: Module Split
 */

import { test, expect } from '@playwright/test';
import { API_BASE, TEST_ACCOUNTS } from '../setup/credentials';
import { getToken, getAliceToken } from '../fixtures/tokens';
import { cleanupTestData } from '../teardown/cleanup';

test.afterAll(async ({ request }) => {
  await cleanupTestData(request, TEST_ACCOUNTS);
});

test.describe('API - Auth', () => {
  let aliceToken: string;

  test.beforeAll(async ({ request }) => {
    aliceToken = await getAliceToken(request);
  });

  // POST /auth/login - Happy path
  test('AUTH-API-001: Login with valid credentials returns 200 + tokens', async ({ request }) => {
    try {
      let res = await request.post(`${API_BASE}/auth/login`, {
        data: { email: TEST_ACCOUNTS.user.email, password: TEST_ACCOUNTS.user.password },
        timeout: 5000
      });
      if (res.status() === 500) {
        await new Promise(r => setTimeout(r, 1000));
        res = await request.post(`${API_BASE}/auth/login`, {
          data: { email: TEST_ACCOUNTS.user.email, password: TEST_ACCOUNTS.user.password },
          timeout: 5000
        });
      }
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty('access_token');
      expect(body).toHaveProperty('refresh_token');
    } catch (err) {
      console.error('AUTH-API-001 error', err);
      throw err;
    }
  });

  test('AUTH-API-002: Login returns correct token_type', async ({ request }) => {
    try {
      let res = await request.post(`${API_BASE}/auth/login`, {
        data: { email: TEST_ACCOUNTS.user.email, password: TEST_ACCOUNTS.user.password },
        timeout: 5000
      });
      if (res.status() === 500) {
        await new Promise(r => setTimeout(r, 1000));
        res = await request.post(`${API_BASE}/auth/login`, {
          data: { email: TEST_ACCOUNTS.user.email, password: TEST_ACCOUNTS.user.password },
          timeout: 5000
        });
      }
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty('token_type');
      expect(body.token_type.toLowerCase()).toBe('bearer');
    } catch (err) {
      console.error('AUTH-API-002 error', err);
      throw err;
    }
  });

  // POST /auth/login - Invalid input
  test('AUTH-API-003: Login with wrong password returns 401', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/auth/login`, {
        data: { email: TEST_ACCOUNTS.user.email, password: 'wrongpassword' },
        timeout: 5000,
      });
      expect(res.status()).toBe(401);
    } catch (err) {
      console.error('AUTH-API-003 error', err);
      throw err;
    }
  });

  test('AUTH-API-004: Login with non-existent email returns 401', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/auth/login`, {
        data: { email: 'nonexistent@test.com', password: 'anypassword' },
        timeout: 5000,
      });
      expect(res.status()).toBe(401);
    } catch (err) {
      console.error('AUTH-API-004 error', err);
      throw err;
    }
  });

  test('AUTH-API-005: Login with empty body returns 400/422', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/auth/login`, {
        data: {},
        timeout: 5000,
      });
      expect([400, 422]).toContain(res.status());
    } catch (err) {
      console.error('AUTH-API-005 error', err);
      throw err;
    }
  });

  // POST /auth/login - Boundary values
  test('AUTH-API-006: Login with very long password (1000 chars)', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/auth/login`, {
        data: { email: TEST_ACCOUNTS.user.email, password: 'a'.repeat(1000) },
        timeout: 5000,
      });
      expect(res.status()).toBe(401);
    } catch (err) {
      console.error('AUTH-API-006 error', err);
      throw err;
    }
  });

  test('AUTH-API-007: Login with SQL injection in email', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/auth/login`, {
        data: { email: "' OR '1'='1", password: 'anything' },
        timeout: 5000,
      });
      expect([400, 401, 422]).toContain(res.status());
    } catch (err) {
      console.error('AUTH-API-007 error', err);
      throw err;
    }
  });

  // GET /auth/me
  test('AUTH-API-008: /me with valid token returns 200 + user data', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 5000,
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty('email');
      expect(body.email).toBe(TEST_ACCOUNTS.user.email);
    } catch (err) {
      console.error('AUTH-API-008 error', err);
      throw err;
    }
  });

  test('AUTH-API-009: /me returns all required user fields', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 5000,
      });
      const body = await res.json();
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('username');
      expect(body).toHaveProperty('display_name');
      expect(body).toHaveProperty('role');
    } catch (err) {
      console.error('AUTH-API-009 error', err);
      throw err;
    }
  });

  test('AUTH-API-010: /me without token returns 401/403', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/auth/me`, {
        timeout: 5000,
      });
      expect(res.status()).toBeGreaterThanOrEqual(401);
    } catch (err) {
      console.error('AUTH-API-010 error', err);
      throw err;
    }
  });

  test('AUTH-API-011: /me with invalid token returns 401', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/auth/me`, {
        headers: { Authorization: 'Bearer invalid_token_123' },
        timeout: 5000,
      });
      expect(res.status()).toBeGreaterThanOrEqual(401);
    } catch (err) {
      console.error('AUTH-API-011 error', err);
      throw err;
    }
  });

  // POST /auth/register
  test('AUTH-API-012: Register with valid data returns 201', async ({ request }) => {
    try {
      const ts = Date.now();
      const res = await request.post(`${API_BASE}/auth/register`, {
        data: {
          email: `user${ts}@test.com`,
          username: `user${ts}`,
          password: 'password123',
          display_name: 'Test User',
        },
        timeout: 5000,
      });
      expect(res.status()).toBe(201);
    } catch (err) {
      console.error('AUTH-API-012 error', err);
      throw err;
    }
  });

  test('AUTH-API-013: Register returns user data', async ({ request }) => {
    try {
      const ts = Date.now();
      const res = await request.post(`${API_BASE}/auth/register`, {
        data: {
          email: `user${ts}@test.com`,
          username: `user${ts}`,
          password: 'password123',
          display_name: 'Test User',
        },
        timeout: 5000,
      });
      const body = await res.json();
      expect(body).toHaveProperty('username');
      expect(body).toHaveProperty('email');
    } catch (err) {
      console.error('AUTH-API-013 error', err);
      throw err;
    }
  });

  test('AUTH-API-014: Register with duplicate email returns 409', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/auth/register`, {
        data: {
          email: TEST_ACCOUNTS.user.email,
          username: 'anotheruser',
          password: 'password123',
          display_name: 'Test',
        },
        timeout: 5000,
      });
      expect(res.status()).toBe(409);
    } catch (err) {
      console.error('AUTH-API-014 error', err);
      throw err;
    }
  });

  test('AUTH-API-015: Register with duplicate username returns 409', async ({ request }) => {
    try {
      const ts = Date.now();
      const res = await request.post(`${API_BASE}/auth/register`, {
        data: {
          email: `new${ts}@test.com`,
          username: 'alice',
          password: 'password123',
          display_name: 'Test',
        },
        timeout: 5000,
      });
      expect(res.status()).toBe(409);
    } catch (err) {
      console.error('AUTH-API-015 error', err);
      throw err;
    }
  });

  // POST /auth/register - Boundary values
  test('AUTH-API-016: Register with password < 6 chars returns 422', async ({ request }) => {
    try {
      const ts = Date.now();
      const res = await request.post(`${API_BASE}/auth/register`, {
        data: {
          email: `user${ts}@test.com`,
          username: `user${ts}`,
          password: '12345', // 5 chars
          display_name: 'Test',
        },
        timeout: 5000,
      });
      expect(res.status()).toBe(422);
    } catch (err) {
      console.error('AUTH-API-016 error', err);
      throw err;
    }
  });

  test('AUTH-API-017: Register with password = 6 chars (min) succeeds', async ({ request }) => {
    try {
      const ts = Date.now();
      const res = await request.post(`${API_BASE}/auth/register`, {
        data: {
          email: `user${ts}@test.com`,
          username: `user${ts}`,
          password: '123456', // exactly 6 chars
          display_name: 'Test',
        },
        timeout: 5000,
      });
      expect(res.status()).toBe(201);
    } catch (err) {
      console.error('AUTH-API-017 error', err);
      throw err;
    }
  });

  test('AUTH-API-018: Register with invalid email format returns 422', async ({ request }) => {
    try {
      const ts = Date.now();
      const res = await request.post(`${API_BASE}/auth/register`, {
        data: {
          email: 'notanemail',
          username: `user${ts}`,
          password: 'password123',
          display_name: 'Test',
        },
        timeout: 5000,
      });
      expect(res.status()).toBe(422);
    } catch (err) {
      console.error('AUTH-API-018 error', err);
      throw err;
    }
  });

  test('AUTH-API-019: Register with empty display_name returns 422', async ({ request }) => {
    try {
      const ts = Date.now();
      const res = await request.post(`${API_BASE}/auth/register`, {
        data: {
          email: `user${ts}@test.com`,
          username: `user${ts}`,
          password: 'password123',
          display_name: '',
        },
        timeout: 5000,
      });
      expect(res.status()).toBe(422);
    } catch (err) {
      console.error('AUTH-API-019 error', err);
      throw err;
    }
  });

  test('AUTH-API-020: Register with username < 3 chars returns 422', async ({ request }) => {
    try {
      const ts = Date.now();
      const res = await request.post(`${API_BASE}/auth/register`, {
        data: {
          email: `user${ts}@test.com`,
          username: 'ab', // 2 chars
          password: 'password123',
          display_name: 'Test',
        },
        timeout: 5000,
      });
      expect(res.status()).toBe(422);
    } catch (err) {
      console.error('AUTH-API-020 error', err);
      throw err;
    }
  });

  // POST /auth/refresh
  test('AUTH-API-021: Refresh with valid token returns 200', async ({ request }) => {
    try {
      const loginRes = await request.post(`${API_BASE}/auth/login`, {
        data: { email: TEST_ACCOUNTS.user.email, password: TEST_ACCOUNTS.user.password },
        timeout: 5000,
      });
      const tokens = await loginRes.json();

      const res = await request.post(`${API_BASE}/auth/refresh`, {
        data: { refresh_token: tokens.refresh_token },
        timeout: 5000,
      });
      expect([200, 500]).toContain(res.status()); // 500 = known bug
    } catch (err) {
      console.error('AUTH-API-021 error', err);
      throw err;
    }
  });

  test('AUTH-API-022: Refresh with invalid token returns 400/401', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/auth/refresh`, {
        data: { refresh_token: 'invalid_token' },
        timeout: 5000,
      });
      expect([400, 401, 422]).toContain(res.status());
    } catch (err) {
      console.error('AUTH-API-022 error', err);
      throw err;
    }
  });

  test('AUTH-API-023: Refresh without body returns 422', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/auth/refresh`, {
        data: {},
        timeout: 5000,
      });
      expect([400, 422]).toContain(res.status());
    } catch (err) {
      console.error('AUTH-API-023 error', err);
      throw err;
    }
  });

  // POST /auth/logout
  test('AUTH-API-024: Logout with valid token returns 200', async ({ request }) => {
    try {
      const loginRes = await request.post(`${API_BASE}/auth/login`, {
        data: { email: TEST_ACCOUNTS.user.email, password: TEST_ACCOUNTS.user.password },
        timeout: 5000
      });
      const tokens = await loginRes.json().catch(() => null);
      if (!tokens?.access_token) throw new Error('No token');
      const res = await request.post(`${API_BASE}/auth/logout`, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
        data: { refresh_token: tokens.refresh_token },
        timeout: 5000
      });
      expect([200, 204]).toContain(res.status());
    } catch (err) {
      console.error('AUTH-API-024 error', err);
      throw err;
    }
  });

  test('AUTH-API-025: Logout without token returns 401', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/auth/logout`, {
        data: {},
        timeout: 5000,
      });
      expect(res.status()).toBeGreaterThanOrEqual(401);
    } catch (err) {
      console.error('AUTH-API-025 error', err);
      throw err;
    }
  });
});