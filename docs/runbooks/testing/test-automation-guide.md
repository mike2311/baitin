# Test Automation Guide

## Overview

This guide explains how to run automated tests for Phase 2 of the BAITIN Trading Management System.

## Prerequisites

1. **Node.js and npm** installed
2. **Backend dependencies** installed: `cd backend && npm install`
3. **Frontend dependencies** installed: `cd frontend && npm install`
4. **Playwright browsers** installed: `npx playwright install`

## Running Tests

### API Tests

API tests are located in `backend/src/**/*.spec.ts` files.

```bash
# Run all API tests
cd backend
npm test

# Run specific test file
npm test -- order-confirmation-post.spec.ts

# Run with coverage
npm test -- --coverage
```

### UI Tests (Playwright)

UI tests are located in `e2e/tests/` directory.

```bash
# Run all UI tests
npm run test:e2e

# Run tests in UI mode (interactive)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Run specific test file
npx playwright test e2e/tests/ui/navigation.spec.ts

# Run tests on specific browser
npx playwright test --project=chromium
```

### Performance Tests

```bash
# Run performance tests
npx playwright test e2e/tests/performance/
```

### Security Tests

```bash
# Run security tests
npx playwright test e2e/tests/security/
```

### All Tests

Use the test execution script to run all tests:

```bash
# Run all Phase 2 tests
node scripts/run-phase2-tests.js
```

## Test Data

Test data is managed through the `TestDataSeeder` utility:

- **Location:** `backend/src/test-utils/test-data-seeder.ts`
- **Configuration:** `backend/src/test-utils/test-data.config.ts`

Test data uses predictable IDs:
- Customers: `TEST-CUST-001`, `TEST-CUST-002`, etc.
- Vendors: `TEST-VEND-001`, `TEST-VEND-002`, etc.
- Items: `TEST-ITEM-001`, `TEST-ITEM-002`, etc.
- OEs: `TEST-OE-001`, `TEST-OE-002`, etc.
- OCs: `TEST-OC-001`, `TEST-OC-002`, etc.
- Contracts: `TEST-CONT-001`, `TEST-CONT-002`, etc.

## Test Environment

### Backend
- **URL:** `http://localhost:3001`
- **API Base:** `/api`
- **Health Check:** `http://localhost:3001/api/health`

### Frontend
- **URL:** `http://100.114.91.110:5173` (network IP) or `http://localhost:5173`
- **Login:** Use test credentials from `TEST_DATA.USER`

## Test Structure

### API Tests
- Located in: `backend/src/**/*.spec.ts`
- Use: Jest testing framework
- Helpers: `backend/src/test-utils/test-helpers.ts`
- Client: `backend/src/test-utils/api-test-client.ts`

### UI Tests
- Located in: `e2e/tests/`
- Use: Playwright testing framework
- Page Objects: `e2e/pages/`
- Helpers: `e2e/helpers/`

### Test Categories
- **UI Tests:** `e2e/tests/ui/`
- **Workflow Tests:** `e2e/tests/workflows/`
- **Performance Tests:** `e2e/tests/performance/`
- **Security Tests:** `e2e/tests/security/`

## Interpreting Test Results

### API Test Results
- ✅ Pass: Test completed successfully
- ❌ Fail: Test failed - check error message
- ⏭️ Skip: Test was skipped

### Playwright Test Results
- View HTML report: `npx playwright show-report`
- View test results: `test-results/` directory
- Screenshots on failure: `test-results/` directory
- Videos on failure: `test-results/` directory

## Troubleshooting

### Common Issues

1. **Backend not running**
   - Start backend: `cd backend && npm run start:dev`
   - Check port 3001 is available

2. **Frontend not running**
   - Start frontend: `cd frontend && npm run dev`
   - Check port 5173 is available

3. **Playwright browsers not installed**
   - Run: `npx playwright install`

4. **Test data conflicts**
   - Clean test data: Use `TestDataSeeder.cleanup()`
   - Use unique test IDs

5. **Authentication failures**
   - Check test user exists in database
   - Verify JWT token generation

## Best Practices

1. **Isolate tests** - Each test should be independent
2. **Clean up data** - Remove test data after tests
3. **Use test data seeder** - Don't hardcode test data
4. **Wait for async operations** - Use proper wait strategies
5. **Take screenshots** - On failures for debugging
6. **Run tests in CI/CD** - Automate test execution

## Continuous Integration

Tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run API Tests
  run: cd backend && npm test

- name: Run UI Tests
  run: npm run test:e2e
```

## Additional Resources

- **Playwright Documentation:** https://playwright.dev
- **Jest Documentation:** https://jestjs.io
- **Test Execution Tracker:** `docs/runbooks/testing/phase-2-crud-test-execution-tracker.md`
- **Test Summary:** `docs/runbooks/testing/phase-2-test-execution-summary.md`
