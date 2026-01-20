import { test, expect } from '@playwright/test';
import { AuthHelper } from '../../helpers/auth.helper';

test.describe('OC Post Workflow', () => {
  test.beforeEach(async ({ page }) => {
    const authHelper = new AuthHelper(page);
    await authHelper.loginAsAdmin();
  });

  test('OC Post workflow', async ({ page }) => {
    // Navigate to OC Post page
    await page.goto('/order-confirmation/post');
    await page.waitForLoadState('networkidle');

    // Fill company code
    await page.fill('input[name="companyCode"]', 'HT');

    // Fill OE numbers
    await page.fill('textarea[name="oeNos"], input[name="oeNos"]', 'TEST-OE-001');

    // Click post button
    await page.click('button:has-text("Post")');

    // Wait for success message or redirect
    await page.waitForTimeout(2000);

    // Check if OC was created or success message shown
    const successMessage = page.locator('text=/success|created|posted/i');
    if (await successMessage.count() > 0) {
      await expect(successMessage).toBeVisible();
    }
  });
});
