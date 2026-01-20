import { test, expect } from '@playwright/test';
import { AuthHelper } from '../../helpers/auth.helper';

test.describe('Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    const authHelper = new AuthHelper(page);
    await authHelper.loginAsAdmin();
  });

  test('PERF-001: Page load time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/order-confirmation/entry');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Page should load within 2 seconds
    expect(loadTime).toBeLessThan(2000);
  });

  test('PERF-002: Search response time', async ({ page }) => {
    await page.goto('/order-confirmation/enquiry');
    
    const startTime = Date.now();
    await page.fill('input[name="confNo"]', 'TEST');
    await page.click('button:has-text("Search")');
    await page.waitForResponse(response => response.url().includes('/api/order-confirmation/enquiry'));
    const responseTime = Date.now() - startTime;

    // Search should respond within 500ms
    expect(responseTime).toBeLessThan(500);
  });

  test('PERF-003: Batch operation performance', async ({ page }) => {
    await page.goto('/bom');
    await page.fill('input[name="itemNo"]', 'TEST-ITEM-001');
    await page.click('button:has-text("Load")');
    await page.waitForLoadState('networkidle');

    // Add multiple rows
    const startTime = Date.now();
    for (let i = 0; i < 10; i++) {
      await page.click('button:has-text("Add")');
      await page.waitForTimeout(100);
    }
    const batchTime = Date.now() - startTime;

    // Batch operations should complete reasonably fast
    expect(batchTime).toBeLessThan(5000);
  });
});
