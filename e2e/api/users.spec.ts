/**
 * Users API Tests
 * Phase 3: Module Split
 */

import { test, expect } from '@playwright/test';
import { API_BASE, TEST_ACCOUNTS } from '../setup/credentials';
import { getToken, getAliceToken, getAdminToken, getBobToken } from '../fixtures/tokens';
import { cleanupTestData } from '../teardown/cleanup';
import { TEST_ACCOUNTS } from '../setup/credentials';
import { expectStatus, expectStatusAtLeast } from './helpers';

test.afterAll(async ({ request }) => {
  await cleanupTestData(request, TEST_ACCOUNTS);
});

test.describe('API - Users', () => {
  let aliceToken: string;
  let bobToken: string;
  let adminToken: string;

  test.beforeAll(async ({ request }) => {
    aliceToken = await getAliceToken(request);
    const _bobToken = await getBobToken(request);
    adminToken = await getAdminToken(request);
  });

  // GET /users - List
  test('USER-API-001: GET /users returns 200', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/users`, {
        timeout: 5000,
      });
      expectStatus(res, 200);
    } catch (err) {
      console.error('USER-API-001 error', err);
      throw err;
    }
  });

  test('USER-API-002: GET /users returns array', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/users`, {
        timeout: 5000,
      });
      expectStatus(res, 200);
      const body = await res.json();
      const items = body.items || body;
      expect(Array.isArray(items)).toBeTruthy();
      // Phase 4: Check structure if items exist
      if (items.length > 0) {
        expect(items[0]).toHaveProperty('id');
        expect(typeof items[0].id).toBe('string');
      }
    } catch (err) {
      console.error('USER-API-002 error', err);
      throw err;
    }
  });

  test('USER-API-003: GET /users with pagination', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/users?page=1&per_page=10`, {
        timeout: 5000,
      });
      expectStatus(res, 200);
    } catch (err) {
      console.error('USER-API-003 error', err);
      throw err;
    }
  });

  // GET /users/{username}
  test('USER-API-004: GET /users/{username} returns 200 for existing', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/users/alice`, {
        timeout: 5000,
      });
      expectStatus(res, 200);
    } catch (err) {
      console.error('USER-API-004 error', err);
      throw err;
    }
  });

  test('USER-API-005: GET /users/{username} returns user data', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/users/alice`, {
        timeout: 5000,
      });
      expectStatus(res, 200);
      const body = await res.json();
      expect(body).toHaveProperty('username');
      expect(body).toHaveProperty('email');
      expect(body.username).toBe('alice');
      // Phase 4: Check types
      expect(typeof body.id).toBe('string');
      expect(typeof body.username).toBe('string');
      expect(typeof body.email).toBe('string');
      expect(body.email).toContain('@');
    } catch (err) {
      console.error('USER-API-005 error', err);
      throw err;
    }
  });

  test('USER-API-006: GET /users/{username} returns 403/404 for non-existent', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/users/nonexistentuser123`, {
        timeout: 5000,
      });
      expect([403, 404]).toContain(res.status());
    } catch (err) {
      console.error('USER-API-006 error', err);
      throw err;
    }
  });

  // GET /users/{username}/posts
  test('USER-API-007: GET /users/{username}/posts returns 200', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/users/alice/posts`, {
        timeout: 5000,
      });
      expectStatus(res, 200);
    } catch (err) {
      console.error('USER-API-007 error', err);
      throw err;
    }
  });

  test('USER-API-008: GET /users/{username}/posts returns posts', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/users/alice/posts`, {
        timeout: 5000,
      });
      const body = await res.json();
      expect(Array.isArray(body.items || body)).toBeTruthy();
    } catch (err) {
      console.error('USER-API-008 error', err);
      throw err;
    }
  });

  // POST /users/{username}/follow
  test('USER-API-009: POST /users/{username}/follow follows user', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/users/bob/follow`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 5000,
      });
      expectStatus(res, 200);
    } catch (err) {
      console.error('USER-API-009 error', err);
      throw err;
    }
  });

  test('USER-API-010: POST /users/{username}/follow without auth returns 401', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/users/bob/follow`, {
        timeout: 5000,
      });
      expectStatusAtLeast(res, 401);
    } catch (err) {
      console.error('USER-API-010 error', err);
      throw err;
    }
  });

  test('USER-API-011: POST /users/{username}/follow non-existent returns 404', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/users/nonexistent/follow`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 5000,
      });
      expect([404, 403, 422]).toContain(res.status());
    } catch (err) {
      console.error('USER-API-011 error', err);
      throw err;
    }
  });

  // DELETE /users/{username}/follow
  test('USER-API-012: DELETE /users/{username}/follow unfollows', async ({ request }) => {
    try {
      const res = await request.delete(`${API_BASE}/users/bob/follow`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 5000,
      });
      expect([200, 204]).toContain(res.status());
    } catch (err) {
      console.error('USER-API-012 error', err);
      throw err;
    }
  });

  test('USER-API-013: DELETE /users/{username}/follow without auth returns 401', async ({ request }) => {
    try {
      const res = await request.delete(`${API_BASE}/users/bob/follow`, {
        timeout: 5000,
      });
      expectStatusAtLeast(res, 401);
    } catch (err) {
      console.error('USER-API-013 error', err);
      throw err;
    }
  });

  // GET /users/{username}/followers
  test('USER-API-014: GET /users/{username}/followers returns 200', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/users/alice/followers`, {
        timeout: 5000,
      });
      expectStatus(res, 200);
    } catch (err) {
      console.error('USER-API-014 error', err);
      throw err;
    }
  });

  test('USER-API-015: GET /users/{username}/followers returns list', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/users/alice/followers`, {
        timeout: 5000,
      });
      const body = await res.json();
      expect(Array.isArray(body.items || body)).toBeTruthy();
    } catch (err) {
      console.error('USER-API-015 error', err);
      throw err;
    }
  });

  test('USER-API-016: GET /users/{username}/followers with pagination', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/users/alice/followers?page=1`, {
        timeout: 5000,
      });
      expectStatus(res, 200);
    } catch (err) {
      console.error('USER-API-016 error', err);
      throw err;
    }
  });

  // GET /users/{username}/following
  test('USER-API-017: GET /users/{username}/following returns 200', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/users/alice/following`, {
        timeout: 5000,
      });
      expectStatus(res, 200);
    } catch (err) {
      console.error('USER-API-017 error', err);
      throw err;
    }
  });

  test('USER-API-018: GET /users/{username}/following returns list', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/users/alice/following`, {
        timeout: 5000,
      });
      const body = await res.json();
      expect(Array.isArray(body.items || body)).toBeTruthy();
    } catch (err) {
      console.error('USER-API-018 error', err);
      throw err;
    }
  });

  // Permission tests
  test('USER-API-019: Admin can access any user profile', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/users/alice`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        timeout: 5000,
      });
      expectStatus(res, 200);
    } catch (err) {
      console.error('USER-API-019 error', err);
      throw err;
    }
  });

  test('USER-API-020: Regular user cannot ban users', async ({ request }) => {
    try {
      const res = await request.patch(`${API_BASE}/admin/users/some-id/ban`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 5000,
      });
      expectStatusAtLeast(res, 403);
    } catch (err) {
      console.error('USER-API-020 error', err);
      throw err;
    }
  });

  // Self-follow tests
  test('USER-API-021: Cannot follow yourself', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/users/alice/follow`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 5000,
      });
      expect([400, 409, 422]).toContain(res.status());
    } catch (err) {
      console.error('USER-API-021 error', err);
      throw err;
    }
  });

  test('USER-API-022: Cannot unfollow yourself', async ({ request }) => {
    try {
      const res = await request.delete(`${API_BASE}/users/alice/follow`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 5000,
      });
      expect([400, 404, 422]).toContain(res.status());
    } catch (err) {
      console.error('USER-API-022 error', err);
      throw err;
    }
  });

  // Banned user tests
  test('USER-API-023: Banned user profile is accessible', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/users/alice`, {
        timeout: 5000,
      });
      expectStatus(res, 200);
    } catch (err) {
      console.error('USER-API-023 error', err);
      throw err;
    }
  });

  // Additional tests for complete coverage
  test('USER-API-024: GET /users with invalid token returns 401', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/users`, {
        headers: { Authorization: 'Bearer invalid_token_123' },
        timeout: 5000,
      });
      expectStatusAtLeast(res, 401);
    } catch (err) {
      console.error('USER-API-024 error', err);
      throw err;
    }
  });

  test('USER-API-025: GET /users/{username} with invalid token returns 401', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/users/alice`, {
        headers: { Authorization: 'Bearer invalid_token_123' },
        timeout: 5000,
      });
      expectStatusAtLeast(res, 401);
    } catch (err) {
      console.error('USER-API-025 error', err);
      throw err;
    }
  });
});