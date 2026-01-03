# Database Setup for Migration Testing

## Database Connection Required

The migration CLI tool needs a PostgreSQL database connection to load data. The connection failed with `ECONNREFUSED`, which means either:
1. PostgreSQL is not running
2. Connection settings are incorrect
3. Database doesn't exist

## Default Configuration

The migration CLI uses these defaults (from `environment.util.ts`):
- Host: `localhost`
- Port: `5432`
- Database: `baitin_poc`
- User: `postgres`
- Password: Must be set via `DB_PASSWORD` environment variable

## Setup Options

### Option 1: Use Existing NestJS Backend Database

If you have the NestJS backend running, it likely uses a database configured in `.env`:

```bash
# Check backend/.env for database settings
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=baitin_poc_dev  # or baitin_poc
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
```

Set environment variables to match:
```powershell
$env:DB_HOST="localhost"
$env:DB_PORT="5432"
$env:DB_NAME="baitin_poc"  # or match your backend DB name
$env:DB_USER="postgres"
$env:DB_PASSWORD="your_password"
$env:ENV="POC"
```

### Option 2: Create New Test Database

```sql
-- Connect to PostgreSQL as superuser
psql -U postgres

-- Create database
CREATE DATABASE baitin_poc;

-- The NestJS backend will create tables via TypeORM migrations
-- Or you can run migrations manually
```

### Option 3: Verify Database Connection

Test if PostgreSQL is running:
```powershell
# Test connection
psql -U postgres -h localhost -d baitin_poc -c "SELECT 1"
```

## Next Steps

Once database is configured:
1. Ensure tables exist (run NestJS migrations if needed)
2. Set environment variables
3. Run load command again

## Table Creation

The tables should be created by TypeORM when the NestJS backend starts (if `synchronize: true` in development), or via migrations:

```bash
cd backend
npm run migration:run
```

Tables needed for small subset:
- `zstdcode`
- `zorigin`

