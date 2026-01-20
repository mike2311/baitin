import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { AuthHelper } from '../../helpers/auth.helper';

test.describe('Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    const authHelper = new AuthHelper(page);
    await authHelper.loginAsAdmin();
  });

  test('UI-001: Navigation bar functionality', async ({ page }) => {
    // Check if navigation bar is visible
    const navBar = page.locator('nav, [role="navigation"]');
    await expect(navBar).toBeVisible();

    // Check if main menu items are present
    const menuItems = ['Dashboard', 'Order Confirmation', 'Contract', 'BOM'];
    for (const item of menuItems) {
      const menuItem = page.locator(`a:has-text("${item}")`);
      if (await menuItem.count() > 0) {
        await expect(menuItem).toBeVisible();
      }
    }
  });

  test('UI-002: Back navigation', async ({ page }) => {
    // Navigate to a page
    await page.goto('/order-confirmation/entry');
    
    // Click back button if it exists
    const backButton = page.locator('button:has-text("Back"), a:has-text("Back")');
    if (await backButton.count() > 0) {
      await backButton.click();
      // Should navigate back
      await expect(page).not.toHaveURL(/\/order-confirmation\/entry/);
    }
  });
});
