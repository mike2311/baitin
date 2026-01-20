import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Order Confirmation Entry Page Object Model
 */
export class OrderConfirmationEntryPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to OC entry page
   */
  async goto(ocNo?: string): Promise<void> {
    const url = ocNo ? `/order-confirmation/entry/${ocNo}` : '/order-confirmation/entry';
    await this.page.goto(url);
    await this.waitForLoad();
  }

  /**
   * Fill confirmation number
   */
  async fillConfNo(confNo: string): Promise<void> {
    await this.page.fill('input[name="confNo"]', confNo);
  }

  /**
   * Fill customer number
   */
  async fillCustNo(custNo: string): Promise<void> {
    await this.page.fill('input[name="custNo"]', custNo);
  }

  /**
   * Fill date
   */
  async fillDate(date: string): Promise<void> {
    await this.page.fill('input[name="date"]', date);
  }

  /**
   * Add a new detail line
   */
  async addDetailLine(): Promise<void> {
    await this.page.click('button:has-text("Add Line")');
  }

  /**
   * Fill detail line item number
   */
  async fillDetailItemNo(lineIndex: number, itemNo: string): Promise<void> {
    await this.page.fill(`input[name="details[${lineIndex}].itemNo"]`, itemNo);
  }

  /**
   * Fill detail line quantity
   */
  async fillDetailQty(lineIndex: number, qty: number): Promise<void> {
    await this.page.fill(`input[name="details[${lineIndex}].qty"]`, qty.toString());
  }

  /**
   * Click save button
   */
  async clickSave(): Promise<void> {
    await this.page.click('button:has-text("Save")');
  }

  /**
   * Click delete button
   */
  async clickDelete(): Promise<void> {
    await this.page.click('button:has-text("Delete")');
  }

  /**
   * Check if save button is disabled
   */
  async isSaveDisabled(): Promise<boolean> {
    const saveButton = this.page.locator('button:has-text("Save")');
    return await saveButton.isDisabled();
  }

  /**
   * Get validation error messages
   */
  async getValidationErrors(): Promise<string[]> {
    const errorElements = await this.page.$$('.text-red-500, [role="alert"]');
    const errors: string[] = [];
    for (const element of errorElements) {
      const text = await element.textContent();
      if (text) errors.push(text);
    }
    return errors;
  }
}
