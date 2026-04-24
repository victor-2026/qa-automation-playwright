/**
 * Teardown utilities for cleaning up test data
 * Phase 2: Cleanup & Teardown
 */

import type { APIRequestContext } from '@playwright/test';

export type Accounts = {
  user?: { email: string; password: string };
  admin?: { email: string; password: string };
  mod?: { email: string; password: string };
  bob?: { email: string; password: string };
};

const API_BASE = process.env.API_BASE_URL || process.env.API_BASE || 'http://localhost:8000/api';

async function loginAndGetToken(request: APIRequestContext, email: string, password: string): Promise<string | null> {
  try {
    const res = await request.post(`${API_BASE}/auth/login`, {
      data: { email, password },
    });
    if (res.status() === 200) {
      const body = await res.json();
      if (body?.access_token) return body.access_token;
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Cleanup test data created during tests
 * - Test posts (SmokeTest, Test post)
 * - Test users (smoke, temp, test users)
 * - Test conversations
 * - Likes on test posts
 */
export async function cleanupTestData(request: APIRequestContext, accounts?: Accounts): Promise<void> {
  const adminToken = accounts?.admin
    ? await loginAndGetToken(request, accounts.admin.email, accounts.admin.password)
    : null;

  if (!adminToken) {
    console.log('[teardown] No admin token, skipping cleanup');
    return;
  }

  // Cleanup test posts
  try {
    const res = await request.get(`${API_BASE}/posts`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    const items = (data?.items ?? data) as any[];
    for (const p of items) {
      if (p?.content && typeof p.content === 'string' && /Smoke test|SmokeTest|Test post/i.test(p.content)) {
        await request.delete(`${API_BASE}/posts/${p.id}`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        }).catch(() => {});
        console.log(`[teardown] Deleted post: ${p.id}`);
      }
    }
  } catch {
    // ignore
  }

  // Cleanup test users
  try {
    const res = await request.get(`${API_BASE}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const users = await res.json();
    const list = users?.items ?? users ?? [];
    const pattern = /(smoke|temp|test|alice)@/i;
    for (const u of list) {
      if (u.email && pattern.test(u.email) && u.email !== accounts?.user?.email) {
        await request.delete(`${API_BASE}/admin/users/${u.id}`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        }).catch(() => {});
        console.log(`[teardown] Deleted user: ${u.email}`);
      }
    }
  } catch {
    // ignore
  }

  // Cleanup test conversations
  try {
    const res = await request.get(`${API_BASE}/conversations`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const convs = await res.json();
    const list = (convs?.items ?? convs) as any[];
    for (const c of list) {
      if (c?.title && typeof c.title === 'string' && /Smoke|Test/i.test(c.title)) {
        await request.delete(`${API_BASE}/conversations/${c.id}`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        }).catch(() => {});
        console.log(`[teardown] Deleted conversation: ${c.id}`);
      }
    }
  } catch {
    // ignore
  }

  // Cleanup likes on test posts
  try {
    const res = await request.get(`${API_BASE}/posts`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    const items = (data?.items ?? data) as any[];
    for (const p of items) {
      if (p?.id) {
        await request.delete(`${API_BASE}/posts/${p.id}/like`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        }).catch(() => {});
      }
    }
  } catch {
    // ignore
  }

  console.log('[teardown] Cleanup complete');
}