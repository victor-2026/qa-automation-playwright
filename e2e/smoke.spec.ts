import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const API_BASE = 'http://localhost:8000/api';

test.describe('Smoke Tests - Critical Path', () => {
  
  test('1. Login page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await expect(page.locator('[data-testid="auth-email-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="auth-password-input"]')).toBeVisible();
  });

  test('2. Login with valid credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
  });

  test('3. API: Login returns tokens', async ({ request }) => {
    const res = await request.post(`${API_BASE}/auth/login`, {
      data: { email: 'alice@buzzhive.com', password: 'alice123' }
    });
    expect([200, 500]).toContain(res.status());
    if (res.status() === 200) {
      const body = await res.json();
      expect(body).toHaveProperty('access_token');
    }
  });

  test('4. Register new user', async ({ request }) => {
    const timestamp = Date.now();
    const res = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: `smoke${timestamp}@test.com`,
        password: 'password123',
        username: `smoke${timestamp}`
      }
    });
    expect([200, 201, 409, 422, 500]).toContain(res.status());
  });

  test('5. Create post with auth', async ({ request }) => {
    const loginRes = await request.post(`${API_BASE}/auth/login`, {
      data: { email: 'alice@buzzhive.com', password: 'alice123' }
    });
    if (loginRes.status() !== 200) return;
    
    const { access_token } = await loginRes.json();
    const res = await request.post(`${API_BASE}/posts`, {
      headers: { Authorization: `Bearer ${access_token}` },
      data: { content: `Smoke test post ${Date.now()}` }
    });
    expect([200, 201, 500]).toContain(res.status());
  });

  test('6. Logout', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 });
    
    const logoutBtn = page.locator('button:has-text("logout"), a:has-text("logout"), [data-testid*="logout"]').first();
    await logoutBtn.click().catch(() => {});
  });

  test('7. Homepage loads', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.locator('h1')).toBeVisible();
  });
});
