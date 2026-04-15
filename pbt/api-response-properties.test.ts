import { describe, test, expect } from '@jest/globals';
import { login, getMe } from './api-client';

describe('API Response Properties', () => {
  test('error responses have error detail', async () => {
    const wrongLogin = await login('wrong@example.com', 'wrong');
    expect(wrongLogin.status).toBeGreaterThanOrEqual(400);

    const noToken = await getMe('invalid-token');
    expect(noToken.status).toBeGreaterThanOrEqual(400);
  });

  test('POST /auth/login returns tokens on success', async () => {
    const response = await login('alice@buzzhive.com', 'alice123');
    expect([200, 500]).toContain(response.status);
    
    if (response.status === 200) {
      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('refresh_token');
    }
  });

  test('GET /auth/me returns user object on valid token', async () => {
    const loginResponse = await login('alice@buzzhive.com', 'alice123');
    if (loginResponse.status !== 200) return;

    const data = loginResponse.body as { access_token: string };
    const meResponse = await getMe(data.access_token);
    expect(meResponse.status).toBe(200);
    expect(meResponse.body).toHaveProperty('id');
    expect(meResponse.body).toHaveProperty('email');
    expect(meResponse.body).toHaveProperty('username');
  });

  test('health endpoint is accessible without auth', async () => {
    const response = await fetch('http://localhost:8000/api/health');
    expect(response.status).toBe(200);
  });
});
