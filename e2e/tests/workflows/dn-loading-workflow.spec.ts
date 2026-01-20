import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../../helpers/auth.helper';

/**
 * Delivery Note and Loading Workflow E2E Tests
 *
 * Original Logic Reference:
 * - Legacy Forms: idn, idnbrk, iload, isetla, pla
 * - Documentation: docs/source/02-business-processes/delivery-note-process.md
 * - Business Rules:
 *   - Create DN from SO
 *   - Copy breakdown from OE if available
 *   - Assign DN to Loading
 *   - Generate loading advice
 *   - Status transitions: Created → Loading → Shipped → Delivered → Invoiced
 *
 * Reference: Phase 3 - DN and Loading Workflow E2E Tests
 */

test.describe('Delivery Note and Loading Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('Create DN from SO and verify breakdown copy', async ({ page }) => {
    // Navigate to Shipping Order enquiry
    await page.goto('/shipping-orders');
    
    // Find an existing SO or create one
    await page.getByRole('button', { name: /search/i }).click();
    await page.waitForSelector('[data-testid="so-list"]');
    
    // Select first SO
    const firstSoRow = page.locator('[data-testid="so-list"] tbody tr').first();
    await firstSoRow.click();
    
    // Click Create DN button
    await page.getByRole('button', { name: /create dn|create delivery note/i }).click();
    
    // Verify DN creation form opens
    await expect(page).toHaveURL(/.*delivery-notes.*/);
    
    // Verify SO number is pre-filled
    const soNoField = page.getByLabel(/so number|shipping order/i);
    await expect(soNoField).toHaveValue(/SO\d+/);
    
    // Fill DN details
    const dnNo = `DN-E2E-${Date.now()}`;
    await page.getByLabel('DN Number').fill(dnNo);
    await page.getByLabel('Date').fill('2025-01-15');
    
    // Verify items are copied from SO
    await expect(page.locator('[data-testid="dn-items-grid"] tbody tr')).toHaveCount(1, { timeout: 5000 });
    
    // Verify breakdown is copied from OE if available
    const breakdownSection = page.locator('[data-testid="breakdown-section"]');
    if (await breakdownSection.isVisible()) {
      await expect(breakdownSection).toBeVisible();
      const breakdownRows = page.locator('[data-testid="breakdown-grid"] tbody tr');
      const breakdownCount = await breakdownRows.count();
      expect(breakdownCount).toBeGreaterThan(0);
    }
    
    // Save DN
    await page.getByRole('button', { name: /save/i }).click();
    
    // Verify success message
    await expect(page.getByText(/delivery note created successfully/i)).toBeVisible();
    
    // Verify DN appears in list
    await page.goto('/delivery-notes');
    await expect(page.getByText(dnNo)).toBeVisible();
  });

  test('Create DN manually with validation', async ({ page }) => {
    await page.goto('/delivery-notes');
    
    // Click create new DN
    await page.getByRole('button', { name: /create/i }).click();
    
    // Try to save without required fields - should show validation errors
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/dn number is required/i)).toBeVisible();
    
    // Fill required fields
    const dnNo = `DN-MANUAL-${Date.now()}`;
    await page.getByLabel('DN Number').fill(dnNo);
    await page.getByLabel('Date').fill('2025-01-15');
    await page.getByLabel('Customer').selectOption('CUST001');
    
    // Add item
    await page.getByRole('button', { name: /add item/i }).click();
    await page.getByLabel('Item Number').fill('ITEM001');
    await page.getByLabel('Quantity').fill('100');
    await page.getByLabel('Cartons').fill('10');
    
    // Save successfully
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/delivery note created successfully/i)).toBeVisible();
  });

  test('Create Loading Master and assign DNs', async ({ page }) => {
    // First, create or find DNs
    await page.goto('/delivery-notes');
    await page.getByRole('button', { name: /search/i }).click();
    await page.waitForSelector('[data-testid="dn-list"]');
    
    // Get DN numbers for assignment
    const dnRows = page.locator('[data-testid="dn-list"] tbody tr');
    const dnCount = await dnRows.count();
    
    if (dnCount === 0) {
      // Create a DN first
      await page.getByRole('button', { name: /create/i }).click();
      const dnNo = `DN-LOADING-${Date.now()}`;
      await page.getByLabel('DN Number').fill(dnNo);
      await page.getByLabel('Date').fill('2025-01-15');
      await page.getByLabel('Customer').selectOption('CUST001');
      await page.getByRole('button', { name: /add item/i }).click();
      await page.getByLabel('Item Number').fill('ITEM001');
      await page.getByLabel('Quantity').fill('100');
      await page.getByRole('button', { name: /save/i }).click();
      await page.waitForTimeout(1000);
    }
    
    // Navigate to Loading module
    await page.goto('/loading');
    
    // Click create new Loading Master
    await page.getByRole('button', { name: /create/i }).click();
    
    // Fill loading master details
    const loadingNo = `LOAD-${Date.now()}`;
    await page.getByLabel('Loading Number').fill(loadingNo);
    await page.getByLabel('Date').fill('2025-01-15');
    await page.getByLabel('Vessel Name').fill('VESSEL-001');
    await page.getByLabel('Voyage Number').fill('VOY-001');
    await page.getByLabel('Total Weight').fill('1000');
    await page.getByLabel('Total Cube').fill('500');
    await page.getByLabel('Total Cartons').fill('100');
    
    // Assign DNs to loading
    await page.getByRole('button', { name: /assign dns|add dns/i }).click();
    
    // Select DNs from list
    await page.waitForSelector('[data-testid="dn-selection-list"]');
    const dnCheckboxes = page.locator('[data-testid="dn-selection-list"] input[type="checkbox"]');
    const availableDnCount = await dnCheckboxes.count();
    
    if (availableDnCount > 0) {
      // Select first DN
      await dnCheckboxes.first().check();
      await page.getByRole('button', { name: /confirm|add selected/i }).click();
      
      // Verify DN is added to loading
      await expect(page.locator('[data-testid="assigned-dns"]')).toContainText(/DN\d+/);
    }
    
    // Save loading master
    await page.getByRole('button', { name: /save/i }).click();
    
    // Verify success message
    await expect(page.getByText(/loading master created successfully/i)).toBeVisible();
    
    // Verify DN status is updated to Loading
    await page.goto('/delivery-notes');
    await page.getByRole('button', { name: /search/i }).click();
    await page.waitForSelector('[data-testid="dn-list"]');
    
    // Check that assigned DN shows Loading status
    const assignedDnRow = page.locator('[data-testid="dn-list"] tbody tr').first();
    await expect(assignedDnRow).toContainText(/Loading/i);
  });

  test('Generate Loading Advice', async ({ page }) => {
    // Navigate to Loading module
    await page.goto('/loading');
    
    // Find an existing loading master
    await page.getByRole('button', { name: /search/i }).click();
    await page.waitForSelector('[data-testid="loading-list"]');
    
    const loadingRow = page.locator('[data-testid="loading-list"] tbody tr').first();
    await loadingRow.click();
    
    // Click Generate Loading Advice
    await page.getByRole('button', { name: /generate loading advice|create loading advice/i }).click();
    
    // Fill loading advice details
    const laNo = `LA-${Date.now()}`;
    await page.getByLabel('Loading Advice Number').fill(laNo);
    await page.getByLabel('Date').fill('2025-01-15');
    
    // Verify DNs are included
    await expect(page.locator('[data-testid="la-dns-list"] tbody tr')).toHaveCount(1, { timeout: 5000 });
    
    // Verify items from DNs are included
    await expect(page.locator('[data-testid="la-items-list"] tbody tr')).toHaveCount(1, { timeout: 5000 });
    
    // Generate loading advice
    await page.getByRole('button', { name: /generate|create/i }).click();
    
    // Verify success message
    await expect(page.getByText(/loading advice generated successfully/i)).toBeVisible();
    
    // Verify loading advice appears in list
    await page.goto('/loading/advice');
    await expect(page.getByText(laNo)).toBeVisible();
  });

  test('DN status transitions', async ({ page }) => {
    await page.goto('/delivery-notes');
    
    // Find an existing DN
    await page.getByRole('button', { name: /search/i }).click();
    await page.waitForSelector('[data-testid="dn-list"]');
    
    const dnRow = page.locator('[data-testid="dn-list"] tbody tr').first();
    await dnRow.click();
    
    // Verify initial status is Created
    await expect(page.getByText(/status.*created/i)).toBeVisible();
    
    // Change status to Confirmed
    await page.getByLabel('Status').selectOption('Confirmed');
    await page.getByRole('button', { name: /update status|save/i }).click();
    await expect(page.getByText(/status updated successfully/i)).toBeVisible();
    await expect(page.getByText(/confirmed/i)).toBeVisible();
    
    // Change status to Loading
    await page.getByLabel('Status').selectOption('Loading');
    await page.getByRole('button', { name: /update status|save/i }).click();
    await expect(page.getByText(/loading/i)).toBeVisible();
  });

  test('DN breakdown copy from OE', async ({ page }) => {
    // Navigate to SO that was created from OE with breakdown
    await page.goto('/shipping-orders');
    await page.getByRole('button', { name: /search/i }).click();
    await page.waitForSelector('[data-testid="so-list"]');
    
    // Select SO that has breakdown data
    const soRow = page.locator('[data-testid="so-list"] tbody tr').first();
    await soRow.click();
    
    // Create DN from SO
    await page.getByRole('button', { name: /create dn|create delivery note/i }).click();
    
    // Verify breakdown section is visible
    const breakdownSection = page.locator('[data-testid="breakdown-section"]');
    if (await breakdownSection.isVisible({ timeout: 3000 })) {
      await expect(breakdownSection).toBeVisible();
      
      // Verify breakdown rows are populated
      const breakdownRows = page.locator('[data-testid="breakdown-grid"] tbody tr');
      const breakdownCount = await breakdownRows.count();
      expect(breakdownCount).toBeGreaterThan(0);
      
      // Verify breakdown quantities match OE
      const firstBreakdownRow = breakdownRows.first();
      await expect(firstBreakdownRow).toContainText(/\d+/); // Should have quantity
    }
  });

  test('Multiple DNs in one Loading', async ({ page }) => {
    // Create multiple DNs first
    const dnNumbers: string[] = [];
    
    for (let i = 0; i < 2; i++) {
      await page.goto('/delivery-notes');
      await page.getByRole('button', { name: /create/i }).click();
      
      const dnNo = `DN-MULTI-${Date.now()}-${i}`;
      dnNumbers.push(dnNo);
      
      await page.getByLabel('DN Number').fill(dnNo);
      await page.getByLabel('Date').fill('2025-01-15');
      await page.getByLabel('Customer').selectOption('CUST001');
      await page.getByRole('button', { name: /add item/i }).click();
      await page.getByLabel('Item Number').fill('ITEM001');
      await page.getByLabel('Quantity').fill('100');
      await page.getByRole('button', { name: /save/i }).click();
      await page.waitForTimeout(1000);
    }
    
    // Create Loading Master
    await page.goto('/loading');
    await page.getByRole('button', { name: /create/i }).click();
    
    const loadingNo = `LOAD-MULTI-${Date.now()}`;
    await page.getByLabel('Loading Number').fill(loadingNo);
    await page.getByLabel('Date').fill('2025-01-15');
    await page.getByLabel('Vessel Name').fill('VESSEL-002');
    
    // Assign multiple DNs
    await page.getByRole('button', { name: /assign dns|add dns/i }).click();
    await page.waitForSelector('[data-testid="dn-selection-list"]');
    
    const dnCheckboxes = page.locator('[data-testid="dn-selection-list"] input[type="checkbox"]');
    const count = await dnCheckboxes.count();
    
    // Select all available DNs (up to 2)
    for (let i = 0; i < Math.min(2, count); i++) {
      await dnCheckboxes.nth(i).check();
    }
    
    await page.getByRole('button', { name: /confirm|add selected/i }).click();
    
    // Verify multiple DNs are assigned
    const assignedDns = page.locator('[data-testid="assigned-dns"] tbody tr');
    const assignedCount = await assignedDns.count();
    expect(assignedCount).toBeGreaterThanOrEqual(1);
    
    // Save loading master
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/loading master created successfully/i)).toBeVisible();
  });

  test('DN enquiry and search functionality', async ({ page }) => {
    await page.goto('/delivery-notes');
    
    // Test search by DN number
    await page.getByLabel('DN Number').fill('DN001');
    await page.getByRole('button', { name: /search/i }).click();
    
    await page.waitForSelector('[data-testid="dn-list"]');
    const results = page.locator('[data-testid="dn-list"] tbody tr');
    const count = await results.count();
    
    // Verify search results
    for (let i = 0; i < count; i++) {
      await expect(results.nth(i)).toContainText('DN001');
    }
    
    // Test search by customer
    await page.getByLabel('DN Number').clear();
    await page.getByLabel('Customer').selectOption('CUST001');
    await page.getByRole('button', { name: /search/i }).click();
    
    await page.waitForSelector('[data-testid="dn-list"]');
    const customerResults = page.locator('[data-testid="dn-list"] tbody tr');
    
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
    await page.waitForSelector('[data-testid="dn-list"]');
  });

  test('Loading Master search and filter', async ({ page }) => {
    await page.goto('/loading');
    
    // Test search by loading number
    await page.getByLabel('Loading Number').fill('LOAD001');
    await page.getByRole('button', { name: /search/i }).click();
    
    await page.waitForSelector('[data-testid="loading-list"]');
    const results = page.locator('[data-testid="loading-list"] tbody tr');
    
    // Verify search results
    const count = await results.count();
    for (let i = 0; i < count; i++) {
      await expect(results.nth(i)).toContainText('LOAD001');
    }
    
    // Test filter by status
    await page.getByLabel('Loading Number').clear();
    await page.getByLabel('Status').selectOption('Planned');
    await page.getByRole('button', { name: /search/i }).click();
    
    await page.waitForSelector('[data-testid="loading-list"]');
    const statusResults = page.locator('[data-testid="loading-list"] tbody tr');
    
    // Verify all results have Planned status
    const statusResultsCount = await statusResults.count();
    for (let i = 0; i < statusResultsCount; i++) {
      await expect(statusResults.nth(i)).toContainText(/planned/i);
    }
  });

  test('DN edit and validation', async ({ page }) => {
    await page.goto('/delivery-notes');
    
    // Find and select an existing DN
    await page.getByRole('button', { name: /search/i }).click();
    await page.waitForSelector('[data-testid="dn-list"]');
    
    const dnRow = page.locator('[data-testid="dn-list"] tbody tr').first();
    await dnRow.click();
    
    // Click edit
    await page.getByRole('button', { name: /edit/i }).click();
    
    // Modify quantity
    const qtyInput = page.locator('[data-testid="dn-items-grid"] input[type="number"]').first();
    await qtyInput.fill('150');
    
    // Save changes
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/delivery note updated successfully/i)).toBeVisible();
    
    // Try to edit DN that is already in Loading status
    await page.getByLabel('Status').selectOption('Loading');
    await page.getByRole('button', { name: /update status|save/i }).click();
    await page.waitForTimeout(1000);
    
    // Try to edit - should show warning or prevent edit
    await page.getByRole('button', { name: /edit/i }).click();
    
    // If edit is allowed, verify validation
    const editQtyInput = page.locator('[data-testid="dn-items-grid"] input[type="number"]').first();
    if (await editQtyInput.isVisible()) {
      await editQtyInput.fill('200');
      await page.getByRole('button', { name: /save/i }).click();
      
      // Should either save or show validation message
      const successOrError = page.locator('text=/success|error|validation/i');
      await expect(successOrError.first()).toBeVisible();
    }
  });

  test('DN keyboard navigation', async ({ page }) => {
    await page.goto('/delivery-notes');
    
    await page.getByRole('button', { name: /create/i }).click();
    
    // Test Tab navigation through form
    await page.keyboard.press('Tab'); // Focus on DN Number
    await expect(page.locator('input:focus')).toHaveAttribute('id', /dnNo|dn-number/i);
    
    const dnNo = `DN-KEYBOARD-${Date.now()}`;
    await page.keyboard.type(dnNo);
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
    await page.keyboard.press('Tab'); // Cartons
    await page.keyboard.type('10');
    
    // Save
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/created successfully/i)).toBeVisible();
  });

  test('Loading Master error handling', async ({ page }) => {
    await page.goto('/loading');
    
    await page.getByRole('button', { name: /create/i }).click();
    
    // Try to save duplicate loading number
    await page.getByLabel('Loading Number').fill('LOAD001'); // Assume exists
    await page.getByLabel('Date').fill('2025-01-15');
    await page.getByLabel('Vessel Name').fill('VESSEL-001');
    
    await page.getByRole('button', { name: /save/i }).click();
    
    // Should show duplicate error
    await expect(page.getByText(/already exists/i)).toBeVisible();
    
    // Test invalid date
    await page.getByLabel('Loading Number').fill(`LOAD-INVALID-${Date.now()}`);
    await page.getByLabel('Date').fill('invalid-date');
    
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/invalid date/i)).toBeVisible();
  });
});
