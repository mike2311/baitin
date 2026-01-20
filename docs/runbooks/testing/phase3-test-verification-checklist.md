# Phase 3 Test Verification Checklist

## Pre-Execution Verification

Use this checklist to verify the test setup before running tests.

### ✅ File Structure Verification

- [x] All unit test files created in `backend/src/`
- [x] All integration test files created in `backend/src/`
- [x] All E2E test files created in `e2e/tests/workflows/`
- [x] Performance test files created
- [x] Security test files created
- [x] Regression test files created
- [x] Validation test files created
- [x] Test data seeder created
- [x] CI/CD workflow file created

### ✅ Test File Locations

#### Backend Unit Tests
- [x] `backend/src/shipping-order/*.spec.ts`
- [x] `backend/src/delivery-note/*.spec.ts`
- [x] `backend/src/loading/*.spec.ts`
- [x] `backend/src/invoice/*.spec.ts`
- [x] `backend/src/enquiry/*.spec.ts`
- [x] `backend/src/reporting/*.spec.ts`

#### Backend Integration Tests
- [x] `backend/src/phase3-workflow.integration.spec.ts`
- [x] `backend/src/phase3-cross-module.integration.spec.ts`

#### Backend Performance Tests
- [x] `backend/src/performance/phase3-api-performance.spec.ts`

#### Backend Security Tests
- [x] `backend/src/security/phase3-authz.spec.ts`
- [x] `backend/src/security/phase3-data-security.spec.ts`

#### Backend Regression Tests
- [x] `backend/src/regression/phase2-regression.spec.ts`
- [x] `backend/src/regression/cross-phase-integration.spec.ts`

#### Backend Validation Tests
- [x] `backend/src/validation/document-output.spec.ts`
- [x] `backend/src/validation/report-output.spec.ts`

#### E2E Tests
- [x] `e2e/tests/workflows/so-workflow.spec.ts`
- [x] `e2e/tests/workflows/dn-loading-workflow.spec.ts`
- [x] `e2e/tests/workflows/invoice-workflow.spec.ts`
- [x] `e2e/tests/workflows/reporting-workflow.spec.ts`
- [x] `e2e/tests/workflows/complete-phase3-workflow.spec.ts`

#### Performance Tests
- [x] `e2e/tests/performance/phase3-performance.spec.ts`

### ✅ Documentation Files

- [x] `docs/runbooks/testing/phase3-uat-scenarios.md`
- [x] `docs/runbooks/testing/phase3-uat-checklist.md`
- [x] `docs/runbooks/testing/phase3-load-testing.md`
- [x] `docs/runbooks/testing/phase3-test-implementation-summary.md`
- [x] `docs/runbooks/testing/phase3-test-verification-checklist.md` (this file)

### ✅ CI/CD Configuration

- [x] `.github/workflows/phase3-tests.yml` exists and is valid YAML

### ⚠️ Pre-Run Checks

#### Dependencies
- [ ] All npm dependencies installed (`npm ci` in backend)
- [ ] All npm dependencies installed (`npm ci` in frontend)
- [ ] Playwright browsers installed (`npx playwright install`)

#### Database Setup
- [ ] Test database configured
- [ ] Database migrations run
- [ ] Test data seeder can run successfully

#### Environment Variables
- [ ] Test database connection variables set
- [ ] JWT secret configured for tests
- [ ] API URLs configured for E2E tests

#### Services
- [ ] Backend can start in test mode
- [ ] Frontend can build and serve
- [ ] Database is accessible

### 🔧 Common Issues to Check

1. **Import Errors**
   - Check all `import` statements resolve
   - Verify entity imports match actual file names
   - Check service imports are correct

2. **Type Errors**
   - Run TypeScript compiler check
   - Verify all types are defined
   - Check DTO imports

3. **Test Data Issues**
   - Verify test data seeder works
   - Check master data exists (customers, items, vendors)
   - Verify test data cleanup works

4. **API Endpoint Mismatches**
   - Verify API routes match test expectations
   - Check authentication endpoints
   - Verify document generation endpoints

5. **E2E Test Selectors**
   - Verify UI selectors match actual frontend
   - Check data-testid attributes exist
   - Verify page routes are correct

## Execution Steps

### Step 1: Verify Setup
```bash
# Check TypeScript compilation
cd backend
npx tsc --noEmit

# Check for linting errors
npm run lint
```

### Step 2: Run Unit Tests
```bash
cd backend
npm test -- --testPathPattern="(shipping-order|delivery-note|loading|invoice|enquiry|reporting)" --listTests
```

### Step 3: Run Integration Tests
```bash
cd backend
npm test -- --testPathPattern="phase3-(workflow|cross-module)" --listTests
```

### Step 4: Run Security Tests
```bash
cd backend
npm test -- --testPathPattern="phase3-(authz|data-security)" --listTests
```

### Step 5: Run Regression Tests
```bash
cd backend
npm test -- --testPathPattern="(phase2-regression|cross-phase-integration)" --listTests
```

### Step 6: Run Performance Tests (Optional)
```bash
cd backend
npm test -- --testPathPattern="phase3-api-performance" --listTests
```

### Step 7: Run E2E Tests (Requires Running Services)
```bash
# Start backend and frontend first
cd backend && npm run start:dev &
cd frontend && npm run dev &

# Then run E2E tests
npm run test:e2e -- --grep "Phase 3"
```

## Troubleshooting

### Issue: Tests fail with "Cannot find module"
**Solution:** Check import paths and ensure all dependencies are installed

### Issue: Database connection errors
**Solution:** Verify DATABASE_* environment variables are set correctly

### Issue: Authentication fails in tests
**Solution:** Check JWT_SECRET is set and test user exists in database

### Issue: E2E tests timeout
**Solution:** Increase timeout values or check if services are running

### Issue: Performance tests fail
**Solution:** Check if performance targets are too strict for test environment

## Next Actions

After verification:
1. Run tests individually to identify issues
2. Fix any compilation or runtime errors
3. Update test data as needed
4. Adjust test expectations to match actual API behavior
5. Run full test suite
6. Generate coverage reports
7. Review and address any failing tests
