import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Order Enquiry Quantity Breakdown Page Object Model
 */
export class OrderEnquiryQtyBreakdownPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to quantity breakdown page
   */
  async goto(oeNo?: string, itemNo?: string): Promise<void> {
    let url = '/order-enquiry/qty-breakdown';
    const params = new URLSearchParams();
    if (oeNo) params.append('oeNo', oeNo);
    if (itemNo) params.append('itemNo', itemNo);
    if (params.toString()) url += `?${params.toString()}`;
    await this.page.goto(url);
    await this.waitForLoad();
  }

  /**
   * Fill OE number
   */
  async fillOeNo(oeNo: string): Promise<void> {
    await this.page.fill('input[name="oeNo"]', oeNo);
  }

  /**
   * Fill item number
   */
  async fillItemNo(itemNo: string): Promise<void> {
    await this.page.fill('input[name="itemNo"]', itemNo);
  }

  /**
   * Click load button
   */
  async clickLoad(): Promise<void> {
    await this.page.click('button:has-text("Load")');
  }

  /**
   * Add a new breakdown row
   */
  async addBreakdownRow(): Promise<void> {
    await this.page.click('button:has-text("Add")');
  }

  /**
   * Fill quantity in grid
   */
  async fillQty(rowIndex: number, qty: number): Promise<void> {
    await this.page.fill(`[data-row-index="${rowIndex}"] input[name="qty"]`, qty.toString());
  }

  /**
   * Fill port in grid
   */
  async fillPort(rowIndex: number, port: string): Promise<void> {
    await this.page.fill(`[data-row-index="${rowIndex}"] input[name="port"]`, port);
  }

  /**
   * Click save button
   */
  async clickSave(): Promise<void> {
    await this.page.click('button:has-text("Save")');
  }

  /**
   * Delete a breakdown row
   */
  async deleteRow(rowIndex: number): Promise<void> {
    await this.page.click(`[data-row-index="${rowIndex}"] button:has-text("Delete")`);
  }
}
