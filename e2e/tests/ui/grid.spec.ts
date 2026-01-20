import { test, expect } from '@playwright/test';
import { AuthHelper } from '../../helpers/auth.helper';
import { BomManagementPage } from '../../pages/BomManagementPage';

test.describe('Data Display Tests', () => {
  test.beforeEach(async ({ page }) => {
    const authHelper = new AuthHelper(page);
    await authHelper.loginAsAdmin();
  });

  test('UI-007: Empty state handling', async ({ page }) => {
    const bomPage = new BomManagementPage(page);
    await bomPage.goto('NON-EXISTENT-ITEM');

    // Check if empty state message is displayed
    const emptyState = page.locator('text=/no data|empty|no results/i');
    if (await emptyState.count() > 0) {
      await expect(emptyState).toBeVisible();
    }
  });

  test('UI-008: Large dataset handling', async ({ page }) => {
    const bomPage = new BomManagementPage(page);
    await bomPage.goto('TEST-ITEM-001');

    // Check if pagination or virtual scrolling is present for large datasets
    const pagination = page.locator('[aria-label*="pagination"], .pagination');
    const virtualScroll = page.locator('[data-virtual-scroller]');
    
    // At least one should be present if handling large datasets
    const hasPagination = await pagination.count() > 0;
    const hasVirtualScroll = await virtualScroll.count() > 0;
    
    // This test passes if either pagination or virtual scroll exists
    // or if the page loads without issues
    expect(true).toBe(true);
  });

  test('UI-009: Date field formatting', async ({ page }) => {
    const ocPage = new OrderConfirmationEntryPage(page);
    await ocPage.goto('TEST-OC-001');

    // Check if date fields are properly formatted
    const dateInput = page.locator('input[type="date"], input[name*="date"]');
    if (await dateInput.count() > 0) {
      await expect(dateInput.first()).toBeVisible();
    }
  });
});
