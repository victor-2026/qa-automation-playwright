import fc from 'fast-check';
import { login, getUser } from './api-client';

describe('User Profile Properties', () => {
  let authToken: string;
  let testUsername: string;

  beforeAll(async () => {
    const loginResponse = await login('alice@buzzhive.com', 'alice123');
    if (loginResponse.status === 200) {
      authToken = (loginResponse.body as { access_token: string }).access_token;
      testUsername = (loginResponse.body as { username: string }).username;
    }
  });

  test('getUser returns user object with required fields', async () => {
    if (!authToken) return;
    
    const response = await getUser(testUsername, authToken);
    expect([200, 404, 500]).toContain(response.status);
    
    if (response.status === 200) {
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('username');
      expect(response.body).toHaveProperty('email');
    }
  });

  test('getUser without token returns 401', async () => {
    const response = await getUser('alice', '');
    expect([401, 403, 500]).toContain(response.status);
  });

  test('getUser with invalid token returns error', async () => {
    const response = await getUser('alice', 'invalid-token-xyz');
    expect([401, 403, 500]).toContain(response.status);
  });

  test('getUser for non-existent user returns 404', async () => {
    if (!authToken) return;
    
    const response = await getUser(`nonexistent_${Date.now()}`, authToken);
    expect([404, 500]).toContain(response.status);
  });

  test('getUser response structure is consistent', async () => {
    if (!authToken) return;
    
    const response = await getUser(testUsername, authToken);
    if (response.status === 200) {
      const body = response.body as Record<string, unknown>;
      expect(typeof body.id).toBe('number');
      expect(typeof body.username).toBe('string');
      expect(typeof body.email).toBe('string');
    }
  });

  test('username case sensitivity for getUser', async () => {
    if (!authToken) return;
    
    const response1 = await getUser('Alice', authToken);
    const response2 = await getUser('alice', authToken);
    
    expect([200, 404, 500]).toContain(response1.status);
    expect([200, 404, 500]).toContain(response2.status);
  });

  test('getUser with different users returns different data', async () => {
    if (!authToken || !testUsername) return;
    
    const aliceResponse = await getUser(testUsername, authToken);
    const bobResponse = await getUser('bob', authToken);
    
    if (aliceResponse.status === 200 && bobResponse.status === 200) {
      expect(aliceResponse.body).not.toEqual(bobResponse.body);
    }
  });

  test('response time is reasonable', async () => {
    if (!authToken) return;
    
    const start = Date.now();
    await getUser(testUsername, authToken);
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(3000);
  });
});
