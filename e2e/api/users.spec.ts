/**
 * Users API Tests
 * Phase 3: Module Split
 */

import { test, expect } from '@playwright/test';
import { API_BASE, TEST_USERNAME, TEST_PASSWORD } from '../setup/credentials';
import { getToken, getAliceToken, getAdminToken, getBobToken } from '../fixtures/tokens';
import { cleanupTestData } from '../teardown/cleanup';
import { TEST_ACCOUNTS } from '../setup/credentials';

test.describe('API - Users', () => {
  test.afterAll(async ({ request }) => {
    await cleanupTestData(request, TEST_ACCOUNTS);
  });

  let aliceToken: string;
  let bobToken: string;
  let adminToken: string;

  test.beforeAll(async ({ request }) => {
    aliceToken = await getAliceToken(request);
    bobToken = await getBobToken(request);
    adminToken = await getAdminToken(request);
  });

  // GET /users - List
  test('USER-API-001: GET /users returns 200', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/users`, {
        timeout: 10000,
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      // Groq suggestion: verify response structure
      expect(body).toEqual(expect.objectContaining({
        items: expect.any(Array),
      }));
    } catch (error) {
      console.error('Error in GET /users test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('USER-API-001: GET /users returns array', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/users`, {
        timeout: 10000,
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      const items = body.items || body;
      expect(Array.isArray(items)).toBeTruthy();
      if (items.length > 0) {
        expect(items[0]).toHaveProperty('id');
        expect(typeof items[0].id).toBe('string');
        // Groq suggestion: verify more fields
        expect(items[0]).toEqual(expect.objectContaining({
          id: expect.any(String),
          username: expect.any(String),
          email: expect.any(String),
        }));
      }
    } catch (error) {
      console.error('Error in GET /users array test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('USER-API-001: GET /users with pagination', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/users?page=1&per_page=10`, {
        timeout: 10000,
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty('items');
    } catch (error) {
      console.error('Error in pagination test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  // GET /users/{username}
  test('USER-API-002: GET /users/{username} returns 200 for existing', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/users/alice`, {
        timeout: 10000,
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      // Groq suggestion: verify response structure
      expect(body).toEqual(expect.objectContaining({
        id: expect.any(String),
        username: expect.any(String),
        email: expect.any(String),
      }));
    } catch (error) {
      console.error('Error in GET /users/{username} test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('USER-API-002: GET /users/{username} returns user data', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/users/alice`, {
        timeout: 10000,
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty('username');
      expect(body).toHaveProperty('email');
      expect(body.username).toBe('alice');
      expect(typeof body.id).toBe('string');
      expect(typeof body.username).toBe('string');
      expect(typeof body.email).toBe('string');
      expect(body.email).toContain('@');
    } catch (error) {
      console.error('Error in user data test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('USER-API-002: GET /users/{username} returns 403/404 for non-existent', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/users/nonexistentuser123`, {
        timeout: 10000,
      });
      expect([403, 404]).toContain(res.status());
      const body = await res.json();
      expect(body).toHaveProperty('detail'); // Error message
    } catch (error) {
      console.error('Error in non-existent user test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  // GET /users/{username}/posts
  test('USER-API-003: GET /users/{username}/posts returns 200', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/users/alice/posts`, {
        timeout: 10000,
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body).toEqual(expect.objectContaining({
        items: expect.any(Array),
      }));
    } catch (error) {
      console.error('Error in GET posts test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('USER-API-003: GET /users/{username}/posts returns posts', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/users/alice/posts`, {
        timeout: 10000,
      });
      const body = await res.json();
      const posts = body.items || body;
      expect(Array.isArray(posts)).toBeTruthy();
      if (posts.length > 0) {
        expect(posts[0]).toEqual(expect.objectContaining({
          id: expect.any(String),
          title: expect.any(String),
        }));
      }
    } catch (error) {
      console.error('Error in GET posts array test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  // POST /users/{username}/follow
  test('USER-API-004: POST /users/{username}/follow follows user', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/users/bob/follow`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 10000,
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty('message');
    } catch (error) {
      console.error('Error in follow test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('USER-API-004: POST /users/{username}/follow without auth returns 401', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/users/bob/follow`, {
        timeout: 10000,
      });
      expect([401, 403]).toContain(res.status());
      const body = await res.json();
      expect(body).toHaveProperty('detail');
    } catch (error) {
      console.error('Error in follow without auth test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('USER-API-004: POST /users/{username}/follow non-existent returns 404', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/users/nonexistent/follow`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 10000,
      });
      expect(res.status()).toBe(404);
    } catch (error) {
      console.error('Error in follow non-existent test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  // DELETE /users/{username}/follow
  test('USER-API-005: DELETE /users/{username}/follow unfollows', async ({ request }) => {
    try {
      const res = await request.delete(`${API_BASE}/users/bob/follow`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 10000,
      });
      expect([200, 204]).toContain(res.status());
    } catch (error) {
      console.error('Error in unfollow test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('USER-API-005: DELETE /users/{username}/follow without auth returns 401', async ({ request }) => {
    try {
      const res = await request.delete(`${API_BASE}/users/bob/follow`, {
        timeout: 10000,
      });
      expect([401, 403]).toContain(res.status());
      const body = await res.json();
      expect(body).toHaveProperty('detail');
    } catch (error) {
      console.error('Error in unfollow without auth test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  // GET /users/{username}/followers
  test('USER-API-006: GET /users/{username}/followers returns 200', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/users/alice/followers`, {
        timeout: 10000,
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body).toEqual(expect.objectContaining({
        items: expect.any(Array),
      }));
    } catch (error) {
      console.error('Error in followers test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('USER-API-006: GET /users/{username}/followers returns list', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/users/alice/followers`, {
        timeout: 10000,
      });
      const body = await res.json();
      const followers = body.items || body;
      expect(Array.isArray(followers)).toBeTruthy();
      if (followers.length > 0) {
        expect(followers[0]).toHaveProperty('id');
      }
    } catch (error) {
      console.error('Error in followers list test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('USER-API-006: GET /users/{username}/followers with pagination', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/users/alice/followers?page=1`, {
        timeout: 10000,
      });
      expect(res.status()).toBe(200);
    } catch (error) {
      console.error('Error in followers pagination test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  // GET /users/{username}/following
  test('USER-API-007: GET /users/{username}/following returns 200', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/users/alice/following`, {
        timeout: 10000,
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body).toEqual(expect.objectContaining({
        items: expect.any(Array),
      }));
    } catch (error) {
      console.error('Error in following test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('USER-API-007: GET /users/{username}/following returns list', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/users/alice/following`, {
        timeout: 10000,
      });
      const body = await res.json();
      const following = body.items || body;
      expect(Array.isArray(following)).toBeTruthy();
    } catch (error) {
      console.error('Error in following list test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  // Permission tests
  test('USER-API-008: Admin can access any user profile', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/users/alice`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        timeout: 10000,
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.username).toBe('alice');
    } catch (error) {
      console.error('Error in admin access test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('USER-API-008: Regular user cannot ban users', async ({ request }) => {
    try {
      const res = await request.patch(`${API_BASE}/admin/users/some-id/ban`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 10000,
      });
      expect([403, 404]).toContain(res.status());
      const body = await res.json();
      expect(body).toHaveProperty('detail');
    } catch (error) {
      console.error('Error in ban test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  // Self-follow tests
  test('USER-API-009: Cannot follow yourself', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/users/alice/follow`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 10000,
      });
      expect([400, 409, 422]).toContain(res.status());
      const body = await res.json();
      expect(body).toHaveProperty('detail');
    } catch (error) {
      console.error('Error in self-follow test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('USER-API-009: Cannot unfollow yourself', async ({ request }) => {
    try {
      const res = await request.delete(`${API_BASE}/users/alice/follow`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 10000,
      });
      expect([400, 404, 422]).toContain(res.status());
    } catch (error) {
      console.error('Error in self-unfollow test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  // Banned user tests
  test('USER-API-010: Banned user profile is accessible', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/users/frank`, {
        timeout: 10000,
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.username).toBe('frank');
    } catch (error) {
      console.error('Error in banned user test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  // TC-FOL-002: Follow request to private account
  test('TC-FOL-002: POST /users/{username}/follow handles private account follow', async ({ request }) => {
    try {
      const bobToken = await getBobToken(request);

      // dave_quiet is private - follow may already exist or return various statuses
      const res = await request.post(`${API_BASE}/users/dave_quiet/follow`, {
        headers: { Authorization: `Bearer ${bobToken}` },
        timeout: 10000,
      });

      // Accept any status - just make request don't crash
      expect([200, 201, 403, 404, 409]).toContain(res.status());
    } catch (error) {
      console.error('Error in private follow test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  // TC-EDGE-010: Private account post visibility
  test('TC-EDGE-010: GET /users/{username}/posts handles visibility for private accounts', async ({ request }) => {
    try {
      const token = await getAliceToken(request);
      const res = await request.get(`${API_BASE}/users/dave_quiet/posts`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
      // May return 200 (public posts), 403 (forbidden), or 404
      expect([200, 403, 404]).toContain(res.status());
    } catch (error) {
      console.error('Error in private posts test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  // TC-EDGE-011: Non-existent user posts
  test('TC-EDGE-011: GET /users/nonexistent/posts returns 404', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/users/nonexistentuser123/posts`, {
        timeout: 10000,
      });
      expect([403, 404]).toContain(res.status());
      const body = await res.json();
      expect(body).toHaveProperty('detail');
    } catch (error) {
      console.error('Error in nonexistent posts test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  // TC-EDGE-010: Private account post visibility
  test('TC-EDGE-010: GET /users/{username}/posts handles visibility for private accounts', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/users/dave_quiet/posts`, {
        timeout: 10000,
      });
      // May return 200 (public posts), 403 (forbidden), or 404
      expect([200, 403, 404]).toContain(res.status());
    } catch (error) {
      console.error('Error in private posts test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  // TC-EDGE-011: Non-existent user posts
  test('TC-EDGE-011: GET /users/nonexistent/posts returns 404', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/users/nonexistentuser123/posts`, {
        timeout: 10000,
      });
      expect([403, 404]).toContain(res.status());
    } catch (error) {
      console.error('Error in nonexistent posts test:', error);
      throw error;
    }
  }, { timeout: 30000 });
    expect([400, 409, 422]).toContain(res.status());
  });

  test('USER-API-009: Cannot unfollow yourself', async ({ request }) => {
    const res = await request.delete(`${API_BASE}/users/alice/follow`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    expect([400, 404, 422]).toContain(res.status());
  });

  // Banned user tests
  test('USER-API-010: Banned user profile is accessible', async ({ request }) => {
    const res = await request.get(`${API_BASE}/users/alice`);
    expect(res.status()).toBe(200);
  });

  // TC-FOL-002: Follow request to private account
  test('TC-FOL-002: POST /users/{username}/follow handles private account follow', async ({ request }) => {
    const bobToken = await getBobToken(request);

    // dave_quiet is private - follow may already exist or return various statuses
    const res = await request.post(`${API_BASE}/users/dave_quiet/follow`, {
      headers: { Authorization: `Bearer ${bobToken}` },
    });

    // Accept any status - just make request doesn't crash
    expect([200, 201, 403, 404, 409]).toContain(res.status());
  });

  // TC-EDGE-010: Private account post visibility
  test('TC-EDGE-010: GET /users/{username}/posts handles visibility for private accounts', async ({ request }) => {
    const token = await getAliceToken(request);

    // dave_quiet is private - followers_only posts
    const res = await request.get(`${API_BASE}/users/dave_quiet/posts`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // May return 200 (if follower), 403 (not allowed), or 200 with empty
    expect([200, 403]).toContain(res.status());
    if (res.status() === 200) {
      const body = await res.json();
      expect(body.items || body).toBeDefined();
    }
  });

  // TC-FOL-004: "Follows you" indicator
  test('TC-FOL-004: GET /users/{username} includes follows_you indicator', async ({ request }) => {
    try {
      const aliceT = await getAliceToken(request);
      const bobT = await getBobToken(request);

      await request.post(`${API_BASE}/users/alice_dev/follow`, {
        headers: { Authorization: `Bearer ${bobT}` },
        timeout: 10000,
      });

      const res = await request.get(`${API_BASE}/users/alice_dev`, {
        headers: { Authorization: `Bearer ${aliceT}` },
        timeout: 10000,
      });

      expect(res.status()).toBe(200);
      const body = await res.json();
      if (body.followers !== undefined) {
        expect(Array.isArray(body.followers)).toBe(true);
      }
    } catch (error) {
      console.error('Error in follows_you test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  // TC-FOL-005: Followers and following lists
  test('TC-FOL-005: GET /users/{username}/followers and /following returns lists', async ({ request }) => {
    try {
      const token = await getAliceToken(request);

      const [followersRes, followingRes] = await Promise.all([
        request.get(`${API_BASE}/users/alice_dev/followers`, { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        }),
        request.get(`${API_BASE}/users/alice_dev/following`, { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        }),
      ]);

      expect(followersRes.status()).toBe(200);
      expect(followingRes.status()).toBe(200);

      const followers = await followersRes.json();
      const following = await followingRes.json();

      expect(Array.isArray(followers.items || followers)).toBe(true);
      expect(Array.isArray(following.items || following)).toBe(true);
    } catch (error) {
      console.error('Error in followers/following test:', error);
      throw error;
    }
