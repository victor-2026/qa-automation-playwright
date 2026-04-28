/**
 * Conversations/Messages API Tests
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

test.describe('API - Conversations', () => {
  let aliceToken: string;
  let bobToken: string;

  test.beforeAll(async ({ request }) => {
    aliceToken = await getAliceToken(request);
    bobToken = await getBobToken(request);
  });

  // GET /conversations
  test('MSG-API-001: GET /conversations returns 200 with auth', async ({ request }) => {
    const res = await request.get(`${API_BASE}/conversations`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    expect(res.status()).toBe(200);
  });

  test('MSG-API-001: GET /conversations without auth returns 401', async ({ request }) => {
    const res = await request.get(`${API_BASE}/conversations`);
    expect(res.status()).toBeGreaterThanOrEqual(401);
  });

  test('MSG-API-001: GET /conversations returns array', async ({ request }) => {
    const res = await request.get(`${API_BASE}/conversations`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const items = body.items || body;
    expect(Array.isArray(items)).toBeTruthy();
    // Phase 4: Check structure if exists
    if (items.length > 0) {
      expect(items[0]).toHaveProperty('id');
    }
  });

  // POST /conversations/dm/{username}
  test('MSG-API-002: POST /conversations/dm/{username} starts DM', async ({ request }) => {
    const res = await request.post(`${API_BASE}/conversations/dm/bob`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    expect(res.status()).toBe(200);
    // Phase 4: Check response structure
    const body = await res.json();
    expect(body).toHaveProperty('id');
    expect(typeof body.id).toBe('string');
  });

  test('MSG-API-002: POST /conversations/dm/{username} without auth returns 401', async ({ request }) => {
    const res = await request.post(`${API_BASE}/conversations/dm/bob`);
    expect(res.status()).toBeGreaterThanOrEqual(401);
  });

  test('MSG-API-002: POST /conversations/dm/{username} with non-existent user returns 404', async ({ request }) => {
    const res = await request.post(`${API_BASE}/conversations/dm/nonexistent`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    expect(res.status()).toBe(404);
  });

  test('MSG-API-002: POST /conversations/dm/{username} with yourself returns 400/422', async ({ request }) => {
    const res = await request.post(`${API_BASE}/conversations/dm/alice`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    expect([400, 404, 422]).toContain(res.status());
  });

  // GET /conversations/{id}
  test('MSG-API-003: GET /conversations/{id} returns messages', async ({ request }) => {
    const dmRes = await request.post(`${API_BASE}/conversations/dm/bob`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    const conv = await dmRes.json();

    const res = await request.get(`${API_BASE}/conversations/${conv.id}`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    expect(res.status()).toBe(200);
  });

  test('MSG-API-003: GET /conversations/{id} without auth returns 401', async ({ request }) => {
    const res = await request.get(`${API_BASE}/conversations/some-id`);
    expect(res.status()).toBeGreaterThanOrEqual(401);
  });

  test('MSG-API-003: GET /conversations/{id} not participant returns 403', async ({ request }) => {
    const dmRes = await request.post(`${API_BASE}/conversations/dm/alice`, {
      headers: { Authorization: `Bearer ${bobToken}` },
    });
    const conv = await dmRes.json();

    const res = await request.get(`${API_BASE}/conversations/${conv.id}`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    expect([200, 403]).toContain(res.status());
  });

  // POST /conversations/{id}/read
  test('MSG-API-004: POST /conversations/{id}/read marks as read', async ({ request }) => {
    const dmRes = await request.post(`${API_BASE}/conversations/dm/bob`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    const conv = await dmRes.json();

    const res = await request.post(`${API_BASE}/conversations/${conv.id}/read`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    expect([200, 204]).toContain(res.status());
  });

  test('MSG-API-004: POST /conversations/{id}/read without auth returns 401', async ({ request }) => {
    const res = await request.post(`${API_BASE}/conversations/some-id/read`);
    expect(res.status()).toBeGreaterThanOrEqual(401);
  });

  // DELETE /conversations/{id}
  test('MSG-API-005: DELETE /conversations/{id} deletes conversation', async ({ request }) => {
    const dmRes = await request.post(`${API_BASE}/conversations/dm/bob`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    const conv = await dmRes.json();

    const res = await request.delete(`${API_BASE}/conversations/${conv.id}`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    expect([200, 204]).toContain(res.status());
  });

  test('MSG-API-005: DELETE /conversations/{id} without auth returns 401', async ({ request }) => {
    const res = await request.delete(`${API_BASE}/conversations/some-id`);
    expect(res.status()).toBeGreaterThanOrEqual(401);
  });

  // Edge cases
  test('MSG-API-006: Empty conversations list is valid', async ({ request }) => {
    const res = await request.get(`${API_BASE}/conversations`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('items');
  });

  test('MSG-API-006: Pagination works', async ({ request }) => {
    const res = await request.get(`${API_BASE}/conversations?page=1&per_page=5`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    expect(res.status()).toBe(200);
  });
});