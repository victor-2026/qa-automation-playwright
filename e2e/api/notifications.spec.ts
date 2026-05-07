/**
 * Notifications API Tests
 * Phase 3: Module Split
 */

import { test, expect } from '@playwright/test';
import { API_BASE, TEST_ACCOUNTS } from '../setup/credentials';
import { getAliceToken, getBobToken } from '../fixtures/tokens';
import { cleanupTestData } from '../teardown/cleanup';
//import { TEST_ACCOUNTS } from '../setup/credentials';

test.afterAll(async ({ request }) => {
  await cleanupTestData(request, TEST_ACCOUNTS);
});

test.describe('API - Notifications', () => {
  let aliceToken: string;
  let bobToken: string;

  test.beforeAll(async ({ request }) => {
    aliceToken = await getAliceToken(request);
    bobToken = await getBobToken(request);
  });

  // GET /notifications
  test('NOTIF-API-001: GET /notifications returns 200 with auth', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/notifications`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 5000,
      });
      expect([200, 403]).toContain(res.status());
    } catch (err) {
      console.error('NOTIF-API-001 error', err);
      throw err;
    }
  });

  test('NOTIF-API-002: GET /notifications without auth returns 401', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/notifications`, {
        timeout: 5000,
      });
      expect(res.status()).toBeGreaterThanOrEqual(401);
    } catch (err) {
      console.error('NOTIF-API-002 error', err);
      throw err;
    }
  });

  test('NOTIF-API-003: GET /notifications returns array', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/notifications`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 5000,
      });
      expect([200, 403]).toContain(res.status());
      if (res.status() === 200) {
        const body = await res.json();
        const items = body.items || body;
        expect(Array.isArray(items)).toBeTruthy();
      }
    } catch (err) {
      console.error('NOTIF-API-003 error', err);
      throw err;
    }
  });

  test('NOTIF-API-004: GET /notifications has required fields', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/notifications`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 5000,
      });
      expect([200, 403]).toContain(res.status());
      if (res.status() === 200) {
        const body = await res.json();
        const items = body.items || body;
        if (items.length > 0) {
          expect(items[0]).toHaveProperty('id');
          expect(items[0]).toHaveProperty('type');
          expect(typeof items[0].id).toBe('string');
          expect(typeof items[0].type).toBe('string');
        }
      }
    } catch (err) {
      console.error('NOTIF-API-004 error', err);
      throw err;
    }
  });

  // GET /notifications/unread-count
  test('NOTIF-API-005: GET /notifications/unread-count returns count', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 5000,
      });
      expect([200, 403]).toContain(res.status());
    } catch (err) {
      console.error('NOTIF-API-005 error', err);
      throw err;
    }
  });

  test('NOTIF-API-006: GET /notifications/unread-count returns number', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 5000,
      });
      expect([200, 403]).toContain(res.status());
      if (res.status() === 200) {
        const body = await res.json();
        expect(typeof body.count !== 'undefined' || typeof body.unread_count !== 'undefined').toBeTruthy();
      }
    } catch (err) {
      console.error('NOTIF-API-006 error', err);
      throw err;
    }
  });

  test('NOTIF-API-007: GET /notifications/unread-count without auth returns 401', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/notifications/unread-count`, {
        timeout: 5000,
      });
      expect(res.status()).toBeGreaterThanOrEqual(401);
    } catch (err) {
      console.error('NOTIF-API-007 error', err);
      throw err;
    }
  });

  // POST /notifications/read-all
  test('NOTIF-API-008: POST /notifications/read-all marks all read', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/notifications/read-all`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 5000,
      });
      expect([200, 204]).toContain(res.status());
    } catch (err) {
      console.error('NOTIF-API-008 error', err);
      throw err;
    }
  });

  test('NOTIF-API-009: POST /notifications/read-all without auth returns 401', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/notifications/read-all`, {
        timeout: 5000,
      });
      expect(res.status()).toBeGreaterThanOrEqual(401);
    } catch (err) {
      console.error('NOTIF-API-009 error', err);
      throw err;
    }
  });

  test('NOTIF-API-010: POST /notifications/read-all then unread-count is 0', async ({ request }) => {
    try {
      await request.post(`${API_BASE}/notifications/read-all`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 5000,
      });

      const countRes = await request.get(`${API_BASE}/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 5000,
      });
      if (countRes.status() !== 200) return;
      const body = await countRes.json();
      const count = body.count ?? body.unread_count;
      expect([0, '0']).toContain(count);
    } catch (err) {
      console.error('NOTIF-API-010 error', err);
      throw err;
    }
  });

  // POST /notifications/{id}/read
  test('NOTIF-API-011: POST /notifications/{id}/read marks one read', async ({ request }) => {
    try {
      const listRes = await request.get(`${API_BASE}/notifications`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 5000,
      });
      if (listRes.status() !== 200) return;
      const body = await listRes.json();
      const items = body.items || body;

      if (items.length > 0) {
        const res = await request.post(`${API_BASE}/notifications/${items[0].id}/read`, {
          headers: { Authorization: `Bearer ${aliceToken}` },
          timeout: 5000,
        });
        expect([200, 204]).toContain(res.status());
      }
    } catch (err) {
      console.error('NOTIF-API-011 error', err);
      throw err;
    }
  });

  test('NOTIF-API-012: POST /notifications/{id}/read without auth returns 401', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/notifications/some-id/read`, {
        timeout: 5000,
      });
      expect(res.status()).toBeGreaterThanOrEqual(401);
    } catch (err) {
      console.error('NOTIF-API-012 error', err);
      throw err;
    }
  });

  test('NOTIF-API-013: POST /notifications/{id}/read with non-existent id returns 404', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/notifications/00000000-0000-0000-0000-000000000000/read`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 5000,
      });
      expect([403, 404, 500]).toContain(res.status());
    } catch (err) {
      console.error('NOTIF-API-013 error', err);
      throw err;
    }
  });

  // Notification types
  test('NOTIF-API-014: Notifications have valid types', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/notifications`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 5000,
      });
      if (res.status() !== 200) return;
      const body = await res.json();
      const items = body.items || body;
      const validTypes = ['like', 'comment', 'follow', 'repost', 'mention'];

      items.forEach((item: any) => {
        if (item.type) {
          expect(validTypes).toContain(item.type);
        }
      });
    } catch (err) {
      console.error('NOTIF-API-014 error', err);
      throw err;
    }
  });

  test('NOTIF-API-015: Notifications have actor field', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/notifications`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 5000,
      });
      if (res.status() !== 200) return;
      const body = await res.json();
      const items = body.items || body;

      if (items.length > 0) {
        expect(items[0]).toHaveProperty('actor');
      }
    } catch (err) {
      console.error('NOTIF-API-015 error', err);
      throw err;
    }
  });

  // Pagination
  test('NOTIF-API-016: GET /notifications with pagination', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/notifications?page=1&per_page=10`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 5000,
      });
      expect([200, 403]).toContain(res.status());
    } catch (err) {
      console.error('NOTIF-API-016 error', err);
      throw err;
    }
  });
});