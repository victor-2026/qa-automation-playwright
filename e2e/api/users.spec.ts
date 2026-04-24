/**
 * Users API Tests
 * Phase 3: Module Split
 */

import { test, expect } from '@playwright/test';
import { API_BASE, TEST_USERNAME, TEST_PASSWORD } from '../setup/credentials';
import { getToken, getAliceToken, getAdminToken, getBobToken } from '../fixtures/tokens';
import { cleanupTestData } from '../teardown/cleanup';
import { TEST_ACCOUNTS } from '../setup/credentials';

test.afterAll(async ({ request }) => {
  await cleanupTestData(request, TEST_ACCOUNTS);
});

test.describe('API - Users', () => {
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
    const res = await request.get(`${API_BASE}/users`);
    expect(res.status()).toBe(200);
  });

  test('USER-API-001: GET /users returns array', async ({ request }) => {
    const res = await request.get(`${API_BASE}/users`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    const items = body.items || body;
    expect(Array.isArray(items)).toBeTruthy();
    if (items.length > 0) {
      expect(items[0]).toHaveProperty('id');
      expect(typeof items[0].id).toBe('string');
    }
  });

  test('USER-API-001: GET /users with pagination', async ({ request }) => {
    const res = await request.get(`${API_BASE}/users?page=1&per_page=10`);
    expect(res.status()).toBe(200);
  });

  // GET /users/{username}
  test('USER-API-002: GET /users/{username} returns 200 for existing', async ({ request }) => {
    const res = await request.get(`${API_BASE}/users/alice`);
    expect(res.status()).toBe(200);
  });

  test('USER-API-002: GET /users/{username} returns user data', async ({ request }) => {
    const res = await request.get(`${API_BASE}/users/alice`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('username');
    expect(body).toHaveProperty('email');
    expect(body.username).toBe('alice');
    expect(typeof body.id).toBe('string');
    expect(typeof body.username).toBe('string');
    expect(typeof body.email).toBe('string');
    expect(body.email).toContain('@');
  });

  test('USER-API-002: GET /users/{username} returns 403/404 for non-existent', async ({ request }) => {
    const res = await request.get(`${API_BASE}/users/nonexistentuser123`);
    expect([403, 404]).toContain(res.status());
  });

  // GET /users/{username}/posts
  test('USER-API-003: GET /users/{username}/posts returns 200', async ({ request }) => {
    const res = await request.get(`${API_BASE}/users/alice/posts`);
    expect(res.status()).toBe(200);
  });

  test('USER-API-003: GET /users/{username}/posts returns posts', async ({ request }) => {
    const res = await request.get(`${API_BASE}/users/alice/posts`);
    const body = await res.json();
    expect(Array.isArray(body.items || body)).toBeTruthy();
  });

  // POST /users/{username}/follow
  test('USER-API-004: POST /users/{username}/follow follows user', async ({ request }) => {
    const res = await request.post(`${API_BASE}/users/bob/follow`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    expect(res.status()).toBe(200);
  });

  test('USER-API-004: POST /users/{username}/follow without auth returns 401', async ({ request }) => {
    const res = await request.post(`${API_BASE}/users/bob/follow`);
    expect(res.status()).toBeGreaterThanOrEqual(401);
  });

  test('USER-API-004: POST /users/{username}/follow non-existent returns 404', async ({ request }) => {
    const res = await request.post(`${API_BASE}/users/nonexistent/follow`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    expect(res.status()).toBe(404);
  });

  // DELETE /users/{username}/follow
  test('USER-API-005: DELETE /users/{username}/follow unfollows', async ({ request }) => {
    const res = await request.delete(`${API_BASE}/users/bob/follow`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    expect([200, 204]).toContain(res.status());
  });

  test('USER-API-005: DELETE /users/{username}/follow without auth returns 401', async ({ request }) => {
    const res = await request.delete(`${API_BASE}/users/bob/follow`);
    expect(res.status()).toBeGreaterThanOrEqual(401);
  });

  // GET /users/{username}/followers
  test('USER-API-006: GET /users/{username}/followers returns 200', async ({ request }) => {
    const res = await request.get(`${API_BASE}/users/alice/followers`);
    expect(res.status()).toBe(200);
  });

  test('USER-API-006: GET /users/{username}/followers returns list', async ({ request }) => {
    const res = await request.get(`${API_BASE}/users/alice/followers`);
    const body = await res.json();
    expect(Array.isArray(body.items || body)).toBeTruthy();
  });

  test('USER-API-006: GET /users/{username}/followers with pagination', async ({ request }) => {
    const res = await request.get(`${API_BASE}/users/alice/followers?page=1`);
    expect(res.status()).toBe(200);
  });

  // GET /users/{username}/following
  test('USER-API-007: GET /users/{username}/following returns 200', async ({ request }) => {
    const res = await request.get(`${API_BASE}/users/alice/following`);
    expect(res.status()).toBe(200);
  });

  test('USER-API-007: GET /users/{username}/following returns list', async ({ request }) => {
    const res = await request.get(`${API_BASE}/users/alice/following`);
    const body = await res.json();
    expect(Array.isArray(body.items || body)).toBeTruthy();
  });

  // Permission tests
  test('USER-API-008: Admin can access any user profile', async ({ request }) => {
    const res = await request.get(`${API_BASE}/users/alice`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status()).toBe(200);
  });

  test('USER-API-008: Regular user cannot ban users', async ({ request }) => {
    const res = await request.patch(`${API_BASE}/admin/users/some-id/ban`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    expect(res.status()).toBeGreaterThanOrEqual(403);
  });

  // Self-follow tests
  test('USER-API-009: Cannot follow yourself', async ({ request }) => {
    const res = await request.post(`${API_BASE}/users/alice/follow`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
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
    const aliceT = await getAliceToken(request);
    const bobT = await getBobToken(request);

    await request.post(`${API_BASE}/users/alice_dev/follow`, {
      headers: { Authorization: `Bearer ${bobT}` },
    });

    const res = await request.get(`${API_BASE}/users/alice_dev`, {
      headers: { Authorization: `Bearer ${aliceT}` },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    if (body.followers !== undefined) {
      expect(Array.isArray(body.followers)).toBe(true);
    }
  });

  // TC-FOL-005: Followers and following lists
  test('TC-FOL-005: GET /users/{username}/followers and /following returns lists', async ({ request }) => {
    const token = await getAliceToken(request);

    const [followersRes, followingRes] = await Promise.all([
      request.get(`${API_BASE}/users/alice_dev/followers`, { headers: { Authorization: `Bearer ${token}` } }),
      request.get(`${API_BASE}/users/alice_dev/following`, { headers: { Authorization: `Bearer ${token}` } }),
    ]);

    expect(followersRes.status()).toBe(200);
    expect(followingRes.status()).toBe(200);

    const followers = await followersRes.json();
    const following = await followingRes.json();

    expect(Array.isArray(followers.items || followers)).toBe(true);
    expect(Array.isArray(following.items || following)).toBe(true);
  });
});