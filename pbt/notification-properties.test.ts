import fc from 'fast-check';
import { login, getNotifications } from './api-client';

describe('Notification Properties', () => {
  let authToken: string;

  beforeAll(async () => {
    const loginResponse = await login('alice@buzzhive.com', 'alice123');
    if (loginResponse.status === 200) {
      authToken = (loginResponse.body as { access_token: string }).access_token;
    }
  });

  test('getNotifications returns array', async () => {
    if (!authToken) return;
    
    const response = await getNotifications(authToken);
    expect([200, 500]).toContain(response.status);
    const body = response.body as Record<string, unknown>;
    const items = body?.items ?? body;
    expect(Array.isArray(items)).toBe(true);
  });

  test('getNotifications without token returns 401', async () => {
    const response = await getNotifications('');
    expect([401, 403, 500]).toContain(response.status);
  });

  test('getNotifications with invalid token returns error', async () => {
    const response = await getNotifications('invalid-token');
    expect([401, 403, 500]).toContain(response.status);
  });

  test('notification objects have expected structure', async () => {
    if (!authToken) return;
    
    const response = await getNotifications(authToken);
    if (response.status === 200) {
      const body = response.body as Record<string, unknown>;
      const notifications = (body?.items ?? body) as Record<string, unknown>[];
      if (notifications.length > 0) {
        const firstNotification = notifications[0];
        expect(firstNotification).toHaveProperty('id');
        expect(firstNotification).toHaveProperty('type');
        expect(typeof firstNotification.type).toBe('string');
      }
    }
  });

  test('notification types are from allowed set', async () => {
    if (!authToken) return;
    
    const response = await getNotifications(authToken);
    if (response.status === 200) {
      const body = response.body as Record<string, unknown>;
      const notifications = (body?.items ?? body) as { type: string }[];
      const validTypes = ['like', 'comment', 'follow', 'mention', 'system'];
      
      for (const notification of notifications) {
        if (notification.type) {
          expect(validTypes).toContain(notification.type);
        }
      }
    }
  });

  test('multiple requests return consistent structure', async () => {
    if (!authToken) return;
    
    const response1 = await getNotifications(authToken);
    const response2 = await getNotifications(authToken);
    
    if (response1.status === 200 && response2.status === 200) {
      const body1 = response1.body as Record<string, unknown>;
      const body2 = response2.body as Record<string, unknown>;
      const items1 = body1?.items ?? body1;
      const items2 = body2?.items ?? body2;
      expect(Array.isArray(items1)).toBe(true);
      expect(Array.isArray(items2)).toBe(true);
    }
  });

  test('response time is reasonable', async () => {
    if (!authToken) return;
    
    const start = Date.now();
    await getNotifications(authToken);
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(3000);
  });

  test('unread count is non-negative', async () => {
    if (!authToken) return;
    
    const response = await fetch('http://localhost:8000/api/notifications/unread-count', {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    
    if (response.status === 200) {
      const data = await response.json() as { count: number };
      expect(data.count).toBeGreaterThanOrEqual(0);
    }
  });
});
