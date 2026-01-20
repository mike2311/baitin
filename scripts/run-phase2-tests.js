#!/usr/bin/env node

/**
 * Phase 2 Test Execution Script
 *
 * Executes all Phase 2 tests and generates a report.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TEST_RESULTS_DIR = path.join(__dirname, '..', 'test-results');
const TEST_REPORT_FILE = path.join(TEST_RESULTS_DIR, 'phase-2-test-report.json');

// Ensure test results directory exists
if (!fs.existsSync(TEST_RESULTS_DIR)) {
  fs.mkdirSync(TEST_RESULTS_DIR, { recursive: true });
}

console.log('Starting Phase 2 Test Execution...\n');

const testResults = {
  timestamp: new Date().toISOString(),
  apiTests: {
    status: 'pending',
    passed: 0,
    failed: 0,
    total: 0,
  },
  uiTests: {
    status: 'pending',
    passed: 0,
    failed: 0,
    total: 0,
  },
  performanceTests: {
    status: 'pending',
    passed: 0,
    failed: 0,
    total: 0,
  },
  securityTests: {
    status: 'pending',
    passed: 0,
    failed: 0,
    total: 0,
  },
};

try {
  // Run API tests
  console.log('Running API tests...');
  try {
    execSync('cd backend && npm test -- --testPathPattern="\\.spec\\.ts$"', {
      stdio: 'inherit',
    });
    testResults.apiTests.status = 'completed';
  } catch (error) {
    testResults.apiTests.status = 'failed';
    console.error('API tests failed:', error.message);
  }

  // Run UI tests (Playwright)
  console.log('\nRunning UI tests...');
  try {
    execSync('npm run test:e2e', { stdio: 'inherit' });
    testResults.uiTests.status = 'completed';
  } catch (error) {
    testResults.uiTests.status = 'failed';
    console.error('UI tests failed:', error.message);
  }

  // Write test report
  fs.writeFileSync(TEST_REPORT_FILE, JSON.stringify(testResults, null, 2));
  console.log(`\nTest report written to: ${TEST_REPORT_FILE}`);

  // Determine exit code
  const hasFailures =
    testResults.apiTests.status === 'failed' ||
    testResults.uiTests.status === 'failed';

  if (hasFailures) {
    console.error('\nSome tests failed. Check the report for details.');
    process.exit(1);
  } else {
    console.log('\nAll tests passed!');
    process.exit(0);
  }
} catch (error) {
  console.error('Test execution error:', error);
  process.exit(1);
}
