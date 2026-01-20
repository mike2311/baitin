import { Page, Locator } from '@playwright/test';

/**
 * Base Page Class
 *
 * Provides common methods for all page objects.
 */
export class BasePage {
  constructor(protected page: Page) {}

  /**
   * Navigate to a specific URL
   */
  async goto(url: string): Promise<void> {
    await this.page.goto(url);
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Wait for page to load
   */
  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Click a button by text
   */
  async clickButton(text: string): Promise<void> {
    await this.page.click(`button:has-text("${text}")`);
  }

  /**
   * Fill an input field
   */
  async fillInput(name: string, value: string): Promise<void> {
    await this.page.fill(`input[name="${name}"]`, value);
  }

  /**
   * Get text content of an element
   */
  async getText(selector: string): Promise<string> {
    return await this.page.textContent(selector) || '';
  }

  /**
   * Check if element is visible
   */
  async isVisible(selector: string): Promise<boolean> {
    return await this.page.isVisible(selector);
  }

  /**
   * Wait for element to be visible
   */
  async waitForVisible(selector: string, timeout: number = 5000): Promise<void> {
    await this.page.waitForSelector(selector, { state: 'visible', timeout });
  }

  /**
   * Take a screenshot
   */
  async screenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `screenshots/${name}.png` });
  }
}
