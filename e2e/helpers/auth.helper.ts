import { Page } from '@playwright/test';
import { TEST_DATA } from '../../backend/src/test-utils/test-data.config';

/**
 * Authentication Helper
 *
 * Handles login/logout operations for e2e tests.
 */
export class AuthHelper {
  constructor(private page: Page) {}

  /**
   * Logs in as admin user
   */
  async loginAsAdmin(
    username: string = TEST_DATA.USER.USERNAME,
    password: string = TEST_DATA.USER.PASSWORD,
  ): Promise<void> {
    await this.page.goto('/login');
    await this.page.fill('input[name="username"]', username);
    await this.page.fill('input[name="password"]', password);
    await this.page.click('button[type="submit"]');
    await this.page.waitForURL(/\/(dashboard|home)/, { timeout: 10000 });
  }

  /**
   * Logs in as regular user
   */
  async loginAsUser(
    username: string = 'regularuser',
    password: string = 'password123',
  ): Promise<void> {
    await this.loginAsAdmin(username, password);
  }

  /**
   * Logs out current user
   */
  async logout(): Promise<void> {
    await this.page.click('button:has-text("Logout")');
    await this.page.waitForURL('/login', { timeout: 5000 });
  }

  /**
   * Checks if user is logged in
   */
  async isLoggedIn(): Promise<boolean> {
    const url = this.page.url();
    return !url.includes('/login');
  }

  /**
   * Gets auth token from localStorage
   */
  async getAuthToken(): Promise<string | null> {
    return await this.page.evaluate(() => {
      return localStorage.getItem('auth_token') || localStorage.getItem('token');
    });
  }

  /**
   * Sets auth token in localStorage
   */
  async setAuthToken(token: string): Promise<void> {
    await this.page.evaluate((t) => {
      localStorage.setItem('auth_token', t);
      localStorage.setItem('token', t);
    }, token);
  }
}
