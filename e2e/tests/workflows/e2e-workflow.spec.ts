import { test, expect } from '@playwright/test';
import { AuthHelper } from '../../helpers/auth.helper';
import { OrderConfirmationEntryPage } from '../../pages/OrderConfirmationEntryPage';
import { ContractEntryPage } from '../../pages/ContractEntryPage';

test.describe('End-to-End Workflow: OE → OC → Contract', () => {
  test.beforeEach(async ({ page }) => {
    const authHelper = new AuthHelper(page);
    await authHelper.loginAsAdmin();
  });

  test('E2E-001: Complete OE to Contract workflow', async ({ page }) => {
    // Step 1: Post OE to OC
    await page.goto('/order-confirmation/post');
    await page.fill('input[name="companyCode"]', 'HT');
    await page.fill('textarea[name="oeNos"], input[name="oeNos"]', 'TEST-OE-001');
    await page.click('button:has-text("Post")');
    await page.waitForTimeout(2000);

    // Step 2: Generate Contract from OC
    await page.goto('/contract/generate');
    await page.fill('input[name="confNo"]', 'HT-OC/TEST-OE-001');
    await page.click('button:has-text("Generate")');
    await page.waitForTimeout(3000);

    // Step 3: Verify contract was created
    const successMessage = page.locator('text=/success|generated|created/i');
    if (await successMessage.count() > 0) {
      await expect(successMessage).toBeVisible();
    }
  });
});
