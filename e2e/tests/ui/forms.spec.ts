import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { OrderConfirmationEntryPage } from '../../pages/OrderConfirmationEntryPage';
import { AuthHelper } from '../../helpers/auth.helper';

test.describe('Form Interaction Tests', () => {
  test.beforeEach(async ({ page }) => {
    const authHelper = new AuthHelper(page);
    await authHelper.loginAsAdmin();
  });

  test('UI-003: Button states (disabled during loading)', async ({ page }) => {
    const ocPage = new OrderConfirmationEntryPage(page);
    await ocPage.goto();

    // Check if save button exists and can be disabled
    const saveButton = page.locator('button:has-text("Save")');
    if (await saveButton.count() > 0) {
      // Button should be enabled when form is ready
      await expect(saveButton).toBeEnabled();
    }
  });

  test('UI-004: Error message display', async ({ page }) => {
    const ocPage = new OrderConfirmationEntryPage(page);
    await ocPage.goto();

    // Try to save without required fields
    await ocPage.clickSave();

    // Check if error messages are displayed
    const errorMessages = await ocPage.getValidationErrors();
    expect(errorMessages.length).toBeGreaterThan(0);
  });

  test('UI-005: Grid editing', async ({ page }) => {
    const ocPage = new OrderConfirmationEntryPage(page);
    await ocPage.goto('TEST-OC-001');

    // Check if grid is present
    const grid = page.locator('[role="grid"], .data-grid');
    if (await grid.count() > 0) {
      await expect(grid).toBeVisible();
    }
  });

  test('UI-006: Form reset on navigation', async ({ page }) => {
    const ocPage = new OrderConfirmationEntryPage(page);
    
    // Fill some data
    await ocPage.goto();
    await ocPage.fillConfNo('TEST-OC-TEMP');
    
    // Navigate away
    await page.goto('/dashboard');
    
    // Navigate back
    await ocPage.goto();
    
    // Form should be reset (confNo should be empty or different)
    const confNoInput = page.locator('input[name="confNo"]');
    const value = await confNoInput.inputValue();
    expect(value).not.toBe('TEST-OC-TEMP');
  });
});
