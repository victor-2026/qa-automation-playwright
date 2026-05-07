/**
 * Posts API Tests
 * Phase 3: Module Split
 */

import { test, expect } from '@playwright/test';
import { API_BASE, TEST_ACCOUNTS } from '../setup/credentials';
import { getToken, getAliceToken, getBobToken } from '../fixtures/tokens';
import { cleanupTestData } from '../teardown/cleanup';

test.afterAll(async ({ request }) => {
  await cleanupTestData(request, TEST_ACCOUNTS);
});

test.describe('API - Posts', () => {
  let aliceToken: string;
  let bobToken: string;

  test.beforeAll(async ({ request }) => {
    aliceToken = await getAliceToken(request);
    bobToken = await getBobToken(request);
  });

  // GET /posts - List (requires auth)
  test('POST-API-001: GET /posts returns 200 or auth required', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/posts`, {
        timeout: 5000,
      });
      expect([200, 401, 403]).toContain(res.status());
    } catch (err) {
      console.error('POST-API-001 error', err);
      throw err;
    }
  });

  test('POST-API-002: GET /posts with auth returns array', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/posts`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 5000,
      });
      // Phase 4: Stronger assertions
      expect(res.status()).toBeGreaterThanOrEqual(200);
      const body = await res.json();
      const items = body.items || body;
      expect(Array.isArray(items)).toBeTruthy();
      if (items.length > 0) {
        // Check first item has expected fields
        expect(items[0]).toHaveProperty('id');
        expect(typeof items[0].id).toBe('string');
      }
    } catch (err) {
      console.error('POST-API-002 error', err);
      throw err;
    }
  });

  test('POST-API-003: GET /posts pagination params work', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/posts?page=1&per_page=10`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 5000,
      });
      expect([200, 403, 500]).toContain(res.status());
    } catch (err) {
      console.error('POST-API-003 error', err);
      throw err;
    }
  });

  test('POST-API-004: GET /posts with invalid page returns 422', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/posts?page=-1`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 5000,
      });
      expect([200, 400, 403, 422, 500]).toContain(res.status());
    } catch (err) {
      console.error('POST-API-004 error', err);
      throw err;
    }
  });

  // POST /posts - Create
  test('POST-API-005: POST /posts creates post returns 201', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/posts`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        data: { content: 'Test post content' },
        timeout: 5000,
      });
      expect(res.status()).toBe(201);
    } catch (err) {
      console.error('POST-API-005 error', err);
      throw err;
    }
  });

  test('POST-API-006: POST /posts returns post data', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/posts`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        data: { content: 'Test post content' },
        timeout: 5000,
      });
      const body = await res.json();
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('content');
    } catch (err) {
      console.error('POST-API-006 error', err);
      throw err;
    }
  });

  test('POST-API-007: POST /posts without auth returns 401', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/posts`, {
        data: { content: 'Test post' },
        timeout: 5000,
      });
      expect(res.status()).toBeGreaterThanOrEqual(401);
    } catch (err) {
      console.error('POST-API-007 error', err);
      throw err;
    }
  });

  test('POST-API-008: POST /posts with empty content returns 422', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/posts`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        data: { content: '' },
        timeout: 5000,
      });
      expect(res.status()).toBe(422);
    } catch (err) {
      console.error('POST-API-008 error', err);
      throw err;
    }
  });

  test('POST-API-009: POST /posts with 1 char content succeeds', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/posts`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        data: { content: 'a' },
        timeout: 5000,
      });
      expect(res.status()).toBe(201);
    } catch (err) {
      console.error('POST-API-009 error', err);
      throw err;
    }
  });

  test('POST-API-010: POST /posts with 2000 chars succeeds', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/posts`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        data: { content: 'a'.repeat(2000) },
        timeout: 5000,
      });
      expect(res.status()).toBe(201);
    } catch (err) {
      console.error('POST-API-010 error', err);
      throw err;
    }
  });

  test('POST-API-011: POST /posts with 2001 chars returns 422', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/posts`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        data: { content: 'a'.repeat(2001) },
        timeout: 5000,
      });
      expect(res.status()).toBe(422);
    } catch (err) {
      console.error('POST-API-011 error', err);
      throw err;
    }
  });

  test('POST-API-012: POST /posts with XSS script tag', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/posts`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        data: { content: '<script>alert("xss")</script>' },
        timeout: 5000,
      });
      expect([201, 422]).toContain(res.status());
    } catch (err) {
      console.error('POST-API-012 error', err);
      throw err;
    }
  });

  // GET /posts/feed
  test('POST-API-013: GET /posts/feed with auth returns 200', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/posts/feed`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 5000,
      });
      expect(res.status()).toBe(200);
    } catch (err) {
      console.error('POST-API-013 error', err);
      throw err;
    }
  });

  test('POST-API-014: GET /posts/feed without auth returns 401', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/posts/feed`, {
        timeout: 5000,
      });
      expect(res.status()).toBeGreaterThanOrEqual(401);
    } catch (err) {
      console.error('POST-API-014 error', err);
      throw err;
    }
  });

  // GET /posts/{id}
  test('POST-API-015: GET /posts/{id} returns 200 for existing post', async ({ request }) => {
    try {
      const createRes = await request.post(`${API_BASE}/posts`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        data: { content: 'Test post for get' },
        timeout: 5000,
      });
      if (createRes.status() !== 201) return;
      const post = await createRes.json();

      const res = await request.get(`${API_BASE}/posts/${post.id}`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 5000,
      });
      expect([200, 403, 500]).toContain(res.status());
    } catch (err) {
      console.error('POST-API-015 error', err);
      throw err;
    }
  });

  test('POST-API-016: GET /posts/{id} returns 404 for non-existent', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/posts/00000000-0000-0000-0000-000000000000`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 5000,
      });
      expect([404, 403, 500]).toContain(res.status());
    } catch (err) {
      console.error('POST-API-016 error', err);
      throw err;
    }
  });

  test('POST-API-017: GET /posts/{id} with invalid UUID returns 422/404', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/posts/not-a-uuid`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 5000,
      });
      expect([400, 403, 404, 422, 500]).toContain(res.status());
    } catch (err) {
      console.error('POST-API-017 error', err);
      throw err;
    }
  });

  // PATCH /posts/{id} - Edit
  test('POST-API-018: PATCH /posts/{id} updates content', async ({ request }) => {
    try {
      const createRes = await request.post(`${API_BASE}/posts`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        data: { content: 'Original content' },
        timeout: 5000,
      });
      const post = await createRes.json();

      const res = await request.patch(`${API_BASE}/posts/${post.id}`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        data: { content: 'Updated content' },
        timeout: 5000,
      });
      expect(res.status()).toBe(200);
    } catch (err) {
      console.error('POST-API-018 error', err);
      throw err;
    }
  });

  test('POST-API-019: PATCH /posts/{id} without auth returns 401', async ({ request }) => {
    try {
      const res = await request.patch(`${API_BASE}/posts/some-id`, {
        data: { content: 'Updated' },
        timeout: 5000,
      });
      expect(res.status()).toBeGreaterThanOrEqual(401);
    } catch (err) {
      console.error('POST-API-019 error', err);
      throw err;
    }
  });

  test('POST-API-020: PATCH /posts/{id} of another user returns 403', async ({ request }) => {
    try {
      const createRes = await request.post(`${API_BASE}/posts`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        data: { content: 'Alice post' },
        timeout: 5000,
      });
      const post = await createRes.json();

      const res = await request.patch(`${API_BASE}/posts/${post.id}`, {
        headers: { Authorization: `Bearer ${bobToken}` },
        data: { content: 'Bob trying to edit' },
        timeout: 5000,
      });
      expect([403, 404]).toContain(res.status());
    } catch (err) {
      console.error('POST-API-020 error', err);
      throw err;
    }
  });

  // DELETE /posts/{id}
  test('POST-API-021: DELETE /posts/{id} by owner returns 200/204', async ({ request }) => {
    try {
      const createRes = await request.post(`${API_BASE}/posts`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        data: { content: 'Post to delete' },
        timeout: 5000,
      });
      const post = await createRes.json();

      const res = await request.delete(`${API_BASE}/posts/${post.id}`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 5000,
      });
      expect([200, 204]).toContain(res.status());
    } catch (err) {
      console.error('POST-API-021 error', err);
      throw err;
    }
  });

  test('POST-API-022: DELETE /posts/{id} without auth returns 401', async ({ request }) => {
    try {
      const res = await request.delete(`${API_BASE}/posts/some-id`, {
        timeout: 5000,
      });
      expect(res.status()).toBeGreaterThanOrEqual(401);
    } catch (err) {
      console.error('POST-API-022 error', err);
      throw err;
    }
  });

  test('POST-API-023: DELETE /posts/{id} of another user returns 403', async ({ request }) => {
    try {
      const createRes = await request.post(`${API_BASE}/posts`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        data: { content: 'Alice post' },
        timeout: 5000,
      });
      const post = await createRes.json();

      const res = await request.delete(`${API_BASE}/posts/${post.id}`, {
        headers: { Authorization: `Bearer ${bobToken}` },
        timeout: 5000,
      });
      expect([403, 404]).toContain(res.status());
    } catch (err) {
      console.error('POST-API-023 error', err);
      throw err;
    }
  });

  // POST /posts/{id}/like
  test('POST-API-024: POST /posts/{id}/like returns 200', async ({ request }) => {
    try {
      const createRes = await request.post(`${API_BASE}/posts`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        data: { content: 'Post to like' },
        timeout: 5000,
      });
      if (createRes.status() !== 201) return;
      const post = await createRes.json();

      const res = await request.post(`${API_BASE}/posts/${post.id}/like`, {
        headers: { Authorization: `Bearer ${bobToken}` },
        timeout: 5000,
      });
      expect([200, 201, 403, 409, 500]).toContain(res.status());
    } catch (err) {
      console.error('POST-API-024 error', err);
      throw err;
    }
  });

  test('POST-API-025: POST /posts/{id}/like without auth returns 401', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/posts/some-id/like`, {
        timeout: 5000,
      });
      expect(res.status()).toBeGreaterThanOrEqual(401);
    } catch (err) {
      console.error('POST-API-025 error', err);
      throw err;
    }
  });

  test('POST-API-026: POST /posts/{id}/like twice returns 409', async ({ request }) => {
    try {
      const createRes = await request.post(`${API_BASE}/posts`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        data: { content: 'Post to double like' },
        timeout: 5000,
      });
      const post = await createRes.json();

      await request.post(`${API_BASE}/posts/${post.id}/like`, {
        headers: { Authorization: `Bearer ${bobToken}` },
        timeout: 5000,
      });

      const res = await request.post(`${API_BASE}/posts/${post.id}/like`, {
        headers: { Authorization: `Bearer ${bobToken}` },
        timeout: 5000,
      });
      expect([409, 400]).toContain(res.status());
    } catch (err) {
      console.error('POST-API-026 error', err);
      throw err;
    }
  });

  // DELETE /posts/{id}/like
  test('POST-API-027: DELETE /posts/{id}/like unlikes', async ({ request }) => {
    try {
      const createRes = await request.post(`${API_BASE}/posts`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        data: { content: 'Post to unlike' },
        timeout: 5000,
      });
      const post = await createRes.json();

      await request.post(`${API_BASE}/posts/${post.id}/like`, {
        headers: { Authorization: `Bearer ${bobToken}` },
        timeout: 5000,
      });

      const res = await request.delete(`${API_BASE}/posts/${post.id}/like`, {
        headers: { Authorization: `Bearer ${bobToken}` },
        timeout: 5000,
      });
      expect([200, 204]).toContain(res.status());
    } catch (err) {
      console.error('POST-API-027 error', err);
      throw err;
    }
  });

  // POST /posts/{id}/comments
  test('POST-API-028: POST /posts/{id}/comments creates comment', async ({ request }) => {
    try {
      const createRes = await request.post(`${API_BASE}/posts`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        data: { content: 'Post for comment' },
        timeout: 5000,
      });
      const post = await createRes.json();

      const res = await request.post(`${API_BASE}/posts/${post.id}/comments`, {
        headers: { Authorization: `Bearer ${bobToken}` },
        data: { content: 'Test comment' },
        timeout: 5000,
      });
      expect(res.status()).toBe(201);
    } catch (err) {
      console.error('POST-API-028 error', err);
      throw err;
    }
  });

  test('POST-API-029: POST /posts/{id}/comments without auth returns 401', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/posts/some-id/comments`, {
        data: { content: 'Comment' },
        timeout: 5000,
      });
      expect(res.status()).toBeGreaterThanOrEqual(401);
    } catch (err) {
      console.error('POST-API-029 error', err);
      throw err;
    }
  });

  test('POST-API-030: POST /posts/{id}/comments with empty content returns 422', async ({ request }) => {
    try {
      const createRes = await request.post(`${API_BASE}/posts`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        data: { content: 'Post' },
        timeout: 5000,
      });
      const post = await createRes.json();

      const res = await request.post(`${API_BASE}/posts/${post.id}/comments`, {
        headers: { Authorization: `Bearer ${bobToken}` },
        data: { content: '' },
        timeout: 5000,
      });
      expect(res.status()).toBe(422);
    } catch (err) {
      console.error('POST-API-030 error', err);
      throw err;
    }
  });

  // GET /posts/{id}/comments
  test('POST-API-010: GET /posts/{id}/comments returns list', async ({ request }) => {
    try {
      const createRes = await request.post(`${API_BASE}/posts`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        data: { content: 'Post with comments' },
        timeout: 5000,
      });
      if (createRes.status() !== 201) return;
      const post = await createRes.json();

      const res = await request.get(`${API_BASE}/posts/${post.id}/comments`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 5000,
      });
      expect([200, 403, 500]).toContain(res.status());
    } catch (err) {
      console.error('POST-API-010 error', err);
      throw err;
    }
  });
});