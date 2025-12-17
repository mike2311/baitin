# Order Enquiry Module

## Overview

The Order Enquiry (OE) module handles the creation, import, validation, and processing of customer order enquiries. It is the entry point for all orders in the system.

## Forms

### OE Control
- **`ioectrl`** - Input OE Control File
- **`eoectrl`** - OE Control File Enquiry
- **`eoeact`** - OE Activity Enquiry
- **`eoerecord`** - OE Record Enquiry

### OE Import/Input/Print
- **`ioe1@`** - Input OE (New) - Manual entry form
- **`uoexls`** - Import OE from Excel File (standard format)
- **`uoexls_2013`** - Import OE from Excel (2013 CSV) - Most complex (1,747 lines)
- **`uoexls_2013_xls`** - Import OE from Excel (2013 XLS)
- **`unewoexls`** - Import OE (New Format Excel File)
- **`uwalxls`** - Import OE from Walmart XLS File
- **`uoexls2`** - Import OE from XLS (Multi Item Block)
- **`zoexls_batch`** - Export OE to XLS (Batch Mode)
- **`pordenq2`** - Print Order Enquiry (New)
- **`poedoc`** - Print OE Doc (OE, OC, CONT)

### Qty Breakdown
- **`iqtybrk2`** - Input Qty Breakdown By PO
- **`ppobrk`** - Print OE Qty Breakdown By PO No.
- **`uqty_breakdown`** - Import Qty Breakdown (CSV)
- **`uqty_breakdown_xls`** - Import Qty Breakdown (XLS)

### Other Enquiry
- **`poeerr`** - Check OE Data
- **`eoebypo`** - OE Enquiry By PO No.
- **`ioedeldate`** - Input O.E. Shipment Status

## Key Programs

### uoexls_2013.prg (1,747 lines)

**Purpose:** Primary Excel import program for 2013 CSV format

**Key Functions:**
1. Dynamic field detection (searches for "ITEM", "QTY", etc.)
2. OE Control validation
3. Customer validation
4. Item validation
5. Quantity breakdown processing
6. BOM processing
7. Data import to `moe` and `moehd` tables

**Complexity:** Most complex program in the system

**Code Reference:** See `docs/05-business-logic/excel-import-logic.md` for detailed analysis

### uoexls.prg

**Purpose:** Standard Excel import

**Features:**
- Standard Excel format support
- Basic validation
- Item and customer lookup

### unewoexls.prg

**Purpose:** New format Excel import

**Features:**
- Updated Excel format support
- Enhanced validation
- Improved error handling

### uwalxls.prg

**Purpose:** Walmart-specific Excel format

**Features:**
- Walmart format parsing
- Custom field mapping
- Walmart-specific validations

## Excel Import Formats Supported

1. **Standard Format** - Generic Excel template
2. **Walmart Format** - Walmart-specific layout
3. **CSV Format (2013)** - Comma-separated values
4. **XLS Format (2013)** - Excel 2013 format
5. **Multi-Item Block** - Items grouped in blocks
6. **New Format** - Updated Excel template

## Validation Logic

### OE Control Validation
- OE must have control record in `moectrl`
- Exception: INSP company (adds "IN-" prefix)
- Customer code must match

### Customer Validation
- Customer must exist in `mcustom`
- Customer code validated against OE Control
- Customer settings retrieved (`show_sub_item_detail`)

### Item Validation
- Items must exist in `mitem`
- Item numbers validated
- Item details retrieved (price, cost, etc.)

## Qty Breakdown Entry

### Manual Entry
- **Form:** `iqtybrk2`
- User enters breakdowns by size/color/style
- System validates totals match item quantity

### Import
- **CSV Import:** `uqty_breakdown`
- **XLS Import:** `uqty_breakdown_xls`
- Import breakdowns from Excel

### Storage
- **Table:** `mqtybrk`
- One record per size/color/style combination
- Linked to OE and item

## BOM Processing

### Product BOM
- **Table:** `mprodbom`
- Defines parent/sub-item relationships
- Quantities per parent item

### OE BOM
- **Table:** `moebom`
- BOM items for specific OE
- Quantities calculated from `mprodbom`
- Created during OE processing

### Processing Logic
- Check if item has BOM
- Create sub-item records
- Calculate quantities proportionally
- Set prices and retail prices

## Tables Accessed

### Primary Tables
- `moe` - OE Detail
- `moehd` - OE Header
- `moectrl` - OE Control
- `mqtybrk` - Quantity Breakdown
- `moebom` - OE BOM

### Lookup Tables
- `mitem` - Items
- `mcustom` - Customers
- `mvendor` - Vendors
- `mprodbom` - Product BOM
- `mskn` - SKN mapping

## Business Rules

1. **OE Control Required:** OE must have control record (except INSP)
2. **Customer Match:** Customer must match OE Control
3. **Item Validation:** All items must exist
4. **Qty Breakdown:** Optional, but validated if present
5. **BOM Processing:** Automatic if item has BOM
6. **Company Codes:** Set based on OE number format

## Error Handling

### Validation Errors
- OE Control not found → Import skipped
- Customer mismatch → Import skipped
- Invalid item → Item line skipped
- Missing required fields → Error shown

### Processing Errors
- Quantity errors → Validation error
- Date format errors → Conversion error
- BOM calculation errors → Default quantities used

## Reporting

### OE Reports
- **`pordenq2`** - Order Enquiry report
- **`poedoc`** - OE document (OE, OC, CONT)
- **`ppobrk`** - Qty breakdown by PO
- **`eoectrl`** - OE Control enquiry
- **`eoeact`** - OE Activity enquiry
- **`eoerecord`** - OE Record enquiry

## Summary

The Order Enquiry module is the foundation of the order processing system. It handles complex Excel imports with dynamic field detection, validates data against master files, processes quantity breakdowns and BOMs, and prepares orders for confirmation. The module supports multiple Excel formats and provides comprehensive validation and error handling.



