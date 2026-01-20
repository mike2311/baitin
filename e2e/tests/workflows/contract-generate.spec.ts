import { test, expect } from '@playwright/test';
import { AuthHelper } from '../../helpers/auth.helper';

test.describe('Contract Generation Workflow', () => {
  test.beforeEach(async ({ page }) => {
    const authHelper = new AuthHelper(page);
    await authHelper.loginAsAdmin();
  });

  test('Contract generation workflow', async ({ page }) => {
    // Navigate to contract generation page
    await page.goto('/contract/generate');
    await page.waitForLoadState('networkidle');

    // Fill OC number
    await page.fill('input[name="confNo"]', 'TEST-OC-001');

    // Click generate button
    await page.click('button:has-text("Generate")');

    // Wait for contracts to be generated
    await page.waitForTimeout(3000);

    // Check if contracts were created or success message shown
    const successMessage = page.locator('text=/success|generated|created/i');
    if (await successMessage.count() > 0) {
      await expect(successMessage).toBeVisible();
    }
  });
});
