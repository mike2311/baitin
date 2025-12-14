# Program Inventory

## Overview

The system contains 176+ program files (.prg) containing business logic, utilities, and data processing routines.

## Program Count

- **Total Programs:** 176+ (.prg files identified)
- **Categories:** Business logic, utilities, data conversion, reporting

## Key Programs by Category

### Excel Import Programs
- `uoexls_2013.prg` - Excel import (2013 CSV) - 1,747 lines (most complex)
- `uoexls.prg` - Standard Excel import
- `unewoexls.prg` - New format Excel import
- `uwalxls.prg` - Walmart format import
- `uoexls2.prg` - Multi-item block format
- `enqbyitem_xls.prg` - Item enquiry Excel export
- `enqbyso2_xls.prg` - SO enquiry Excel export

### Data Processing Programs
- `uordcont.prg` - Update OC/Contract
- `uwcontract.prg` - Contract generation
- `upostoe.prg` - Post OE to OC
- `uworderconf.prg` - Order confirmation processing

### Data Import/Export Programs
- `xitem.prg` - Import items from legacy system
- `xcustom.prg` - Import customers from legacy system
- `xvendor.prg` - Import vendors from legacy system
- `xmoe.prg` - Import OE from legacy system
- `xinvhd.prg` - Import invoice header
- `xinvdt.prg` - Import invoice detail
- `xordhd.prg` - Import OC header
- `xorddt.prg` - Import OC detail
- `xconthd.prg` - Import contract header
- `xcontdt.prg` - Import contract detail
- `xmso.prg` - Import shipping order

### Utility Programs
- `zdoc.prg` - Reindex utility
- `systemtools.prg` - System tools
- `getToday.prg` - Get today's date
- `userid.prg` - Get user ID
- `getexrate.prg` - Get exchange rate
- `getzPara.prg` - Get system parameter

### Report Programs
- `pinv.prg` - Invoice printing logic
- `pso.prg` - SO printing
- `pcontract.prg` - Contract printing
- `ppacklist1_new.prg` - Packing list
- `printreport.prg` - Generic report printing

### Data Conversion Programs
- `zvencon.prg` - Vendor code conversion
- `zchange_item.prg` - Change item number
- `zdr_so_conv.prg` - DR SO conversion
- `zdr_dn_conv.prg` - DR DN conversion
- `add_cxl.prg` - Add cancel status

### String/Text Processing Programs
- `charcon.prg` - Character concatenation
- `cutchar.prg` - Cut characters
- `cutline.prg` - Cut lines
- `cutremark.prg` - Cut remarks
- `cutspace.prg` - Cut spaces
- `numtoeng.prg` - Number to English
- `dateword.prg` - Date to words

### Calculation Programs
- `totprice.prg` - Total price calculation
- `curprice.prg` - Current price
- `count_moebom.prg` - Count OE BOM
- `subnum.prg` - Extract number from string

### Reindex Programs
- `zmoe.prg` - Reindex OE
- `zmordhd.prg` - Reindex OC header
- `zmorddt.prg` - Reindex OC detail
- `zmconthd.prg` - Reindex contract header
- `zmcontdt.prg` - Reindex contract detail
- `zmitem.prg` - Reindex items
- `zmcustom.prg` - Reindex customers
- `zminvhd.prg` - Reindex invoice header
- `zminvdt.prg` - Reindex invoice detail
- `zmso.prg` - Reindex shipping order

## Program Complexity

### Most Complex Programs

1. **`uoexls_2013.prg`** - 1,747 lines
   - Excel import with dynamic field detection
   - Complex validation and processing

2. **`uoexls.prg`** - Large program
   - Standard Excel import
   - Multiple format support

3. **`uwcontract.prg`** - Medium complexity
   - Contract generation logic
   - Vendor grouping

## Program Dependencies

### Call Hierarchy

```
main.prg
  ↓
ILOGON (form)
  ↓
BATMENUS.MPX / BATMENU.MPX
  ↓
Forms → Programs
  ↓
Utility Programs
```

### Common Utilities

Many programs use:
- `charcon.prg` - String concatenation
- `getToday.prg` - Date functions
- `userid.prg` - User identification
- `numtoeng.prg` - Number formatting

## Program Organization

### By Function

- **Import/Export:** Excel, legacy data
- **Processing:** Order, contract, invoice processing
- **Utilities:** Reindex, conversion, tools
- **Reporting:** Report generation
- **Text Processing:** String manipulation
- **Calculations:** Price, quantity calculations

## Summary

The system has 176+ programs organized by function. The most complex is `uoexls_2013.prg` (1,747 lines) handling Excel imports. Programs follow naming conventions and are called from forms or other programs.



