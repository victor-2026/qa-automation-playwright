import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class NavPage extends BasePage {
  readonly feedLink: Locator;
  readonly profileLink: Locator;
  readonly logoutButton: Locator;
  readonly notificationsBadge: Locator;

  constructor(page: Page) {
    super(page);
    this.feedLink = page.locator('[data-testid="nav-feed"]');
    this.profileLink = page.locator('[data-testid="nav-profile"]');
    this.logoutButton = page.locator('[data-testid="nav-logout"]');
    this.notificationsBadge = page.locator('[data-testid="nav-notifications-badge"]');
  }

  async isLoggedIn(): Promise<boolean> {
    return this.feedLink.isVisible().catch(() => false);
  }

  async logout() {
    await this.logoutButton.click();
    await this.page.waitForURL('**/login');
  }
}
