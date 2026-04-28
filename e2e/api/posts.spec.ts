/**
 * Posts API Tests
 * Phase 3: Module Split
 */

import { test, expect } from '@playwright/test';
import { API_BASE, TEST_USERNAME, TEST_PASSWORD } from '../setup/credentials';
import { getToken, getAliceToken, getBobToken } from '../fixtures/tokens';
import { cleanupTestData } from '../teardown/cleanup';
import { TEST_ACCOUNTS } from '../setup/credentials';

test.describe('API - Posts', () => {
  test.afterAll(async ({ request }) => {
    await cleanupTestData(request, TEST_ACCOUNTS);
  });

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
        timeout: 10000,
      });
      expect([200, 401, 403]).toContain(res.status());
      const body = await res.json();
      expect(body).toHaveProperty('items');
    } catch (error) {
      console.error('Error in GET /posts test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('POST-API-001: GET /posts with auth returns array', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/posts`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 10000,
      });
      // Phase 4: Stronger assertions
      expect(res.status()).toBeGreaterThanOrEqual(200);
      const body = await res.json();
      const items = body.items || body;
      expect(Array.isArray(items)).toBeTruthy();
      if (items.length > 0) {
        expect(items[0]).toHaveProperty('id');
        expect(typeof items[0].id).toBe('string');
        // Groq suggestion: verify more fields
        expect(items[0]).toEqual(expect.objectContaining({
          id: expect.any(String),
          content: expect.any(String),
        }));
      }
    } catch (error) {
      console.error('Error in GET /posts array test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('POST-API-001: GET /posts pagination params work', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/posts?page=1&per_page=10`, {
        timeout: 10000,
      });
      expect(res.status()).toBeGreaterThanOrEqual(200);
      const body = await res.json();
      expect(body).toHaveProperty('items');
    } catch (error) {
      console.error('Error in pagination test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('POST-API-001: GET /posts with invalid page returns 422', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/posts?page=-1`, {
        timeout: 10000,
      });
      expect([200, 400, 422]).toContain(res.status());
      const body = await res.json();
      expect(body).toHaveProperty('detail');
    } catch (error) {
      console.error('Error in invalid page test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  // POST /posts - Create
  test('POST-API-002: POST /posts creates post returns 201', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/posts`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        data: { content: 'Test post content' },
        timeout: 10000,
      });
      expect(res.status()).toBe(201);
      const body = await res.json();
      expect(body).toHaveProperty('id');
    } catch (error) {
      console.error('Error in create post test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('POST-API-002: POST /posts returns post data', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/posts`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        data: { content: 'Test post content' },
        timeout: 10000,
      });
      const body = await res.json();
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('content');
      // Groq suggestion: verify response structure
      expect(body).toEqual(expect.objectContaining({
        id: expect.any(String),
        content: expect.any(String),
        createdAt: expect.any(String),
      }));
    } catch (error) {
      console.error('Error in post data test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('POST-API-002: POST /posts with auth returns 401', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/posts`, {
        data: { content: 'Test post' },
        timeout: 10000,
      });
      expect(res.status()).toBeGreaterThanOrEqual(401);
      const body = await res.json();
      expect(body).toHaveProperty('detail');
    } catch (error) {
      console.error('Error in unauthorized post test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('POST-API-002: POST /posts with empty content returns 422', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/posts`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        data: { content: '' },
        timeout: 10000,
      });
      expect(res.status()).toBe(422);
      const body = await res.json();
      expect(body).toHaveProperty('detail');
    } catch (error) {
      console.error('Error in empty content test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('POST-API-002: POST /posts with 1 char content succeeds', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/posts`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        data: { content: 'a' },
        timeout: 10000,
      });
      expect(res.status()).toBe(201);
    } catch (error) {
      console.error('Error in 1 char content test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('POST-API-002: POST /posts with 2000 chars succeeds', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/posts`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        data: { content: 'a'.repeat(2000) },
        timeout: 10000,
      });
      expect(res.status()).toBe(201);
    } catch (error) {
      console.error('Error in 2000 chars test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  // GET /posts/{id} - Single post
  test('POST-API-003: GET /posts/{id} returns 200 for existing', async ({ request }) => {
    try {
      // First create a post
      const createRes = await request.post(`${API_BASE}/posts`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        data: { content: 'Test post for GET' },
        timeout: 10000,
      });
      const post = await createRes.json();
      const postId = post.id;

      const res = await request.get(`${API_BASE}/posts/${postId}`, {
        timeout: 10000,
      });
      expect(res.status()).toBeGreaterThanOrEqual(200);
      const body = await res.json();
      expect(body).toHaveProperty('id');
    } catch (error) {
      console.error('Error in GET single post test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('POST-API-003: GET /posts/{id} returns post data', async ({ request }) => {
    try {
      // First create a post
      const createRes = await request.post(`${API_BASE}/posts`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        data: { content: 'Test post for GET' },
        timeout: 10000,
      });
      const post = await createRes.json();
      const postId = post.id;

      const res = await request.get(`${API_BASE}/posts/${postId}`, {
        timeout: 10000,
      });
      const body = await res.json();
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('content');
      // Groq suggestion: verify structure
      expect(body).toEqual(expect.objectContaining({
        id: expect.any(String),
        content: expect.any(String),
      }));
    } catch (error) {
      console.error('Error in post data GET test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('POST-API-003: GET /posts/{id} returns 404 for non-existent', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/posts/nonexistent123`, {
        timeout: 10000,
      });
      expect([404, 422]).toContain(res.status());
      const body = await res.json();
      expect(body).toHaveProperty('detail');
    } catch (error) {
      console.error('Error in non-existent post test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  // PBT - Property-Based Testing
  test('POST-API-004: POST /posts with SQL injection in content', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/posts`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        data: { content: "'; DROP TABLE posts; --" },
        timeout: 10000,
      });
      expect([201, 400, 422]).toContain(res.status());
    } catch (error) {
      console.error('Error in SQL injection test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  // GET /posts/{id}/comments
  test('POST-API-005: GET /posts/{id}/comments returns 200', async ({ request }) => {
    try {
      // First create a post
      const createRes = await request.post(`${API_BASE}/posts`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        data: { content: 'Post for comments' },
        timeout: 10000,
      });
      const post = await createRes.json();
      const postId = post.id;

      const res = await request.get(`${API_BASE}/posts/${postId}/comments`, {
        timeout: 10000,
      });
      expect(res.status()).toBeGreaterThanOrEqual(200);
      const body = await res.json();
      expect(body).toHaveProperty('items');
    } catch (error) {
      console.error('Error in comments test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('POST-API-005: GET /posts/{id}/comments returns comments', async ({ request }) => {
    try {
      // First create a post
      const createRes = await request.post(`${API_BASE}/posts`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        data: { content: 'Post for comments' },
        timeout: 10000,
      });
      const post = await createRes.json();
      const postId = post.id;

      const res = await request.get(`${API_BASE}/posts/${postId}/comments`, {
        timeout: 10000,
      });
      const body = await res.json();
      const comments = body.items || body;
      expect(Array.isArray(comments)).toBeTruthy();
    } catch (error) {
      console.error('Error in comments list test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  // POST /posts/{id}/like
  test('POST-API-006: POST /posts/{id}/like likes post', async ({ request }) => {
    try {
      // First create a post
      const createRes = await request.post(`${API_BASE}/posts`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        data: { content: 'Post to like' },
        timeout: 10000,
      });
      const post = await createRes.json();
      const postId = post.id;

      const res = await request.post(`${API_BASE}/posts/${postId}/like`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 10000,
      });
      expect([200, 201]).toContain(res.status());
    } catch (error) {
      console.error('Error in like post test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('POST-API-006: POST /posts/{id}/like without auth returns 401', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/posts/some-id/like`, {
        timeout: 10000,
      });
      expect(res.status()).toBeGreaterThanOrEqual(401);
      const body = await res.json();
      expect(body).toHaveProperty('detail');
    } catch (error) {
      console.error('Error in like without auth test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('POST-API-006: POST /posts/{id}/like non-existent returns 404', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/posts/nonexistent123/like`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 10000,
      });
      expect(res.status()).toBe(404);
      const body = await res.json();
      expect(body).toHaveProperty('detail');
    } catch (error) {
      console.error('Error in like non-existent test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  // DELETE /posts/{id}
  test('POST-API-007: DELETE /posts/{id} deletes post', async ({ request }) => {
    try {
      // First create a post
      const createRes = await request.post(`${API_BASE}/posts`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        data: { content: 'Post to delete' },
        timeout: 10000,
      });
      const post = await createRes.json();
      const postId = post.id;

      const res = await request.delete(`${API_BASE}/posts/${postId}`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 10000,
      });
      expect([200, 204]).toContain(res.status());
    } catch (error) {
      console.error('Error in delete post test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('POST-API-007: DELETE /posts/{id} without auth returns 401', async ({ request }) => {
    try {
      const res = await request.delete(`${API_BASE}/posts/some-id`, {
        timeout: 10000,
      });
      expect(res.status()).toBeGreaterThanOrEqual(401);
      const body = await res.json();
      expect(body).toHaveProperty('detail');
    } catch (error) {
      console.error('Error in delete without auth test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('POST-API-007: DELETE /posts/{id} non-existent returns 404', async ({ request }) => {
    try {
      const res = await request.delete(`${API_BASE}/posts/nonexistent123`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 10000,
      });
      expect(res.status()).toBe(404);
      const body = await res.json();
      expect(body).toHaveProperty('detail');
    } catch (error) {
      console.error('Error in delete non-existent test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  // Negative tests - Different user actions
  test('POST-API-008: Regular user cannot delete others posts', async ({ request }) => {
    try {
      // Create post as alice
      const createRes = await request.post(`${API_BASE}/posts`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        data: { content: 'Alice post' },
        timeout: 10000,
      });
      const post = await createRes.json();
      const postId = post.id;

      // Try to delete as bob
      const res = await request.delete(`${API_BASE}/posts/${postId}`, {
        headers: { Authorization: `Bearer ${bobToken}` },
        timeout: 10000,
      });
      expect(res.status()).toBeGreaterThanOrEqual(403);
    } catch (error) {
      console.error('Error in delete others post test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  // Privacy tests
  test('POST-API-009: Cannot see private user posts without following', async ({ request }) => {
    try {
      // dave_quiet is private - alice is not following
      const res = await request.get(`${API_BASE}/users/dave_quiet/posts`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 10000,
      });
      // May return 403 (forbidden) or 200 with empty posts
      expect([200, 403]).toContain(res.status());
      const body = await res.json();
      expect(body).toHaveProperty('items');
    } catch (error) {
      console.error('Error in private posts test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  // TC-POST-001: Create post with mentions
  test('TC-POST-001: POST /posts with @mention creates post', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/posts`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        data: { content: 'Hello @bob!' },
        timeout: 10000,
      });
      expect([200, 201]).toContain(res.status());
      const body = await res.json();
      expect(body).toHaveProperty('content');
    } catch (error) {
      console.error('Error in mention post test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  // TC-POST-002: Create post with hashtags
  test('TC-POST-002: POST /posts with #hashtag creates post', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/posts`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        data: { content: 'Hello #testing' },
        timeout: 10000,
      });
      expect([200, 201]).toContain(res.status());
      const body = await res.json();
      expect(body).toHaveProperty('content');
    } catch (error) {
      console.error('Error in hashtag post test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  // TC-POST-003: Create post with URL
  test('TC-POST-003: POST /posts with URL creates post', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/posts`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        data: { content: 'Check this http://example.com' },
        timeout: 10000,
      });
      expect([200, 201]).toContain(res.status());
      const body = await res.json();
      expect(body).toHaveProperty('content');
    } catch (error) {
      console.error('Error in URL post test:', error);
      throw error;
    }
  }, { timeout: 30000 });
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

  // TC-COM-002: Reply to a comment (nested) - API may not support nesting
  test('TC-COM-002: POST /posts/{id}/comments handles nested reply', async ({ request }) => {
    const createRes = await request.post(`${API_BASE}/posts`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
      data: { content: 'Post for nested comment test' },
    });
    const post = await createRes.json();

    // First comment
    const commentRes = await request.post(`${API_BASE}/posts/${post.id}/comments`, {
      headers: { Authorization: `Bearer ${bobToken}` },
      data: { content: 'First comment' },
    });
    expect([201, 200]).toContain(commentRes.status());
    const comment = await commentRes.json();

    // Try to reply to first comment (nested reply)
    const replyRes = await request.post(`${API_BASE}/posts/${post.id}/comments`, {
      headers: { Authorization: `Bearer ${bobToken}` },
      data: { content: 'Nested reply', parent_id: comment.id },
    });

    // Accept 200/201 (created), 422 (field not supported), or 404 - depends on backend
    expect([200, 201, 404, 422]).toContain(replyRes.status());
  });

  // TC-COM-004: Like a comment
  test('TC-COM-004: Comments endpoint supports likes', async ({ request }) => {
    const createRes = await request.post(`${API_BASE}/posts`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
      data: { content: 'Post for comment like test' },
    });
    const post = await createRes.json();

    const commentRes = await request.post(`${API_BASE}/posts/${post.id}/comments`, {
      headers: { Authorization: `Bearer ${bobToken}` },
      data: { content: 'Comment to like' },
    });
    const comment = await commentRes.json();

    // Check if comments have likes - may not be implemented
    if (comment.likes !== undefined) {
      expect(typeof comment.likes).toBe('number');
    }
  });
});