# Order Enquiry Process

## Overview

Order Enquiry (OE) is the entry point for customer orders. OEs can be created through Excel import or manual entry, and go through validation, processing, and posting workflows.

## OE Creation Methods

### 1. Excel Import

**Primary Method:** Most OEs are imported from Excel files

**Supported Formats:**
- Standard Excel format
- Walmart XLS format
- CSV format (2013)
- XLS format (2013)
- Multi-item block format
- New format Excel file

**Forms/Programs:**
- `uoexls` - Standard Excel import
- `uoexls_2013` - 2013 CSV format (1,747 lines - most complex)
- `uoexls_2013_xls` - 2013 XLS format
- `uoexls2` - Multi-item block format
- `unewoexls` - New format Excel
- `uwalxls` - Walmart format

**Code Reference:** `uoexls_2013.prg` (primary import logic)

### 2. Manual Entry

**Form:** `ioe1@` (Input OE New)

**Process:**
1. User enters OE number
2. System validates OE Control record
3. User enters items manually
4. System validates items and quantities
5. OE saved to database

## OE Validation Rules

### OE Control Record Validation

**Requirement:** OE must have control record in `moectrl` table

**Exception:** INSP company (adds "IN-" prefix automatically)

**Validation Logic (from `uoexls_2013.prg` lines 148-156):**
```foxpro
IF ALLTRIM(w_password)="INSP"
    w_oe_no="IN-"+ALLTRIM(w_oe_no)   
ELSE 
    select moectrl
    set order to OE_NO
    seek w_oe_no
    if eof()
        messagebox(w_oe_no+" --- No OE Control Record"+ chr(10)+"Import Skipped", 0+16, "Syster Message")
        loop
    ENDIF
ENDIF
```

**Business Rules:**
- OE Control record must exist before import (except INSP)
- OE number must match control record
- Customer code must match (validated separately)

### Customer Validation

**Requirement:** Customer code must exist in `mcustom` and match OE Control

**Validation Logic (lines 177-184):**
```foxpro
IF ALLTRIM(w_password)<>"INSP"
    if alltrim(w_cust_no)<>alltrim(moectrl.cust_no) and !empty(w_oe_no)
        messagebox("OE No.:"+alltrim(w_oe_no) +" --- OE Control Record Cust Code Not Match"+ chr(10)+"Import Skipped", 0+16, "Syster Message")
        loop
    ENDIF
ENDIF
```

**Additional Check (lines 185-190):**
```foxpro
select mcustom
locate for alltrim(mcustom.cust_no)== alltrim(w_cust_no)
w_show_sub_item=''
if !eof()
   w_show_sub_item = mcustom.show_sub_item_detail
endif
```

**Business Rules:**
- Customer must exist in `mcustom`
- Customer code from Excel must match OE Control customer
- Customer's `show_sub_item_detail` setting affects display

### Item Validation

**Requirement:** All items must exist in `mitem` table

**Validation Logic:**
- Items checked against `mitem` table
- Item number must match exactly
- Item must be active (not suspended)

**Code Reference:** `uoexls_2013.prg` (lines 22-28)

## Excel Import Process

### Step 1: File Loading

**Process:**
1. Excel file loaded into temporary table `woexlst`
2. File parsed row by row
3. Header row identified (contains field names)

### Step 2: Dynamic Field Detection

**Process:** System dynamically detects column positions by searching for keywords

**Fields Detected:**
- **Item:** Searches for "ITEM" in column headers
- **Sub SKN:** Searches for "SUB SKN" or "SUB SKU #"
- **SKU:** Searches for "SKU #"
- **Quantity:** Searches for "TOTAL PIECE", "TOTAL QTY", "TOT PIECE", "TOT QTY"
- **Ship From/To:** Searches for shipping date fields
- **Customer Ship From/To:** Searches for customer shipping dates
- **Remark:** Searches for "COMMENT"
- **Retail 1/2:** Searches for "RETAIL1", "RETAIL PRICE 1", etc.

**Code Reference:** `uoexls_2013.prg` (lines 227-433)

### Step 3: Data Extraction

**Process:**
1. Extract distinct OE numbers from file
2. For each OE number:
   - Group items (handle "SEE BELOW" for sub-items)
   - Process "SEE ABOVE" for SKU references
   - Extract quantities and dates
   - Validate data

**Code Reference:** `uoexls_2013.prg` (lines 131-224)

### Step 4: OE Header Creation

**Process:**
1. Check if OE header exists
2. If not, create new `moehd` record
3. Set OE number, date, user information

**Code Reference:** `uoexls_2013.prg` (lines 196-207)

### Step 5: OE Detail Creation

**Process:**
1. Create `moe` records for each item
2. Set item details (qty, price, cost, etc.)
3. Link to OE header
4. Set company code based on OE number format

**Code Reference:** `uoexls_2013.prg` (lines 216-218, `update_moe` procedure)

### Step 6: Quantity Breakdown Processing

**Process:**
1. Extract quantity breakdowns (size/color/style)
2. Create `mqtybrk` records
3. Link to OE and item

**Code Reference:** `uoexls_2013.prg` (line 217, `update_mqtybrk` procedure)

### Step 7: BOM Processing

**Process:**
1. Check if item has BOM in `mprodbom`
2. If yes, create `moebom` records for sub-items
3. Calculate sub-item quantities from BOM ratios

**Code Reference:** `uoexls_2013.prg` (line 218, `Process_Moe` procedure)

## Quantity Breakdown Processing

### Purpose

Track quantities by size, color, style variations within an item

### Storage

**Table:** `mqtybrk`

**Fields:**
- `oe_no` - Links to OE
- `item_no` - Links to item
- `size_code` - Size code
- `color_code` - Color code
- `style_code` - Style code
- `qty` - Quantity for this combination

### Processing Logic

**From Excel:**
- Extract breakdown columns
- Create one `mqtybrk` record per size/color/style combination
- Sum quantities for same combinations

**Manual Entry:**
- Form: `iqtybrk2` (Input Qty Breakdown By PO)
- User enters breakdowns manually
- System validates totals match item quantity

**Code Reference:** `uoexls_2013.prg` (line 220, `process_qty_breakdown` procedure)

## BOM Handling

### Product BOM Structure

**Table:** `mprodbom`

**Structure:**
- `item_no` - Parent item
- `sub_item` - Sub-item
- `qty` - Quantity of sub-item per parent

### OE BOM Processing

**Table:** `moebom`

**Process:**
1. Check if OE item has BOM in `mprodbom`
2. If yes:
   - Create `moebom` records for each sub-item
   - Calculate quantities: `sub_qty = head_qty * bom_qty / total_bom_qty`
   - Set prices and retail prices for sub-items

**Code Reference:** `uoexls_2013.prg` (line 218, `Process_Moe` procedure)

### BOM Quantity Calculation

**Formula (from `uordcont.prg` lines 53):**
```foxpro
replace morddt.qty with w_head_qty * mprodbom.qty / sum_qty.total_qty
```

**Process:**
1. Sum all BOM quantities for parent item
2. For each sub-item, calculate: `(head_qty * bom_qty) / total_bom_qty`
3. Distribute head quantity proportionally

## OE Control Record Requirements

### Purpose

OE Control records (`moectrl`) serve as:
- Validation checkpoint before OE creation
- Source of OE date
- Customer validation reference

### Required Fields

- `oe_no` - Order Enquiry number (Primary Key)
- `cust_no` - Customer number
- `oe_date` - Order Enquiry date

### Creation

**Form:** `ioectrl` (Input OE Control File)

**Process:**
1. User enters OE number
2. User selects customer
3. User enters OE date
4. System creates `moectrl` record

### Usage

**During OE Import:**
- Validates OE number exists
- Validates customer matches
- Provides OE date

**Code Reference:** `uoexls_2013.prg` (lines 148-175)

## Customer Matching Logic

### Process

1. Extract customer code from Excel (dynamic field detection)
2. Validate against `moectrl.cust_no`
3. Validate against `mcustom.cust_no`
4. Retrieve customer settings (e.g., `show_sub_item_detail`)

### Customer-Specific Behavior

**`show_sub_item_detail` Setting:**
- Affects how sub-items are displayed
- Retrieved from `mcustom` table
- Used in OE processing

**Code Reference:** `uoexls_2013.prg` (lines 185-190)

## Item Validation

### Process

1. Extract item numbers from Excel
2. Look up each item in `mitem` table
3. Validate item exists
4. Retrieve item details (price, cost, etc.)

### Item Lookup

**Code Reference:**
```foxpro
select mitem
set order to item_no
seek item_no
```

### Item Details Used

- Item description
- Standard price
- Cost
- Packing information
- Dimensions (cube, weight)
- HTC code
- Standard code

## Error Handling

### Validation Errors

**OE Control Not Found:**
- Error: "No OE Control Record"
- Action: Import skipped for that OE

**Customer Mismatch:**
- Error: "OE Control Record Cust Code Not Match"
- Action: Import skipped

**Invalid Item:**
- Error: Item not found in `mitem`
- Action: Item line skipped or error shown

### Processing Errors

**Quantity Errors:**
- Negative quantities
- Zero quantities
- Mismatched totals

**Date Errors:**
- Invalid date formats
- Missing required dates

## OE Status Management

### Status Values

- `status = 1` - Active/Posted (from `xmoe.prg` line 49)
- Other status codes may exist for different states

### Status Transitions

```
Created → Processing → Posted → Confirmed
```

### Status Updates

- Set during OE creation
- Updated when posted to OC
- May be updated during amendments

## Company-Specific Behavior

### HT (Holiday Times)
- OE numbers contain "/" character
- `comp_code = "HT"` set automatically

### BAT (Baitin Trading)
- OE numbers don't contain "/"
- `comp_code = "BAT"` set automatically

### INSP (InSpirt Designs)
- Adds "IN-" prefix to OE numbers
- Bypasses OE Control validation
- Uses different date logic

### HFW (Holiday Funworld)
- Uses "HFW" prefix for OE numbers
- `w_oe_prefix = "HFW"`

**Code Reference:** `xmoe.prg` (lines 50-54), `uoexls_2013.prg` (lines 145-147, 1337-1341)

## Summary

The Order Enquiry process is the foundation of the trading system. It handles complex Excel imports with dynamic field detection, validates data against master files, processes quantity breakdowns and BOMs, and prepares orders for confirmation. The process is highly configurable to support different customer formats and company-specific requirements.



