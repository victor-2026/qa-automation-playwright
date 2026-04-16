import { test as base, Page, APIRequestContext } from '@playwright/test';
import { LoginPage, NavPage, FeedPage } from './pages';

const API_BASE = 'http://localhost:8000/api';

async function getAuthToken(request: APIRequestContext, email: string, password: string): Promise<string | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await request.post(`${API_BASE}/auth/login`, {
        data: { email, password }
      });
      if (res.status() === 200) {
        const body = await res.json();
        if (body.access_token) {
          return body.access_token;
        }
      }
    } catch (e) {
      // Retry on network error
    }
    if (attempt < 2) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  return null;
}

type Pages = {
  loginPage: LoginPage;
  navPage: NavPage;
  feedPage: FeedPage;
  aliceToken: string;
  adminToken: string;
  bobToken: string;
};

export const test = base.extend<Pages>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  navPage: async ({ page }, use) => {
    await use(new NavPage(page));
  },
  feedPage: async ({ page }, use) => {
    await use(new FeedPage(page));
  },
  aliceToken: async ({ request }, use) => {
    const token = await getAuthToken(request, 'alice@buzzhive.com', 'alice123');
    await use(token || '');
  },
  adminToken: async ({ request }, use) => {
    const token = await getAuthToken(request, 'admin@buzzhive.com', 'admin123');
    await use(token || '');
  },
  bobToken: async ({ request }, use) => {
    const token = await getAuthToken(request, 'bob@buzzhive.com', 'bob123');
    await use(token || '');
  },
});

export { expect } from '@playwright/test';

export const accounts = {
  alice: { email: 'alice@buzzhive.com', password: 'alice123' },
  bob: { email: 'bob@buzzhive.com', password: 'bob123' },
  admin: { email: 'admin@buzzhive.com', password: 'admin123' },
  mod: { email: 'mod@buzzhive.com', password: 'mod123' },
  banned: { email: 'frank@buzzhive.com', password: 'frank123' },
};

export async function loginAs(page: Page, email: string, password: string) {
  await page.goto('http://localhost:3000');
  await page.fill('[data-testid="auth-email-input"]', email);
  await page.fill('[data-testid="auth-password-input"]', password);
  await page.click('[data-testid="auth-login-btn"]');
  await page.waitForURL('**/');
}
