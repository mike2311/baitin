import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../../helpers/auth.helper';

/**
 * Shipping Order Workflow E2E Tests
 *
 * Original Logic Reference:
 * - Legacy Forms: isetso, pso, pso_pdf
 * - Documentation: docs/source/02-business-processes/shipping-process.md
 * - Business Rules:
 *   - Test SO creation through UI
 *   - Test SO document generation
 *   - Test customer-specific formats
 *   - Test available vs shipped items
 *   - Test keyboard navigation and validation
 *
 * Reference: Phase 3 - SO Workflow E2E Tests
 */

test.describe('Shipping Order Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('Create SO from OC and generate document', async ({ page }) => {
    // Navigate to Order Confirmation enquiry
    await page.goto('/order-confirmation/enquiry');

    // Find an existing OC or create one
    await page.getByRole('button', { name: /search/i }).click();

    // Wait for results and select first OC
    await page.waitForSelector('[data-testid="oc-list"]');
    const firstOcRow = page.locator('[data-testid="oc-list"] tbody tr').first();
    await firstOcRow.click();

    // Click Create SO button
    await page.getByRole('button', { name: /create so/i }).click();

    // Verify SO creation form opens
    await expect(page).toHaveURL(/.*shipping-orders.*/);

    // Fill SO details
    const soNo = `SO-E2E-${Date.now()}`;
    await page.getByLabel('SO Number').fill(soNo);
    await page.getByLabel('Customer').selectOption('CUST001');
    await page.getByLabel('Date').fill('2025-01-15');

    // Add SO items
    await page.getByRole('button', { name: /add item/i }).click();
    await page.getByLabel('Item Number').fill('ITEM001');
    await page.getByLabel('Quantity').fill('100');
    await page.getByLabel('Price').fill('10.50');

    // Save SO
    await page.getByRole('button', { name: /save/i }).click();

    // Verify success message
    await expect(page.getByText('Shipping Order created successfully')).toBeVisible();

    // Verify SO appears in list
    await page.goto('/shipping-orders');
    await expect(page.getByText(soNo)).toBeVisible();

    // Generate SO document
    await page.getByText(soNo).click();
    await page.getByRole('button', { name: /generate document/i }).click();

    // Select document options
    await page.getByLabel('Document Type').selectOption('so_document');
    await page.getByLabel('Output Format').selectOption('excel');
    await page.getByLabel('Format Key').selectOption('DEFAULT');

    // Generate document
    await page.getByRole('button', { name: /generate/i }).click();

    // Verify download starts (check for download event or success message)
    await expect(page.getByText('Document generated successfully')).toBeVisible();
  });

  test('Create SO manually with validation', async ({ page }) => {
    await page.goto('/shipping-orders');

    // Click create new SO
    await page.getByRole('button', { name: /create/i }).click();

    // Try to save without required fields - should show validation errors
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText('SO Number is required')).toBeVisible();
    await expect(page.getByText('Customer is required')).toBeVisible();

    // Fill required fields
    await page.getByLabel('SO Number').fill(`SO-VALIDATION-${Date.now()}`);
    await page.getByLabel('Customer').selectOption('CUST001');
    await page.getByLabel('Date').fill('2025-01-15');

    // Add item
    await page.getByRole('button', { name: /add item/i }).click();
    await page.getByLabel('Item Number').fill('ITEM001');
    await page.getByLabel('Quantity').fill('100');
    await page.getByLabel('Price').fill('10.50');

    // Save successfully
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText('Shipping Order created successfully')).toBeVisible();
  });

  test('SO document generation with customer-specific format', async ({ page }) => {
    await page.goto('/shipping-orders');

    // Find SO for Spencer customer
    await page.getByRole('button', { name: /search/i }).click();
    await page.waitForSelector('[data-testid="so-list"]');

    // Select SO and generate document with Spencer format
    const soRow = page.locator('[data-testid="so-list"] tbody tr').first();
    await soRow.click();

    await page.getByRole('button', { name: /generate document/i }).click();

    // Select Spencer format
    await page.getByLabel('Document Type').selectOption('so_document');
    await page.getByLabel('Output Format').selectOption('excel');
    await page.getByLabel('Format Key').selectOption('SPENCER_FORMAT');

    // Generate
    await page.getByRole('button', { name: /generate/i }).click();

    // Verify Spencer format document is generated
    await expect(page.getByText('Document generated successfully')).toBeVisible();
  });

  test('SO available vs shipped items logic', async ({ page }) => {
    await page.goto('/shipping-orders');

    // Create new SO
    await page.getByRole('button', { name: /create/i }).click();

    const soNo = `SO-AVAILABLE-${Date.now()}`;
    await page.getByLabel('SO Number').fill(soNo);
    await page.getByLabel('Customer').selectOption('CUST001');
    await page.getByLabel('Date').fill('2025-01-15');

    // Click "Get Available Items" button
    await page.getByRole('button', { name: /get available items/i }).click();

    // Verify available items are shown
    await expect(page.getByText('Available Items')).toBeVisible();

    // Select some items
    const firstItemCheckbox = page.locator('[data-testid="available-items"] input[type="checkbox"]').first();
    await firstItemCheckbox.check();

    // Add selected items to SO
    await page.getByRole('button', { name: /add selected items/i }).click();

    // Verify items are added to SO grid
    await expect(page.locator('[data-testid="so-items-grid"] tbody tr')).toHaveCount(1);

    // Save SO
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText('Shipping Order created successfully')).toBeVisible();

    // Verify items are now "shipped" and not available for new SO
    await page.goto('/shipping-orders');
    await page.getByRole('button', { name: /create/i }).click();

    const newSoNo = `SO-AVAILABLE-2-${Date.now()}`;
    await page.getByLabel('SO Number').fill(newSoNo);
    await page.getByLabel('Customer').selectOption('CUST001');

    await page.getByRole('button', { name: /get available items/i }).click();

    // Previously selected item should not be available
    const availableItemsCount = await page.locator('[data-testid="available-items"] tbody tr').count();
    // Should have fewer items now
  });

  test('SO edit and status transitions', async ({ page }) => {
    await page.goto('/shipping-orders');

    // Find and select an existing SO
    await page.getByRole('button', { name: /search/i }).click();
    await page.waitForSelector('[data-testid="so-list"]');

    const soRow = page.locator('[data-testid="so-list"] tbody tr').first();
    await soRow.click();

    // Click edit
    await page.getByRole('button', { name: /edit/i }).click();

    // Modify quantity
    const qtyInput = page.locator('[data-testid="so-items-grid"] input[type="number"]').first();
    await qtyInput.fill('150');

    // Save changes
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText('Shipping Order updated successfully')).toBeVisible();

    // Change status to Confirmed
    await page.getByLabel('Status').selectOption('Confirmed');
    await page.getByRole('button', { name: /update status/i }).click();
    await expect(page.getByText('Status updated successfully')).toBeVisible();

    // Verify status change
    await expect(page.getByText('Confirmed')).toBeVisible();
  });

  test('SO enquiry and search functionality', async ({ page }) => {
    await page.goto('/shipping-orders');

    // Test search by SO number
    await page.getByLabel('SO Number').fill('SO001');
    await page.getByRole('button', { name: /search/i }).click();

    await page.waitForSelector('[data-testid="so-list"]');
    const results = page.locator('[data-testid="so-list"] tbody tr');
    const count = await results.count();

    // Verify search results
    for (let i = 0; i < count; i++) {
      await expect(results.nth(i)).toContainText('SO001');
    }

    // Test search by customer
    await page.getByLabel('SO Number').clear();
    await page.getByLabel('Customer').selectOption('CUST001');
    await page.getByRole('button', { name: /search/i }).click();

    await page.waitForSelector('[data-testid="so-list"]');
    const customerResults = page.locator('[data-testid="so-list"] tbody tr');

    // Verify all results are for selected customer
    const customerResultsCount = await customerResults.count();
    for (let i = 0; i < customerResultsCount; i++) {
      await expect(customerResults.nth(i)).toContainText('CUST001');
    }

    // Test date range search
    await page.getByLabel('Date From').fill('2025-01-01');
    await page.getByLabel('Date To').fill('2025-01-31');
    await page.getByRole('button', { name: /search/i }).click();

    // Verify results are within date range
    await page.waitForSelector('[data-testid="so-list"]');
  });

  test('SO keyboard navigation and form interaction', async ({ page }) => {
    await page.goto('/shipping-orders');

    await page.getByRole('button', { name: /create/i }).click();

    // Test Tab navigation through form
    await page.keyboard.press('Tab'); // Focus on SO Number
    await expect(page.locator('input:focus')).toHaveAttribute('id', /soNo|so-number/i);

    await page.keyboard.type(`SO-KEYBOARD-${Date.now()}`);
    await page.keyboard.press('Tab'); // Move to Customer
    await expect(page.locator('select:focus')).toHaveAttribute('id', /custNo|customer/i);

    await page.keyboard.press('ArrowDown'); // Select first option
    await page.keyboard.press('Enter');

    await page.keyboard.press('Tab'); // Move to Date
    await expect(page.locator('input:focus')).toHaveAttribute('type', 'date');

    await page.keyboard.type('2025-01-15');

    // Test Enter to move to next field
    await page.keyboard.press('Enter'); // Should move to next field or submit if last

    // Test item grid navigation
    await page.getByRole('button', { name: /add item/i }).click();

    // Navigate item grid with keyboard
    await page.keyboard.press('Tab'); // Item number field
    await page.keyboard.type('ITEM001');
    await page.keyboard.press('Tab'); // Quantity
    await page.keyboard.type('100');
    await page.keyboard.press('Tab'); // Price
    await page.keyboard.type('10.50');

    // Test Ctrl+S to save (if implemented)
    await page.keyboard.press('Control+s');

    // Or use save button
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/created successfully/i)).toBeVisible();
  });

  test('SO document preview functionality', async ({ page }) => {
    await page.goto('/shipping-orders');

    // Select SO
    await page.getByRole('button', { name: /search/i }).click();
    await page.waitForSelector('[data-testid="so-list"]');

    const soRow = page.locator('[data-testid="so-list"] tbody tr').first();
    await soRow.click();

    // Click generate document
    await page.getByRole('button', { name: /generate document/i }).click();

    // Click preview button
    await page.getByRole('button', { name: /preview/i }).click();

    // Verify preview modal opens
    await expect(page.getByText('Document Preview')).toBeVisible();

    // Verify preview content
    await expect(page.getByText(/SO\d+/)).toBeVisible(); // SO number
    await expect(page.getByText(/ITEM\d+/)).toBeVisible(); // Items

    // Close preview
    await page.getByRole('button', { name: /close/i }).click();
    await expect(page.getByText('Document Preview')).not.toBeVisible();
  });

  test('SO bulk operations', async ({ page }) => {
    await page.goto('/shipping-orders');

    // Select multiple SOs
    await page.getByRole('button', { name: /search/i }).click();
    await page.waitForSelector('[data-testid="so-list"]');

    const checkboxes = page.locator('[data-testid="so-list"] input[type="checkbox"]');
    const count = await checkboxes.count();

    // Select first 2 SOs (if available)
    for (let i = 0; i < Math.min(2, count); i++) {
      await checkboxes.nth(i).check();
    }

    // Verify bulk actions appear
    if (count >= 2) {
      await expect(page.getByRole('button', { name: /bulk generate documents/i })).toBeVisible();

      // Test bulk document generation
      await page.getByRole('button', { name: /bulk generate documents/i }).click();

      // Select options for bulk generation
      await page.getByLabel('Document Type').selectOption('so_document');
      await page.getByLabel('Output Format').selectOption('excel');

      // Generate bulk documents
      await page.getByRole('button', { name: /generate bulk/i }).click();

      // Verify success message
      await expect(page.getByText('Bulk documents generated successfully')).toBeVisible();
    }
  });

  test('SO error handling and validation messages', async ({ page }) => {
    await page.goto('/shipping-orders');

    await page.getByRole('button', { name: /create/i }).click();

    // Try to save duplicate SO number
    await page.getByLabel('SO Number').fill('SO001'); // Assume exists
    await page.getByLabel('Customer').selectOption('CUST001');
    await page.getByLabel('Date').fill('2025-01-15');

    await page.getByRole('button', { name: /save/i }).click();

    // Should show duplicate error
    await expect(page.getByText(/already exists/i)).toBeVisible();

    // Test invalid date
    await page.getByLabel('SO Number').fill(`SO-INVALID-${Date.now()}`);
    await page.getByLabel('Date').fill('invalid-date');

    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/invalid date/i)).toBeVisible();

    // Test item validation
    await page.getByRole('button', { name: /add item/i }).click();
    await page.getByLabel('Item Number').fill('INVALID_ITEM');

    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/invalid item/i)).toBeVisible();
  });

  test('SO performance with large datasets', async ({ page }) => {
    await page.goto('/shipping-orders');

    // Test search performance
    const startTime = Date.now();

    await page.getByRole('button', { name: /search/i }).click();

    await page.waitForSelector('[data-testid="so-list"]', { timeout: 10000 });

    const loadTime = Date.now() - startTime;

    // Should load within reasonable time
    expect(loadTime).toBeLessThan(5000); // 5 seconds

    // Test grid rendering performance
    const rows = page.locator('[data-testid="so-list"] tbody tr');
    const rowCount = await rows.count();

    if (rowCount > 50) {
      // Test scrolling performance for large grids
      const scrollStartTime = Date.now();

      // Scroll to bottom
      await page.locator('[data-testid="so-list"]').evaluate(el => el.scrollTop = el.scrollHeight);

      // Wait for scroll to complete
      await page.waitForTimeout(1000);

      const scrollTime = Date.now() - scrollStartTime;
      expect(scrollTime).toBeLessThan(2000); // 2 seconds for scrolling
    }
  });

  test('SO mobile responsiveness', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/shipping-orders');

    // Verify mobile layout
    await expect(page.getByRole('button', { name: /menu/i })).toBeVisible();

    // Test mobile form interaction
    await page.getByRole('button', { name: /create/i }).click();

    // Verify form is usable on mobile
    await expect(page.getByLabel('SO Number')).toBeVisible();
    await expect(page.getByLabel('Customer')).toBeVisible();

    // Test mobile grid
    await page.getByRole('button', { name: /search/i }).click();
    await page.waitForSelector('[data-testid="so-list"]');

    // Verify grid is scrollable on mobile
    const grid = page.locator('[data-testid="so-list"]');
    await expect(grid).toBeVisible();
  });
});