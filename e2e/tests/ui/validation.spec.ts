import { test, expect } from '@playwright/test';
import { AuthHelper } from '../../helpers/auth.helper';
import { OrderConfirmationEntryPage } from '../../pages/OrderConfirmationEntryPage';
import { ContractEntryPage } from '../../pages/ContractEntryPage';

test.describe('Form Validation Tests', () => {
  test.beforeEach(async ({ page }) => {
    const authHelper = new AuthHelper(page);
    await authHelper.loginAsAdmin();
  });

  test('Form validation errors', async ({ page }) => {
    const ocPage = new OrderConfirmationEntryPage(page);
    await ocPage.goto();

    // Try to save without required fields
    await ocPage.clickSave();

    // Should show validation errors
    const errors = await ocPage.getValidationErrors();
    expect(errors.length).toBeGreaterThan(0);
  });

  test('Field-level validations', async ({ page }) => {
    const ocPage = new OrderConfirmationEntryPage(page);
    await ocPage.goto();

    // Try invalid date format
    await ocPage.fillDate('invalid-date');
    await ocPage.clickSave();

    // Should show date validation error
    const errors = await ocPage.getValidationErrors();
    const hasDateError = errors.some(e => e.toLowerCase().includes('date'));
    expect(hasDateError).toBe(true);
  });
});
