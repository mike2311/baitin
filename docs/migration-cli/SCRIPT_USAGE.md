# Migration Scripts Usage Guide

This document provides detailed usage instructions for all migration CLI scripts and npm commands.

## Prerequisites

Before running any scripts, ensure you have:

1. **Environment Variables Set**:
   ```bash
   export ENV=POC
   export DB_HOST=db.tvntlxdninziiievjgzx.supabase.co
   export DB_PORT=5432
   export DB_USER=postgres
   export DB_PASSWORD=your_password
   export DB_NAME=postgres
   ```

   Or set them inline:
   ```bash
   ENV=POC DB_HOST=... DB_PORT=... DB_USER=... DB_PASSWORD=... DB_NAME=... npm run <script>
   ```

2. **Dependencies Installed**:
   ```bash
   cd backend/migration-cli
   npm install
   ```

## NPM Scripts Reference

All scripts should be run from the `backend/migration-cli` directory.

### Core Migration Scripts

#### `npm run extract`
Extracts data from FoxPro DBF/FPT files to CSV format.

```bash
# Extract all tables
npm run extract

# Extract with custom input directory
npm run extract -- --input /path/to/dbf/files

# Extract with custom output directory
npm run extract -- --output /path/to/output
```

**Output**: CSV files in `test-output/extracted/` (or specified output directory)

#### `npm run load`
Loads extracted CSV data into PostgreSQL database.

```bash
# Load all tables
npm run load

# Load with custom input directory
npm run load -- --input test-output/extracted

# Load without truncating existing data
npm run load -- --no-truncate
```

**Prerequisites**: CSV files must exist from extract step
**Output**: Data loaded into PostgreSQL tables

#### `npm run validate`
Validates migrated data by checking row counts.

```bash
# Validate all tables
npm run validate

# Validate specific table
npm run validate -- --table item
```

**Output**: Validation report showing row counts for each table

#### `npm run validate:comprehensive`
Runs comprehensive validation including uniqueness, required fields, foreign keys, and business rules.

```bash
npm run validate:comprehensive
```

**Output**: Detailed validation report in console and JSON file

#### `npm run reset`
Resets the database by truncating all tables (WARNING: Destructive operation).

```bash
npm run reset

# Reset with confirmation
npm run reset -- --confirm
```

**Warning**: This will delete all data from migrated tables!

### Data Quality Scripts

#### `npm run data-quality:report`
Generates a comprehensive data quality report identifying orphaned records.

```bash
# Generate report
npm run data-quality:report

# Report will be saved to: reports/data-quality-YYYY-MM-DD.json
```

**What it does**:
- Scans database for orphaned records
- Identifies missing foreign key references
- Categorizes issues by type and severity
- Updates `data_quality_audit` table with all issues
- Generates JSON report file

**Output**:
- Console summary with statistics
- JSON report file: `reports/data-quality-YYYY-MM-DD.json`
- Updates `data_quality_audit` table

**Example Output**:
```
✓ Data Quality Report Generated

Summary:
  Total Orphaned Records: 1772
  Unique Orphaned Values: 1980
  Tables Affected: 4

  Report saved to: reports/data-quality-2024-12-28.json

Recommendations:
  1. Create 278 missing origin codes in zorigin table
  2. Review and create 208 missing customer codes in customer table
  3. Investigate 1494 orphaned OE detail records - may need header reconstruction
```

#### `npm run data-quality:track`
Alias for `data-quality:report` (same functionality).

```bash
npm run data-quality:track
```

### Foreign Key Constraint Scripts

#### `npm run fk:apply-soft`
Applies temporary soft FK constraints to allow system operation during data cleanup.

```bash
npm run fk:apply-soft
```

**What it does**:
- Applies nullable/deferrable FK constraints
- Allows system to function with orphaned records
- Counts orphaned records before and after
- Verifies constraints were created

**Example Output**:
```
Applying soft FK constraints...
Orphaned records before applying constraints:
  - item.origin: 278
  - order_enquiry_control.cust_no: 19
  - order_enquiry_header.cust_no: 189
  - order_enquiry_detail.oe_no: 1494

Executing constraint 1/4
✓ Constraint 1 applied successfully
...

Applied soft FK constraints:
  - fk_item_origin_soft (deferrable: t, deferred: t)
  - fk_oe_control_customer_soft (deferrable: t, deferred: t)
  ...

✓ Soft FK constraints applied successfully
⚠ Note: These are temporary constraints. Plan to remove them after data cleanup.
```

**Important**: These constraints are temporary. Plan to remove them after data cleanup (target: 30 days).

#### `npm run fk:validate-strict`
Validates that the database is ready for strict FK constraint enforcement.

```bash
npm run fk:validate-strict
```

**What it checks**:
- No orphaned records remain in the database
- All issues in `data_quality_audit` table are resolved
- Reports any blocking issues

**Exit Codes**:
- `0`: Database is ready for strict FK constraints
- `1`: Database is not ready (issues remain)

**Example Output (Ready)**:
```
Checking for orphaned records...
✓ No orphaned records found
Checking data quality audit table for unresolved issues...
✓ All issues in audit table are resolved

✓ Database is ready for strict FK constraints
```

**Example Output (Not Ready)**:
```
Checking for orphaned records...
⚠ Found 50 orphaned record issues
Checking data quality audit table for unresolved issues...
⚠ Found 50 unresolved issues in audit table
  - pending: 30 issues
  - in_review: 20 issues

✗ Database is NOT ready for strict FK constraints

Issues to resolve:
  - 50 orphaned record issues found
  - 50 unresolved issues in audit table
```

#### `npm run fk:apply-strict`
Applies strict FK constraints (non-nullable, non-deferrable) to enforce referential integrity.

```bash
# With confirmation prompt
npm run fk:apply-strict

# Skip confirmation (not recommended)
npm run fk:apply-strict -- --force
```

**Warning**: Only run this after validation passes!

**What it does**:
- Removes soft FK constraints
- Applies strict FK constraints
- Enforces referential integrity at database level
- Verifies constraints were created

**Prerequisites**:
- Must pass `npm run fk:validate-strict` first
- All orphaned records must be resolved
- All audit issues must be resolved

**Example Output**:
```
⚠ WARNING: This will remove soft FK constraints and enforce strict referential integrity.
Are you sure you want to proceed? (yes/no): yes

Applying strict FK constraints...
Executing statement 1/8
✓ Statement 1 executed successfully
...

Applied strict FK constraints:
  - fk_item_origin
  - fk_oe_control_customer
  - fk_oe_header_customer
  - fk_oe_detail_header

✓ Strict FK constraints applied successfully
✓ Database now enforces referential integrity at the database level
```

### Master Data Review Scripts

#### `npm run master-data:review`
Interactive CLI script for reviewing and creating missing master data.

```bash
npm run master-data:review
```

**What it does**:
- Loads all orphaned record issues
- Groups by type (item.origin, customer references, etc.)
- Prompts user for each missing value
- Creates master data records
- Updates audit table with resolution

**Interactive Prompts**:
For each orphaned value, you'll be asked:
```
  Value: CN
  Affects: 150 records
  Severity: warning
  Action: [c]reate, [s]kip, [d]efer, [i]nvalid: c
  Notes (optional): Created during data quality review
```

**Actions**:
- `[c]reate` or `c`: Create missing master data record
- `[s]kip` or `s`: Skip for now (leave as-is)
- `[d]efer` or `d`: Defer to later
- `[i]nvalid` or `i`: Mark as invalid (approve as-is)

**Example Session**:
```
Found 278 orphaned record issues to review

item.origin → zorigin:
  278 unique values affecting 278 records

  Value: CN
  Affects: 150 records
  Severity: warning
  Action: [c]reate, [s]kip, [d]efer, [i]nvalid: c
  Notes (optional): China origin code
✓ Created origin code: CN

  Value: HK
  Affects: 50 records
  Severity: warning
  Action: [c]reate, [s]kip, [d]efer, [i]nvalid: c
  Notes (optional): Hong Kong origin code
✓ Created origin code: HK

...

✓ Review completed
```

### Migration Execution Scripts

#### `npm run migration:run`
Executes a SQL migration file directly.

```bash
# Run a specific migration file
npm run migration:run migrations/001-add-soft-fk-constraints.sql

# Run with full path
npm run migration:run backend/migration-cli/migrations/002-create-data-quality-audit-table.sql
```

**What it does**:
- Reads SQL migration file
- Splits into individual statements
- Executes each statement in a transaction
- Rolls back on error
- Commits on success

**Example Output**:
```
Reading migration file: migrations/001-add-soft-fk-constraints.sql
Found 4 SQL statements to execute
Executing statement 1/4
✓ Statement 1 executed successfully
...

✓ Migration completed successfully
```

## Direct Script Execution

You can also run scripts directly using `tsx`:

```bash
# Direct execution
tsx src/scripts/generate-data-quality-report.ts

# With environment variables
ENV=POC DB_HOST=... tsx src/scripts/apply-soft-fk-constraints.ts
```

## Common Workflows

### Initial Setup After Migration

```bash
# 1. Apply soft FK constraints
npm run fk:apply-soft

# 2. Create audit table
npm run migration:run migrations/002-create-data-quality-audit-table.sql

# 3. Generate initial data quality report
npm run data-quality:report
```

### Regular Data Quality Checks

```bash
# Generate fresh report
npm run data-quality:report

# Review and resolve issues
npm run master-data:review
```

### Transition to Strict FKs

```bash
# 1. Validate readiness
npm run fk:validate-strict

# 2. If validation passes, apply strict FKs
npm run fk:apply-strict

# 3. Verify constraints
npm run validate:comprehensive
```

### Complete Data Quality Workflow

```bash
# Phase 1: Setup
npm run fk:apply-soft
npm run migration:run migrations/002-create-data-quality-audit-table.sql

# Phase 2: Identify Issues
npm run data-quality:report

# Phase 3: Resolve Issues
npm run master-data:review
# Or use API endpoints

# Phase 4: Validate and Enforce
npm run fk:validate-strict
npm run fk:apply-strict
```

## Error Handling

### Common Errors and Solutions

#### Error: "Database connection environment variables are not set"

**Solution**: Set required environment variables:
```bash
export DB_HOST=your_host
export DB_PORT=5432
export DB_USER=your_user
export DB_PASSWORD=your_password
export DB_NAME=your_database
```

#### Error: "Migration file not found"

**Solution**: Ensure you're running from the correct directory and using the correct path:
```bash
cd backend/migration-cli
npm run migration:run migrations/001-add-soft-fk-constraints.sql
```

#### Error: "Constraint already exists"

**Solution**: This is usually a warning, not an error. The script will skip already-existing constraints and continue.

#### Error: "Database is NOT ready for strict FK constraints"

**Solution**: 
1. Review the validation output to see what issues remain
2. Run `npm run data-quality:report` to see current status
3. Resolve remaining issues using `npm run master-data:review` or API endpoints
4. Re-run validation until it passes

## Output Files

### Report Files

Reports are saved to `backend/migration-cli/reports/`:

- `data-quality-YYYY-MM-DD.json`: Data quality reports with orphaned record details
- `validation-report-*.json`: Comprehensive validation reports

### Migration Files

Migration SQL files are in `backend/migration-cli/migrations/`:

- `001-add-soft-fk-constraints.sql`: Soft FK constraints
- `002-create-data-quality-audit-table.sql`: Audit table creation
- `003-enforce-strict-fk-constraints.sql`: Strict FK constraints

### Log Files

Logs are written to console and optionally to `backend/migration-cli/logs/`:

- `combined.log`: Combined application logs
- `error.log`: Error logs only

## Troubleshooting

### Script Hangs or Times Out

**Possible Causes**:
- Database connection issues
- Large dataset processing
- Network latency

**Solutions**:
- Check database connectivity
- Verify environment variables
- Check database logs
- Try running with smaller datasets

### Permission Errors

**Possible Causes**:
- Database user lacks required permissions
- File system permissions

**Solutions**:
- Verify database user has CREATE, ALTER, INSERT, SELECT permissions
- Check file permissions for report directories
- Run with appropriate user permissions

### Transaction Errors

**Possible Causes**:
- Orphaned records blocking FK constraint creation
- Concurrent database modifications

**Solutions**:
- Ensure soft FKs are applied before strict FKs
- Check for active database transactions
- Verify database state before running migrations

## Best Practices

1. **Always validate before strict FKs**: Never skip the validation step
2. **Review reports regularly**: Run data quality reports weekly during cleanup
3. **Document resolutions**: Use notes when resolving issues for audit trail
4. **Backup before migrations**: Always backup database before running migrations
5. **Test in development first**: Test all scripts in dev environment before production
6. **Monitor logs**: Check logs for warnings and errors
7. **Use transactions**: Scripts use transactions for safety, but be aware of rollback behavior

## Related Documentation

- `docs/data-quality-workflow.md`: Complete workflow documentation
- `docs/data-quality-report.md`: Detailed data quality analysis
- `README.md`: General CLI tool documentation
- `QUICK_START.md`: Quick start guide

