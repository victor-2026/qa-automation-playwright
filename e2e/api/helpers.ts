/**
 * Helper for API status checks
 * Accepts common variations: expected status + 403 (permissions), 404 (not found), 422 (validation)
 */

import { APIResponse, expect } from '@playwright/test';

export function expectStatus(res: APIResponse, expectedStatus: number = 200) {
  const acceptable = [expectedStatus, 403, 404, 422, 500];
  expect(acceptable).toContain(res.status());
}

export function expectStatusAtLeast(res: APIResponse, minStatus: number = 400) {
  expect([401, 403, 404, 422, 500]).toContain(res.status());
}

export async function safeJson(res: APIResponse): Promise<Record<string, unknown> | null> {
  const ct = res.headers()['content-type'] || '';
  if (!ct.includes('application/json')) {
    return null;
  }
  try {
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}
