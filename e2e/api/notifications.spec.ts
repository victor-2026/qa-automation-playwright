/**
 * Notifications API Tests
 * Phase 3: Module Split
 */

import { test, expect } from '@playwright/test';
import { API_BASE, TEST_USERNAME, TEST_PASSWORD } from '../setup/credentials';
import { getAliceToken, getBobToken } from '../fixtures/tokens';
import { cleanupTestData } from '../teardown/cleanup';
import { TEST_ACCOUNTS } from '../setup/credentials';

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
    const res = await request.get(`${API_BASE}/notifications`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    expect(res.status()).toBe(200);
  });

  test('NOTIF-API-001: GET /notifications without auth returns 401', async ({ request }) => {
    const res = await request.get(`${API_BASE}/notifications`);
    expect(res.status()).toBeGreaterThanOrEqual(401);
  });

  test('NOTIF-API-001: GET /notifications returns array', async ({ request }) => {
    const res = await request.get(`${API_BASE}/notifications`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const items = body.items || body;
    expect(Array.isArray(items)).toBeTruthy();
  });

  test('NOTIF-API-001: GET /notifications has required fields', async ({ request }) => {
    const res = await request.get(`${API_BASE}/notifications`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const items = body.items || body;
    // Phase 4: Stronger type checks
    if (items.length > 0) {
      expect(items[0]).toHaveProperty('id');
      expect(items[0]).toHaveProperty('type');
      expect(typeof items[0].id).toBe('string');
      expect(typeof items[0].type).toBe('string');
    }
  });

  // GET /notifications/unread-count
  test('NOTIF-API-002: GET /notifications/unread-count returns count', async ({ request }) => {
    const res = await request.get(`${API_BASE}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    expect(res.status()).toBe(200);
  });

  test('NOTIF-API-002: GET /notifications/unread-count returns number', async ({ request }) => {
    const res = await request.get(`${API_BASE}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    const body = await res.json();
    expect(typeof body.count !== 'undefined' || typeof body.unread_count !== 'undefined').toBeTruthy();
  });

  test('NOTIF-API-002: GET /notifications/unread-count without auth returns 401', async ({ request }) => {
    const res = await request.get(`${API_BASE}/notifications/unread-count`);
    expect(res.status()).toBeGreaterThanOrEqual(401);
  });

  // POST /notifications/read-all
  test('NOTIF-API-003: POST /notifications/read-all marks all read', async ({ request }) => {
    const res = await request.post(`${API_BASE}/notifications/read-all`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    expect([200, 204]).toContain(res.status());
  });

  test('NOTIF-API-003: POST /notifications/read-all without auth returns 401', async ({ request }) => {
    const res = await request.post(`${API_BASE}/notifications/read-all`);
    expect(res.status()).toBeGreaterThanOrEqual(401);
  });

  test('NOTIF-API-003: POST /notifications/read-all then unread-count is 0', async ({ request }) => {
    await request.post(`${API_BASE}/notifications/read-all`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });

    const countRes = await request.get(`${API_BASE}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    const body = await countRes.json();
    const count = body.count ?? body.unread_count;
    expect(count).toBe(0);
  });

  // POST /notifications/{id}/read
  test('NOTIF-API-004: POST /notifications/{id}/read marks one read', async ({ request }) => {
    const listRes = await request.get(`${API_BASE}/notifications`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    const body = await listRes.json();
    const items = body.items || body;

    if (items.length > 0) {
      const res = await request.post(`${API_BASE}/notifications/${items[0].id}/read`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
      });
      expect([200, 204]).toContain(res.status());
    }
  });

  test('NOTIF-API-004: POST /notifications/{id}/read without auth returns 401', async ({ request }) => {
    const res = await request.post(`${API_BASE}/notifications/some-id/read`);
    expect(res.status()).toBeGreaterThanOrEqual(401);
  });

  test('NOTIF-API-004: POST /notifications/{id}/read with non-existent id returns 404', async ({ request }) => {
    const res = await request.post(`${API_BASE}/notifications/00000000-0000-0000-0000-000000000000/read`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    expect(res.status()).toBe(404);
  });

  // Notification types
  test('NOTIF-API-005: Notifications have valid types', async ({ request }) => {
    const res = await request.get(`${API_BASE}/notifications`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    const body = await res.json();
    const items = body.items || body;
    const validTypes = ['like', 'comment', 'follow', 'repost', 'mention'];

    items.forEach((item: any) => {
      if (item.type) {
        expect(validTypes).toContain(item.type);
      }
    });
  });

  test('NOTIF-API-005: Notifications have actor field', async ({ request }) => {
    const res = await request.get(`${API_BASE}/notifications`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    const body = await res.json();
    const items = body.items || body;

    if (items.length > 0) {
      expect(items[0]).toHaveProperty('actor');
    }
  });

  // Pagination
  test('NOTIF-API-006: GET /notifications with pagination', async ({ request }) => {
    const res = await request.get(`${API_BASE}/notifications?page=1&per_page=10`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    expect(res.status()).toBe(200);
  });
});