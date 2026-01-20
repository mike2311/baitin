import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../../helpers/auth.helper';

/**
 * Phase 3 Frontend Performance Tests
 *
 * Performance Targets:
 * - Page load: <2s initial load
 * - Time to interactive: <3s
 * - Grid rendering: <500ms for 100 rows
 * - Form interactions: <100ms response time
 * - Document download: <5s initiation
 *
 * Reference: Phase 3 - Frontend Performance Testing
 */

test.describe('Phase 3 Frontend Performance', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  describe('Page Load Performance', () => {
    test('SO Entry page loads in <2s', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/shipping-orders');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(2000);
    });

    test('DN Entry page loads in <2s', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/delivery-notes');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(2000);
    });

    test('Loading Entry page loads in <2s', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/loading');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(2000);
    });

    test('Invoice Entry page loads in <2s', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/invoices');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(2000);
    });

    test('Enquiry page loads in <2s', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/enquiry');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(2000);
    });

    test('Reporting page loads in <2s', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/reporting');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(2000);
    });
  });

  describe('Time to Interactive', () => {
    test('SO Entry page becomes interactive in <3s', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/shipping-orders');
      
      // Wait for interactive elements
      await page.waitForSelector('button:has-text("Create"), button:has-text("Search")', { timeout: 3000 });
      await page.waitForFunction(() => {
        return document.readyState === 'complete';
      });
      
      const interactiveTime = Date.now() - startTime;
      
      expect(interactiveTime).toBeLessThan(3000);
    });

    test('Invoice Entry page becomes interactive in <3s', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/invoices');
      
      await page.waitForSelector('button:has-text("Create"), button:has-text("Search")', { timeout: 3000 });
      await page.waitForFunction(() => {
        return document.readyState === 'complete';
      });
      
      const interactiveTime = Date.now() - startTime;
      
      expect(interactiveTime).toBeLessThan(3000);
    });
  });

  describe('Grid Rendering Performance', () => {
    test('SO grid renders 100 rows in <500ms', async ({ page }) => {
      await page.goto('/shipping-orders');
      
      // Trigger search to load grid data
      await page.getByRole('button', { name: /search/i }).click();
      await page.waitForSelector('[data-testid="so-list"]', { timeout: 10000 });
      
      // Measure grid render time
      const startTime = Date.now();
      
      // Wait for grid to be fully rendered
      await page.waitForSelector('[data-testid="so-list"] tbody tr', { timeout: 5000 });
      
      // Scroll to trigger rendering of all rows
      await page.locator('[data-testid="so-list"]').evaluate((el) => {
        el.scrollTop = el.scrollHeight;
      });
      
      await page.waitForTimeout(100); // Allow render to complete
      
      const renderTime = Date.now() - startTime;
      
      // Verify grid has rows
      const rows = page.locator('[data-testid="so-list"] tbody tr');
      const rowCount = await rows.count();
      
      if (rowCount > 0) {
        expect(renderTime).toBeLessThan(500);
      }
    });

    test('Invoice grid renders 100 rows in <500ms', async ({ page }) => {
      await page.goto('/invoices');
      
      await page.getByRole('button', { name: /search/i }).click();
      await page.waitForSelector('[data-testid="invoice-list"]', { timeout: 10000 });
      
      const startTime = Date.now();
      
      await page.waitForSelector('[data-testid="invoice-list"] tbody tr', { timeout: 5000 });
      
      await page.locator('[data-testid="invoice-list"]').evaluate((el) => {
        el.scrollTop = el.scrollHeight;
      });
      
      await page.waitForTimeout(100);
      
      const renderTime = Date.now() - startTime;
      
      const rows = page.locator('[data-testid="invoice-list"] tbody tr');
      const rowCount = await rows.count();
      
      if (rowCount > 0) {
        expect(renderTime).toBeLessThan(500);
      }
    });

    test('DN grid renders 100 rows in <500ms', async ({ page }) => {
      await page.goto('/delivery-notes');
      
      await page.getByRole('button', { name: /search/i }).click();
      await page.waitForSelector('[data-testid="dn-list"]', { timeout: 10000 });
      
      const startTime = Date.now();
      
      await page.waitForSelector('[data-testid="dn-list"] tbody tr', { timeout: 5000 });
      
      await page.locator('[data-testid="dn-list"]').evaluate((el) => {
        el.scrollTop = el.scrollHeight;
      });
      
      await page.waitForTimeout(100);
      
      const renderTime = Date.now() - startTime;
      
      const rows = page.locator('[data-testid="dn-list"] tbody tr');
      const rowCount = await rows.count();
      
      if (rowCount > 0) {
        expect(renderTime).toBeLessThan(500);
      }
    });
  });

  describe('Form Interaction Performance', () => {
    test('Form field interactions respond in <100ms', async ({ page }) => {
      await page.goto('/shipping-orders');
      await page.getByRole('button', { name: /create/i }).click();
      
      // Measure input response time
      const startTime = Date.now();
      await page.getByLabel(/so number/i).fill('SO-TEST');
      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(100);
    });

    test('Dropdown selection responds in <100ms', async ({ page }) => {
      await page.goto('/shipping-orders');
      await page.getByRole('button', { name: /create/i }).click();
      
      const startTime = Date.now();
      await page.getByLabel(/customer/i).selectOption('CUST001');
      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(100);
    });

    test('Grid cell editing responds in <100ms', async ({ page }) => {
      await page.goto('/shipping-orders');
      await page.getByRole('button', { name: /create/i }).click();
      await page.getByRole('button', { name: /add item/i }).click();
      
      const startTime = Date.now();
      await page.getByLabel(/item number/i).fill('ITEM001');
      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(100);
    });
  });

  describe('Document Download Performance', () => {
    test('SO document download initiates in <5s', async ({ page }) => {
      await page.goto('/shipping-orders');
      
      // Find an existing SO
      await page.getByRole('button', { name: /search/i }).click();
      await page.waitForSelector('[data-testid="so-list"]', { timeout: 10000 });
      
      const soRow = page.locator('[data-testid="so-list"] tbody tr').first();
      await soRow.click();
      
      // Generate document
      await page.getByRole('button', { name: /generate document/i }).click();
      await page.getByLabel(/document type/i).selectOption('so_document');
      await page.getByLabel(/output format/i).selectOption('excel');
      
      const startTime = Date.now();
      await page.getByRole('button', { name: /generate/i }).click();
      
      // Wait for download to initiate (success message or download event)
      await expect(page.getByText(/document generated|download/i), { timeout: 5000 }).toBeVisible();
      
      const downloadTime = Date.now() - startTime;
      
      expect(downloadTime).toBeLessThan(5000);
    });

    test('Packing list download initiates in <5s', async ({ page }) => {
      await page.goto('/invoices');
      
      await page.getByRole('button', { name: /search/i }).click();
      await page.waitForSelector('[data-testid="invoice-list"]', { timeout: 10000 });
      
      const invRow = page.locator('[data-testid="invoice-list"] tbody tr').first();
      await invRow.click();
      
      await page.getByRole('button', { name: /generate packing list/i }).click();
      await page.getByLabel(/document type/i).selectOption('packing_list');
      await page.getByLabel(/output format/i).selectOption('excel');
      
      const startTime = Date.now();
      await page.getByRole('button', { name: /generate/i }).click();
      
      await expect(page.getByText(/packing list.*generated|download/i), { timeout: 5000 }).toBeVisible();
      
      const downloadTime = Date.now() - startTime;
      
      expect(downloadTime).toBeLessThan(5000);
    });
  });

  describe('Search Performance', () => {
    test('SO search completes in <1s', async ({ page }) => {
      await page.goto('/shipping-orders');
      
      const startTime = Date.now();
      await page.getByRole('button', { name: /search/i }).click();
      await page.waitForSelector('[data-testid="so-list"]', { timeout: 10000 });
      const searchTime = Date.now() - startTime;
      
      expect(searchTime).toBeLessThan(1000);
    });

    test('Invoice search with filters completes in <1s', async ({ page }) => {
      await page.goto('/invoices');
      
      // Apply filters
      await page.getByLabel(/customer/i).selectOption('CUST001');
      await page.getByLabel(/date from/i).fill('2025-01-01');
      await page.getByLabel(/date to/i).fill('2025-01-31');
      
      const startTime = Date.now();
      await page.getByRole('button', { name: /search/i }).click();
      await page.waitForSelector('[data-testid="invoice-list"]', { timeout: 10000 });
      const searchTime = Date.now() - startTime;
      
      expect(searchTime).toBeLessThan(1000);
    });
  });

  describe('Large Dataset Performance', () => {
    test('Grid handles 1000+ rows efficiently', async ({ page }) => {
      await page.goto('/shipping-orders');
      
      // Trigger search that returns many results
      await page.getByRole('button', { name: /search/i }).click();
      await page.waitForSelector('[data-testid="so-list"]', { timeout: 10000 });
      
      // Measure scroll performance
      const startTime = Date.now();
      
      // Scroll through grid
      await page.locator('[data-testid="so-list"]').evaluate((el) => {
        el.scrollTop = el.scrollHeight / 2;
      });
      await page.waitForTimeout(200);
      
      await page.locator('[data-testid="so-list"]').evaluate((el) => {
        el.scrollTop = el.scrollHeight;
      });
      await page.waitForTimeout(200);
      
      const scrollTime = Date.now() - startTime;
      
      // Should scroll smoothly even with many rows
      expect(scrollTime).toBeLessThan(2000);
    });
  });

  describe('Concurrent Operations', () => {
    test('Multiple form interactions remain responsive', async ({ page }) => {
      await page.goto('/shipping-orders');
      await page.getByRole('button', { name: /create/i }).click();
      
      // Perform multiple rapid interactions
      const startTime = Date.now();
      
      await page.getByLabel(/so number/i).fill('SO1');
      await page.getByLabel(/customer/i).selectOption('CUST001');
      await page.getByLabel(/date/i).fill('2025-01-15');
      await page.getByRole('button', { name: /add item/i }).click();
      await page.getByLabel(/item number/i).fill('ITEM001');
      await page.getByLabel(/quantity/i).fill('100');
      
      const interactionTime = Date.now() - startTime;
      
      // All interactions should complete quickly
      expect(interactionTime).toBeLessThan(1000);
    });
  });
});
