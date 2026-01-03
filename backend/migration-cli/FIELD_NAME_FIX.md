# Field Name Mapping Fix

## Problem Identified

The CSV extraction was producing empty values because the field mappings used lowercase field names (e.g., `std_code`, `description`) but the actual DBF files contain uppercase field names (e.g., `STD_CODE`, `STD_DESP`).

### Actual DBF Field Names

**zstdcode.dbf**:
- `STD_CODE` (not `std_code`)
- `STD_DESP` (not `description`)

**zorigin.dbf**:
- `ORIGIN` (matches mapping)
- `ORIGIN_COD` (not `description`)

## Solution Applied

1. **Updated Field Mappings** (`config/field-mappings.json`):
   - Changed `zstdcode` mapping keys from `std_code` → `STD_CODE`, `description` → `STD_DESP`
   - Changed `zorigin` mapping: kept `ORIGIN`, changed `description` → `ORIGIN_COD`

2. **Improved Field Matching** (`src/extractor/extractor.service.ts`):
   - Added case-insensitive field lookup to handle future case variations
   - Improved field name matching logic to find actual DBF field names

## Verification

✅ Extraction now works correctly:
- zstdcode: 27 rows extracted with actual data
- zorigin: 4 rows extracted with actual data

## Important Note

**Field mappings must match the actual DBF field names exactly** (case-sensitive). When adding new tables, verify the actual field names in the DBF files first using:

```javascript
const {DBFFile} = require('dbffile');
const dbf = await DBFFile.open('path/to/file.dbf');
console.log('Fields:', dbf.fields.map(f => f.name));
```

## Next Steps

Before extracting other tables, verify their actual field names and update the field mappings accordingly.

