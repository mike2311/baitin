import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Login Page Object Model
 */
export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to login page
   */
  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  /**
   * Fill username
   */
  async fillUsername(username: string): Promise<void> {
    await this.page.fill('input[name="username"]', username);
  }

  /**
   * Fill password
   */
  async fillPassword(password: string): Promise<void> {
    await this.page.fill('input[name="password"]', password);
  }

  /**
   * Click login button
   */
  async clickLogin(): Promise<void> {
    await this.page.click('button[type="submit"]');
  }

  /**
   * Login with credentials
   */
  async login(username: string, password: string): Promise<void> {
    await this.goto();
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.clickLogin();
    await this.page.waitForURL(/\/(dashboard|home)/, { timeout: 10000 });
  }

  /**
   * Check if error message is displayed
   */
  async hasErrorMessage(): Promise<boolean> {
    const errorSelector = '.error, [role="alert"], .text-red-500';
    return await this.page.isVisible(errorSelector);
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string> {
    const errorSelector = '.error, [role="alert"], .text-red-500';
    return await this.page.textContent(errorSelector) || '';
  }
}
