import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Contract Entry Page Object Model
 */
export class ContractEntryPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to contract entry page
   */
  async goto(contNo?: string): Promise<void> {
    const url = contNo ? `/contract/entry/${contNo}` : '/contract/entry';
    await this.page.goto(url);
    await this.waitForLoad();
  }

  /**
   * Fill contract number
   */
  async fillContNo(contNo: string): Promise<void> {
    await this.page.fill('input[name="contNo"]', contNo);
  }

  /**
   * Fill confirmation number
   */
  async fillConfNo(confNo: string): Promise<void> {
    await this.page.fill('input[name="confNo"]', confNo);
  }

  /**
   * Fill vendor number
   */
  async fillVendorNo(vendorNo: string): Promise<void> {
    await this.page.fill('input[name="vendorNo"]', vendorNo);
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
}
