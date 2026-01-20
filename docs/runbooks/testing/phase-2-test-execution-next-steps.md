# Phase 2 Test Execution - Next Steps

**Date:** 2026-01-05  
**Status:** Test Infrastructure Complete, SQLite Compatibility Issue Identified

## Current Status

✅ **Completed:**
- All test files created (10 API test files, 9 UI test files, 1 integration test file)
- Test infrastructure setup (test-helpers, test-data-seeder, api-test-client)
- TypeScript compilation errors fixed
- CI/CD workflow configured

⚠️ **Known Issue:**
- SQLite doesn't support AUTOINCREMENT on BIGINT primary keys
- This affects entities with `@PrimaryGeneratedColumn({ type: 'bigint' })`
- Error: `SQLITE_ERROR: AUTOINCREMENT is only allowed on an INTEGER PRIMARY KEY`

## SQLite Compatibility Issue

### Affected Entities
The following entities use BIGINT primary keys and will fail in SQLite test environment:
- `ProductBom` (id: bigint)
- `OrderEnquiryQtyBreakdown` (id: bigint)
- `OrderConfirmationHeader` (id: bigint)
- `OrderConfirmationDetail` (id: bigint)
- `ContractHeader` (id: bigint)
- `ContractDetail` (id: bigint)

### Solutions

#### Option 1: Use PostgreSQL for Tests (Recommended)
Switch test database from SQLite to PostgreSQL:

```typescript
// backend/src/test-utils/test-helpers.ts
TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.TEST_DB_HOST || 'localhost',
  port: parseInt(process.env.TEST_DB_PORT || '5432'),
  username: process.env.TEST_DB_USER || 'test',
  password: process.env.TEST_DB_PASSWORD || 'test',
  database: process.env.TEST_DB_NAME || 'baitin_test',
  dropSchema: true,
  synchronize: true,
  // ... entities
})
```

**Pros:**
- Matches production database
- No compatibility issues
- Better test accuracy

**Cons:**
- Requires PostgreSQL setup
- Slightly slower test execution
- More complex CI/CD setup

#### Option 2: Custom Entity Transformer (Complex)
Create a transformer that maps BIGINT to INTEGER for SQLite:

```typescript
// Modify entity metadata after TypeORM loads it
// This requires hooking into TypeORM's metadata system
```

**Pros:**
- No database setup required
- Fast test execution

**Cons:**
- Complex implementation
- May have edge cases
- Not production-like

#### Option 3: Use better-sqlite3 with Custom Configuration
Use better-sqlite3 driver with custom type mapping:

```typescript
// Configure TypeORM to use better-sqlite3
// Map BIGINT to INTEGER in driver configuration
```

**Pros:**
- Still uses SQLite (fast)
- Can handle type mapping

**Cons:**
- Requires driver configuration
- May have limitations

#### Option 4: Accept Limitation (Not Recommended)
Skip tests that use BIGINT entities or use mocks:

**Pros:**
- No changes needed

**Cons:**
- Reduced test coverage
- Not production-like

## Recommended Next Steps

1. ✅ **Completed:** Set up PostgreSQL for tests
   - ✅ Updated `test-helpers.ts` to use PostgreSQL
   - ✅ Updated CI/CD workflow to include PostgreSQL service
   - ✅ Created test database setup documentation
   - ⏳ **Next:** Run tests to verify everything works

2. **Immediate Actions:**
   - Set up local PostgreSQL test database (or use Supabase test project)
   - Run tests locally to verify PostgreSQL connection works
   - Fix any remaining connection or configuration issues

3. **Long-term:** 
   - ✅ Use PostgreSQL for all test environments (completed)
   - Consider using Docker Compose for local test database setup
   - Add database migration tests

## Test Execution Commands

Once the database issue is resolved:

```bash
# Run all API tests
cd backend && npm test

# Run specific test file
cd backend && npm test -- bom.spec.ts

# Run with coverage
cd backend && npm test -- --coverage

# Run UI tests
npm run test:e2e

# Run all tests
npm run test:all
```

## Files Modified

- ✅ `backend/src/test-utils/test-helpers.ts` - Updated to use PostgreSQL instead of SQLite
- ✅ `backend/src/order-confirmation/order-confirmation-post.spec.ts` - Added apiClient declaration
- ✅ `backend/src/bom/bom-validation-fix.spec.ts` - Added safety checks in afterAll
- ✅ `.github/workflows/test.yml` - Updated to use TEST_DATABASE_* environment variables
- ✅ `docs/runbooks/testing/test-database-setup.md` - Created comprehensive setup guide

## CI/CD Status

The GitHub Actions workflow (`.github/workflows/test.yml`) is configured but will fail until the database issue is resolved.

## Summary

All test infrastructure is complete and ready. The only blocker is the SQLite BIGINT AUTOINCREMENT limitation. The recommended solution is to switch to PostgreSQL for tests, which will provide better test accuracy and match the production environment.
