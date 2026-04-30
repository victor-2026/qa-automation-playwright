/**
 * Metamorphic Tests for Buzzhive API
 * Tests relationships between inputs/outputs
 */

import { test, expect } from '@playwright/test';
import { API_BASE, TEST_ACCOUNTS } from '../setup/credentials';
import { getAliceToken, getBobToken } from '../fixtures/tokens';

test.describe('Metamorphic API Tests', () => {
  let aliceToken: string;
  let bobToken: string;

  test.beforeAll(async ({ request }) => {
    aliceToken = await getAliceToken(request);
    bobToken = await getBobToken(request);
  });

  // Relation 1: Synonym Substitution (case insensitivity)
  test('MET-001: Login case insensitivity', async ({ request }) => {
    const variants = [
      'alice@buzzhive.com',
      'Alice@buzzhive.com',
      'ALICE@BUZZHIVE.COM'
    ];
    
    const results = [];
    for (const email of variants) {
      const res = await request.post(`${API_BASE}/auth/login`, {
        data: { email, password: TEST_ACCOUNTS.user.password },
        timeout: 5000,
      });
      results.push(res.status());
    }
    
    // All should return same status (200 if case-insensitive, 401 if case-sensitive)
    const firstStatus = results[0];
    for (const status of results) {
      expect(status).toBe(firstStatus);
    }
  });

  // Relation 2: Parameter Permutation
  test('MET-002: Query param order independence', async ({ request }) => {
    const res1 = await request.get(`${API_BASE}/posts?page=1&per_page=10`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
      timeout: 5000,
    });
    const res2 = await request.get(`${API_BASE}/posts?per_page=10&page=1`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
      timeout: 5000,
    });
    
    expect(res1.status()).toBe(res2.status());
    
    const body1 = await res1.json();
    const body2 = await res2.json();
    const len1 = (body1.items || body1).length;
    const len2 = (body2.items || body2).length;
    expect(len1).toBe(len2);
  });

  // Relation 3: Follow/Unfollow Symmetry
  test('MET-003: Follow-unfollow symmetry', async ({ request }) => {
    // Check initial following count
    const initialRes = await request.get(`${API_BASE}/users/bob/following`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
      timeout: 5000,
    });
    const initialData = await initialRes.json();
    const initialCount = Array.isArray(initialData) ? initialData.length : (initialData.items?.length || 0);
    
    // Follow bob
    await request.post(`${API_BASE}/users/bob/follow`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
      timeout: 5000,
    });
    
    // Unfollow bob
    await request.delete(`${API_BASE}/users/bob/follow`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
      timeout: 5000,
    });
    
    // Check final count = initial count
    const finalRes = await request.get(`${API_BASE}/users/bob/following`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
      timeout: 5000,
    });
    const finalData = await finalRes.json();
    const finalCount = Array.isArray(finalData) ? finalData.length : (finalData.items?.length || 0);
    
    expect(finalCount).toBe(initialCount);
  });

  // Relation 4: Negation
  test('MET-004: Existence negation', async ({ request }) => {
    const res1 = await request.get(`${API_BASE}/users/alice`, {
      timeout: 5000,
    });
    const res2 = await request.get(`${API_BASE}/users/nonexistent_user_12345`, {
      timeout: 5000,
    });
    
    // Different results expected
    expect(res1.status()).not.toBe(res2.status());
  });

  // Relation 5: Pagination Disjoint Sets
  test('MET-005: Pagination disjoint sets', async ({ request }) => {
    const res1 = await request.get(`${API_BASE}/posts?page=1&per_page=5`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
      timeout: 5000,
    });
    const res2 = await request.get(`${API_BASE}/posts?page=2&per_page=5`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
      timeout: 5000,
    });
    
    const body1 = await res1.json();
    const body2 = await res2.json();
    
    const items1 = body1.items || body1;
    const items2 = body2.items || body2;
    
    const ids1 = items1.map((p: any) => p.id);
    const ids2 = items2.map((p: any) => p.id);
    
    // No overlap
    const overlap = ids1.filter((id: string) => ids2.includes(id));
    expect(overlap.length).toBe(0);
  });

  // Relation 6: Self-follow should always fail
  test('MET-006: Self-follow consistency', async ({ request }) => {
    for (const user of ['alice', 'bob']) {
      const token = user === 'alice' ? aliceToken : bobToken;
      const res = await request.post(`${API_BASE}/users/${user}/follow`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000,
      });
      // Should always fail (400, 409, or 422)
      expect([400, 409, 422]).toContain(res.status());
    }
  });

  // Relation 7: Auth consistency
  test('MET-007: Auth token consistency', async ({ request }) => {
    // Same credentials should always return same token structure
    const results = [];
    for (let i = 0; i < 3; i++) {
      const res = await request.post(`${API_BASE}/auth/login`, {
        data: { 
          email: TEST_ACCOUNTS.user.email, 
          password: TEST_ACCOUNTS.user.password 
        },
        timeout: 5000,
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      results.push(body);
    }
    
    // All should have access_token and token_type
    for (const body of results) {
      expect(body).toHaveProperty('access_token');
      expect(body).toHaveProperty('token_type');
      expect(body.token_type.toLowerCase()).toBe('bearer');
    }
  });
});
