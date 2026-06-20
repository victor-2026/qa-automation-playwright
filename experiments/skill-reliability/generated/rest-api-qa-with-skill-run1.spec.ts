import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:8000/api';

test.describe('Buzzhive Auth API Tests (with skill)', () => {
  test('POST /api/auth/login with valid credentials returns 200 and token with timeout', async ({ request }) => {
    const response = await request.post(`${API_BASE}/auth/login`, {
      data: {
        email: 'alice@buzzhive.com',
        password: 'alice123',
      },
      timeout: 5000,
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('access_token');
    expect(typeof body.access_token).toBe('string');
    expect(body.access_token.length).toBeGreaterThan(0);
    expect(body).toHaveProperty('token_type', 'bearer');
  });

  test('POST /api/auth/login with invalid password returns 401 and error message', async ({ request }) => {
    const response = await request.post(`${API_BASE}/auth/login`, {
      data: {
        email: 'alice@buzzhive.com',
        password: 'wrongpassword',
      },
      timeout: 5000,
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toHaveProperty('detail');
    expect(body.detail).toContain('Invalid');
  });

  test('POST /api/auth/login with invalid email returns 422 validation error', async ({ request }) => {
    const response = await request.post(`${API_BASE}/auth/login`, {
      data: {
        email: 'not-an-email',
        password: 'alice123',
      },
      timeout: 5000,
    });

    expect(response.status()).toBe(422);
    const body = await response.json();
    expect(body).toHaveProperty('detail');
  });
});