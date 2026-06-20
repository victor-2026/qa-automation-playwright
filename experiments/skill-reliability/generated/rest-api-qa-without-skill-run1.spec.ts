import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:8000/api';

test.describe('Buzzhive Auth API Tests (without skill)', () => {
  test('POST /api/auth/login with valid credentials returns 200 and token', async ({ request }) => {
    const response = await request.post(`${API_BASE}/auth/login`, {
      data: {
        email: 'alice@buzzhive.com',
        password: 'alice123',
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('access_token');
  });

  test('POST /api/auth/login with invalid password returns 401 and error message', async ({ request }) => {
    const response = await request.post(`${API_BASE}/auth/login`, {
      data: {
        email: 'alice@buzzhive.com',
        password: 'wrongpassword',
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toHaveProperty('detail');
  });
});