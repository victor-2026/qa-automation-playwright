import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class MessagesPage extends BasePage {
  readonly newConversationBtn: Locator;
  readonly newConversationModal: Locator;
  readonly newConversationSearch: Locator;
  readonly messageInput: Locator;
  readonly sendButton: Locator;

  constructor(page: Page) {
    super(page);
    this.newConversationBtn = page.locator('[data-testid="new-conversation-btn"]');
    this.newConversationModal = page.locator('[data-testid="new-conversation-modal"]');
    this.newConversationSearch = page.locator('[data-testid="new-conversation-search"]');
    this.messageInput = page.locator('[data-testid="message-input"]');
    this.sendButton = page.locator('[data-testid="message-send-btn"]');
  }

  async openNewConversation() {
    await this.newConversationBtn.click();
  }

  async searchUser(username: string) {
    await this.newConversationSearch.fill(username);
  }

  async selectUser(tid: string) {
    await this.page.locator(`[data-testid="new-conversation-user-${tid}"]`).click();
  }

  async openConversation(tid: string) {
    await this.page.locator(`[data-testid="conversation-${tid}"]`).click();
  }

  async sendMessage(content: string) {
    await this.messageInput.fill(content);
    await this.sendButton.click();
  }

  async getMessages() {
    return this.page.locator('[data-testid^="message-"]').all();
  }
}
