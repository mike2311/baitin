# Next Steps - Complete Testing Phase

**Current Status:** 71% Tests Passing (115/162)  
**Target:** 95%+ Tests Passing  
**Estimated Time:** 3-4 hours of focused work

---

## 🎯 Quick Start - Next Session

### 1. Verify Environment (5 minutes)

```bash
# Check Docker database is running
docker ps | grep postgres

# Should show: baitin_poc_postgres_test (healthy)

# Test database connection
cd backend
node test-db-connection.js

# Should show: ✅ Database connection successful!
```

### 2. Run Quick Verification Test (2 minutes)

```bash
# Run a test we know passes
npm test -- bom.spec.ts --maxWorkers=1 --testTimeout=60000

# Expected: PASS  13 tests
```

**If this fails:** Database might need restart
```bash
docker restart baitin_poc_postgres_test
sleep 5
# Try again
```

---

## 🔥 Critical Path to 95% (3-4 hours)

### Phase 1: Fix Integration Tests (1-2 hours)

**Goal:** Get 47 failing integration tests passing

#### Step 1.1: Reset Database Schema
```bash
docker exec baitin_poc_postgres_test psql -U postgres -d baitin_test -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

#### Step 1.2: Run Single Integration Test
```bash
cd backend
npm test -- phase3-cross-module.integration.spec.ts --maxWorkers=1 --testTimeout=60000
```

**Expected Issues:**
- Authentication errors (user doesn't exist)
- 404 errors (routes not found)
- Schema conflicts

**Fixes to Try:**
1. Verify test user creation in `beforeAll`
2. Check route registration in `minimal-test-app.ts`
3. Add explicit cleanup in `afterAll`

#### Step 1.3: Debug and Fix
If tests fail, check:
1. Is `app` defined in tests? (check `beforeAll` succeeded)
2. Are routes registered? (check `app.getHttpServer()` has routes)
3. Is database clean? (might need fresh restart)

#### Step 1.4: Run All Integration Tests
```bash
npm test -- --testPathPattern="integration" --maxWorkers=1 --testTimeout=60000
```

### Phase 2: Run Phase 3 Unit Tests (30 minutes)

**Goal:** Execute 18 unit test files

#### Step 2.1: Run Individual Test Files
```bash
# Shipping Order tests
npm test -- shipping-order.service.spec.ts --maxWorkers=1
npm test -- shipping-order.controller.spec.ts --maxWorkers=1
npm test -- shipping-order-document.service.spec.ts --maxWorkers=1

# Invoice tests
npm test -- invoice.service.spec.ts --maxWorkers=1
npm test -- invoice.controller.spec.ts --maxWorkers=1
npm test -- invoice-document.service.spec.ts --maxWorkers=1
npm test -- invoice-validation.service.spec.ts --maxWorkers=1

# Delivery Note tests
npm test -- delivery-note.service.spec.ts --maxWorkers=1
npm test -- delivery-note.controller.spec.ts --maxWorkers=1

# Loading tests
npm test -- loading.service.spec.ts --maxWorkers=1
npm test -- loading.controller.spec.ts --maxWorkers=1

# Enquiry tests
npm test -- enquiry.service.spec.ts --maxWorkers=1
npm test -- enquiry.controller.spec.ts --maxWorkers=1

# Reporting tests
npm test -- reporting.service.spec.ts --maxWorkers=1
npm test -- report-seeder.service.spec.ts --maxWorkers=1
npm test -- report-batch-migration.service.spec.ts --maxWorkers=1

# Document validation tests
npm test -- document-output.spec.ts --maxWorkers=1
npm test -- report-output.spec.ts --maxWorkers=1
```

#### Step 2.2: Fix Any Failures
Common issues:
- Mock setup problems
- Missing dependencies
- Incorrect test data

### Phase 3: Run All Tests Together (30 minutes)

```bash
# Run complete test suite
npm test -- --testTimeout=60000 --maxWorkers=1

# This should give us final pass rate
```

### Phase 4: Generate Coverage Report (15 minutes)

```bash
npm test -- --coverage --testTimeout=60000 --maxWorkers=1
```

**Deliverable:** HTML coverage report in `coverage/` directory

---

## ⚡ Quick Wins - Clean Up Linting (1 hour)

### Option A: Automated Fix (30 minutes)

```bash
cd backend
npm run lint -- --fix

# This will auto-fix:
# - Unused imports
# - Formatting issues
# - Simple violations
```

### Option B: Manual Fix (1 hour)

Focus on these common issues:
1. Remove unused `createTestApp` imports
2. Remove `Test`, `TestingModule` from non-test code
3. Convert `require()` to `import`
4. Remove unused variables

---

## 📊 Generate Final Report (30 minutes)

### Create Test Execution Summary

```markdown
# Test Execution Summary

## Results
- Total Tests: XXX
- Passing: XXX (XX%)
- Failing: XXX (XX%)
- Skipped: XXX

## Coverage
- Statements: XX%
- Branches: XX%
- Functions: XX%
- Lines: XX%

## Test Suites Status
- Phase 2 CRUD: XX/XX passing
- Phase 3 Services: XX/XX passing
- Integration Tests: XX/XX passing
- Performance Tests: XX/XX passing

## Issues Found
[List any issues discovered during testing]

## Recommendations
[Next steps for UAT]
```

---

## 🎬 If You Get Stuck

### Issue: Tests Won't Start

**Symptoms:**
- `this.postgres.Pool is not a constructor`
- Connection timeouts
- Jest hangs

**Solutions:**
1. Restart Docker database
   ```bash
   docker restart baitin_poc_postgres_test
   sleep 5
   ```

2. Clear Jest cache
   ```bash
   npm test -- --clearCache
   ```

3. Verify environment
   ```bash
   node test-db-connection.js
   ```

### Issue: Schema Conflicts

**Symptoms:**
- `relation "IDX_xxx" already exists`
- Duplicate key errors

**Solutions:**
1. Reset schema manually
   ```bash
   docker exec baitin_poc_postgres_test psql -U postgres -d baitin_test -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
   ```

2. Run tests one at a time
   ```bash
   npm test -- <test-file> --maxWorkers=1
   ```

### Issue: Authentication Failures

**Symptoms:**
- `app is undefined`
- `Cannot read property 'close' of undefined`

**Solutions:**
1. Check `beforeAll` completed successfully
2. Verify test user creation
3. Add try-catch in setup:
   ```typescript
   beforeAll(async () => {
     try {
       const { app: testApp, moduleRef } = await createMinimalTestApp();
       app = testApp;
       // ... rest of setup
     } catch (error) {
       console.error('Setup failed:', error);
       throw error;
     }
   }, 60000);
   ```

---

## 📋 Checklist - Session Goal

### Must Complete
- [ ] Integration tests running (47 tests)
- [ ] Phase 3 unit tests executed (18 files)
- [ ] Overall pass rate > 90%
- [ ] Coverage report generated

### Should Complete
- [ ] Linting cleaned up (259 warnings fixed)
- [ ] Test execution summary created
- [ ] Known issues documented

### Nice to Have
- [ ] E2E tests executed
- [ ] Performance tests run
- [ ] UAT preparation started

---

## 🚀 Success Metrics

**Minimum Success:** 90% test pass rate  
**Target Success:** 95% test pass rate  
**Stretch Goal:** 100% test pass rate

**Time Budget:**
- Integration tests: 1-2 hours
- Unit tests: 30 minutes
- Coverage report: 15 minutes
- Linting: 1 hour
- **Total: 3-4 hours**

---

## 📞 Need Help?

### Check Documentation
1. `docs/runbooks/testing/FINAL_TEST_STATUS.md` - Complete status
2. `docs/runbooks/testing/QUICK_START_TESTING.md` - How to run tests
3. `TEST_COMPLETION_SUMMARY.md` - Overall summary
4. `SESSION_COMPLETION_REPORT.md` - This session's work

### Common Commands

```bash
# Restart everything
docker-compose down
docker-compose up -d postgres-test
cd backend
npm test -- --clearCache

# Run specific test
npm test -- <test-name> --maxWorkers=1 --testTimeout=60000

# Check database
node test-db-connection.js

# Get test list
npm test -- --listTests

# Run with verbose output
npm test -- <test-name> --verbose
```

---

**Ready to complete testing?** 🎯

Start with the Quick Start verification, then follow the Critical Path. You've got this! 💪
