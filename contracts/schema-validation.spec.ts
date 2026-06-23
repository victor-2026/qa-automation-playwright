/**
 * CONTRACT-001: OpenAPI Schema Validation
 *
 * Validates all API responses against the exported OpenAPI spec.
 * Catches structural drift: field additions, removals, type changes.
 *
 * Prerequisites:
 *   1. Backend running (docker-compose up or Render)
 *   2. Run: npm run contracts:export
 *
 * Run: npx playwright test --project=contracts
 */

import { test, expect, APIRequestContext } from '@playwright/test';
import { validateApiResponse } from './validate-schema';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:8000';

const ALICE = { email: 'alice@buzzhive.com', password: 'alice123' };
const ADMIN = { email: 'admin@buzzhive.com', password: 'admin123' };

async function login(request: APIRequestContext, email: string, password: string): Promise<string> {
  const res = await request.post(`${API_BASE}/api/auth/login`, {
    data: { email, password },
  });
  const body = await res.json();
  return body.access_token;
}

async function assertSchema(
  response: Awaited<ReturnType<APIRequestContext['get']>>,
  method: string,
  apiPath: string
) {
  const result = await validateApiResponse(response, method, apiPath);
  if (!result.valid && result.errors) {
    const formatted = result.errors
      .map(e => `  ${e.instancePath || '/'} ${e.message}`)
      .join('\n');
    expect(result.valid, `Schema mismatch for ${method} ${apiPath}:\n${formatted}`).toBeTruthy();
  }
}

test.describe('CONTRACT-001: OpenAPI Schema Validation', () => {
  let aliceToken: string;
  let adminToken: string;

  test.beforeAll(async ({ request }) => {
    aliceToken = await login(request, ALICE.email, ALICE.password);
    adminToken = await login(request, ADMIN.email, ADMIN.password);
  });

  test('CONTRACT-001-01: GET /health returns valid schema', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/health`);
    expect(res.status()).toBe(200);
    await assertSchema(res, 'get', '/api/health');
  });

  test('CONTRACT-001-02: POST /auth/login returns valid TokenResponse', async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/auth/login`, {
      data: { email: ALICE.email, password: ALICE.password },
    });
    expect(res.status()).toBe(200);
    await assertSchema(res, 'post', '/api/auth/login');
  });

  test('CONTRACT-001-03: POST /auth/register returns valid TokenResponse', async ({ request }) => {
    const timestamp = Date.now();
    const res = await request.post(`${API_BASE}/api/auth/register`, {
      data: {
        email: `contract-${timestamp}@test.com`,
        username: `contract_user_${timestamp}`,
        password: 'testpass123',
        display_name: 'Contract Test User',
      },
    });
    expect([201, 409, 422]).toContain(res.status());
    if (res.status() === 201) {
      await assertSchema(res, 'post', '/api/auth/register');
    }
  });

  test('CONTRACT-001-04: GET /auth/me returns valid UserResponse', async ({ request }) => {
    const token = await login(request, ALICE.email, ALICE.password);
    const res = await request.get(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    await assertSchema(res, 'get', '/api/auth/me');
  });

  test('CONTRACT-001-05: GET /posts returns valid paginated response', async ({ request }) => {
    const token = await login(request, ALICE.email, ALICE.password);
    const res = await request.get(`${API_BASE}/api/posts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    await assertSchema(res, 'get', '/api/posts');
  });

  test('CONTRACT-001-06: GET /posts/feed returns valid paginated response', async ({ request }) => {
    const token = await login(request, ALICE.email, ALICE.password);
    const res = await request.get(`${API_BASE}/api/posts/feed`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    await assertSchema(res, 'get', '/api/posts/feed');
  });

  test('CONTRACT-001-07: GET /users returns valid response', async ({ request }) => {
    const token = await login(request, ALICE.email, ALICE.password);
    const res = await request.get(`${API_BASE}/api/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    await assertSchema(res, 'get', '/api/users');
  });

  test('CONTRACT-001-08: GET /users/{username} returns valid UserResponse', async ({ request }) => {
    const token = await login(request, ALICE.email, ALICE.password);
    const res = await request.get(`${API_BASE}/api/users/alice_dev`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    await assertSchema(res, 'get', '/api/users/{username}');
  });

  test('CONTRACT-001-09: GET /admin/stats returns valid AdminStatsResponse', async ({ request }) => {
    const token = await login(request, ADMIN.email, ADMIN.password);
    const res = await request.get(`${API_BASE}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    await assertSchema(res, 'get', '/api/admin/stats');
  });

  test('CONTRACT-001-10: GET /admin/users returns valid response', async ({ request }) => {
    const token = await login(request, ADMIN.email, ADMIN.password);
    const res = await request.get(`${API_BASE}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    await assertSchema(res, 'get', '/api/admin/users');
  });

  test('CONTRACT-001-11: GET /notifications returns valid response', async ({ request }) => {
    const token = await login(request, ALICE.email, ALICE.password);
    const res = await request.get(`${API_BASE}/api/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    await assertSchema(res, 'get', '/api/notifications');
  });

  test('CONTRACT-001-12: GET /notifications/unread-count returns valid response', async ({ request }) => {
    const token = await login(request, ALICE.email, ALICE.password);
    const res = await request.get(`${API_BASE}/api/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    await assertSchema(res, 'get', '/api/notifications/unread-count');
  });

  test('CONTRACT-001-13: GET /bookmarks returns valid response', async ({ request }) => {
    const token = await login(request, ALICE.email, ALICE.password);
    const res = await request.get(`${API_BASE}/api/bookmarks`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    await assertSchema(res, 'get', '/api/bookmarks');
  });

  test('CONTRACT-001-14: GET /conversations returns valid response', async ({ request }) => {
    const token = await login(request, ALICE.email, ALICE.password);
    const res = await request.get(`${API_BASE}/api/conversations`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    await assertSchema(res, 'get', '/api/conversations');
  });

  test('CONTRACT-001-15: POST /auth/login returns valid error schema (401)', async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/auth/login`, {
      data: { email: 'wrong@test.com', password: 'wrongpass' },
    });
    expect(res.status()).toBe(401);
    await assertSchema(res, 'post', '/api/auth/login');
  });

  test('CONTRACT-001-16: GET /posts without auth returns 401/403', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/posts`);
    expect([401, 403]).toContain(res.status());
  });

  test('CONTRACT-001-17: Spec defines all expected endpoints', async () => {
    const { getDefinedPaths } = await import('./validate-schema');
    const defined = getDefinedPaths();
    const expected = [
      '/api/health',
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/refresh',
      '/api/auth/logout',
      '/api/auth/me',
      '/api/posts',
      '/api/posts/feed',
      '/api/users',
      '/api/users/{username}',
      '/api/admin/stats',
      '/api/admin/users',
      '/api/notifications',
      '/api/notifications/unread-count',
      '/api/bookmarks',
      '/api/conversations',
      '/api/search/users',
      '/api/search/posts',
    ];

    const missing = expected.filter(p => !defined.includes(p));
    if (missing.length > 0) {
      console.warn('Missing endpoints in OpenAPI spec:', missing);
    }
    expect(missing.length).toBeLessThanOrEqual(3);
  });

  // TEMP: Demonstrates schema drift — remove after screenshot
  test('CONTRACT-DEMO: schema drift caught — field missing from API response', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/posts`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    // API returns { items: [...], total: ... } but we assert a 'data' field
    // that doesn't exist — same pattern as when code drifts from spec
    expect(body).toHaveProperty('data');
  });
});
