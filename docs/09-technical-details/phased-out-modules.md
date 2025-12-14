# Phased Out Modules

## Overview

Based on analysis of the menu structure (`BATMENUS.MPR`) and system workflow, several modules and features have been phased out and are disabled in the current system. These modules are still present in the codebase but are not accessible through the menu system.

## Disabled Modules

### 1. Document Printing Module (Fully Disabled)

**Menu Location:** Main menu pad "Document Printing" (ALT+D)

**Status:** Completely disabled with `SKIP FOR .t.`

**Sub-modules (contained in popup `_1880p3656`):**
- **Bank Draft Request** (`ibdrfreq`)
  - Input/Print Bank Draft Request
  - Related table: `mbdrfreq`
  
- **Collection Order** (`Icolord`)
  - Input/Print Collection Order
  - Related table: `mcolord`
  
- **Shipping Document Requirement** (`pshipreq`)
  - Print Shipping Document Requirement

**Reason for Phase-out:**
These banking and payment document printing functions appear to be legacy features that are no longer part of the core trading workflow. The current workflow focuses on:
- Order Enquiry → Order Confirmation → Contract → Shipping Order → Delivery Note → Invoice

The banking document printing module was likely used for payment processing and letter of credit documentation, which may have been replaced by external systems or manual processes.

## Disabled Features Within Active Modules

### 2. Order Enquiry Module - Disabled Features

**Change PO No. (Not in Use)**
- **Menu Location:** Order Enquiry → "Change PO No. (Not in Use)"
- **Status:** Disabled with `SKIP FOR .t.`
- **Form:** `ichangepo`
- **Purpose:** Was used to change Purchase Order numbers in existing orders
- **Reason:** Likely replaced by other order management processes or no longer needed

### 3. File Management Module - Disabled Item Import Features

Several item import functions are disabled:

**Import Item** (`uimport_item`)
- **Status:** Disabled with `SKIP FOR .t.`
- **Purpose:** Bulk import of items from external sources

**Import HTS** (`uimport_HTS`)
- **Status:** Disabled with `SKIP FOR .t.`
- **Purpose:** Import Harmonized Tariff Schedule codes for items

**Import UPC** (`uimport_upc`)
- **Status:** Disabled with `SKIP FOR .t.`
- **Purpose:** Import Universal Product Codes for items

**Import License Item From XLS** (`ilicense`)
- **Status:** Disabled with `SKIP FOR .t.`
- **Purpose:** Import licensed items from Excel files

**Reason for Phase-out:**
These import functions may have been replaced by:
- Manual data entry through the main "Input Item" form (`iitem`)
- Different import processes
- External data integration systems
- Or the need for these bulk imports diminished over time

## Related Tables (Potentially Unused)

Based on the phased-out modules, the following tables may be less frequently used or phased out:

### Banking/Payment Tables
- `mbdrfreq` - Bank Draft Request (used by disabled Document Printing module)
- `mcolord` - Collection Order (used by disabled Document Printing module)
- `mbankin` - Bank Information (may still be used for reference)
- `mpayhd` - Payment Header (may still be used in Delivery Report module)

### Legacy/Backup Tables
- `loe` - Legacy Order Enquiry (marked as legacy in table inventory)
- Various backup tables with `#` suffix or date suffixes

## Current Active Workflow

The current system workflow focuses on these core modules:

```
File Management (Master Data)
  ↓
Order Enquiry (OE)
  ↓
Order Confirmation (OC)
  ↓
Contract
  ↓
Shipping Order (SO)
  ↓
Delivery Note (DN)
  ↓
Invoice
```

**Supporting Modules:**
- Delivery Report (tracking and payment status)
- Enquiry (data analysis)
- Report (business reports)
- Acrobat File (PDF generation)

## Impact Analysis

### Code Still Present
- Forms and programs for phased-out modules still exist in the source code
- Tables for banking documents (`mbdrfreq`, `mcolord`) still exist
- Import programs still exist but are disabled

### Menu Structure
- Disabled items are hidden from users via `SKIP FOR .t.` condition
- Menu structure still references these items but they are not accessible

### Data Integrity
- Historical data in phased-out tables may still exist
- No automatic cleanup of old banking document records
- Legacy import data may still be in the database

## Recommendations

1. **Documentation:** Keep this documentation for reference during modernization
2. **Data Migration:** If modernizing, decide whether to migrate historical banking document data
3. **Code Cleanup:** Consider removing disabled menu items and unused forms during refactoring
4. **Table Cleanup:** Evaluate whether phased-out tables can be archived or removed

## Summary

**Fully Phased Out Modules:**
1. Document Printing Module (Banking/Payment documents)

**Partially Phased Out Features:**
1. Change PO No. function in Order Enquiry
2. Multiple Item Import functions in File Management

These phased-out modules represent approximately 1 full module and 5 individual features that are no longer part of the active trading workflow.
