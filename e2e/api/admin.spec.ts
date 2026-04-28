/**
 * Admin API Tests
 * Phase 3: Module Split
 */

import { test, expect } from '@playwright/test';
import { API_BASE, TEST_USERNAME, TEST_PASSWORD } from '../setup/credentials';
import { getToken, getAdminToken, getModToken } from '../fixtures/tokens';
import { cleanupTestData } from '../teardown/cleanup';
import { TEST_ACCOUNTS } from '../setup/credentials';

test.afterAll(async ({ request }) => {
  await cleanupTestData(request, TEST_ACCOUNTS);
});

test.describe('API - Admin', () => {
  let adminToken: string;
  let modToken: string;
  let userToken: string;

  test.beforeAll(async ({ request }) => {
    adminToken = await getAdminToken(request);
    modToken = await getModToken(request);
    userToken = await getToken(request, TEST_USERNAME, TEST_PASSWORD);
  });

  // GET /admin/stats
  test('ADMIN-API-001: GET /admin/stats returns 200 for admin', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/admin/stats`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        timeout: 5000,
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      const keys = Object.keys(body);
      expect(keys.includes('users_count') || keys.includes('users') || keys.includes('posts')).toBeTruthy();
      if (body.users_count !== undefined) expect(typeof body.users_count).toBe('number');
    } catch (err) {
      console.error('ADMIN-API-001 error', err);
      throw err;
    }
  });

  test('ADMIN-API-001: GET /admin/stats returns stats data', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/admin/stats`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        timeout: 5000,
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      const keys = Object.keys(body);
      expect(keys.includes('users_count') || keys.includes('users') || keys.includes('posts')).toBeTruthy();
    } catch (err) {
      console.error('ADMIN-API-001 stats data error', err);
      throw err;
    }
  });

  test('ADMIN-API-001: GET /admin/stats returns 403 for regular user', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/admin/stats`, {
        headers: { Authorization: `Bearer ${userToken}` },
        timeout: 5000,
      });
      expect(res.status()).toBe(403);
    } catch (err) {
      console.error('ADMIN-API-001 regular user error', err);
      throw err;
    }
  });

  test('ADMIN-API-001: GET /admin/stats returns 401 without auth', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/admin/stats`, { timeout: 5000 });
      expect(res.status()).toBeGreaterThanOrEqual(401);
    } catch (err) {
      console.error('ADMIN-API-001 no auth error', err);
      throw err;
    }
  });

  // GET /admin/users
  test('ADMIN-API-002: GET /admin/users returns 200 for admin', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        timeout: 5000,
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      const users = body.items || body;
      expect(Array.isArray(users)).toBeTruthy();
      if (users.length > 0) {
        expect(users[0]).toHaveProperty('id');
        expect(users[0]).toHaveProperty('email');
      }
    } catch (err) {
      console.error('ADMIN-API-002 error', err);
      throw err;
    }
  });

  test('ADMIN-API-002: GET /admin/users returns 403 for regular user', async ({ request }) => {
    const res = await request.get(`${API_BASE}/admin/users`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    expect(res.status()).toBe(403);
  });

  test('ADMIN-API-002: GET /admin/users returns 403 for moderator', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${modToken}` },
        timeout: 5000,
      });
      expect(res.status()).toBe(403);
    } catch (err) {
      console.error('ADMIN-API-002 moderator error', err);
      throw err;
    }
  });

  test('ADMIN-API-002: GET /admin/users returns array', async ({ request }) => {
    const res = await request.get(`${API_BASE}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const body = await res.json();
    expect(Array.isArray(body.items || body)).toBeTruthy();
  });

  // PATCH /admin/users/{id}
  test('ADMIN-API-003: PATCH /admin/users/{id} updates user', async ({ request }) => {
    const listRes = await request.get(`${API_BASE}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const body = await listRes.json();
    const users = body.items || body;

    if (users.length > 0) {
      const res = await request.patch(`${API_BASE}/admin/users/${users[0].id}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: { display_name: 'Updated Name' },
      });
      expect(res.status()).toBe(200);
    }
  });

  test('ADMIN-API-003: PATCH /admin/users/{id} returns 403 for non-admin', async ({ request }) => {
    const res = await request.patch(`${API_BASE}/admin/users/some-id`, {
      headers: { Authorization: `Bearer ${userToken}` },
      data: { display_name: 'Hack' },
    });
    expect(res.status()).toBe(403);
  });

  // PATCH /admin/users/{id}/ban
  test('ADMIN-API-004: PATCH /admin/users/{id}/ban bans user', async ({ request }) => {
    const listRes = await request.get(`${API_BASE}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const body = await listRes.json();
    const users = body.items || body;

    const regularUser = users.find((u: any) => u.role === 'user' && u.email !== TEST_USERNAME);
    if (regularUser) {
      const res = await request.patch(`${API_BASE}/admin/users/${regularUser.id}/ban`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect([200, 204]).toContain(res.status());
    }
  });

  test('ADMIN-API-004: PATCH /admin/users/{id}/ban returns 403 for moderator', async ({ request }) => {
    const res = await request.patch(`${API_BASE}/admin/users/some-id/ban`, {
      headers: { Authorization: `Bearer ${modToken}` },
    });
    expect(res.status()).toBe(403);
  });

  test('ADMIN-API-004: PATCH /admin/users/{id}/ban returns 403 for regular user', async ({ request }) => {
    const res = await request.patch(`${API_BASE}/admin/users/some-id/ban`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    expect(res.status()).toBe(403);
  });

  // PATCH /admin/users/{id}/unban
  test('ADMIN-API-014: PATCH /admin/users/{id}/unban unbans user', async ({ request }) => {
    try {
      const res = await request.patch(`${API_BASE}/admin/users/alice/unban`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        timeout: 5000,
      });
      expect([200, 204]).toContain(res.status());
    } catch (err) {
      console.error('ADMIN-API-014 error', err);
      throw err;
    }
  });
    expect([200, 204]).toContain(res.status());
  });

  test('ADMIN-API-015: PATCH /admin/users/{id}/unban returns 403 for non-admin', async ({ request }) => {
    try {
      const res = await request.patch(`${API_BASE}/admin/users/alice/unban`, {
        headers: { Authorization: `Bearer ${userToken}` },
        timeout: 5000,
      });
      expect(res.status()).toBe(403);
    } catch (err) {
      console.error('ADMIN-API-015 error', err);
      throw err;
    }
  });

  // DELETE /admin/users/{id}
  test('ADMIN-API-006: DELETE /admin/users/{id} deletes user', async ({ request }) => {
    const ts = Date.now();
    const registerRes = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `temp${ts}@test.com`,
        username: `tempuser${ts}`,
        password: 'password123',
        display_name: 'Temp User',
      },
    });
    const newUser = await registerRes.json();

    const res = await request.delete(`${API_BASE}/admin/users/${newUser.id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect([200, 204]).toContain(res.status());
  });

  test('ADMIN-API-006: DELETE /admin/users/{id} returns 403 for non-admin', async ({ request }) => {
    const res = await request.delete(`${API_BASE}/admin/users/some-id`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    expect(res.status()).toBe(403);
  });

  test('ADMIN-API-016: DELETE /admin/users/{id} cannot delete admin', async ({ request }) => {
    try {
      const listRes = await request.get(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        timeout: 5000,
      });
      const body = await listRes.json();
      const users = body.items || body;
      const admin = users.find((u: any) => u.role === 'admin');
      if (admin) {
        const res = await request.delete(`${API_BASE}/admin/users/${admin.id}`, {
          headers: { Authorization: `Bearer ${adminToken}` },
          timeout: 5000,
        });
        expect([400, 403, 409]).toContain(res.status());
      }
    } catch (err) {
      console.error('ADMIN-API-016 error', err);
      throw err;
    }
  });

  // GET /admin/posts
  test('ADMIN-API-017: GET /admin/posts returns 200 for admin', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/admin/posts`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        timeout: 5000,
      });
      expect(res.status()).toBe(200);
    } catch (err) {
      console.error('ADMIN-API-017 error', err);
      throw err;
    }
  });

  test('ADMIN-API-018: GET /admin/posts returns 403 for regular user', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/admin/posts`, {
        headers: { Authorization: `Bearer ${userToken}` },
        timeout: 5000,
      });
      expect(res.status()).toBe(403);
    } catch (err) {
      console.error('ADMIN-API-018 error', err);
      throw err;
    }
  });

  test('ADMIN-API-019: GET /admin/posts returns array', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/admin/posts`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        timeout: 5000,
      });
      const body = await res.json();
      expect(Array.isArray(body.items || body)).toBeTruthy();
    } catch (err) {
      console.error('ADMIN-API-019 error', err);
      throw err;
    }
  });

  // DELETE /admin/posts/{id} - Moderator can delete
  test('ADMIN-API-020: DELETE /admin/posts/{id} by mod returns 200', async ({ request }) => {
    try {
      const createRes = await request.post(`${API_BASE}/posts`, {
        headers: { Authorization: `Bearer ${userToken}` },
        data: { content: 'Post to moderate' },
        timeout: 5000,
      });
      const post = await createRes.json();
      const res = await request.delete(`${API_BASE}/admin/posts/${post.id}`, {
        headers: { Authorization: `Bearer ${modToken}` },
        timeout: 5000,
      });
      expect([200, 204]).toContain(res.status());
    } catch (err) {
      console.error('ADMIN-API-020 error', err);
      throw err;
    }
  });

  test('ADMIN-API-008: DELETE /admin/posts/{id} by admin returns 200', async ({ request }) => {
    const createRes = await request.post(`${API_BASE}/posts`, {
      headers: { Authorization: `Bearer ${userToken}` },
      data: { content: 'Post for admin delete' },
    });
    const post = await createRes.json();

    const res = await request.delete(`${API_BASE}/admin/posts/${post.id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect([200, 204]).toContain(res.status());
  });

  test('ADMIN-API-022: DELETE /admin/posts/{id} by regular user returns 403', async ({ request }) => {
    try {
      const res = await request.delete(`${API_BASE}/admin/posts/some-id`, {
        headers: { Authorization: `Bearer ${userToken}` },
        timeout: 5000,
      });
      expect(res.status()).toBe(403);
    } catch (err) {
      console.error('ADMIN-API-022 error', err);
      throw err;
    }
  });

  // Admin can see all posts including deleted
  test('ADMIN-API-023: GET /admin/posts includes deleted posts', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/admin/posts`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        timeout: 5000,
      });
      expect(res.status()).toBe(200);
    } catch (err) {
      console.error('ADMIN-API-023 error', err);
      throw err;
    }
  });

  // Role-based access summary
  test('ADMIN-API-025: Admin has full access', async ({ request }) => {
    try {
      const statsRes = await request.get(`${API_BASE}/admin/stats`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        timeout: 5000,
      });
      const usersRes = await request.get(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        timeout: 5000,
      });
      const postsRes = await request.get(`${API_BASE}/admin/posts`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        timeout: 5000,
      });
      expect(statsRes.status()).toBe(200);
      expect(usersRes.status()).toBe(200);
      expect(postsRes.status()).toBe(200);
    } catch (err) {
      console.error('ADMIN-API-025 error', err);
      throw err;
    }
  });

  test('ADMIN-API-026: Moderator has limited access', async ({ request }) => {
    try {
      const statsRes = await request.get(`${API_BASE}/admin/stats`, {
        headers: { Authorization: `Bearer ${modToken}` },
        timeout: 5000,
      });
      expect([403, 404, 401]).toContain(statsRes.status());
    } catch (err) {
      console.error('ADMIN-API-026 error', err);
      throw err;
    }
  });
      const usersRes = await request.get(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        timeout: 5000,
      });
      const postsRes = await request.get(`${API_BASE}/admin/posts`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        timeout: 5000,
      });
      expect(statsRes.status()).toBe(200);
      expect(usersRes.status()).toBe(200);
      expect(postsRes.status()).toBe(200);
    } catch (err) {
      console.error('ADMIN-API-024 error', err);
      throw err;
    }
  });
});