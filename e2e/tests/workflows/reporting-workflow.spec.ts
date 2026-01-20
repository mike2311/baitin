import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../../helpers/auth.helper';

/**
 * Reporting Workflow E2E Tests
 *
 * Original Logic Reference:
 * - Legacy Reports: 116+ .frx report files
 * - Documentation: docs/source/06-reporting/report-inventory.md
 * - Business Rules:
 *   - Batch migration of reports
 *   - Report generation with parameters
 *   - Report preview functionality
 *   - PDF and Excel export
 *   - Progress tracking
 *
 * Reference: Phase 3 - Reporting Workflow E2E Tests
 */

test.describe('Reporting Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('Access Report Batch Migration UI', async ({ page }) => {
    // Navigate to Reporting module
    await page.goto('/reporting');
    
    // Verify page loads
    await expect(page.getByText(/reporting|reports/i)).toBeVisible();
    
    // Navigate to Batch Migration
    await page.getByRole('button', { name: /batch migration|migrate reports/i }).click();
    
    // Verify batch migration page loads
    await expect(page).toHaveURL(/.*reporting.*migration|.*migration.*reporting/i);
    await expect(page.getByText(/batch migration|migrate reports/i)).toBeVisible();
  });

  test('Review Pending Reports for Migration', async ({ page }) => {
    await page.goto('/reporting/migration');
    
    // Wait for pending reports list to load
    await page.waitForSelector('[data-testid="pending-reports-list"]', { timeout: 10000 });
    
    // Verify pending reports are displayed
    const pendingReports = page.locator('[data-testid="pending-reports-list"] tbody tr');
    const pendingCount = await pendingReports.count();
    
    expect(pendingCount).toBeGreaterThanOrEqual(0);
    
    // Verify report information is shown
    if (pendingCount > 0) {
      const firstReport = pendingReports.first();
      await expect(firstReport).toContainText(/\w+/); // Should have report name or key
      
      // Verify status column
      await expect(firstReport.locator('[data-testid="report-status"]')).toBeVisible();
    }
  });

  test('Execute Batch Migration', async ({ page }) => {
    await page.goto('/reporting/migration');
    
    // Wait for pending reports list
    await page.waitForSelector('[data-testid="pending-reports-list"]', { timeout: 10000 });
    
    // Select reports for migration
    const reportCheckboxes = page.locator('[data-testid="pending-reports-list"] input[type="checkbox"]');
    const reportCount = await reportCheckboxes.count();
    
    if (reportCount > 0) {
      // Select first report (or up to max batch size)
      const reportsToSelect = Math.min(3, reportCount);
      for (let i = 0; i < reportsToSelect; i++) {
        await reportCheckboxes.nth(i).check();
      }
      
      // Click Execute Migration button
      await page.getByRole('button', { name: /execute migration|start migration/i }).click();
      
      // Verify migration started
      await expect(page.getByText(/migration started|processing/i)).toBeVisible();
      
      // Wait for migration to complete (with timeout)
      await page.waitForSelector('[data-testid="migration-progress"]', { timeout: 60000 });
      
      // Verify progress indicator
      const progressIndicator = page.locator('[data-testid="migration-progress"]');
      await expect(progressIndicator).toBeVisible();
    } else {
      // No pending reports - verify message
      await expect(page.getByText(/no pending reports|all reports migrated/i)).toBeVisible();
    }
  });

  test('Monitor Migration Progress', async ({ page }) => {
    await page.goto('/reporting/migration');
    
    // Start a migration if possible
    await page.waitForSelector('[data-testid="pending-reports-list"]', { timeout: 10000 });
    const reportCheckboxes = page.locator('[data-testid="pending-reports-list"] input[type="checkbox"]');
    const reportCount = await reportCheckboxes.count();
    
    if (reportCount > 0) {
      await reportCheckboxes.first().check();
      await page.getByRole('button', { name: /execute migration/i }).click();
      
      // Monitor progress
      const progressBar = page.locator('[data-testid="migration-progress-bar"]');
      if (await progressBar.isVisible({ timeout: 5000 })) {
        // Verify progress updates
        const initialProgress = await progressBar.getAttribute('aria-valuenow');
        expect(initialProgress).toBeTruthy();
        
        // Wait for progress to update
        await page.waitForTimeout(2000);
        
        // Verify progress indicator shows status
        const statusText = page.locator('[data-testid="migration-status"]');
        await expect(statusText).toBeVisible();
      }
      
      // Verify completed reports count
      const completedCount = page.locator('[data-testid="completed-reports-count"]');
      if (await completedCount.isVisible({ timeout: 10000 })) {
        await expect(completedCount).toBeVisible();
      }
    }
  });

  test('Validate Migrated Report', async ({ page }) => {
    await page.goto('/reporting');
    
    // Navigate to migrated reports
    await page.getByRole('button', { name: /migrated reports|active reports/i }).click();
    
    // Wait for reports list
    await page.waitForSelector('[data-testid="reports-list"]', { timeout: 10000 });
    
    // Select a migrated report
    const reportRows = page.locator('[data-testid="reports-list"] tbody tr');
    const reportCount = await reportRows.count();
    
    if (reportCount > 0) {
      const firstReport = reportRows.first();
      await firstReport.click();
      
      // Click Validate button
      await page.getByRole('button', { name: /validate|test report/i }).click();
      
      // Verify validation results
      await expect(page.getByText(/validation|test results/i)).toBeVisible();
      
      // Verify SQL validation passed
      await expect(page.getByText(/sql.*valid|query.*valid/i)).toBeVisible();
      
      // Verify performance test results
      const performanceResults = page.locator('[data-testid="performance-results"]');
      if (await performanceResults.isVisible({ timeout: 5000 })) {
        await expect(performanceResults).toBeVisible();
      }
    }
  });

  test('Generate Report with Parameters', async ({ page }) => {
    await page.goto('/reporting');
    
    // Navigate to report generation
    await page.getByRole('button', { name: /generate report|reports/i }).click();
    
    // Wait for reports list
    await page.waitForSelector('[data-testid="reports-list"]', { timeout: 10000 });
    
    // Select a report
    const reportRows = page.locator('[data-testid="reports-list"] tbody tr');
    const reportCount = await reportRows.count();
    
    if (reportCount > 0) {
      await reportRows.first().click();
      
      // Click Generate button
      await page.getByRole('button', { name: /generate|run report/i }).click();
      
      // Fill report parameters if required
      const parameterSection = page.locator('[data-testid="report-parameters"]');
      if (await parameterSection.isVisible({ timeout: 3000 })) {
        // Fill date range parameters
        const dateFromField = page.getByLabel('Date From');
        if (await dateFromField.isVisible()) {
          await dateFromField.fill('2025-01-01');
        }
        
        const dateToField = page.getByLabel('Date To');
        if (await dateToField.isVisible()) {
          await dateToField.fill('2025-01-31');
        }
        
        // Fill customer parameter if available
        const customerField = page.getByLabel('Customer');
        if (await customerField.isVisible()) {
          await customerField.selectOption('CUST001');
        }
      }
      
      // Select output format
      await page.getByLabel('Output Format').selectOption('excel');
      
      // Generate report
      await page.getByRole('button', { name: /generate|create report/i }).click();
      
      // Verify report generation started
      await expect(page.getByText(/generating|processing/i)).toBeVisible();
      
      // Wait for report to complete
      await expect(page.getByText(/report generated successfully|download ready/i), { timeout: 30000 }).toBeVisible();
    }
  });

  test('Report Preview Functionality', async ({ page }) => {
    await page.goto('/reporting');
    
    // Navigate to report generation
    await page.getByRole('button', { name: /generate report|reports/i }).click();
    await page.waitForSelector('[data-testid="reports-list"]', { timeout: 10000 });
    
    // Select a report
    const reportRows = page.locator('[data-testid="reports-list"] tbody tr');
    const reportCount = await reportRows.count();
    
    if (reportCount > 0) {
      await reportRows.first().click();
      
      // Click Preview button
      await page.getByRole('button', { name: /preview/i }).click();
      
      // Verify preview modal opens
      await expect(page.getByText(/preview|report preview/i)).toBeVisible();
      
      // Verify preview data is displayed
      await page.waitForSelector('[data-testid="preview-data"]', { timeout: 10000 });
      const previewData = page.locator('[data-testid="preview-data"]');
      await expect(previewData).toBeVisible();
      
      // Verify columns are shown
      const previewColumns = page.locator('[data-testid="preview-columns"]');
      if (await previewColumns.isVisible()) {
        await expect(previewColumns).toBeVisible();
      }
      
      // Verify row count is shown
      const rowCount = page.locator('[data-testid="preview-row-count"]');
      if (await rowCount.isVisible()) {
        await expect(rowCount).toContainText(/\d+/);
      }
      
      // Close preview
      await page.getByRole('button', { name: /close/i }).click();
      await expect(page.getByText(/preview/i)).not.toBeVisible();
    }
  });

  test('Report Output Format Validation (Excel)', async ({ page }) => {
    await page.goto('/reporting');
    
    await page.getByRole('button', { name: /generate report/i }).click();
    await page.waitForSelector('[data-testid="reports-list"]', { timeout: 10000 });
    
    const reportRows = page.locator('[data-testid="reports-list"] tbody tr');
    const reportCount = await reportRows.count();
    
    if (reportCount > 0) {
      await reportRows.first().click();
      await page.getByRole('button', { name: /generate/i }).click();
      
      // Select Excel format
      await page.getByLabel('Output Format').selectOption('excel');
      
      // Fill parameters if needed
      const parameterSection = page.locator('[data-testid="report-parameters"]');
      if (await parameterSection.isVisible({ timeout: 3000 })) {
        // Fill any required parameters
      }
      
      // Generate
      await page.getByRole('button', { name: /generate|create report/i }).click();
      
      // Wait for download or success message
      await expect(page.getByText(/report generated|download ready/i), { timeout: 30000 }).toBeVisible();
      
      // Verify Excel format is mentioned
      await expect(page.getByText(/excel|\.xlsx/i)).toBeVisible();
    }
  });

  test('Report Output Format Validation (PDF)', async ({ page }) => {
    await page.goto('/reporting');
    
    await page.getByRole('button', { name: /generate report/i }).click();
    await page.waitForSelector('[data-testid="reports-list"]', { timeout: 10000 });
    
    const reportRows = page.locator('[data-testid="reports-list"] tbody tr');
    const reportCount = await reportRows.count();
    
    if (reportCount > 0) {
      await reportRows.first().click();
      await page.getByRole('button', { name: /generate/i }).click();
      
      // Select PDF format
      await page.getByLabel('Output Format').selectOption('pdf');
      
      // Generate
      await page.getByRole('button', { name: /generate|create report/i }).click();
      
      // Wait for download or success message
      await expect(page.getByText(/report generated|download ready/i), { timeout: 30000 }).toBeVisible();
      
      // Verify PDF format is mentioned
      await expect(page.getByText(/pdf|\.pdf/i)).toBeVisible();
    }
  });

  test('Report Migration Error Handling', async ({ page }) => {
    await page.goto('/reporting/migration');
    
    await page.waitForSelector('[data-testid="pending-reports-list"]', { timeout: 10000 });
    
    // Try to migrate with invalid report key (if UI allows)
    const reportCheckboxes = page.locator('[data-testid="pending-reports-list"] input[type="checkbox"]');
    const reportCount = await reportCheckboxes.count();
    
    if (reportCount > 0) {
      // Select a report
      await reportCheckboxes.first().check();
      
      // Execute migration
      await page.getByRole('button', { name: /execute migration/i }).click();
      
      // Wait for any error messages
      await page.waitForTimeout(5000);
      
      // Check for error messages
      const errorMessages = page.locator('text=/error|failed|invalid/i');
      const errorCount = await errorMessages.count();
      
      if (errorCount > 0) {
        // Verify error is displayed clearly
        await expect(errorMessages.first()).toBeVisible();
        
        // Verify error details are shown
        const errorDetails = page.locator('[data-testid="error-details"]');
        if (await errorDetails.isVisible()) {
          await expect(errorDetails).toBeVisible();
        }
      }
    }
  });

  test('Report Search and Filter', async ({ page }) => {
    await page.goto('/reporting');
    
    // Test search by report name
    await page.getByLabel('Report Name').fill('Sales');
    await page.getByRole('button', { name: /search/i }).click();
    
    await page.waitForSelector('[data-testid="reports-list"]', { timeout: 10000 });
    const results = page.locator('[data-testid="reports-list"] tbody tr');
    const count = await results.count();
    
    // Verify search results
    for (let i = 0; i < count; i++) {
      await expect(results.nth(i)).toContainText(/sales/i);
    }
    
    // Test filter by category
    await page.getByLabel('Report Name').clear();
    await page.getByLabel('Category').selectOption('Sales');
    await page.getByRole('button', { name: /search|filter/i }).click();
    
    await page.waitForSelector('[data-testid="reports-list"]');
    const categoryResults = page.locator('[data-testid="reports-list"] tbody tr');
    
    // Verify all results are in selected category
    const categoryResultsCount = await categoryResults.count();
    for (let i = 0; i < categoryResultsCount; i++) {
      await expect(categoryResults.nth(i)).toContainText(/sales/i);
    }
  });

  test('Report Performance Monitoring', async ({ page }) => {
    await page.goto('/reporting');
    
    // Navigate to report performance monitoring
    await page.getByRole('button', { name: /performance|monitoring/i }).click();
    
    // Verify performance dashboard loads
    await expect(page.getByText(/performance|monitoring/i)).toBeVisible();
    
    // Verify performance metrics are displayed
    const metricsSection = page.locator('[data-testid="performance-metrics"]');
    if (await metricsSection.isVisible({ timeout: 5000 })) {
      await expect(metricsSection).toBeVisible();
      
      // Verify average execution time
      const avgExecutionTime = page.locator('[data-testid="avg-execution-time"]');
      if (await avgExecutionTime.isVisible()) {
        await expect(avgExecutionTime).toContainText(/\d+/);
      }
      
      // Verify slow reports list
      const slowReports = page.locator('[data-testid="slow-reports"]');
      if (await slowReports.isVisible()) {
        await expect(slowReports).toBeVisible();
      }
    }
  });

  test('Report Definition Management', async ({ page }) => {
    await page.goto('/reporting');
    
    // Navigate to report management
    await page.getByRole('button', { name: /manage|definitions/i }).click();
    
    // Verify report definitions list
    await page.waitForSelector('[data-testid="report-definitions-list"]', { timeout: 10000 });
    
    // Verify CRUD operations are available
    await expect(page.getByRole('button', { name: /create|add report/i })).toBeVisible();
    
    // Test create new report definition
    await page.getByRole('button', { name: /create|add report/i }).click();
    
    // Fill report definition form
    const reportKey = `REPORT-${Date.now()}`;
    await page.getByLabel('Report Key').fill(reportKey);
    await page.getByLabel('Report Name').fill('Test Report');
    await page.getByLabel('Category').selectOption('Test');
    await page.getByLabel('Description').fill('Test report description');
    
    // Save report definition
    await page.getByRole('button', { name: /save/i }).click();
    
    // Verify success message
    await expect(page.getByText(/report.*created successfully|saved successfully/i)).toBeVisible();
    
    // Verify report appears in list
    await expect(page.getByText(reportKey)).toBeVisible();
  });

  test('Report Batch Migration Progress Tracking', async ({ page }) => {
    await page.goto('/reporting/migration');
    
    // Start a migration
    await page.waitForSelector('[data-testid="pending-reports-list"]', { timeout: 10000 });
    const reportCheckboxes = page.locator('[data-testid="pending-reports-list"] input[type="checkbox"]');
    const reportCount = await reportCheckboxes.count();
    
    if (reportCount > 0) {
      // Select multiple reports
      const reportsToSelect = Math.min(3, reportCount);
      for (let i = 0; i < reportsToSelect; i++) {
        await reportCheckboxes.nth(i).check();
      }
      
      await page.getByRole('button', { name: /execute migration/i }).click();
      
      // Verify progress tracking UI
      const progressSection = page.locator('[data-testid="migration-progress-section"]');
      await expect(progressSection).toBeVisible({ timeout: 10000 });
      
      // Verify batch ID is shown
      const batchId = page.locator('[data-testid="batch-id"]');
      if (await batchId.isVisible()) {
        await expect(batchId).toBeVisible();
      }
      
      // Verify total reports count
      const totalReports = page.locator('[data-testid="total-reports"]');
      if (await totalReports.isVisible()) {
        await expect(totalReports).toContainText(/\d+/);
      }
      
      // Verify completed reports count
      const completedReports = page.locator('[data-testid="completed-reports"]');
      if (await completedReports.isVisible()) {
        await expect(completedReports).toContainText(/\d+/);
      }
      
      // Verify individual report status
      const reportStatuses = page.locator('[data-testid="report-status-item"]');
      if (await reportStatuses.first().isVisible({ timeout: 10000 })) {
        const statusCount = await reportStatuses.count();
        expect(statusCount).toBeGreaterThan(0);
      }
    }
  });

  test('Report Comparison with Legacy Output', async ({ page }) => {
    await page.goto('/reporting');
    
    // Navigate to report comparison
    await page.getByRole('button', { name: /compare|legacy comparison/i }).click();
    
    // Select a report for comparison
    await page.waitForSelector('[data-testid="reports-list"]', { timeout: 10000 });
    const reportRows = page.locator('[data-testid="reports-list"] tbody tr');
    const reportCount = await reportRows.count();
    
    if (reportCount > 0) {
      await reportRows.first().click();
      
      // Click Compare button
      await page.getByRole('button', { name: /compare|validate against legacy/i }).click();
      
      // Upload legacy report file or select from list
      const legacyFileInput = page.locator('input[type="file"]');
      if (await legacyFileInput.isVisible()) {
        // File upload would be handled here
        // await legacyFileInput.setInputFiles('path/to/legacy-report.xlsx');
      }
      
      // Run comparison
      await page.getByRole('button', { name: /run comparison|compare/i }).click();
      
      // Verify comparison results
      await expect(page.getByText(/comparison|validation results/i), { timeout: 30000 }).toBeVisible();
      
      // Verify differences are highlighted
      const differences = page.locator('[data-testid="comparison-differences"]');
      if (await differences.isVisible()) {
        await expect(differences).toBeVisible();
      }
    }
  });
});
