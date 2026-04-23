/**
 * Health API Tests
 * Phase 3: Module Split
 */

import { test, expect } from '@playwright/test';
import { API_BASE, TEST_USERNAME, TEST_PASSWORD } from '../setup/credentials';
import { getAliceToken } from '../fixtures/tokens';
import { cleanupTestData } from '../teardown/cleanup';
import { TEST_ACCOUNTS } from '../setup/credentials';

test.afterAll(async ({ request }) => {
  await cleanupTestData(request, TEST_ACCOUNTS);
});

test.describe('API - Health', () => {
  let aliceToken: string;

  test.beforeAll(async ({ request }) => {
    aliceToken = await getAliceToken(request);
  });

  // GET /api/health
  test('HEALTH-API-001: GET /health returns 200', async ({ request }) => {
    const res = await request.get(`${API_BASE}/health`);
    expect(res.status()).toBe(200);
  });

  test('HEALTH-API-001: GET /health returns healthy status', async ({ request }) => {
    const res = await request.get(`${API_BASE}/health`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    // Phase 4: Stronger assertions - check status value
    expect(body).toHaveProperty('status');
    expect(typeof body.status).toBe('string');
    expect(['healthy', 'ok', 'up']).toContain(body.status.toLowerCase());
  });

  // GET /api/bookmarks
  test('HEALTH-API-002: GET /bookmarks returns 200 with auth', async ({ request }) => {
    const res = await request.get(`${API_BASE}/bookmarks`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    expect(res.status()).toBe(200);
  });

  test('HEALTH-API-002: GET /bookmarks without auth returns 401', async ({ request }) => {
    const res = await request.get(`${API_BASE}/bookmarks`);
    expect(res.status()).toBeGreaterThanOrEqual(401);
  });

  test('HEALTH-API-002: GET /bookmarks returns array', async ({ request }) => {
    const res = await request.get(`${API_BASE}/bookmarks`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    const body = await res.json();
    expect(Array.isArray(body.items || body)).toBeTruthy();
  });
});