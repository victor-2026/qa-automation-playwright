import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class SearchPage extends BasePage {
  readonly searchInput: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.locator('[data-testid="nav-search-input"]');
  }

  async search(query: string) {
    await this.searchInput.fill(query);
  }

  async getResults() {
    return this.page.locator('[data-testid^="post-card-"]').all();
  }

  async getResultCount(): Promise<number> {
    return this.page.locator('[data-testid^="post-card-"]').count();
  }
}
