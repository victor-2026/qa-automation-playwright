/**
 * Helpers for metamorphic testing
 */

import { APIResponse } from '@playwright/test';

/**
 * Check two responses have same status
 */
export function expectSameStatus(res1: APIResponse, res2: APIResponse) {
  expect(res1.status()).toBe(res2.status());
}

/**
 * Check two responses have different status
 */
export function expectDifferentStatus(res1: APIResponse, res2: APIResponse) {
  expect(res1.status()).not.toBe(res2.status());
}

/**
 * Check two arrays are disjoint (no common elements)
 */
export function expectDisjointSets<T>(arr1: T[], arr2: T[], key: keyof T) {
  const keys1 = arr1.map(item => item[key]);
  const keys2 = arr2.map(item => item[key]);
  const overlap = keys1.filter(k => keys2.includes(k));
  expect(overlap.length).toBe(0);
}

/**
 * Check follow/unfollow symmetry
 */
export async function checkFollowUnfollowSymmetry(
  request: any,
  username: string,
  token: string,
  apiBase: string
) {
  // Get initial count
  const initialRes = await request.get(`${apiBase}/users/${username}/following`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const initialData = await initialRes.json();
  const initialCount = Array.isArray(initialData) ? initialData.length : (initialData.items?.length || 0);
  
  // Follow and unfollow
  await request.post(`${apiBase}/users/bob/follow`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  await request.delete(`${apiBase}/users/bob/follow`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  // Check count restored
  const finalRes = await request.get(`${apiBase}/users/${username}/following`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const finalData = await finalRes.json();
  const finalCount = Array.isArray(finalData) ? finalData.length : (finalData.items?.length || 0);
  
  expect(finalCount).toBe(initialCount);
}
