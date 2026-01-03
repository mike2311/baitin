# Complete Small Subset Migration Plan

## Objective
Complete migration of reference tables (zstdcode, zorigin) and make data visible in UI for owner validation.

## Status

### ✅ Completed
1. Fixed field mapping for zorigin (ORIGIN_COD → description)
2. Cleaned previous test data
3. Re-extracted data with correct mappings
4. Fixed loader to use TransformerService (maps legacy field names to target names)
5. Created ReferenceModule with Controller and Service for API endpoints
6. Registered ReferenceModule in AppModule

### ⏳ Next Steps

**Step 1: Load Data to PostgreSQL**
```powershell
cd C:\github\baitin\backend\migration-cli
$env:ENV="POC"
npm run dev -- load `
  --input C:\github\baitin\backend\migration-cli\test-output\extracted `
  --mode baseline `
  --tables zstdcode zorigin
```

**Step 2: Validate Data**
```powershell
npm run dev -- validate `
  --manifest C:\github\baitin\backend\migration-cli\test-output\extracted\extraction-manifest.json `
  --output C:\github\baitin\backend\migration-cli\test-output\reports
```

**Step 3: Verify in Database**
```sql
SELECT COUNT(*) FROM zstdcode;  -- Should be 27
SELECT COUNT(*) FROM zorigin;   -- Should be 4
SELECT * FROM zstdcode LIMIT 5;
SELECT * FROM zorigin;
```

**Step 4: Test API Endpoints**
```bash
# After starting NestJS backend
GET /reference/standard-codes
GET /reference/origins
GET /reference/standard-codes/01
GET /reference/origins/HONGKONG
```

**Step 5: Display in UI**
- Frontend should call API endpoints to display reference data
- Owner can validate data accuracy

## Field Mapping Verification

### zstdcode
- DBF: `STD_CODE`, `STD_DESP`
- Entity: `stdCode`, `description`
- Mapping: ✅ Correct
  - `STD_CODE` → `stdCode`
  - `STD_DESP` → `description`

### zorigin
- DBF: `ORIGIN`, `ORIGIN_COD`
- Entity: `origin`, `description`
- Mapping: ✅ Fixed
  - `ORIGIN` → `origin`
  - `ORIGIN_COD` → `description`

## Database Structure Notes

Both entities use:
- Primary key: auto-generated `id`
- Unique constraint on code field (`stdCode`, `origin`)
- `createdAt` timestamp
- String fields with appropriate lengths

**No database structure changes needed** - the entities match the legacy structure appropriately.

## API Endpoints Created

- `GET /reference/standard-codes` - List all standard codes
- `GET /reference/standard-codes/:stdCode` - Get specific standard code
- `GET /reference/origins` - List all origins
- `GET /reference/origins/:origin` - Get specific origin

All endpoints require JWT authentication.

## Next Phase

After owner validation of small subset:
1. Extract and load larger tables (mitem, mcustom, mvendor)
2. Test FPT memo file reading
3. Load order enquiry tables
4. Full integration testing

