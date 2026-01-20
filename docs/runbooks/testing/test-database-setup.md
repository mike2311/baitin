# Test Database Setup

**Date:** 2026-01-05  
**Status:** PostgreSQL (Supabase) configured for tests

## Overview

Tests now use PostgreSQL instead of SQLite to match the production environment (Supabase). This resolves the SQLite BIGINT AUTOINCREMENT compatibility issue.

## Configuration

### Environment Variables

The test configuration supports both test-specific and fallback variables:

**Test-Specific (Recommended):**
- `TEST_DATABASE_HOST` - Test database host
- `TEST_DATABASE_PORT` - Test database port (default: 5432)
- `TEST_DATABASE_USER` - Test database user
- `TEST_DATABASE_PASSWORD` - Test database password
- `TEST_DATABASE_NAME` - Test database name

**Fallback:**
- `DATABASE_HOST` - Used if `TEST_DATABASE_HOST` not set
- `DATABASE_PORT` - Used if `TEST_DATABASE_PORT` not set
- `DATABASE_USER` - Used if `TEST_DATABASE_USER` not set
- `DATABASE_PASSWORD` - Used if `TEST_DATABASE_PASSWORD` not set
- `DATABASE_NAME` - Used if `TEST_DATABASE_NAME` not set

### Local Development

#### Option 1: Use Local PostgreSQL

1. **Install PostgreSQL** (if not already installed)
   ```bash
   # Windows (using Chocolatey)
   choco install postgresql
   
   # macOS (using Homebrew)
   brew install postgresql
   
   # Linux (Ubuntu/Debian)
   sudo apt-get install postgresql postgresql-contrib
   ```

2. **Create Test Database**
   ```sql
   CREATE DATABASE baitin_test;
   CREATE USER baitin_test WITH PASSWORD 'baitin_test_password';
   GRANT ALL PRIVILEGES ON DATABASE baitin_test TO baitin_test;
   ```

3. **Set Environment Variables**
   ```powershell
   # PowerShell
   $env:TEST_DATABASE_HOST = "localhost"
   $env:TEST_DATABASE_PORT = "5432"
   $env:TEST_DATABASE_USER = "baitin_test"
   $env:TEST_DATABASE_PASSWORD = "baitin_test_password"
   $env:TEST_DATABASE_NAME = "baitin_test"
   ```

   ```bash
   # Bash
   export TEST_DATABASE_HOST=localhost
   export TEST_DATABASE_PORT=5432
   export TEST_DATABASE_USER=baitin_test
   export TEST_DATABASE_PASSWORD=baitin_test_password
   export TEST_DATABASE_NAME=baitin_test
   ```

#### Option 2: Use Supabase Test Database

1. **Create a separate Supabase project for testing** (recommended)
   - Go to https://supabase.com/dashboard
   - Create a new project (e.g., "baitin-test")
   - Get connection details from Settings > Database

2. **Set Environment Variables**
   ```powershell
   # PowerShell
   $env:TEST_DATABASE_HOST = "db.xxxxx.supabase.co"
   $env:TEST_DATABASE_PORT = "5432"
   $env:TEST_DATABASE_USER = "postgres"
   $env:TEST_DATABASE_PASSWORD = "your-supabase-password"
   $env:TEST_DATABASE_NAME = "postgres"
   ```

### CI/CD (GitHub Actions)

The CI/CD workflow automatically sets up PostgreSQL:

```yaml
services:
  postgres:
    image: postgres:15
    env:
      POSTGRES_USER: baitin_dev
      POSTGRES_PASSWORD: baitin_dev_password
      POSTGRES_DB: baitin_poc_dev
```

Tests use these credentials automatically in CI/CD.

## Running Tests

### Local

```bash
# Set environment variables (see above)
cd backend
npm test
```

### With Specific Test File

```bash
cd backend
npm test -- bom.spec.ts
```

### With Coverage

```bash
cd backend
npm test -- --coverage
```

## Database Schema

Tests automatically:
- **Drop schema** before each test run (`dropSchema: true`)
- **Create tables** automatically (`synchronize: true`)
- **Use same entities** as production

This ensures a clean database state for each test run.

## Troubleshooting

### Connection Errors

**Error:** `ECONNREFUSED` or `Connection refused`
- **Solution:** Ensure PostgreSQL is running
  ```bash
  # Check if PostgreSQL is running
  pg_isready -h localhost -p 5432
  ```

### Authentication Errors

**Error:** `password authentication failed`
- **Solution:** Verify database credentials in environment variables
- Check that the user has proper permissions

### SSL Errors (Supabase)

**Error:** `SSL connection required`
- **Solution:** The test configuration automatically enables SSL for Supabase connections
- Ensure `TEST_DATABASE_HOST` includes `supabase.co`

### Database Already Exists

**Error:** `database "baitin_test" already exists`
- **Solution:** This is normal - tests will drop and recreate the schema
- If issues persist, manually drop the database:
  ```sql
  DROP DATABASE baitin_test;
  CREATE DATABASE baitin_test;
  ```

## Best Practices

1. **Use Separate Test Database**
   - Never use production database for tests
   - Use `TEST_DATABASE_*` variables to keep test and production separate

2. **Clean State**
   - Tests automatically drop schema before running
   - Each test run starts with a fresh database

3. **Isolation**
   - Each test file gets its own database connection
   - Tests should not depend on data from other tests

4. **Performance**
   - PostgreSQL is faster than SQLite for complex queries
   - Connection pooling is configured for optimal performance

## Migration from SQLite

The following changes were made:

1. **Updated `test-helpers.ts`**
   - Changed from `type: 'sqlite'` to `type: 'postgres'`
   - Added environment variable support
   - Added SSL configuration for Supabase

2. **Removed SQLite-specific code**
   - No longer needed BIGINT → INTEGER mapping
   - No SQLite-specific workarounds

3. **Updated CI/CD**
   - Already had PostgreSQL service configured
   - Added test-specific environment variables

## Next Steps

- ✅ PostgreSQL configuration complete
- ✅ CI/CD workflow updated
- ⏳ Run tests to verify everything works
- ⏳ Update documentation with any additional findings
