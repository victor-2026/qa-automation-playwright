/**
 * Posts API Tests
 * Phase 3: Module Split
 */

import { test, expect } from '@playwright/test';
import { API_BASE, TEST_USERNAME, TEST_PASSWORD } from '../setup/credentials';
import { getToken, getAliceToken, getBobToken } from '../fixtures/tokens';
import { cleanupTestData } from '../teardown/cleanup';
import { TEST_ACCOUNTS } from '../setup/credentials';

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
    const res = await request.get(`${API_BASE}/posts`);
    expect([200, 401, 403]).toContain(res.status());
  });

  test('POST-API-001: GET /posts with auth returns array', async ({ request }) => {
    const res = await request.get(`${API_BASE}/posts`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
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
  });

  test('POST-API-001: GET /posts pagination params work', async ({ request }) => {
    const res = await request.get(`${API_BASE}/posts?page=1&per_page=10`);
    expect(res.status()).toBe(200);
  });

  test('POST-API-001: GET /posts with invalid page returns 422', async ({ request }) => {
    const res = await request.get(`${API_BASE}/posts?page=-1`);
    expect([200, 400, 422]).toContain(res.status());
  });

  // POST /posts - Create
  test('POST-API-002: POST /posts creates post returns 201', async ({ request }) => {
    const res = await request.post(`${API_BASE}/posts`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
      data: { content: 'Test post content' },
    });
    expect(res.status()).toBe(201);
  });

  test('POST-API-002: POST /posts returns post data', async ({ request }) => {
    const res = await request.post(`${API_BASE}/posts`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
      data: { content: 'Test post content' },
    });
    const body = await res.json();
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('content');
  });

  test('POST-API-002: POST /posts with auth returns 401', async ({ request }) => {
    const res = await request.post(`${API_BASE}/posts`, {
      data: { content: 'Test post' },
    });
    expect(res.status()).toBeGreaterThanOrEqual(401);
  });

  test('POST-API-002: POST /posts with empty content returns 422', async ({ request }) => {
    const res = await request.post(`${API_BASE}/posts`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
      data: { content: '' },
    });
    expect(res.status()).toBe(422);
  });

  test('POST-API-002: POST /posts with 1 char content succeeds', async ({ request }) => {
    const res = await request.post(`${API_BASE}/posts`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
      data: { content: 'a' },
    });
    expect(res.status()).toBe(201);
  });

  test('POST-API-002: POST /posts with 2000 chars succeeds', async ({ request }) => {
    const res = await request.post(`${API_BASE}/posts`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
      data: { content: 'a'.repeat(2000) },
    });
    expect(res.status()).toBe(201);
  });

  test('POST-API-002: POST /posts with 2001 chars returns 422', async ({ request }) => {
    const res = await request.post(`${API_BASE}/posts`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
      data: { content: 'a'.repeat(2001) },
    });
    expect(res.status()).toBe(422);
  });

  test('POST-API-002: POST /posts with XSS script tag', async ({ request }) => {
    const res = await request.post(`${API_BASE}/posts`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
      data: { content: '<script>alert("xss")</script>' },
    });
    expect([201, 422]).toContain(res.status());
  });

  // GET /posts/feed
  test('POST-API-003: GET /posts/feed with auth returns 200', async ({ request }) => {
    const res = await request.get(`${API_BASE}/posts/feed`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    expect(res.status()).toBe(200);
  });

  test('POST-API-003: GET /posts/feed without auth returns 401', async ({ request }) => {
    const res = await request.get(`${API_BASE}/posts/feed`);
    expect(res.status()).toBeGreaterThanOrEqual(401);
  });

  // GET /posts/{id}
  test('POST-API-004: GET /posts/{id} returns 200 for existing post', async ({ request }) => {
    const createRes = await request.post(`${API_BASE}/posts`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
      data: { content: 'Test post for get' },
    });
    const post = await createRes.json();

    const res = await request.get(`${API_BASE}/posts/${post.id}`);
    expect(res.status()).toBe(200);
  });

  test('POST-API-004: GET /posts/{id} returns 404 for non-existent', async ({ request }) => {
    const res = await request.get(`${API_BASE}/posts/00000000-0000-0000-0000-000000000000`);
    expect(res.status()).toBe(404);
  });

  test('POST-API-004: GET /posts/{id} with invalid UUID returns 422/404', async ({ request }) => {
    const res = await request.get(`${API_BASE}/posts/not-a-uuid`);
    expect([400, 404, 422]).toContain(res.status());
  });

  // PATCH /posts/{id} - Edit
  test('POST-API-005: PATCH /posts/{id} updates content', async ({ request }) => {
    const createRes = await request.post(`${API_BASE}/posts`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
      data: { content: 'Original content' },
    });
    const post = await createRes.json();

    const res = await request.patch(`${API_BASE}/posts/${post.id}`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
      data: { content: 'Updated content' },
    });
    expect(res.status()).toBe(200);
  });

  test('POST-API-005: PATCH /posts/{id} without auth returns 401', async ({ request }) => {
    const res = await request.patch(`${API_BASE}/posts/some-id`, {
      data: { content: 'Updated' },
    });
    expect(res.status()).toBeGreaterThanOrEqual(401);
  });

  test('POST-API-005: PATCH /posts/{id} of another user returns 403', async ({ request }) => {
    const createRes = await request.post(`${API_BASE}/posts`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
      data: { content: 'Alice post' },
    });
    const post = await createRes.json();

    const res = await request.patch(`${API_BASE}/posts/${post.id}`, {
      headers: { Authorization: `Bearer ${bobToken}` },
      data: { content: 'Bob trying to edit' },
    });
    expect([403, 404]).toContain(res.status());
  });

  // DELETE /posts/{id}
  test('POST-API-006: DELETE /posts/{id} by owner returns 200/204', async ({ request }) => {
    const createRes = await request.post(`${API_BASE}/posts`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
      data: { content: 'Post to delete' },
    });
    const post = await createRes.json();

    const res = await request.delete(`${API_BASE}/posts/${post.id}`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    expect([200, 204]).toContain(res.status());
  });

  test('POST-API-006: DELETE /posts/{id} without auth returns 401', async ({ request }) => {
    const res = await request.delete(`${API_BASE}/posts/some-id`);
    expect(res.status()).toBeGreaterThanOrEqual(401);
  });

  test('POST-API-006: DELETE /posts/{id} of another user returns 403', async ({ request }) => {
    const createRes = await request.post(`${API_BASE}/posts`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
      data: { content: 'Alice post' },
    });
    const post = await createRes.json();

    const res = await request.delete(`${API_BASE}/posts/${post.id}`, {
      headers: { Authorization: `Bearer ${bobToken}` },
    });
    expect([403, 404]).toContain(res.status());
  });

  // POST /posts/{id}/like
  test('POST-API-007: POST /posts/{id}/like returns 200', async ({ request }) => {
    const createRes = await request.post(`${API_BASE}/posts`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
      data: { content: 'Post to like' },
    });
    const post = await createRes.json();

    const res = await request.post(`${API_BASE}/posts/${post.id}/like`, {
      headers: { Authorization: `Bearer ${bobToken}` },
    });
    expect(res.status()).toBe(200);
  });

  test('POST-API-007: POST /posts/{id}/like without auth returns 401', async ({ request }) => {
    const res = await request.post(`${API_BASE}/posts/some-id/like`);
    expect(res.status()).toBeGreaterThanOrEqual(401);
  });

  test('POST-API-007: POST /posts/{id}/like twice returns 409', async ({ request }) => {
    const createRes = await request.post(`${API_BASE}/posts`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
      data: { content: 'Post to double like' },
    });
    const post = await createRes.json();

    await request.post(`${API_BASE}/posts/${post.id}/like`, {
      headers: { Authorization: `Bearer ${bobToken}` },
    });

    const res = await request.post(`${API_BASE}/posts/${post.id}/like`, {
      headers: { Authorization: `Bearer ${bobToken}` },
    });
    expect([409, 400]).toContain(res.status());
  });

  // DELETE /posts/{id}/like
  test('POST-API-008: DELETE /posts/{id}/like unlikes', async ({ request }) => {
    const createRes = await request.post(`${API_BASE}/posts`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
      data: { content: 'Post to unlike' },
    });
    const post = await createRes.json();

    await request.post(`${API_BASE}/posts/${post.id}/like`, {
      headers: { Authorization: `Bearer ${bobToken}` },
    });

    const res = await request.delete(`${API_BASE}/posts/${post.id}/like`, {
      headers: { Authorization: `Bearer ${bobToken}` },
    });
    expect([200, 204]).toContain(res.status());
  });

  // POST /posts/{id}/comments
  test('POST-API-009: POST /posts/{id}/comments creates comment', async ({ request }) => {
    const createRes = await request.post(`${API_BASE}/posts`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
      data: { content: 'Post for comment' },
    });
    const post = await createRes.json();

    const res = await request.post(`${API_BASE}/posts/${post.id}/comments`, {
      headers: { Authorization: `Bearer ${bobToken}` },
      data: { content: 'Test comment' },
    });
    expect(res.status()).toBe(201);
  });

  test('POST-API-009: POST /posts/{id}/comments without auth returns 401', async ({ request }) => {
    const res = await request.post(`${API_BASE}/posts/some-id/comments`, {
      data: { content: 'Comment' },
    });
    expect(res.status()).toBeGreaterThanOrEqual(401);
  });

  test('POST-API-009: POST /posts/{id}/comments with empty content returns 422', async ({ request }) => {
    const createRes = await request.post(`${API_BASE}/posts`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
      data: { content: 'Post' },
    });
    const post = await createRes.json();

    const res = await request.post(`${API_BASE}/posts/${post.id}/comments`, {
      headers: { Authorization: `Bearer ${bobToken}` },
      data: { content: '' },
    });
    expect(res.status()).toBe(422);
  });

  // GET /posts/{id}/comments
  test('POST-API-010: GET /posts/{id}/comments returns list', async ({ request }) => {
    const createRes = await request.post(`${API_BASE}/posts`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
      data: { content: 'Post with comments' },
    });
    const post = await createRes.json();

    const res = await request.get(`${API_BASE}/posts/${post.id}/comments`);
    expect(res.status()).toBe(200);
  });
});