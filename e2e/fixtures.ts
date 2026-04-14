import { test as base, Page } from '@playwright/test';
import { LoginPage, NavPage, FeedPage } from './pages';

type Pages = {
  loginPage: LoginPage;
  navPage: NavPage;
  feedPage: FeedPage;
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
