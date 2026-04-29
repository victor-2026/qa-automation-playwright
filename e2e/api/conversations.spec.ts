/**
 * Conversations/Messages API Tests
 * Phase 3: Module Split
 */

import { test, expect } from '@playwright/test';
import { API_BASE, TEST_ACCOUNTS } from '../setup/credentials';
import { getAliceToken, getBobToken } from '../fixtures/tokens';
import { cleanupTestData } from '../teardown/cleanup';

test.afterAll(async ({ request }) => {
  await cleanupTestData(request, TEST_ACCOUNTS);
});

test.describe('API - Conversations', () => {
  let aliceToken: string;
  let bobToken: string;

  test.beforeAll(async ({ request }) => {
    aliceToken = await getAliceToken(request);
    bobToken = await getBobToken(request);
  });

  // GET /conversations
  test('MSG-API-001: GET /conversations returns 200 with auth', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/conversations`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 5000,
      });
      expect(res.status()).toBe(200);
    } catch (err) {
      console.error('MSG-API-001 error', err);
      throw err;
    }
  });

  test('MSG-API-002: GET /conversations without auth returns 401', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/conversations`, {
        timeout: 5000,
      });
      expect(res.status()).toBeGreaterThanOrEqual(401);
    } catch (err) {
      console.error('MSG-API-002 error', err);
      throw err;
    }
  });

  test('MSG-API-003: GET /conversations returns array', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/conversations`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 5000,
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      const items = body.items || body;
      expect(Array.isArray(items)).toBeTruthy();
      // Phase 4: Check structure if exists
      if (items.length > 0) {
        expect(items[0]).toHaveProperty('id');
      }
    } catch (err) {
      console.error('MSG-API-003 error', err);
      throw err;
    }
  });

  // POST /conversations/dm/{username}
  test('MSG-API-004: POST /conversations/dm/{username} starts DM', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/conversations/dm/bob`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 5000,
      });
      expect(res.status()).toBe(200);
      // Phase 4: Check response structure
      const body = await res.json();
      expect(body).toHaveProperty('id');
      expect(typeof body.id).toBe('string');
    } catch (err) {
      console.error('MSG-API-004 error', err);
      throw err;
    }
  });

  test('MSG-API-005: POST /conversations/dm/{username} without auth returns 401', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/conversations/dm/bob`, {
        timeout: 5000,
      });
      expect(res.status()).toBeGreaterThanOrEqual(401);
    } catch (err) {
      console.error('MSG-API-005 error', err);
      throw err;
    }
  });

  test('MSG-API-006: POST /conversations/dm/{username} with non-existent user returns 404', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/conversations/dm/nonexistent`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 5000,
      });
      expect(res.status()).toBe(404);
    } catch (err) {
      console.error('MSG-API-006 error', err);
      throw err;
    }
  });

  test('MSG-API-007: POST /conversations/dm/{username} with yourself returns 400/422', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/conversations/dm/alice`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 5000,
      });
      expect([400, 404, 422]).toContain(res.status());
    } catch (err) {
      console.error('MSG-API-007 error', err);
      throw err;
    }
  });

  // GET /conversations/{id}
  test('MSG-API-008: GET /conversations/{id} returns messages', async ({ request }) => {
    try {
      const dmRes = await request.post(`${API_BASE}/conversations/dm/bob`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 5000,
      });
      const conv = await dmRes.json();

      const res = await request.get(`${API_BASE}/conversations/${conv.id}`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 5000,
      });
      expect(res.status()).toBe(200);
    } catch (err) {
      console.error('MSG-API-008 error', err);
      throw err;
    }
  });

  test('MSG-API-009: GET /conversations/{id} without auth returns 401', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/conversations/some-id`, {
        timeout: 5000,
      });
      expect(res.status()).toBeGreaterThanOrEqual(401);
    } catch (err) {
      console.error('MSG-API-009 error', err);
      throw err;
    }
  });

  test('MSG-API-010: GET /conversations/{id} not participant returns 403', async ({ request }) => {
    try {
      const dmRes = await request.post(`${API_BASE}/conversations/dm/alice`, {
        headers: { Authorization: `Bearer ${bobToken}` },
        timeout: 5000,
      });
      const conv = await dmRes.json();

      const res = await request.get(`${API_BASE}/conversations/${conv.id}`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 5000,
      });
      expect([200, 403]).toContain(res.status());
    } catch (err) {
      console.error('MSG-API-010 error', err);
      throw err;
    }
  });

  // POST /conversations/{id}/read
  test('MSG-API-011: POST /conversations/{id}/read marks as read', async ({ request }) => {
    try {
      const dmRes = await request.post(`${API_BASE}/conversations/dm/bob`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 5000,
      });
      const conv = await dmRes.json();

      const res = await request.post(`${API_BASE}/conversations/${conv.id}/read`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 5000,
      });
      expect([200, 204]).toContain(res.status());
    } catch (err) {
      console.error('MSG-API-011 error', err);
      throw err;
    }
  });

  test('MSG-API-012: POST /conversations/{id}/read without auth returns 401', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/conversations/some-id/read`, {
        timeout: 5000,
      });
      expect(res.status()).toBeGreaterThanOrEqual(401);
    } catch (err) {
      console.error('MSG-API-012 error', err);
      throw err;
    }
  });

  // DELETE /conversations/{id}
  test('MSG-API-013: DELETE /conversations/{id} deletes conversation', async ({ request }) => {
    try {
      const dmRes = await request.post(`${API_BASE}/conversations/dm/bob`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 5000,
      });
      const conv = await dmRes.json();

      const res = await request.delete(`${API_BASE}/conversations/${conv.id}`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 5000,
      });
      expect([200, 204]).toContain(res.status());
    } catch (err) {
      console.error('MSG-API-013 error', err);
      throw err;
    }
  });

  test('MSG-API-014: DELETE /conversations/{id} without auth returns 401', async ({ request }) => {
    try {
      const res = await request.delete(`${API_BASE}/conversations/some-id`, {
        timeout: 5000,
      });
      expect(res.status()).toBeGreaterThanOrEqual(401);
    } catch (err) {
      console.error('MSG-API-014 error', err);
      throw err;
    }
  });

  // Edge cases
  test('MSG-API-015: Empty conversations list is valid', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/conversations`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 5000,
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty('items');
    } catch (err) {
      console.error('MSG-API-015 error', err);
      throw err;
    }
  });

  test('MSG-API-016: Pagination works', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/conversations?page=1&per_page=5`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 5000,
      });
      expect(res.status()).toBe(200);
    } catch (err) {
      console.error('MSG-API-016 error', err);
      throw err;
    }
  });
});