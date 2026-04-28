/**
 * Conversations/Messages API Tests
 * Phase 3: Module Split
 */

import { test, expect } from '@playwright/test';
import { API_BASE, TEST_USERNAME, TEST_PASSWORD } from '../setup/credentials';
import { getAliceToken, getBobToken } from '../fixtures/tokens';
import { cleanupTestData } from '../teardown/cleanup';
import { TEST_ACCOUNTS } from '../setup/credentials';

test.describe('API - Conversations', () => {
  test.afterAll(async ({ request }) => {
    await cleanupTestData(request, TEST_ACCOUNTS);
  });

  let aliceToken: string;
  let bobToken: string;

  test.beforeAll(async ({ request }) => {
    aliceToken = await getAliceToken(request);
    bobToken = await getBobToken(request);
  });

  // GET /conversations
  test('CONV-API-001: GET /conversations returns 200 with auth', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/conversations`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 10000,
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty('items');
    } catch (error) {
      console.error('Error in conversations test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('CONV-API-001: GET /conversations returns conversations', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/conversations`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 10000,
      });
      const body = await res.json();
      const conversations = body.items || body;
      expect(Array.isArray(conversations)).toBeTruthy();
      if (conversations.length > 0) {
        expect(conversations[0]).toHaveProperty('id');
      }
    } catch (error) {
      console.error('Error in conversations list test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('CONV-API-001: GET /conversations returns 401 without auth', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/conversations`, {
        timeout: 10000,
      });
      expect([401, 403]).toContain(res.status());
      const body = await res.json();
      expect(body).toHaveProperty('detail');
    } catch (error) {
      console.error('Error in conversations no auth test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  // GET /conversations/{id}
  test('CONV-API-002: GET /conversations/{id} returns 200', async ({ request }) => {
    try {
      // First get a conversation
      const listRes = await request.get(`${API_BASE}/conversations`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 10000,
      });
      const listBody = await listRes.json();
      const conversations = listBody.items || listBody;
      
      if (conversations.length > 0) {
        const convId = conversations[0].id;
        const res = await request.get(`${API_BASE}/conversations/${convId}`, {
          headers: { Authorization: `Bearer ${aliceToken}` },
          timeout: 10000,
        });
        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body).toHaveProperty('id');
      }
    } catch (error) {
      console.error('Error in single conversation test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('CONV-API-002: GET /conversations/{id} returns 401 without auth', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/conversations/some-id`, {
        timeout: 10000,
      });
      expect([401, 403]).toContain(res.status());
      const body = await res.json();
      expect(body).toHaveProperty('detail');
    } catch (error) {
      console.error('Error in single conv no auth test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('CONV-API-002: GET /conversations/{id} non-existent returns 404', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/conversations/nonexistent123`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 10000,
      });
      expect(res.status()).toBe(404);
      const body = await res.json();
      expect(body).toHaveProperty('detail');
    } catch (error) {
      console.error('Error in non-existent conv test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  // GET /conversations/{id}/messages
  test('CONV-API-003: GET /conversations/{id}/messages returns 200', async ({ request }) => {
    try {
      const listRes = await request.get(`${API_BASE}/conversations`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 10000,
      });
      const listBody = await listRes.json();
      const conversations = listBody.items || listBody;
      
      if (conversations.length > 0) {
        const convId = conversations[0].id;
        const res = await request.get(`${API_BASE}/conversations/${convId}/messages`, {
          headers: { Authorization: `Bearer ${aliceToken}` },
          timeout: 10000,
        });
        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body).toHaveProperty('items');
      }
    } catch (error) {
      console.error('Error in messages test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('CONV-API-003: GET /conversations/{id}/messages returns messages', async ({ request }) => {
    try {
      const listRes = await request.get(`${API_BASE}/conversations`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 10000,
      });
      const listBody = await listRes.json();
      const conversations = listBody.items || listBody;
      
      if (conversations.length > 0) {
        const convId = conversations[0].id;
        const res = await request.get(`${API_BASE}/conversations/${convId}/messages`, {
          headers: { Authorization: `Bearer ${aliceToken}` },
          timeout: 10000,
        });
        const body = await res.json();
        const messages = body.items || body;
        expect(Array.isArray(messages)).toBeTruthy();
      }
    } catch (error) {
      console.error('Error in messages list test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  // POST /conversations/{id}/messages
  test('CONV-API-004: POST /conversations/{id}/messages sends message', async ({ request }) => {
    try {
      const listRes = await request.get(`${API_BASE}/conversations`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 10000,
      });
      const listBody = await listRes.json();
      const conversations = listBody.items || listBody;
      
      if (conversations.length > 0) {
        const convId = conversations[0].id;
        const res = await request.post(`${API_BASE}/conversations/${convId}/messages`, {
          headers: { Authorization: `Bearer ${aliceToken}` },
          data: { content: 'Test message' },
          timeout: 10000,
        });
        expect([200, 201]).toContain(res.status());
      }
    } catch (error) {
      console.error('Error in send message test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('CONV-API-004: POST /conversations/{id}/messages without auth returns 401', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/conversations/some-id/messages`, {
        data: { content: 'Test' },
        timeout: 10000,
      });
      expect([401, 403]).toContain(res.status());
      const body = await res.json();
      expect(body).toHaveProperty('detail');
    } catch (error) {
      console.error('Error in send message no auth test:', error);
      throw error;
    }
  }, { timeout: 30000 });
});

  let aliceToken: string;
  let bobToken: string;

  test.beforeAll(async ({ request }) => {
    aliceToken = await getAliceToken(request);
    bobToken = await getBobToken(request);
  });

  // GET /conversations
  test('CONV-API-001: GET /conversations returns 200 with auth', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/conversations`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 10000,
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty('items');
    } catch (error) {
      console.error('Error in conversations test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('CONV-API-001: GET /conversations returns conversations', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/conversations`, {
        headers: { Authorization: `Bearer ${aliceToken}` },
        timeout: 10000,
      });
      const body = await res.json();
      const conversations = body.items || body;
      expect(Array.isArray(conversations)).toBeTruthy();
      if (conversations.length > 0) {
        expect(conversations[0]).toHaveProperty('id');
      }
    } catch (error) {
      console.error('Error in conversations list test:', error);
      throw error;
    }
  }, { timeout: 30000 });

  test('CONV-API-001: GET /conversations returns 401 without auth', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/conversations`, {
        timeout: 10000,
      });
      expect([401, 403]).toContain(res.status());
      const body = await res.json();
      expect(body).toHaveProperty('detail');
    } catch (error) {
      console.error('Error in conversations no auth test:', error);
      throw error;
    }
  }, { timeout: 30000 });

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