import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class FeedPage extends BasePage {
  readonly postComposer: Locator;
  readonly postSubmitButton: Locator;
  readonly postList: Locator;

  constructor(page: Page) {
    super(page);
    this.postComposer = page.locator('[data-testid="post-composer-input"]');
    this.postSubmitButton = page.locator('[data-testid="post-composer-submit"]');
    this.postList = page.locator('[data-testid="post-list"]');
  }

  async createPost(content: string) {
    await this.postComposer.fill(content);
    await this.postSubmitButton.click();
    await this.page.waitForTimeout(1000);
  }

  async getFirstPostContent(): Promise<string> {
    const firstPost = this.page.locator('[data-testid="post-content"]').first();
    return firstPost.textContent() || '';
  }
}
