# Data Quality Workflow Documentation

## Overview

This document describes the complete workflow for managing data quality issues, specifically orphaned records that were identified during the data migration from the legacy FoxPro system.

## Background

During data migration, we identified **1,772 orphaned records** across 4 categories:
- 278 items with missing origin codes (zorigin)
- 19 order_enquiry_control records with missing customer codes
- 189 order_enquiry_header records with missing customer codes
- 1,494 order_enquiry_detail records with missing header references

These are **legacy data quality issues** from the FoxPro system, not migration bugs. The migration successfully preserved all data as it existed in the source system.

## Workflow Phases

### Phase 1: Apply Soft FK Constraints

**Purpose**: Allow the system to function while orphaned records are being resolved.

**Steps**:
1. Run the migration to add soft FK constraints:
   ```bash
   cd backend/migration-cli
   npm run fk:apply-soft
   ```

2. This creates temporary nullable/deferrable FK constraints that allow the system to operate even with orphaned records.

3. Verify constraints were applied:
   ```sql
   SELECT conname, contype, condeferrable, condeferred 
   FROM pg_constraint 
   WHERE conname LIKE '%_soft';
   ```

**Important**: These constraints are temporary and should be removed after data cleanup (target: 30 days from creation).

### Phase 2: Generate Data Quality Reports

**Purpose**: Get visibility into all data quality issues.

**Steps**:
1. Generate a comprehensive data quality report:
   ```bash
   cd backend/migration-cli
   npm run data-quality:report
   ```

2. The report will:
   - Count all orphaned records
   - Categorize by type and severity
   - Save results to `reports/data-quality-YYYY-MM-DD.json`
   - Update the `data_quality_audit` table with all issues

3. Review the report output for:
   - Total orphaned records count
   - Breakdown by table and field
   - Recommendations for resolution

### Phase 3: Business Review and Resolution

**Purpose**: Allow business users to review and resolve orphaned records.

#### Option A: Interactive CLI Review

1. Run the interactive review script:
   ```bash
   cd backend/migration-cli
   npm run master-data:review
   ```

2. For each orphaned value, you'll be prompted to:
   - **[c]reate**: Create missing master data record
   - **[s]kip**: Skip for now
   - **[d]efer**: Defer to later
   - **[i]nvalid**: Mark as invalid (approve as-is)

3. The script will:
   - Create missing origin codes automatically
   - Guide you through customer creation (may require API/admin panel)
   - Update the audit table with resolution status

#### Option B: API-Based Review

1. Use the Data Quality API endpoints:
   ```bash
   # Get summary
   GET /api/data-quality/summary

   # Get all issues
   GET /api/data-quality/issues

   # Get issues by status
   GET /api/data-quality/issues?status=pending

   # Get specific issue
   GET /api/data-quality/issues/:id

   # Resolve an issue
   POST /api/data-quality/issues/:id/resolve
   {
     "notes": "Created missing origin code",
     "resolvedBy": "admin"
   }
   ```

2. Use the Reference API to create missing master data:
   ```bash
   # Create origin code
   POST /api/reference/origins
   {
     "origin": "CN",
     "description": "China"
   }
   ```

### Phase 4: Validation and Transition to Strict FKs

**Purpose**: Validate that all issues are resolved before enforcing strict referential integrity.

**Steps**:
1. Validate database readiness:
   ```bash
   cd backend/migration-cli
   npm run fk:validate-strict
   ```

2. This script checks:
   - No orphaned records remain
   - All audit table issues have status 'resolved' or 'approved_as_is'
   - Reports any blocking issues

3. If validation passes (exit code 0):
   ```bash
   npm run fk:apply-strict
   ```

4. If validation fails:
   - Review the output to see what issues remain
   - Resolve remaining issues using Phase 3 workflows
   - Re-run validation until it passes

5. After applying strict FKs:
   - System now enforces referential integrity at the database level
   - No new orphaned records can be created
   - All FKs are non-nullable and non-deferrable

## Migration Scripts Reference

All migration scripts are located in `backend/migration-cli/src/scripts/`:

| Script | Command | Purpose |
|--------|---------|---------|
| `apply-soft-fk-constraints.ts` | `npm run fk:apply-soft` | Apply temporary soft FK constraints |
| `generate-data-quality-report.ts` | `npm run data-quality:report` | Generate data quality report |
| `review-and-create-master-data.ts` | `npm run master-data:review` | Interactive review and creation |
| `validate-strict-fk-ready.ts` | `npm run fk:validate-strict` | Validate readiness for strict FKs |
| `apply-strict-fk-constraints.ts` | `npm run fk:apply-strict` | Apply strict FK constraints |
| `run-migration.ts` | `npm run migration:run <file>` | Execute SQL migration file |

**For detailed script usage, examples, and troubleshooting, see**: [`SCRIPT_USAGE.md`](SCRIPT_USAGE.md)

## Database Tables

### data_quality_audit

Tracks all orphaned record issues and their resolution status.

**Columns**:
- `id`: Primary key
- `source_table`: Table with orphaned FK (e.g., 'item')
- `target_table`: Table that should contain the referenced value (e.g., 'zorigin')
- `fk_field`: Foreign key field name (e.g., 'origin')
- `fk_value`: The orphaned value that doesn't exist in target table
- `orphaned_count`: Number of records affected
- `status`: 'pending', 'in_review', 'resolved', 'approved_as_is'
- `resolution_notes`: Notes about resolution
- `resolved_by`: User who resolved the issue
- `resolved_at`: Timestamp of resolution
- `created_at`: When issue was first identified
- `updated_at`: Last update timestamp

**Query Examples**:
```sql
-- Get all pending issues
SELECT * FROM data_quality_audit WHERE status = 'pending';

-- Get issues by table
SELECT * FROM data_quality_audit WHERE source_table = 'item';

-- Get resolution statistics
SELECT status, COUNT(*) FROM data_quality_audit GROUP BY status;
```

## API Endpoints Reference

### Data Quality Endpoints

**Base URL**: `/api/data-quality`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/summary` | Get summary statistics |
| GET | `/issues` | List all issues (optional ?status=filter) |
| GET | `/issues/:id` | Get specific issue details |
| PUT | `/issues/:id` | Update issue status |
| POST | `/issues/:id/resolve` | Resolve an issue |

### Reference Endpoints

**Base URL**: `/api/reference`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/origins` | Create a new origin code |

## Best Practices

1. **Regular Reporting**: Run data quality reports regularly during cleanup period to track progress.

2. **Audit Everything**: Always update the audit table when resolving issues to maintain a complete audit trail.

3. **Business Review**: Always involve business stakeholders when deciding whether to create missing master data or mark as invalid.

4. **Validation Before Strict FKs**: Never apply strict FK constraints without first validating that all issues are resolved.

5. **Documentation**: Document resolution decisions in the `resolution_notes` field for future reference.

## Troubleshooting

### Issue: Soft FK constraints fail to apply

**Cause**: Constraints may already exist or there may be syntax errors in migration.

**Solution**: Check PostgreSQL error logs, verify migration SQL syntax, use `IF NOT EXISTS` clauses.

### Issue: Data quality report shows different counts than expected

**Cause**: Data may have changed since last report, or query may be filtering incorrectly.

**Solution**: Re-run the report, verify database state, check for data updates.

### Issue: Strict FK validation fails but no orphaned records found

**Cause**: Audit table may have unresolved issues even though records are cleaned up.

**Solution**: Update audit table status to 'resolved' or 'approved_as_is' for cleaned-up issues.

### Issue: Cannot create master data via API

**Cause**: Missing authentication, insufficient permissions, or duplicate key violation.

**Solution**: Check JWT token, verify user permissions, ensure value doesn't already exist.

## Timeline Recommendations

- **Week 1**: Apply soft FK constraints, generate initial reports
- **Week 2**: Deploy business review tools, train users
- **Week 3-4**: Business reviews and creates missing master data
- **Week 5**: Validate readiness, apply strict FK constraints
- **Week 6**: Monitor and document final state

## Related Documentation

- [`SCRIPT_USAGE.md`](SCRIPT_USAGE.md) - Complete script usage guide with examples and troubleshooting
- [`data-quality-report.md`](data-quality-report.md) - Detailed data quality analysis
- `../migrations/001-add-soft-fk-constraints.sql` - Soft FK migration
- `../migrations/003-enforce-strict-fk-constraints.sql` - Strict FK migration

