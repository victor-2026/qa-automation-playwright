import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class AdminPage extends BasePage {
  readonly statsUsersCount: Locator;
  readonly statsPostsCount: Locator;
  readonly searchInput: Locator;
  readonly usersTable: Locator;
  readonly postsTable: Locator;

  constructor(page: Page) {
    super(page);
    this.statsUsersCount = page.locator('[data-testid="admin-stats-users-count"]');
    this.statsPostsCount = page.locator('[data-testid="admin-stats-posts-count"]');
    this.searchInput = page.locator('[data-testid="admin-search-input"]');
    this.usersTable = page.locator('[data-testid="admin-users-table"]');
    this.postsTable = page.locator('[data-testid="admin-posts-table"]');
  }

  async searchUsers(query: string) {
    await this.searchInput.fill(query);
  }

  async getUserRows() {
    return this.page.locator('[data-testid^="admin-user-row-"]').all();
  }

  async changeRole(tid: string, role: string) {
    await this.page.locator(`[data-testid="admin-role-select-${tid}"]`).selectOption(role);
  }

  async toggleVerify(tid: string) {
    await this.page.locator(`[data-testid="admin-verify-btn-${tid}"]`).click();
  }

  async toggleBan(tid: string) {
    await this.page.locator(`[data-testid="admin-ban-btn-${tid}"]`).click();
  }

  async deletePost(postId: string) {
    await this.page.locator(`[data-testid="admin-delete-post-btn-${postId}"]`).click();
  }
}
