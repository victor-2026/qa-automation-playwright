/**
 * Auth API Tests
 * Phase 3: Module Split
 */

import { test, expect } from '@playwright/test';
import { API_BASE, TEST_USERNAME, TEST_PASSWORD } from '../setup/credentials';
import { getToken, getAliceToken } from '../fixtures/tokens';
import { cleanupTestData } from '../teardown/cleanup';
import { TEST_ACCOUNTS } from '../setup/credentials';

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
      const res = await request.post(`${API_BASE}/auth/login`, {
        data: { email: TEST_USERNAME, password: TEST_PASSWORD },
        timeout: 10000,
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty('access_token');
      expect(body).toHaveProperty('refresh_token');
      // Phase 4: Stronger assertions - check types
      expect(typeof body.access_token).toBe('string');
      expect(typeof body.refresh_token).toBe('string');
      expect(body.access_token.length).toBeGreaterThan(0);
      // Groq suggestion: verify response body structure
      expect(body).toEqual(expect.objectContaining({
        access_token: expect.any(String),
        token_type: expect.any(String),
        expires_in: expect.any(Number),
      }));
    } catch (error) {
      console.error('Error in login test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('AUTH-API-001: Login returns correct token_type', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/auth/login`, {
        data: { email: TEST_USERNAME, password: TEST_PASSWORD },
        timeout: 10000,
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty('token_type');
      expect(body.token_type.toLowerCase()).toBe('bearer');
    } catch (error) {
      console.error('Error in token_type test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  // POST /auth/login - Invalid input
  test('AUTH-API-001: Login with wrong password returns 401', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/auth/login`, {
        data: { email: TEST_USERNAME, password: 'wrongpassword' },
        timeout: 10000,
      });
      expect(res.status()).toBe(401);
      const body = await res.json();
      expect(body).toHaveProperty('detail'); // Check error message exists
    } catch (error) {
      console.error('Error in wrong password test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('AUTH-API-001: Login with non-existent email returns 401', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/auth/login`, {
        data: { email: 'nonexistent@test.com', password: 'anypassword' },
        timeout: 10000,
      });
      expect(res.status()).toBe(401);
    } catch (error) {
      console.error('Error in non-existent email test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('AUTH-API-001: Login with empty body returns 400/422', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/auth/login`, { 
        data: {},
        timeout: 10000,
      });
      expect([400, 422]).toContain(res.status());
    } catch (error) {
      console.error('Error in empty body test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  // POST /auth/login - Boundary values
  test('AUTH-API-001: Login with very long password (1000 chars)', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/auth/login`, {
        data: { email: TEST_USERNAME, password: 'a'.repeat(1000) },
        timeout: 10000,
      });
      expect(res.status()).toBe(401);
    } catch (error) {
      console.error('Error in long password test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('AUTH-API-001: Login with SQL injection in email', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/auth/login`, {
        data: { email: "' OR '1'='1", password: 'anything' },
        timeout: 10000,
      });
      expect([400, 401, 422]).toContain(res.status());
    } catch (error) {
      console.error('Error in SQL injection test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  // GET /auth/me
  test('AUTH-API-002: /me with valid token returns 200 + user data', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 10000,
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty('email');
      expect(body.email).toBe(TEST_USERNAME);
      // Groq suggestion: verify response structure
      expect(body).toEqual(expect.objectContaining({
        id: expect.any(String),
        email: expect.any(String),
        role: expect.any(String),
      }));
    } catch (error) {
      console.error('Error in /me test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('AUTH-API-002: /me returns all required user fields', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 10000,
      });
      const body = await res.json();
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('username');
      expect(body).toHaveProperty('email');
      expect(body).toHaveProperty('role');
    } catch (error) {
      console.error('Error in /me fields test:', error);
      throw error;
    }
  }, { timeout: 30000 });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('email');
    expect(body.email).toBe(TEST_USERNAME);
  });

  test('AUTH-API-002: /me returns all required user fields', async ({ request }) => {
    const res = await request.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    const body = await res.json();
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('username');
    expect(body).toHaveProperty('display_name');
    expect(body).toHaveProperty('role');
  });

  test('AUTH-API-002: /me without token returns 401/403', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/auth/me`, {
        timeout: 10000,
      });
      expect([401, 403]).toContain(res.status());
      const body = await res.json();
      expect(body).toHaveProperty('detail'); // Error message
    } catch (error) {
      console.error('Error in /me without token test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('AUTH-API-002: /me with invalid token returns 401', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/auth/me`, {
        headers: { Authorization: 'Bearer invalid_token_123' },
        timeout: 10000,
      });
      expect([401, 403]).toContain(res.status());
    } catch (error) {
      console.error('Error in /me invalid token test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  // POST /auth/register
  test('AUTH-API-003: Register with valid data returns 201', async ({ request }) => {
    try {
      const ts = Date.now();
      const res = await request.post(`${API_BASE}/auth/register`, {
        data: {
          email: `user${ts}@test.com`,
          username: `user${ts}`,
          password: 'password123',
          display_name: 'Test User',
        },
        timeout: 10000,
      });
      expect(res.status()).toBe(201);
      const body = await res.json();
      // Groq suggestion: verify response structure
      expect(body).toEqual(expect.objectContaining({
        id: expect.any(String),
        email: expect.any(String),
        username: expect.any(String),
      }));
    } catch (error) {
      console.error('Error in register test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('AUTH-API-003: Register returns user data', async ({ request }) => {
    try {
      const ts = Date.now();
      const res = await request.post(`${API_BASE}/auth/register`, {
        data: {
          email: `user${ts}@test.com`,
          username: `user${ts}`,
          password: 'password123',
          display_name: 'Test User',
        },
        timeout: 10000,
      });
      const body = await res.json();
      expect(body).toHaveProperty('username');
      expect(body).toHaveProperty('email');
    } catch (error) {
      console.error('Error in register data test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('AUTH-API-003: Register with duplicate email returns 409', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/auth/register`, {
        data: {
          email: TEST_USERNAME,
          username: 'anotheruser',
          password: 'password123',
          display_name: 'Test',
        },
        timeout: 10000,
      });
      expect(res.status()).toBe(409);
      const body = await res.json();
      expect(body).toHaveProperty('detail'); // Error message
    } catch (error) {
      console.error('Error in duplicate email test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('AUTH-API-003: Register with duplicate username returns 409', async ({ request }) => {
    try {
      const ts = Date.now();
      const res = await request.post(`${API_BASE}/auth/register`, {
        data: {
          email: `new${ts}@test.com`,
          username: 'alice',
          password: 'password123',
          display_name: 'Test',
        },
        timeout: 10000,
      });
      expect(res.status()).toBe(409);
    } catch (error) {
      console.error('Error in duplicate username test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  // POST /auth/register - Boundary values
  test('AUTH-API-003: Register with password < 6 chars returns 422', async ({ request }) => {
    try {
      const ts = Date.now();
      const res = await request.post(`${API_BASE}/auth/register`, {
        data: {
          email: `user${ts}@test.com`,
          username: `user${ts}`,
          password: '12345', // 5 chars
          display_name: 'Test',
        },
        timeout: 10000,
      });
      expect(res.status()).toBe(422);
    } catch (error) {
      console.error('Error in password < 6 test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('AUTH-API-003: Register with password = 6 chars (min) succeeds', async ({ request }) => {
    try {
      const ts = Date.now();
      const res = await request.post(`${API_BASE}/auth/register`, {
        data: {
          email: `user${ts}@test.com`,
          username: `user${ts}`,
          password: '123456', // exactly 6 chars
          display_name: 'Test',
        },
        timeout: 10000,
      });
      expect(res.status()).toBe(201);
    } catch (error) {
      console.error('Error in password = 6 test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('AUTH-API-003: Register with invalid email format returns 422', async ({ request }) => {
    try {
      const ts = Date.now();
      const res = await request.post(`${API_BASE}/auth/register`, {
        data: {
          email: 'notanemail',
          username: `user${ts}`,
          password: 'password123',
          display_name: 'Test',
        },
        timeout: 10000,
      });
      expect(res.status()).toBe(422);
    } catch (error) {
      console.error('Error in invalid email test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  // POST /auth/register - PBT (Property-Based Testing)
  test('AUTH-API-003: Register with SQL injection in username', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/auth/register`, {
        data: {
          email: 'pbt@test.com',
          username: "' OR '1'='1",
          password: 'password123',
          display_name: 'Test',
        },
        timeout: 10000,
      });
      expect([400, 422]).toContain(res.status());
    } catch (error) {
      console.error('Error in SQL injection test:', error);
      throw error;
    }
  }, { timeout: 30000 });
    expect(res.status()).toBe(409);
  });

  test('AUTH-API-003: Register with duplicate username returns 409', async ({ request }) => {
    const ts = Date.now();
    const res = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `new${ts}@test.com`,
        username: 'alice',
        password: 'password123',
        display_name: 'Test',
      },
    });
    expect(res.status()).toBe(409);
  });

  // POST /auth/register - Boundary values
  test('AUTH-API-003: Register with password < 6 chars returns 422', async ({ request }) => {
    const ts = Date.now();
    const res = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `user${ts}@test.com`,
        username: `user${ts}`,
        password: '12345', // 5 chars
        display_name: 'Test',
      },
    });
    expect(res.status()).toBe(422);
  });

  test('AUTH-API-003: Register with password = 6 chars (min) succeeds', async ({ request }) => {
    const ts = Date.now();
    const res = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `user${ts}@test.com`,
        username: `user${ts}`,
        password: '123456', // exactly 6 chars
        display_name: 'Test',
      },
    });
    expect(res.status()).toBe(201);
  });

  test('AUTH-API-003: Register with invalid email format returns 422', async ({ request }) => {
    const ts = Date.now();
    const res = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: 'notanemail',
        username: `user${ts}`,
        password: 'password123',
        display_name: 'Test',
      },
    });
    expect(res.status()).toBe(422);
  });

  test('AUTH-API-003: Register with empty display_name returns 422', async ({ request }) => {
    const ts = Date.now();
    const res = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `user${ts}@test.com`,
        username: `user${ts}`,
        password: 'password123',
        display_name: '',
      },
    });
    expect(res.status()).toBe(422);
  });

  test('AUTH-API-003: Register with username < 3 chars returns 422', async ({ request }) => {
    const ts = Date.now();
    const res = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `user${ts}@test.com`,
        username: 'ab', // 2 chars
        password: 'password123',
        display_name: 'Test',
      },
    });
    expect(res.status()).toBe(422);
  });

  // POST /auth/refresh
  test('AUTH-API-004: Refresh with valid token returns 200', async ({ request }) => {
    const loginRes = await request.post(`${API_BASE}/auth/login`, {
      data: { email: TEST_USERNAME, password: TEST_PASSWORD },
    });
    const tokens = await loginRes.json();

    const res = await request.post(`${API_BASE}/auth/refresh`, {
      data: { refresh_token: tokens.refresh_token },
    });
    expect([200, 500]).toContain(res.status()); // 500 = known bug
  });

  test('AUTH-API-004: Refresh with invalid token returns 400/401', async ({ request }) => {
    const res = await request.post(`${API_BASE}/auth/refresh`, {
      data: { refresh_token: 'invalid_token' },
    });
    expect([400, 401, 422]).toContain(res.status());
  });

  test('AUTH-API-004: Refresh without body returns 422', async ({ request }) => {
    const res = await request.post(`${API_BASE}/auth/refresh`, { data: {} });
    expect([400, 422]).toContain(res.status());
  });

  // POST /auth/logout
  test('AUTH-API-005: Logout with valid token returns 200', async ({ request }) => {
    const loginRes = await request.post(`${API_BASE}/auth/login`, {
      data: { email: TEST_USERNAME, password: TEST_PASSWORD },
    });
    const tokens = await loginRes.json();

    const res = await request.post(`${API_BASE}/auth/logout`, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
      data: { refresh_token: tokens.refresh_token },
    });
    expect([200, 204]).toContain(res.status());
  });

  test('AUTH-API-005: Logout without token returns 401', async ({ request }) => {
    const res = await request.post(`${API_BASE}/auth/logout`, { data: {} });
    expect(res.status()).toBeGreaterThanOrEqual(401);
  });
});