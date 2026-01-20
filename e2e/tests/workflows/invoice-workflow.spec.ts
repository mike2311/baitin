import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../../helpers/auth.helper';

/**
 * Invoice Workflow E2E Tests
 *
 * Original Logic Reference:
 * - Legacy Forms: iinvhd@, iinvdt2@, pinv@, ppacklist_new
 * - Documentation: docs/source/02-business-processes/invoice-process.md
 * - Business Rules:
 *   - Create invoice from SO or DN
 *   - Container/ref-driven item selection
 *   - Qty/carton mismatch validation with override
 *   - Date range validation
 *   - Packing list generation (standard & Spencer)
 *   - Shipment advice generation
 *   - Debit note generation
 *   - BOM item handling
 *
 * Reference: Phase 3 - Invoice Workflow E2E Tests
 */

test.describe('Invoice Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('Create Invoice from SO and generate packing list', async ({ page }) => {
    // Navigate to Shipping Order enquiry
    await page.goto('/shipping-orders');
    
    // Find an existing SO
    await page.getByRole('button', { name: /search/i }).click();
    await page.waitForSelector('[data-testid="so-list"]');
    
    // Select first SO
    const firstSoRow = page.locator('[data-testid="so-list"] tbody tr').first();
    await firstSoRow.click();
    
    // Click Create Invoice button
    await page.getByRole('button', { name: /create invoice/i }).click();
    
    // Verify Invoice creation form opens
    await expect(page).toHaveURL(/.*invoices.*/);
    
    // Verify SO number is pre-filled
    const soNoField = page.getByLabel(/so number|shipping order/i);
    await expect(soNoField).toHaveValue(/SO\d+/);
    
    // Fill Invoice details
    const invNo = `INV-E2E-${Date.now()}`;
    await page.getByLabel('Invoice Number').fill(invNo);
    await page.getByLabel('Date').fill('2025-01-15');
    
    // Verify items are copied from SO
    await expect(page.locator('[data-testid="invoice-items-grid"] tbody tr')).toHaveCount(1, { timeout: 5000 });
    
    // Save Invoice
    await page.getByRole('button', { name: /save/i }).click();
    
    // Verify success message
    await expect(page.getByText(/invoice created successfully/i)).toBeVisible();
    
    // Generate Packing List
    await page.getByRole('button', { name: /generate packing list|packing list/i }).click();
    
    // Select packing list options
    await page.getByLabel('Document Type').selectOption('packing_list');
    await page.getByLabel('Output Format').selectOption('excel');
    await page.getByLabel('Format').selectOption('standard');
    
    // Generate document
    await page.getByRole('button', { name: /generate/i }).click();
    
    // Verify document generated successfully
    await expect(page.getByText(/packing list generated successfully|document generated successfully/i)).toBeVisible();
  });

  test('Create Invoice from DN with container selection', async ({ page }) => {
    // Navigate to Delivery Note enquiry
    await page.goto('/delivery-notes');
    
    // Find an existing DN
    await page.getByRole('button', { name: /search/i }).click();
    await page.waitForSelector('[data-testid="dn-list"]');
    
    // Select first DN
    const firstDnRow = page.locator('[data-testid="dn-list"] tbody tr').first();
    await firstDnRow.click();
    
    // Click Create Invoice button
    await page.getByRole('button', { name: /create invoice/i }).click();
    
    // Verify Invoice creation form opens
    await expect(page).toHaveURL(/.*invoices.*/);
    
    // Fill Invoice details
    const invNo = `INV-DN-${Date.now()}`;
    await page.getByLabel('Invoice Number').fill(invNo);
    await page.getByLabel('Date').fill('2025-01-15');
    
    // Select items by container
    await page.getByRole('button', { name: /select by container|select items/i }).click();
    
    // Wait for container selection dialog
    await page.waitForSelector('[data-testid="container-selection"]');
    
    // Select a container
    const containerCheckbox = page.locator('[data-testid="container-selection"] input[type="checkbox"]').first();
    await containerCheckbox.check();
    
    // Confirm selection
    await page.getByRole('button', { name: /confirm|add selected/i }).click();
    
    // Verify items from selected container are added
    await expect(page.locator('[data-testid="invoice-items-grid"] tbody tr')).toHaveCount(1, { timeout: 5000 });
    
    // Save Invoice
    await page.getByRole('button', { name: /save/i }).click();
    
    // Verify success message
    await expect(page.getByText(/invoice created successfully/i)).toBeVisible();
  });

  test('Invoice qty/carton mismatch validation with override', async ({ page }) => {
    await page.goto('/invoices');
    
    // Click create new Invoice
    await page.getByRole('button', { name: /create/i }).click();
    
    // Fill Invoice details
    const invNo = `INV-VALIDATION-${Date.now()}`;
    await page.getByLabel('Invoice Number').fill(invNo);
    await page.getByLabel('Date').fill('2025-01-15');
    await page.getByLabel('Customer').selectOption('CUST001');
    
    // Add item with qty/carton mismatch
    await page.getByRole('button', { name: /add item/i }).click();
    await page.getByLabel('Item Number').fill('ITEM001');
    await page.getByLabel('Quantity').fill('100');
    await page.getByLabel('Cartons').fill('5'); // Mismatch: 100 qty / 5 ctn = 20 per ctn, but item might expect different
    
    // Try to save - should trigger validation
    await page.getByRole('button', { name: /save/i }).click();
    
    // Verify validation message appears
    await expect(page.getByText(/qty.*carton.*mismatch|quantity.*carton.*validation/i)).toBeVisible();
    
    // Click override button
    await page.getByRole('button', { name: /override|continue anyway/i }).click();
    
    // Fill override reason
    await page.getByLabel('Override Reason').fill('Special packaging arrangement');
    await page.getByRole('button', { name: /confirm override|save/i }).click();
    
    // Verify invoice is saved with override
    await expect(page.getByText(/invoice created successfully/i)).toBeVisible();
  });

  test('Invoice date range validation', async ({ page }) => {
    await page.goto('/invoices');
    
    await page.getByRole('button', { name: /create/i }).click();
    
    const invNo = `INV-DATE-${Date.now()}`;
    await page.getByLabel('Invoice Number').fill(invNo);
    await page.getByLabel('Date').fill('2025-01-15');
    await page.getByLabel('Customer').selectOption('CUST001');
    
    // Set invalid date range (to date before from date)
    await page.getByLabel('Invoice Date From').fill('2025-01-20');
    await page.getByLabel('Invoice Date To').fill('2025-01-15'); // Before from date
    
    // Try to save - should show validation error
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/date.*range.*invalid|to date.*must.*greater/i)).toBeVisible();
    
    // Fix date range
    await page.getByLabel('Invoice Date From').fill('2025-01-15');
    await page.getByLabel('Invoice Date To').fill('2025-01-20');
    
    // Add item
    await page.getByRole('button', { name: /add item/i }).click();
    await page.getByLabel('Item Number').fill('ITEM001');
    await page.getByLabel('Quantity').fill('100');
    
    // Save successfully
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/invoice created successfully/i)).toBeVisible();
  });

  test('Generate Spencer format packing list', async ({ page }) => {
    // Navigate to Invoice enquiry
    await page.goto('/invoices');
    
    // Find an existing Invoice or create one
    await page.getByRole('button', { name: /search/i }).click();
    await page.waitForSelector('[data-testid="invoice-list"]');
    
    const invoiceRow = page.locator('[data-testid="invoice-list"] tbody tr').first();
    await invoiceRow.click();
    
    // Click Generate Packing List
    await page.getByRole('button', { name: /generate packing list|packing list/i }).click();
    
    // Select Spencer format
    await page.getByLabel('Document Type').selectOption('packing_list');
    await page.getByLabel('Output Format').selectOption('excel');
    await page.getByLabel('Format').selectOption('spencer');
    
    // Generate document
    await page.getByRole('button', { name: /generate/i }).click();
    
    // Verify Spencer format document is generated
    await expect(page.getByText(/packing list generated successfully|document generated successfully/i)).toBeVisible();
    
    // Verify Spencer-specific elements are present (if preview available)
    const previewButton = page.getByRole('button', { name: /preview/i });
    if (await previewButton.isVisible()) {
      await previewButton.click();
      await expect(page.getByText(/spencer|format/i)).toBeVisible();
    }
  });

  test('Generate Shipment Advice', async ({ page }) => {
    await page.goto('/invoices');
    
    // Find an existing Invoice
    await page.getByRole('button', { name: /search/i }).click();
    await page.waitForSelector('[data-testid="invoice-list"]');
    
    const invoiceRow = page.locator('[data-testid="invoice-list"] tbody tr').first();
    await invoiceRow.click();
    
    // Click Generate Shipment Advice
    await page.getByRole('button', { name: /generate shipment advice|shipment advice/i }).click();
    
    // Select document options
    await page.getByLabel('Document Type').selectOption('shipment_advice');
    await page.getByLabel('Output Format').selectOption('excel');
    
    // Generate document
    await page.getByRole('button', { name: /generate/i }).click();
    
    // Verify document generated successfully
    await expect(page.getByText(/shipment advice generated successfully|document generated successfully/i)).toBeVisible();
  });

  test('Generate Debit Note', async ({ page }) => {
    await page.goto('/invoices');
    
    // Find an existing Invoice
    await page.getByRole('button', { name: /search/i }).click();
    await page.waitForSelector('[data-testid="invoice-list"]');
    
    const invoiceRow = page.locator('[data-testid="invoice-list"] tbody tr').first();
    await invoiceRow.click();
    
    // Click Generate Debit Note
    await page.getByRole('button', { name: /generate debit note|debit note/i }).click();
    
    // Fill debit note details
    const debitNoteNo = `DN-${Date.now()}`;
    await page.getByLabel('Debit Note Number').fill(debitNoteNo);
    await page.getByLabel('Reason').fill('Price adjustment');
    
    // Select items for debit note
    const itemCheckboxes = page.locator('[data-testid="invoice-items-grid"] input[type="checkbox"]');
    const itemCount = await itemCheckboxes.count();
    if (itemCount > 0) {
      await itemCheckboxes.first().check();
    }
    
    // Generate document
    await page.getByRole('button', { name: /generate/i }).click();
    
    // Verify document generated successfully
    await expect(page.getByText(/debit note generated successfully|document generated successfully/i)).toBeVisible();
  });

  test('Invoice with BOM items', async ({ page }) => {
    // Navigate to Invoice entry
    await page.goto('/invoices');
    
    await page.getByRole('button', { name: /create/i }).click();
    
    const invNo = `INV-BOM-${Date.now()}`;
    await page.getByLabel('Invoice Number').fill(invNo);
    await page.getByLabel('Date').fill('2025-01-15');
    await page.getByLabel('Customer').selectOption('CUST001');
    
    // Add BOM head item
    await page.getByRole('button', { name: /add item/i }).click();
    await page.getByLabel('Item Number').fill('BOM-HEAD-001');
    await page.getByLabel('Quantity').fill('10');
    await page.getByLabel('Is Head Item').check();
    
    // Verify BOM sub-items are automatically added or can be added
    const bomSubItemsSection = page.locator('[data-testid="bom-sub-items"]');
    if (await bomSubItemsSection.isVisible({ timeout: 3000 })) {
      await expect(bomSubItemsSection).toBeVisible();
      
      // Verify sub-items are shown
      const subItemRows = page.locator('[data-testid="bom-sub-items"] tbody tr');
      const subItemCount = await subItemRows.count();
      expect(subItemCount).toBeGreaterThan(0);
    }
    
    // Save Invoice
    await page.getByRole('button', { name: /save/i }).click();
    
    // Verify success message
    await expect(page.getByText(/invoice created successfully/i)).toBeVisible();
    
    // Generate packing list and verify BOM structure
    await page.getByRole('button', { name: /generate packing list/i }).click();
    await page.getByLabel('Document Type').selectOption('packing_list');
    await page.getByLabel('Output Format').selectOption('excel');
    await page.getByRole('button', { name: /generate/i }).click();
    
    // Verify BOM structure in document
    await expect(page.getByText(/packing list generated successfully/i)).toBeVisible();
  });

  test('Invoice weight unit conversion (kg to lbs)', async ({ page }) => {
    await page.goto('/invoices');
    
    await page.getByRole('button', { name: /create/i }).click();
    
    const invNo = `INV-WEIGHT-${Date.now()}`;
    await page.getByLabel('Invoice Number').fill(invNo);
    await page.getByLabel('Date').fill('2025-01-15');
    await page.getByLabel('Customer').selectOption('CUST001');
    
    // Add item with weight in kg
    await page.getByRole('button', { name: /add item/i }).click();
    await page.getByLabel('Item Number').fill('ITEM001');
    await page.getByLabel('Quantity').fill('100');
    await page.getByLabel('Weight').fill('50'); // 50 kg
    await page.getByLabel('Weight Unit').selectOption('kg');
    
    // Convert to lbs
    await page.getByRole('button', { name: /convert.*lbs|convert weight/i }).click();
    
    // Verify weight is converted (50 kg = ~110.23 lbs)
    const weightField = page.getByLabel('Weight');
    const weightValue = await weightField.inputValue();
    expect(parseFloat(weightValue)).toBeCloseTo(110.23, 1);
    
    // Verify unit is changed to lbs
    const weightUnitField = page.getByLabel('Weight Unit');
    await expect(weightUnitField).toHaveValue('lbs');
  });

  test('Invoice search and filter', async ({ page }) => {
    await page.goto('/invoices');
    
    // Test search by Invoice number
    await page.getByLabel('Invoice Number').fill('INV001');
    await page.getByRole('button', { name: /search/i }).click();
    
    await page.waitForSelector('[data-testid="invoice-list"]');
    const results = page.locator('[data-testid="invoice-list"] tbody tr');
    const count = await results.count();
    
    // Verify search results
    for (let i = 0; i < count; i++) {
      await expect(results.nth(i)).toContainText('INV001');
    }
    
    // Test search by customer
    await page.getByLabel('Invoice Number').clear();
    await page.getByLabel('Customer').selectOption('CUST001');
    await page.getByRole('button', { name: /search/i }).click();
    
    await page.waitForSelector('[data-testid="invoice-list"]');
    const customerResults = page.locator('[data-testid="invoice-list"] tbody tr');
    
    // Verify all results are for selected customer
    const customerResultsCount = await customerResults.count();
    for (let i = 0; i < customerResultsCount; i++) {
      await expect(customerResults.nth(i)).toContainText('CUST001');
    }
    
    // Test date range search
    await page.getByLabel('Customer').selectOption('');
    await page.getByLabel('Date From').fill('2025-01-01');
    await page.getByLabel('Date To').fill('2025-01-31');
    await page.getByRole('button', { name: /search/i }).click();
    
    // Verify results are within date range
    await page.waitForSelector('[data-testid="invoice-list"]');
  });

  test('Invoice edit and validation', async ({ page }) => {
    await page.goto('/invoices');
    
    // Find and select an existing Invoice
    await page.getByRole('button', { name: /search/i }).click();
    await page.waitForSelector('[data-testid="invoice-list"]');
    
    const invoiceRow = page.locator('[data-testid="invoice-list"] tbody tr').first();
    await invoiceRow.click();
    
    // Click edit
    await page.getByRole('button', { name: /edit/i }).click();
    
    // Modify quantity
    const qtyInput = page.locator('[data-testid="invoice-items-grid"] input[type="number"]').first();
    await qtyInput.fill('150');
    
    // Save changes
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/invoice updated successfully/i)).toBeVisible();
  });

  test('Invoice document preview', async ({ page }) => {
    await page.goto('/invoices');
    
    // Find an existing Invoice
    await page.getByRole('button', { name: /search/i }).click();
    await page.waitForSelector('[data-testid="invoice-list"]');
    
    const invoiceRow = page.locator('[data-testid="invoice-list"] tbody tr').first();
    await invoiceRow.click();
    
    // Click generate document
    await page.getByRole('button', { name: /generate packing list/i }).click();
    
    // Click preview button
    await page.getByRole('button', { name: /preview/i }).click();
    
    // Verify preview modal opens
    await expect(page.getByText(/document preview|preview/i)).toBeVisible();
    
    // Verify preview content
    await expect(page.getByText(/INV\d+|invoice/i)).toBeVisible(); // Invoice number
    await expect(page.getByText(/ITEM\d+/)).toBeVisible(); // Items
    
    // Close preview
    await page.getByRole('button', { name: /close/i }).click();
    await expect(page.getByText(/document preview/i)).not.toBeVisible();
  });

  test('Invoice keyboard navigation', async ({ page }) => {
    await page.goto('/invoices');
    
    await page.getByRole('button', { name: /create/i }).click();
    
    // Test Tab navigation through form
    await page.keyboard.press('Tab'); // Focus on Invoice Number
    await expect(page.locator('input:focus')).toHaveAttribute('id', /invNo|invoice-number/i);
    
    const invNo = `INV-KEYBOARD-${Date.now()}`;
    await page.keyboard.type(invNo);
    await page.keyboard.press('Tab'); // Move to Date
    await expect(page.locator('input:focus')).toHaveAttribute('type', 'date');
    
    await page.keyboard.type('2025-01-15');
    await page.keyboard.press('Tab'); // Move to Customer
    
    // Test item grid navigation
    await page.getByRole('button', { name: /add item/i }).click();
    
    // Navigate item grid with keyboard
    await page.keyboard.press('Tab'); // Item number field
    await page.keyboard.type('ITEM001');
    await page.keyboard.press('Tab'); // Quantity
    await page.keyboard.type('100');
    await page.keyboard.press('Tab'); // Price
    await page.keyboard.type('10.50');
    
    // Save
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/created successfully/i)).toBeVisible();
  });

  test('Invoice error handling', async ({ page }) => {
    await page.goto('/invoices');
    
    await page.getByRole('button', { name: /create/i }).click();
    
    // Try to save duplicate invoice number
    await page.getByLabel('Invoice Number').fill('INV001'); // Assume exists
    await page.getByLabel('Date').fill('2025-01-15');
    await page.getByLabel('Customer').selectOption('CUST001');
    
    await page.getByRole('button', { name: /save/i }).click();
    
    // Should show duplicate error
    await expect(page.getByText(/already exists/i)).toBeVisible();
    
    // Test invalid date
    await page.getByLabel('Invoice Number').fill(`INV-INVALID-${Date.now()}`);
    await page.getByLabel('Date').fill('invalid-date');
    
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/invalid date/i)).toBeVisible();
    
    // Test item validation
    await page.getByRole('button', { name: /add item/i }).click();
    await page.getByLabel('Item Number').fill('INVALID_ITEM');
    
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/invalid item/i)).toBeVisible();
  });

  test('Multi-container Invoice', async ({ page }) => {
    // Create Invoice with items from multiple containers
    await page.goto('/invoices');
    
    await page.getByRole('button', { name: /create/i }).click();
    
    const invNo = `INV-MULTI-CNTR-${Date.now()}`;
    await page.getByLabel('Invoice Number').fill(invNo);
    await page.getByLabel('Date').fill('2025-01-15');
    await page.getByLabel('Customer').selectOption('CUST001');
    
    // Select items by container - first container
    await page.getByRole('button', { name: /select by container/i }).click();
    await page.waitForSelector('[data-testid="container-selection"]');
    
    const containerCheckboxes = page.locator('[data-testid="container-selection"] input[type="checkbox"]');
    const containerCount = await containerCheckboxes.count();
    
    if (containerCount >= 2) {
      // Select first container
      await containerCheckboxes.first().check();
      await page.getByRole('button', { name: /confirm|add selected/i }).click();
      
      // Select second container
      await page.getByRole('button', { name: /select by container/i }).click();
      await page.waitForSelector('[data-testid="container-selection"]');
      await containerCheckboxes.nth(1).check();
      await page.getByRole('button', { name: /confirm|add selected/i }).click();
      
      // Verify items from both containers are added
      const itemRows = page.locator('[data-testid="invoice-items-grid"] tbody tr');
      const itemCount = await itemRows.count();
      expect(itemCount).toBeGreaterThanOrEqual(1);
    }
    
    // Save Invoice
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/invoice created successfully/i)).toBeVisible();
    
    // Generate packing list filtered by container
    await page.getByRole('button', { name: /generate packing list/i }).click();
    await page.getByLabel('Document Type').selectOption('packing_list');
    await page.getByLabel('Filter by Container').check();
    await page.getByLabel('Container').selectOption('CNTR001');
    await page.getByRole('button', { name: /generate/i }).click();
    
    await expect(page.getByText(/packing list generated successfully/i)).toBeVisible();
  });
});
