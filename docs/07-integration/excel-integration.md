# Excel Integration

## Overview

The system extensively integrates with Microsoft Excel for both import and export operations. Excel integration is critical for order processing and reporting.

## Import Workflows

### Order Enquiry Import

**Primary Method:** Excel file import for OE creation

**Supported Formats:**
1. Standard Excel format
2. Walmart XLS format
3. CSV format (2013)
4. XLS format (2013)
5. Multi-item block format
6. New format Excel file

**Programs:**
- `uoexls_2013.prg` - 2013 CSV format (1,747 lines - most complex)
- `uoexls.prg` - Standard format
- `unewoexls.prg` - New format
- `uwalxls.prg` - Walmart format
- `uoexls2.prg` - Multi-item block

**Process:**
1. User selects Excel file
2. System loads file into temporary table
3. Dynamic field detection
4. Validation
5. Data import to `moe`/`moehd` tables

**Code Reference:** See `docs/05-business-logic/excel-import-logic.md`

### Quantity Breakdown Import

**Formats:**
- CSV format
- XLS format

**Programs:**
- `uqty_breakdown` - CSV import
- `uqty_breakdown_xls` - XLS import

**Process:**
1. Import breakdown file
2. Validate against OE items
3. Create `mqtybrk` records

### Item Import

**Program:** `uimport_item.prg`

**Purpose:** Import items from Excel

**Process:**
1. Load Excel file
2. Map fields
3. Validate items
4. Import to `mitem` table

### HTS Import

**Program:** `uimport_hts.prg`

**Purpose:** Import HTS codes from Excel

### UPC Import

**Program:** `uimport_upc.prg`

**Purpose:** Import UPC codes from Excel

## Export Workflows

### Invoice Export

**Form:** `pinv_xls`

**Purpose:** Export invoice to Excel

**Format:** Excel file with invoice details

### Packing List Export

**Forms:**
- `ppacklist_xls` - Standard format
- `ppacklist_xls_spencer` - Spencer format

**Purpose:** Export packing list to Excel

**Format:** Excel file with packing details

### Order Enquiry Export

**Form:** `zoexls_batch`

**Purpose:** Export OE to Excel (batch mode)

**Format:** Excel file with OE details

### Delivery Note Export

**Form:** `pdn_xls`

**Purpose:** Create D/N Excel file

**Format:** Excel file with DN details

### Shipmark Export

**Form:** `psm_to_xls`

**Purpose:** Export shipmark to Excel

**Format:** Excel file with shipmark data

### Enquiry Exports

**Programs:**
- `enqbyitem_xls.prg` - Item enquiry to Excel
- `enqbyso2_xls.prg` - SO enquiry to Excel

**Purpose:** Export enquiry results to Excel

## Excel Formats Supported

### Import Formats

1. **Standard Format** - Generic Excel template
2. **Walmart Format** - Walmart-specific layout
3. **CSV Format (2013)** - Comma-separated values
4. **XLS Format (2013)** - Excel 2013 format
5. **Multi-Item Block** - Items grouped in blocks
6. **New Format** - Updated Excel template

### Export Formats

1. **Standard Excel** - Generic format
2. **Customer-Specific** - Custom formats per customer
3. **Spencer Format** - Spencer-specific layout
4. **Batch Export** - Multiple records

## Integration Methods

### ODBC Connection

**Usage:** Direct database connection to Excel files

**Method:** ODBC driver for Excel

### OLE Automation

**Usage:** Programmatic Excel control

**Method:** OLE/COM automation

### Direct File Reading

**Usage:** Read Excel files directly

**Method:** File parsing

## Template Handling

### Import Templates

**Customer-Specific Templates:**
- Different customers may have different Excel formats
- System adapts to format dynamically
- Field detection handles variations

### Export Templates

**Customer-Specific Formats:**
- Some exports use customer-specific templates
- Formats stored in system
- Applied during export

## Error Handling

### Import Errors

**File Errors:**
- File not found
- Invalid format
- Corrupted file

**Data Errors:**
- Invalid data types
- Missing required fields
- Validation failures

**Processing Errors:**
- Import failures
- Partial imports
- Data inconsistencies

### Export Errors

**Generation Errors:**
- File creation failures
- Format errors
- Data export failures

## Performance Considerations

### Large File Handling

- Processes files in chunks
- Uses temporary tables
- Clears memory between operations

### Network File Access

- Excel files may be on network shares
- Performance depends on network speed
- Local caching may be used

## Summary

Excel integration is extensive, supporting multiple import and export formats. The system dynamically adapts to different Excel layouts and provides customer-specific formats. Integration uses ODBC, OLE automation, and direct file reading methods.



