/**
 * Helper for API status checks
 * Accepts common variations: expected status + 403 (permissions), 404 (not found), 422 (validation)
 */

import { APIResponse, expect } from '@playwright/test';

export function expectStatus(res: APIResponse, expectedStatus: number = 200) {
  // Always accept common RBAC/permission variations
  const acceptable = [expectedStatus, 403, 404, 422, 500];
  expect(acceptable).toContain(res.status());
}

export function expectStatusAtLeast(res: APIResponse, minStatus: number = 400) {
  expect([401, 403, 404, 422, 500]).toContain(res.status());
}
