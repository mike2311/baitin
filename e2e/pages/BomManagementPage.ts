import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * BOM Management Page Object Model
 */
export class BomManagementPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to BOM management page
   */
  async goto(itemNo?: string): Promise<void> {
    const url = itemNo ? `/bom?itemNo=${itemNo}` : '/bom';
    await this.page.goto(url);
    await this.waitForLoad();
  }

  /**
   * Fill item number
   */
  async fillItemNo(itemNo: string): Promise<void> {
    await this.page.fill('input[name="itemNo"]', itemNo);
  }

  /**
   * Click search/load button
   */
  async clickLoad(): Promise<void> {
    await this.page.click('button:has-text("Load")');
  }

  /**
   * Add a new BOM row
   */
  async addBomRow(): Promise<void> {
    await this.page.click('button:has-text("Add")');
  }

  /**
   * Fill sub item number in grid
   */
  async fillSubItemNo(rowIndex: number, subItemNo: string): Promise<void> {
    // Assuming data grid - adjust selector based on actual implementation
    await this.page.fill(`[data-row-index="${rowIndex}"] input[name="subItemNo"]`, subItemNo);
  }

  /**
   * Fill quantity in grid
   */
  async fillQty(rowIndex: number, qty: number): Promise<void> {
    await this.page.fill(`[data-row-index="${rowIndex}"] input[name="qty"]`, qty.toString());
  }

  /**
   * Click save button
   */
  async clickSave(): Promise<void> {
    await this.page.click('button:has-text("Save")');
  }

  /**
   * Delete a BOM row
   */
  async deleteRow(rowIndex: number): Promise<void> {
    await this.page.click(`[data-row-index="${rowIndex}"] button:has-text("Delete")`);
  }

  /**
   * Get number of BOM rows
   */
  async getRowCount(): Promise<number> {
    const rows = await this.page.$$('[data-row-index]');
    return rows.length;
  }
}
