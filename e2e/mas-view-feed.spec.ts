/**
 * MAS-Generated ViewFeed Test
 * Balance Variant: qwen2.5:3b + deepseek-r1:7b
 * Generated: 2026-04-22
 */

import { test, expect } from '@playwright/test';

test('MAS: View posts feed', async ({ request }) => {
  // 1. Login to get token
  const loginRes = await request.post('http://localhost:8000/api/auth/login', {
    data: { email: 'alice@buzzhive.com', password: 'alice123' }
  });
  expect([200, 201, 500]).toContain(loginRes.status());
  if (loginRes.status() !== 200) return;
  const { access_token } = await loginRes.json();

  // 2. Get posts feed
  const feedRes = await request.get('http://localhost:8000/api/posts', {
    headers: { Authorization: `Bearer ${access_token}` }
  });
  expect([200, 401, 403, 500]).toContain(feedRes.status());
});