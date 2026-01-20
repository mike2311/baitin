# Quick Start: Running Tests

**Date:** 2026-01-05  
**Status:** Ready to test

## Prerequisites

1. **PostgreSQL Database** (choose one):
   - Local PostgreSQL installed and running
   - OR Supabase test project created

2. **Environment Variables Set** (see below)

## Quick Setup (5 minutes)

### Option 1: Local PostgreSQL

1. **Create test database:**
   ```sql
   CREATE DATABASE baitin_test;
   ```

2. **Set environment variables:**
   ```powershell
   # PowerShell
   $env:TEST_DATABASE_HOST = "localhost"
   $env:TEST_DATABASE_PORT = "5432"
   $env:TEST_DATABASE_USER = "postgres"
   $env:TEST_DATABASE_PASSWORD = "your_postgres_password"
   $env:TEST_DATABASE_NAME = "baitin_test"
   ```

   ```bash
   # Bash
   export TEST_DATABASE_HOST=localhost
   export TEST_DATABASE_PORT=5432
   export TEST_DATABASE_USER=postgres
   export TEST_DATABASE_PASSWORD=your_postgres_password
   export TEST_DATABASE_NAME=baitin_test
   ```

3. **Run tests:**
   ```bash
   cd backend
   npm test
   ```

### Option 2: Supabase Test Database

1. **Create Supabase test project:**
   - Go to https://supabase.com/dashboard
   - Create new project (e.g., "baitin-test")
   - Get connection details from Settings > Database

2. **Set environment variables:**
   ```powershell
   # PowerShell
   $env:TEST_DATABASE_HOST = "db.xxxxx.supabase.co"
   $env:TEST_DATABASE_PORT = "5432"
   $env:TEST_DATABASE_USER = "postgres"
   $env:TEST_DATABASE_PASSWORD = "your_supabase_password"
   $env:TEST_DATABASE_NAME = "postgres"
   ```

3. **Run tests:**
   ```bash
   cd backend
   npm test
   ```

## Running Specific Tests

```bash
# Run all tests
cd backend && npm test

# Run specific test file
cd backend && npm test -- bom.spec.ts

# Run with coverage
cd backend && npm test -- --coverage

# Run in watch mode
cd backend && npm test -- --watch
```

## What Happens During Tests

1. **Database Setup:**
   - Drops existing schema (`dropSchema: true`)
   - Creates all tables automatically (`synchronize: true`)
   - Uses test database (separate from production)

2. **Test Execution:**
   - Each test file gets a fresh database
   - Tests run in isolation
   - Data is cleaned up after tests

3. **Cleanup:**
   - Schema is dropped after test suite completes
   - Database is ready for next test run

## Troubleshooting

### Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution:** Ensure PostgreSQL is running
```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432
```

### Authentication Error
```
Error: password authentication failed
```
**Solution:** Verify database credentials in environment variables

### Database Doesn't Exist
```
Error: database "baitin_test" does not exist
```
**Solution:** Create the database
```sql
CREATE DATABASE baitin_test;
```

### SSL Error (Supabase)
```
Error: SSL connection required
```
**Solution:** Ensure hostname includes `supabase.co` - SSL is automatically enabled

## Next Steps

Once tests are running:

1. ✅ Verify all tests pass
2. ✅ Check test coverage
3. ✅ Review test results
4. ✅ Fix any failing tests
5. ✅ Update test tracker documentation

## CI/CD

Tests automatically run in GitHub Actions:
- PostgreSQL service is configured
- Environment variables are set automatically
- Tests run on every push/PR

No local setup needed for CI/CD - it's all automated!
