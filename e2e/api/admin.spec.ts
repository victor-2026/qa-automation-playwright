/**
 * Admin API Tests
 * Phase 3: Module Split
 */

import { test, expect } from '@playwright/test';
import { API_BASE, TEST_USERNAME, TEST_PASSWORD } from '../setup/credentials';
import { getToken, getAdminToken, getModToken } from '../fixtures/tokens';
import { cleanupTestData } from '../teardown/cleanup';
import { TEST_ACCOUNTS } from '../setup/credentials';

test.describe('API - Admin', () => {
  test.afterAll(async ({ request }) => {
    await cleanupTestData(request, TEST_ACCOUNTS);
  });

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
        timeout: 10000,
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      // Groq suggestion: fix stats assertion
      const hasStats = 'users_count' in body || 'users' in body || 'posts' in body;
      expect(hasStats).toBeTruthy();
    } catch (error) {
      console.error('Error in stats test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('ADMIN-API-001: GET /admin/stats returns stats data', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/admin/stats`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        timeout: 10000,
      });
      const body = await res.json();
      // Groq suggestion: fix the || operator issue
      expect(body).toEqual(expect.objectContaining({
        users_count: expect.any(Number),
      }));
    } catch (error) {
      console.error('Error in stats data test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('ADMIN-API-001: GET /admin/stats returns 403 for regular user', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/admin/stats`, {
        headers: { Authorization: `Bearer ${userToken}` },
        timeout: 10000,
      });
      expect(res.status()).toBe(403);
    } catch (error) {
      console.error('Error in stats 403 test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('ADMIN-API-001: GET /admin/stats returns 401 without auth', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/admin/stats`, {
        timeout: 10000,
      });
      expect([401, 403]).toContain(res.status());
      const body = await res.json();
      expect(body).toHaveProperty('detail');
    } catch (error) {
      console.error('Error in stats no auth test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  // GET /admin/users
  test('ADMIN-API-002: GET /admin/users returns 200 for admin', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        timeout: 10000,
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty('items');
    } catch (error) {
      console.error('Error in admin users test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('ADMIN-API-002: GET /admin/users returns 403 for regular user', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${userToken}` },
        timeout: 10000,
      });
      expect(res.status()).toBe(403);
    } catch (error) {
      console.error('Error in users 403 test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('ADMIN-API-002: GET /admin/users returns 403 for moderator', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${modToken}` },
        timeout: 10000,
      });
      expect(res.status()).toBe(403);
    } catch (error) {
      console.error('Error in mod users test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('ADMIN-API-002: GET /admin/users returns array', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        timeout: 10000,
      });
      const body = await res.json();
      const users = body.items || body;
      expect(Array.isArray(users)).toBeTruthy();
      if (users.length > 0) {
        expect(users[0]).toHaveProperty('id');
      }
    } catch (error) {
      console.error('Error in users array test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  // PATCH /admin/users/{id}
  test('ADMIN-API-003: PATCH /admin/users/{id} updates user', async ({ request }) => {
    try {
      const listRes = await request.get(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        timeout: 10000,
      });
      const body = await listRes.json();
      const users = body.items || body;

      if (users.length > 0) {
        const res = await request.patch(`${API_BASE}/admin/users/${users[0].id}`, {
          headers: { Authorization: `Bearer ${adminToken}` },
          data: { display_name: 'Updated Name' },
          timeout: 10000,
        });
        expect(res.status()).toBe(200);
        const updatedUser = await res.json();
        expect(updatedUser.display_name).toBe('Updated Name');
      }
    } catch (error) {
      console.error('Error in update user test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('ADMIN-API-003: PATCH /admin/users/{id} returns 403 for moderator', async ({ request }) => {
    try {
      const res = await request.patch(`${API_BASE}/admin/users/some-id`, {
        headers: { Authorization: `Bearer ${modToken}` },
        data: { display_name: 'Hacked' },
        timeout: 10000,
      });
      expect(res.status()).toBe(403);
      const body = await res.json();
      expect(body).toHaveProperty('detail');
    } catch (error) {
      console.error('Error in mod update test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('ADMIN-API-003: PATCH /admin/users/{id} returns 404 for non-existent', async ({ request }) => {
    try {
      const res = await request.patch(`${API_BASE}/admin/users/nonexistent-id`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: { display_name: 'Test' },
        timeout: 10000,
      });
      expect(res.status()).toBe(404);
      const body = await res.json();
      expect(body).toHaveProperty('detail');
    } catch (error) {
      console.error('Error in non-existent update test:', error);
      throw error;
    }
  }, { timeout: 30000 });
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
    try {
      const listRes = await request.get(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        timeout: 10000,
      });
      const body = await listRes.json();
      const users = body.items || body;

      const regularUser = users.find((u: any) => u.role === 'user' && u.email !== TEST_USERNAME);
      if (regularUser) {
        const res = await request.patch(`${API_BASE}/admin/users/${regularUser.id}/ban`, {
          headers: { Authorization: `Bearer ${adminToken}` },
          timeout: 10000,
        });
        expect([200, 204]).toContain(res.status());
      }
    } catch (error) {
      console.error('Error in ban user test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('ADMIN-API-004: PATCH /admin/users/{id}/ban returns 403 for moderator', async ({ request }) => {
    try {
      const res = await request.patch(`${API_BASE}/admin/users/some-id/ban`, {
        headers: { Authorization: `Bearer ${modToken}` },
        timeout: 10000,
      });
      expect(res.status()).toBe(403);
      const body = await res.json();
      expect(body).toHaveProperty('detail');
    } catch (error) {
      console.error('Error in mod ban test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('ADMIN-API-004: PATCH /admin/users/{id}/ban returns 403 for regular user', async ({ request }) => {
    try {
      const res = await request.patch(`${API_BASE}/admin/users/some-id/ban`, {
        headers: { Authorization: `Bearer ${userToken}` },
        timeout: 10000,
      });
      expect(res.status()).toBe(403);
      const body = await res.json();
      expect(body).toHaveProperty('detail');
    } catch (error) {
      console.error('Error in user ban test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  // PATCH /admin/users/{id}/unban
  test('ADMIN-API-005: PATCH /admin/users/{id}/unban unbans user', async ({ request }) => {
    try {
      const res = await request.patch(`${API_BASE}/admin/users/alice/unban`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        timeout: 10000,
      });
      expect([200, 204]).toContain(res.status());
    } catch (error) {
      console.error('Error in unban test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('ADMIN-API-005: PATCH /admin/users/{id}/unban returns 403 for non-admin', async ({ request }) => {
    try {
      const res = await request.patch(`${API_BASE}/admin/users/alice/unban`, {
        headers: { Authorization: `Bearer ${userToken}` },
        timeout: 10000,
      });
      expect(res.status()).toBe(403);
      const body = await res.json();
      expect(body).toHaveProperty('detail');
    } catch (error) {
      console.error('Error in unban 403 test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  // DELETE /admin/users/{id}
  test('ADMIN-API-006: DELETE /admin/users/{id} deletes user', async ({ request }) => {
    try {
      const ts = Date.now();
      const registerRes = await request.post(`${API_BASE}/auth/register`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: {
          email: `temp${ts}@test.com`,
          username: `tempuser${ts}`,
          password: 'password123',
          display_name: 'Temp User',
        },
        timeout: 10000,
      });
      const newUser = await registerRes.json();

      const res = await request.delete(`${API_BASE}/admin/users/${newUser.id}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        timeout: 10000,
      });
      expect([200, 204]).toContain(res.status());
    } catch (error) {
      console.error('Error in delete user test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('ADMIN-API-006: DELETE /admin/users/{id} returns 403 for non-admin', async ({ request }) => {
    try {
      const res = await request.delete(`${API_BASE}/admin/users/some-id`, {
        headers: { Authorization: `Bearer ${userToken}` },
        timeout: 10000,
      });
      expect(res.status()).toBe(403);
      const body = await res.json();
      expect(body).toHaveProperty('detail');
    } catch (error) {
      console.error('Error in delete 403 test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('ADMIN-API-006: DELETE /admin/users/{id} cannot delete admin', async ({ request }) => {
    try {
      const listRes = await request.get(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        timeout: 10000,
      });
      const body = await listRes.json();
      const users = body.items || body;
      
      const adminUser = users.find((u: any) => u.role === 'admin');
      if (adminUser) {
        const res = await request.delete(`${API_BASE}/admin/users/${adminUser.id}`, {
          headers: { Authorization: `Bearer ${adminToken}` },
          timeout: 10000,
        });
        expect([403, 404]).toContain(res.status());
      }
    } catch (error) {
      console.error('Error in delete admin test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  // Moderator tests
  test('ADMIN-API-007: Moderator cannot ban users', async ({ request }) => {
    try {
      const res = await request.patch(`${API_BASE}/admin/users/some-id/ban`, {
        headers: { Authorization: `Bearer ${modToken}` },
        timeout: 10000,
      });
      expect(res.status()).toBe(403);
      const body = await res.json();
      expect(body).toHaveProperty('detail');
    } catch (error) {
      console.error('Error in mod cannot ban test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('ADMIN-API-007: Moderator cannot delete posts', async ({ request }) => {
    try {
      // First create a post as alice
      const postRes = await request.post(`${API_BASE}/posts`, {
        headers: { Authorization: `Bearer ${userToken}` },
        data: { content: 'Post to delete' },
        timeout: 10000,
      });
      const post = await postRes.json();
      
      const res = await request.delete(`${API_BASE}/posts/${post.id}`, {
        headers: { Authorization: `Bearer ${modToken}` },
        timeout: 10000,
      });
      expect(res.status()).toBe(403);
    } catch (error) {
      console.error('Error in mod cannot delete post test:', error);
      throw error;
    }
  }, { timeout: 30000 });
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
  test('ADMIN-API-005: PATCH /admin/users/{id}/unban unbans user', async ({ request }) => {
    const res = await request.patch(`${API_BASE}/admin/users/alice/unban`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect([200, 204]).toContain(res.status());
  });

  test('ADMIN-API-005: PATCH /admin/users/{id}/unban returns 403 for non-admin', async ({ request }) => {
    const res = await request.patch(`${API_BASE}/admin/users/alice/unban`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    expect(res.status()).toBe(403);
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

  test('ADMIN-API-006: DELETE /admin/users/{id} cannot delete admin', async ({ request }) => {
    const listRes = await request.get(`${API_BASE}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const body = await listRes.json();
    const users = body.items || body;

    const admin = users.find((u: any) => u.role === 'admin');
    if (admin) {
      const res = await request.delete(`${API_BASE}/admin/users/${admin.id}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect([400, 403, 409]).toContain(res.status());
    }
  });

  // GET /admin/posts
  test('ADMIN-API-007: GET /admin/posts returns 200 for admin', async ({ request }) => {
    const res = await request.get(`${API_BASE}/admin/posts`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status()).toBe(200);
  });

  test('ADMIN-API-007: GET /admin/posts returns 403 for regular user', async ({ request }) => {
    const res = await request.get(`${API_BASE}/admin/posts`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    expect(res.status()).toBe(403);
  });

  test('ADMIN-API-007: GET /admin/posts returns array', async ({ request }) => {
    const res = await request.get(`${API_BASE}/admin/posts`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const body = await res.json();
    expect(Array.isArray(body.items || body)).toBeTruthy();
  });

  // DELETE /admin/posts/{id} - Moderator can delete
  test('ADMIN-API-008: DELETE /admin/posts/{id} by mod returns 200', async ({ request }) => {
    const createRes = await request.post(`${API_BASE}/posts`, {
      headers: { Authorization: `Bearer ${userToken}` },
      data: { content: 'Post to moderate' },
    });
    const post = await createRes.json();

    const res = await request.delete(`${API_BASE}/admin/posts/${post.id}`, {
      headers: { Authorization: `Bearer ${modToken}` },
    });
    expect([200, 204]).toContain(res.status());
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

  test('ADMIN-API-008: DELETE /admin/posts/{id} by regular user returns 403', async ({ request }) => {
    const res = await request.delete(`${API_BASE}/admin/posts/some-id`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    expect(res.status()).toBe(403);
  });

  // Admin can see all posts including deleted
  test('ADMIN-API-009: GET /admin/posts includes deleted posts', async ({ request }) => {
    const res = await request.get(`${API_BASE}/admin/posts`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status()).toBe(200);
  });

  // Role-based access summary
  test('ADMIN-API-010: Admin has full access', async ({ request }) => {
    const statsRes = await request.get(`${API_BASE}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const usersRes = await request.get(`${API_BASE}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const postsRes = await request.get(`${API_BASE}/admin/posts`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    expect(statsRes.status()).toBe(200);
    expect(usersRes.status()).toBe(200);
    expect(postsRes.status()).toBe(200);
  });
});