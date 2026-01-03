# Integration Test Plan - With Real Data

## Data Location

**Source Directory**: `C:\github\baitin\source`

The real legacy DBF files are available in the `source` folder at the repository root.

## Tables to Test

Based on Phase 1.5 scope, we need to test migration of:

1. **Reference Tables** (Load Order 1):
   - `zstdcode.dbf` - Standard codes
   - `zorigin.dbf` - Country of origin codes

2. **Master Data** (Load Order 2):
   - `mitem.dbf` + `mitem.fpt` - Items (with memo field)
   - `mcustom.dbf` - Customers
   - `mvendor.dbf` - Vendors

3. **Order Enquiry** (Load Order 3-4):
   - `moectrl.dbf` - OE Control (filtered: 2023-01-01 onwards)
   - `moehd.dbf` - OE Header (filtered: 2023-01-01 onwards)
   - `moe.dbf` - OE Detail (filtered: 2023-01-01 onwards)

## Test Setup

### 1. Prepare Test Database

```sql
-- Create test database
CREATE DATABASE baitin_poc_test;

-- The tool will handle table creation via TypeORM migrations
-- But we should verify tables exist before loading
```

### 2. Set Environment Variables

```powershell
$env:ENV="POC"
$env:DB_HOST="localhost"
$env:DB_PORT="5432"
$env:DB_NAME="baitin_poc_test"
$env:DB_USER="postgres"
$env:DB_PASSWORD="your_password"
```

### 3. Verify Source Files Exist

Run this to check which files are available:

```powershell
cd C:\github\baitin
$tables = @('zstdcode', 'zorigin', 'mitem', 'mcustom', 'mvendor', 'moectrl', 'moehd', 'moe')
foreach ($t in $tables) {
  $dbf = "source\$t.dbf"
  $fpt = "source\$t.fpt"
  Write-Host "$t:"
  Write-Host "  DBF: $(if (Test-Path $dbf) { 'EXISTS' } else { 'MISSING' })"
  Write-Host "  FPT: $(if (Test-Path $fpt) { 'EXISTS' } else { 'MISSING' })"
}
```

## Test Execution Steps

### Step 1: Extract Data

```powershell
cd C:\github\baitin\backend\migration-cli
npm run dev -- extract `
  --source C:\github\baitin\source `
  --output C:\github\baitin\backend\migration-cli\test-output\extracted `
  --encoding windows-1252
```

**Expected Results:**
- CSV files created for each table
- Manifest file generated
- Logs show extraction progress
- Check for any rejected records

**Verify:**
- [ ] All CSV files created
- [ ] Row counts match expectations
- [ ] No extraction errors in logs
- [ ] Manifest file is valid JSON

### Step 2: Load Data

```powershell
npm run dev -- load `
  --input C:\github\baitin\backend\migration-cli\test-output\extracted `
  --mode baseline
```

**Expected Results:**
- Data loads into PostgreSQL
- No constraint violations
- Row counts match extracted counts

**Verify:**
- [ ] All tables loaded
- [ ] No foreign key violations
- [ ] Data types correct
- [ ] Dates formatted correctly
- [ ] Boolean values correct (.T./.F. → true/false)
- [ ] Memo fields loaded (if FPT files exist)

### Step 3: Validate Data

```powershell
npm run dev -- validate `
  --manifest C:\github\baitin\backend\migration-cli\test-output\extracted\manifest.json `
  --output C:\github\baitin\backend\migration-cli\test-output\reports
```

**Expected Results:**
- Reconciliation report generated
- Row counts match (extracted = loaded)
- Integrity checks pass
- Markdown and JSON reports created

**Verify:**
- [ ] Report shows 100% match
- [ ] No uniqueness violations
- [ ] Referential integrity maintained
- [ ] Sample data in reports looks correct

### Step 4: Manual Data Verification

```sql
-- Connect to database
psql -U postgres -d baitin_poc_test

-- Check row counts
SELECT 'zstdcode' as table_name, COUNT(*) as row_count FROM zstdcode
UNION ALL
SELECT 'zorigin', COUNT(*) FROM zorigin
UNION ALL
SELECT 'item', COUNT(*) FROM item
UNION ALL
SELECT 'customer', COUNT(*) FROM customer
UNION ALL
SELECT 'vendor', COUNT(*) FROM vendor
UNION ALL
SELECT 'order_enquiry_control', COUNT(*) FROM order_enquiry_control
UNION ALL
SELECT 'order_enquiry_header', COUNT(*) FROM order_enquiry_header
UNION ALL
SELECT 'order_enquiry_detail', COUNT(*) FROM order_enquiry_detail;

-- Check sample records
SELECT * FROM item LIMIT 5;
SELECT * FROM customer LIMIT 5;
SELECT * FROM vendor LIMIT 5;

-- Check for memo fields (desp field in item table)
SELECT item_no, LEFT(desp, 100) as desp_preview FROM item WHERE desp IS NOT NULL LIMIT 5;
```

**Verify:**
- [ ] Row counts match extracted counts
- [ ] Sample records look correct
- [ ] Encoding is correct (no garbled characters)
- [ ] Dates are correct
- [ ] Memo fields contain data (if applicable)

### Step 5: Test Reset Command (Optional)

```powershell
npm run dev -- reset `
  --input C:\github\baitin\backend\migration-cli\test-output\extracted `
  --confirm
```

**Verify:**
- [ ] Tables truncated
- [ ] Data reloaded
- [ ] Row counts match again

## Expected Issues to Watch For

1. **Encoding Issues**
   - Chinese characters may not display correctly
   - Check if encoding conversion works

2. **Date Format Issues**
   - FoxPro dates may need special handling
   - Verify date fields are correct

3. **Memo Field Issues**
   - FPT file reading may have issues
   - Verify memo fields are loaded

4. **File Size Issues**
   - Large files may take time
   - Monitor memory usage

5. **Filter Issues**
   - Date filters may exclude too many records
   - Verify filtered records are correct

## Success Criteria

✅ **Integration Test Passes When:**
- [ ] Extract command completes without errors
- [ ] Load command completes without errors
- [ ] Validate reports show 100% row count match
- [ ] Manual verification shows correct data
- [ ] No encoding issues
- [ ] Memo fields load correctly (if applicable)
- [ ] Performance is acceptable

## Next Steps After Testing

1. **If tests pass:**
   - Update checklist in DEBUGGING_PLAN.md
   - Document any findings
   - Proceed to performance testing

2. **If issues found:**
   - Document issues
   - Fix code
   - Re-test
   - Update documentation

