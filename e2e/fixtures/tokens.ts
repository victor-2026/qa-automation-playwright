/**
 * Shared token utilities for API tests
 * Phase 3: Module Split
 */

import type { APIRequestContext } from '@playwright/test';
import { API_BASE, TEST_USERNAME, TEST_PASSWORD, TEST_ACCOUNTS } from '../setup/credentials';

/**
 * Get token for given email/password
 */
export async function getToken(
  request: APIRequestContext,
  email: string,
  password: string
): Promise<string> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await request.post(`${API_BASE}/auth/login`, {
        data: { email, password },
      });
      if (res.status() === 200) {
        const body = await res.json();
        if (body.access_token) return body.access_token;
      }
    } catch {
      // retry
    }
    if (attempt < 2) await new Promise((r) => setTimeout(r, 1000));
  }
  return '';
}

/**
 * Get Alice (user) token
 */
export async function getAliceToken(request: APIRequestContext): Promise<string> {
  return getToken(request, TEST_USERNAME, TEST_PASSWORD);
}

/**
 * Get Admin token
 */
export async function getAdminToken(request: APIRequestContext): Promise<string> {
  return getToken(request, TEST_ACCOUNTS.admin.email, TEST_ACCOUNTS.admin.password);
}

/**
 * Get Mod token
 */
export async function getModToken(request: APIRequestContext): Promise<string> {
  return getToken(request, TEST_ACCOUNTS.mod.email, TEST_ACCOUNTS.mod.password);
}

/**
 * Get Bob token
 */
export async function getBobToken(request: APIRequestContext): Promise<string> {
  return getToken(request, TEST_ACCOUNTS.bob.email, TEST_ACCOUNTS.bob.password);
}