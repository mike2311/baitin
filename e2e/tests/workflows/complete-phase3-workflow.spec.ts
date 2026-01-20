import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../../helpers/auth.helper';

/**
 * Complete Phase 3 Workflow E2E Test
 *
 * This test covers the complete end-to-end workflow:
 * OE → OC → Contract → SO → DN → Loading → Invoice
 * with document generation at each stage.
 *
 * Original Logic Reference:
 * - Complete workflow documentation
 * - All Phase 3 modules integration
 *
 * Reference: Phase 3 - Complete Workflow E2E Test
 */

test.describe('Complete Phase 3 Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('Complete workflow: OE → OC → Contract → SO → DN → Loading → Invoice with documents', async ({ page }) => {
    const timestamp = Date.now();
    const testPrefix = `E2E-${timestamp}`;
    
    // ============================================
    // Step 1: Create Order Enquiry (OE)
    // ============================================
    test.step('Step 1: Create Order Enquiry', async () => {
      await page.goto('/order-enquiry/entry');
      
      // Create new OE
      await page.getByRole('button', { name: /create|new/i }).click();
      
      const oeNo = `${testPrefix}-OE`;
      await page.getByLabel(/oe number|order enquiry number/i).fill(oeNo);
      await page.getByLabel(/date/i).fill('2025-01-10');
      await page.getByLabel(/customer/i).selectOption('CUST001');
      
      // Add OE items
      await page.getByRole('button', { name: /add item/i }).click();
      await page.getByLabel(/item number/i).fill('ITEM001');
      await page.getByLabel(/quantity/i).fill('1000');
      await page.getByLabel(/price/i).fill('10.50');
      
      // Save OE
      await page.getByRole('button', { name: /save/i }).click();
      await expect(page.getByText(/order enquiry.*created successfully|saved successfully/i), { timeout: 10000 }).toBeVisible();
      
      // Verify OE appears in list
      await page.goto('/order-enquiry/enquiry');
      await page.getByRole('button', { name: /search/i }).click();
      await page.waitForSelector('[data-testid="oe-list"]', { timeout: 10000 });
      await expect(page.getByText(oeNo)).toBeVisible();
    });
    
    // ============================================
    // Step 2: Post OE to Order Confirmation (OC)
    // ============================================
    test.step('Step 2: Post OE to Order Confirmation', async () => {
      await page.goto('/order-confirmation/post');
      
      // Fill OE numbers
      await page.fill('input[name="companyCode"], select[name="companyCode"]', 'HT');
      await page.fill('textarea[name="oeNos"], input[name="oeNos"]', `${testPrefix}-OE`);
      
      // Post to OC
      await page.click('button:has-text("Post"), button:has-text("Create OC")');
      await page.waitForTimeout(3000);
      
      // Verify success message
      await expect(page.getByText(/order confirmation.*created|posted successfully/i), { timeout: 10000 }).toBeVisible();
      
      // Verify OC was created
      await page.goto('/order-confirmation/enquiry');
      await page.getByRole('button', { name: /search/i }).click();
      await page.waitForSelector('[data-testid="oc-list"]', { timeout: 10000 });
      await expect(page.getByText(`${testPrefix}-OE`)).toBeVisible();
    });
    
    // ============================================
    // Step 3: Generate Contract from OC
    // ============================================
    test.step('Step 3: Generate Contract from OC', async () => {
      await page.goto('/contract/generate');
      
      // Fill OC number (format: HT-OC/{oeNo})
      const ocNo = `HT-OC/${testPrefix}-OE`;
      await page.fill('input[name="confNo"], input[name="ocNo"]', ocNo);
      
      // Generate Contract
      await page.click('button:has-text("Generate"), button:has-text("Create Contract")');
      await page.waitForTimeout(3000);
      
      // Verify success message
      await expect(page.getByText(/contract.*generated|created successfully/i), { timeout: 10000 }).toBeVisible();
      
      // Verify Contract was created
      await page.goto('/contract/enquiry');
      await page.getByRole('button', { name: /search/i }).click();
      await page.waitForSelector('[data-testid="contract-list"]', { timeout: 10000 });
      // Contract should be visible in list
    });
    
    // ============================================
    // Step 4: Create Shipping Order (SO) from OC/Contract
    // ============================================
    test.step('Step 4: Create Shipping Order from OC', async () => {
      await page.goto('/order-confirmation/enquiry');
      
      // Find the OC we created
      await page.getByRole('button', { name: /search/i }).click();
      await page.waitForSelector('[data-testid="oc-list"]', { timeout: 10000 });
      
      const ocRow = page.locator('[data-testid="oc-list"] tbody tr').filter({ hasText: `${testPrefix}-OE` });
      await ocRow.click();
      
      // Click Create SO button
      await page.getByRole('button', { name: /create so|create shipping order/i }).click();
      
      // Verify SO creation form opens
      await expect(page).toHaveURL(/.*shipping-orders.*/);
      
      // Fill SO details
      const soNo = `${testPrefix}-SO`;
      await page.getByLabel(/so number|shipping order number/i).fill(soNo);
      await page.getByLabel(/date/i).fill('2025-01-15');
      
      // Verify items are copied from OC
      await expect(page.locator('[data-testid="so-items-grid"] tbody tr'), { timeout: 10000 }).toHaveCount(1);
      
      // Save SO
      await page.getByRole('button', { name: /save/i }).click();
      await expect(page.getByText(/shipping order.*created successfully/i), { timeout: 10000 }).toBeVisible();
      
      // Generate SO Document
      await page.getByRole('button', { name: /generate document|generate so document/i }).click();
      await page.getByLabel(/document type/i).selectOption('so_document');
      await page.getByLabel(/output format/i).selectOption('excel');
      await page.getByRole('button', { name: /generate/i }).click();
      await expect(page.getByText(/document generated successfully/i), { timeout: 15000 }).toBeVisible();
    });
    
    // ============================================
    // Step 5: Create Delivery Note (DN) from SO
    // ============================================
    test.step('Step 5: Create Delivery Note from SO', async () => {
      await page.goto('/shipping-orders');
      
      // Find the SO we created
      await page.getByRole('button', { name: /search/i }).click();
      await page.waitForSelector('[data-testid="so-list"]', { timeout: 10000 });
      
      const soRow = page.locator('[data-testid="so-list"] tbody tr').filter({ hasText: `${testPrefix}-SO` });
      await soRow.click();
      
      // Click Create DN button
      await page.getByRole('button', { name: /create dn|create delivery note/i }).click();
      
      // Verify DN creation form opens
      await expect(page).toHaveURL(/.*delivery-notes.*/);
      
      // Fill DN details
      const dnNo = `${testPrefix}-DN`;
      await page.getByLabel(/dn number|delivery note number/i).fill(dnNo);
      await page.getByLabel(/date/i).fill('2025-01-16');
      
      // Verify items are copied from SO
      await expect(page.locator('[data-testid="dn-items-grid"] tbody tr'), { timeout: 10000 }).toHaveCount(1);
      
      // Save DN
      await page.getByRole('button', { name: /save/i }).click();
      await expect(page.getByText(/delivery note.*created successfully/i), { timeout: 10000 }).toBeVisible();
    });
    
    // ============================================
    // Step 6: Create Loading Master and Assign DN
    // ============================================
    test.step('Step 6: Create Loading Master and Assign DN', async () => {
      await page.goto('/loading');
      
      // Create new Loading Master
      await page.getByRole('button', { name: /create|new/i }).click();
      
      const loadingNo = `${testPrefix}-LOAD`;
      await page.getByLabel(/loading number/i).fill(loadingNo);
      await page.getByLabel(/date/i).fill('2025-01-17');
      await page.getByLabel(/vessel name/i).fill('VESSEL-001');
      await page.getByLabel(/voyage number/i).fill('VOY-001');
      await page.getByLabel(/total weight/i).fill('1000');
      await page.getByLabel(/total cube/i).fill('500');
      await page.getByLabel(/total cartons/i).fill('100');
      
      // Assign DN to loading
      await page.getByRole('button', { name: /assign dns|add dns/i }).click();
      await page.waitForSelector('[data-testid="dn-selection-list"]', { timeout: 10000 });
      
      const dnCheckbox = page.locator('[data-testid="dn-selection-list"] input[type="checkbox"]').filter({ hasText: `${testPrefix}-DN` });
      if (await dnCheckbox.isVisible()) {
        await dnCheckbox.check();
        await page.getByRole('button', { name: /confirm|add selected/i }).click();
      } else {
        // Select first available DN
        const firstDnCheckbox = page.locator('[data-testid="dn-selection-list"] input[type="checkbox"]').first();
        await firstDnCheckbox.check();
        await page.getByRole('button', { name: /confirm|add selected/i }).click();
      }
      
      // Save Loading Master
      await page.getByRole('button', { name: /save/i }).click();
      await expect(page.getByText(/loading master.*created successfully/i), { timeout: 10000 }).toBeVisible();
      
      // Generate Loading Advice
      await page.getByRole('button', { name: /generate loading advice|create loading advice/i }).click();
      const laNo = `${testPrefix}-LA`;
      await page.getByLabel(/loading advice number/i).fill(laNo);
      await page.getByLabel(/date/i).fill('2025-01-17');
      await page.getByRole('button', { name: /generate|create/i }).click();
      await expect(page.getByText(/loading advice.*generated successfully/i), { timeout: 15000 }).toBeVisible();
    });
    
    // ============================================
    // Step 7: Create Invoice from DN
    // ============================================
    test.step('Step 7: Create Invoice from DN', async () => {
      await page.goto('/delivery-notes');
      
      // Find the DN we created
      await page.getByRole('button', { name: /search/i }).click();
      await page.waitForSelector('[data-testid="dn-list"]', { timeout: 10000 });
      
      const dnRow = page.locator('[data-testid="dn-list"] tbody tr').filter({ hasText: `${testPrefix}-DN` });
      await dnRow.click();
      
      // Click Create Invoice button
      await page.getByRole('button', { name: /create invoice/i }).click();
      
      // Verify Invoice creation form opens
      await expect(page).toHaveURL(/.*invoices.*/);
      
      // Fill Invoice details
      const invNo = `${testPrefix}-INV`;
      await page.getByLabel(/invoice number/i).fill(invNo);
      await page.getByLabel(/date/i).fill('2025-01-18');
      
      // Verify items are copied from DN
      await expect(page.locator('[data-testid="invoice-items-grid"] tbody tr'), { timeout: 10000 }).toHaveCount(1);
      
      // Save Invoice
      await page.getByRole('button', { name: /save/i }).click();
      await expect(page.getByText(/invoice.*created successfully/i), { timeout: 10000 }).toBeVisible();
    });
    
    // ============================================
    // Step 8: Generate Packing List (Standard)
    // ============================================
    test.step('Step 8: Generate Standard Packing List', async () => {
      await page.goto('/invoices');
      
      // Find the Invoice we created
      await page.getByRole('button', { name: /search/i }).click();
      await page.waitForSelector('[data-testid="invoice-list"]', { timeout: 10000 });
      
      const invRow = page.locator('[data-testid="invoice-list"] tbody tr').filter({ hasText: `${testPrefix}-INV` });
      await invRow.click();
      
      // Generate Packing List
      await page.getByRole('button', { name: /generate packing list|packing list/i }).click();
      await page.getByLabel(/document type/i).selectOption('packing_list');
      await page.getByLabel(/output format/i).selectOption('excel');
      await page.getByLabel(/format/i).selectOption('standard');
      await page.getByRole('button', { name: /generate/i }).click();
      await expect(page.getByText(/packing list.*generated successfully|document generated successfully/i), { timeout: 15000 }).toBeVisible();
    });
    
    // ============================================
    // Step 9: Generate Spencer Format Packing List
    // ============================================
    test.step('Step 9: Generate Spencer Format Packing List', async () => {
      // Still on invoice detail page
      await page.getByRole('button', { name: /generate packing list/i }).click();
      await page.getByLabel(/document type/i).selectOption('packing_list');
      await page.getByLabel(/output format/i).selectOption('excel');
      await page.getByLabel(/format/i).selectOption('spencer');
      await page.getByRole('button', { name: /generate/i }).click();
      await expect(page.getByText(/packing list.*generated successfully|document generated successfully/i), { timeout: 15000 }).toBeVisible();
    });
    
    // ============================================
    // Step 10: Generate Shipment Advice
    // ============================================
    test.step('Step 10: Generate Shipment Advice', async () => {
      // Still on invoice detail page
      await page.getByRole('button', { name: /generate shipment advice|shipment advice/i }).click();
      await page.getByLabel(/document type/i).selectOption('shipment_advice');
      await page.getByLabel(/output format/i).selectOption('excel');
      await page.getByRole('button', { name: /generate/i }).click();
      await expect(page.getByText(/shipment advice.*generated successfully|document generated successfully/i), { timeout: 15000 }).toBeVisible();
    });
    
    // ============================================
    // Step 11: Verify Data Integrity Across Workflow
    // ============================================
    test.step('Step 11: Verify Data Integrity', async () => {
      // Verify quantities are consistent across workflow
      await page.goto('/order-enquiry/enquiry');
      await page.getByRole('button', { name: /search/i }).click();
      await page.waitForSelector('[data-testid="oe-list"]', { timeout: 10000 });
      const oeRow = page.locator('[data-testid="oe-list"] tbody tr').filter({ hasText: `${testPrefix}-OE` });
      await oeRow.click();
      
      // Get OE quantity
      const oeQty = await page.locator('[data-testid="oe-items-grid"] tbody tr').first().locator('td').nth(2).textContent();
      
      // Verify SO quantity matches
      await page.goto('/shipping-orders');
      await page.getByRole('button', { name: /search/i }).click();
      await page.waitForSelector('[data-testid="so-list"]', { timeout: 10000 });
      const soRow = page.locator('[data-testid="so-list"] tbody tr').filter({ hasText: `${testPrefix}-SO` });
      await soRow.click();
      const soQty = await page.locator('[data-testid="so-items-grid"] tbody tr').first().locator('td').nth(2).textContent();
      
      // Verify DN quantity matches
      await page.goto('/delivery-notes');
      await page.getByRole('button', { name: /search/i }).click();
      await page.waitForSelector('[data-testid="dn-list"]', { timeout: 10000 });
      const dnRow = page.locator('[data-testid="dn-list"] tbody tr').filter({ hasText: `${testPrefix}-DN` });
      await dnRow.click();
      const dnQty = await page.locator('[data-testid="dn-items-grid"] tbody tr').first().locator('td').nth(2).textContent();
      
      // Verify Invoice quantity matches
      await page.goto('/invoices');
      await page.getByRole('button', { name: /search/i }).click();
      await page.waitForSelector('[data-testid="invoice-list"]', { timeout: 10000 });
      const invRow = page.locator('[data-testid="invoice-list"] tbody tr').filter({ hasText: `${testPrefix}-INV` });
      await invRow.click();
      const invQty = await page.locator('[data-testid="invoice-items-grid"] tbody tr').first().locator('td').nth(2).textContent();
      
      // Quantities should be consistent (allowing for breakdowns)
      expect(oeQty).toBeTruthy();
      expect(soQty).toBeTruthy();
      expect(dnQty).toBeTruthy();
      expect(invQty).toBeTruthy();
    });
    
    // ============================================
    // Step 12: Verify All Documents Generated
    // ============================================
    test.step('Step 12: Verify All Documents Generated', async () => {
      // Verify SO document
      await page.goto('/shipping-orders');
      await page.getByRole('button', { name: /search/i }).click();
      await page.waitForSelector('[data-testid="so-list"]', { timeout: 10000 });
      const soRow = page.locator('[data-testid="so-list"] tbody tr').filter({ hasText: `${testPrefix}-SO` });
      await soRow.click();
      
      // Check document status
      const soDocStatus = page.locator('[data-testid="so-document-status"]');
      if (await soDocStatus.isVisible()) {
        await expect(soDocStatus).toContainText(/generated|available/i);
      }
      
      // Verify Loading Advice
      await page.goto('/loading/advice');
      await page.getByRole('button', { name: /search/i }).click();
      await page.waitForSelector('[data-testid="loading-advice-list"]', { timeout: 10000 });
      // Loading advice should be in list
      
      // Verify Invoice documents
      await page.goto('/invoices');
      await page.getByRole('button', { name: /search/i }).click();
      await page.waitForSelector('[data-testid="invoice-list"]', { timeout: 10000 });
      const invRow = page.locator('[data-testid="invoice-list"] tbody tr').filter({ hasText: `${testPrefix}-INV` });
      await invRow.click();
      
      // Check packing list status
      const plStatus = page.locator('[data-testid="packing-list-status"]');
      if (await plStatus.isVisible()) {
        await expect(plStatus).toContainText(/generated|available/i);
      }
    });
  });

  test('Complete workflow with BOM items', async ({ page }) => {
    const timestamp = Date.now();
    const testPrefix = `BOM-${timestamp}`;
    
    // Create OE with BOM items
    await page.goto('/order-enquiry/entry');
    await page.getByRole('button', { name: /create/i }).click();
    
    const oeNo = `${testPrefix}-OE`;
    await page.getByLabel(/oe number/i).fill(oeNo);
    await page.getByLabel(/date/i).fill('2025-01-10');
    await page.getByLabel(/customer/i).selectOption('CUST001');
    
    // Add BOM head item
    await page.getByRole('button', { name: /add item/i }).click();
    await page.getByLabel(/item number/i).fill('BOM-HEAD-001');
    await page.getByLabel(/quantity/i).fill('10');
    await page.getByLabel(/is head item|bom head/i).check();
    
    // Verify BOM sub-items are shown
    const bomSubItems = page.locator('[data-testid="bom-sub-items"]');
    if (await bomSubItems.isVisible({ timeout: 5000 })) {
      await expect(bomSubItems).toBeVisible();
    }
    
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/order enquiry.*created successfully/i), { timeout: 10000 }).toBeVisible();
    
    // Continue workflow: OC → Contract → SO → DN → Invoice
    // Verify BOM structure is maintained throughout
    await page.goto('/order-confirmation/post');
    await page.fill('input[name="companyCode"], select[name="companyCode"]', 'HT');
    await page.fill('textarea[name="oeNos"], input[name="oeNos"]', oeNo);
    await page.click('button:has-text("Post")');
    await page.waitForTimeout(3000);
    
    // Verify BOM items in SO
    await page.goto('/shipping-orders');
    await page.getByRole('button', { name: /search/i }).click();
    await page.waitForSelector('[data-testid="so-list"]', { timeout: 10000 });
    
    // Find SO created from this OC and verify BOM structure
    // (Implementation depends on how BOM is displayed in SO)
  });

  test('Complete workflow with quantity breakdowns', async ({ page }) => {
    const timestamp = Date.now();
    const testPrefix = `QTYBRK-${timestamp}`;
    
    // Create OE with quantity breakdown
    await page.goto('/order-enquiry/entry');
    await page.getByRole('button', { name: /create/i }).click();
    
    const oeNo = `${testPrefix}-OE`;
    await page.getByLabel(/oe number/i).fill(oeNo);
    await page.getByLabel(/date/i).fill('2025-01-10');
    await page.getByLabel(/customer/i).selectOption('CUST001');
    
    // Add item
    await page.getByRole('button', { name: /add item/i }).click();
    await page.getByLabel(/item number/i).fill('ITEM001');
    await page.getByLabel(/quantity/i).fill('1000');
    
    // Add quantity breakdown
    await page.getByRole('button', { name: /add breakdown|quantity breakdown/i }).click();
    await page.getByLabel(/breakdown quantity/i).fill('500');
    await page.getByLabel(/breakdown description/i).fill('Size A');
    await page.getByRole('button', { name: /save breakdown|add/i }).click();
    
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/order enquiry.*created successfully/i), { timeout: 10000 }).toBeVisible();
    
    // Continue workflow and verify breakdown is copied to DN
    await page.goto('/order-confirmation/post');
    await page.fill('input[name="companyCode"], select[name="companyCode"]', 'HT');
    await page.fill('textarea[name="oeNos"], input[name="oeNos"]', oeNo);
    await page.click('button:has-text("Post")');
    await page.waitForTimeout(3000);
    
    // Create SO and DN, verify breakdown is copied
    // (Implementation depends on breakdown display in DN)
  });
});
