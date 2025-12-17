# Form Inventory

## Overview

The system contains 118+ forms referenced in the menu system, providing user interfaces for all system functions. Forms are organized by functional module and follow consistent naming conventions.

## Form Count

- **Total Forms in Menu:** 118+ forms (from BATMENUS.MPR)
- **Total Forms in System:** 195+ (.scx files identified in source directory)
- **Categories:** Authentication, Master Data, Transaction Entry, Enquiry, Report, Utility forms

## Complete Form Inventory by Module

### Authentication Forms (1 form)

| Form Name | Description | Menu Location |
|-----------|-------------|---------------|
| `ilogon` | Login form | Called from main.prg |

### Master Data Entry Forms (21 forms)

#### Item Management (9 forms)
| Form Name | Description | Menu Location |
|-----------|-------------|---------------|
| `iitem` | Input Item | File → Item → Input Item |
| `uimport_item` | Import Item | File → Item → Import Item (disabled) |
| `uimport_HTS` | Import HTS | File → Item → Import HTS (disabled) |
| `uimport_upc` | Import UPC | File → Item → Import UPC (disabled) |
| `iprodbom` | Product BOM | File → Item → Product BOM |
| `izstdcode` | Standard Code | File → Item → Standard Code |
| `ipurunit` | Purchase Unit | File → Item → Purchase Unit |
| `ilicense` | Import License Item From XLS | File → Item → Import License Item From XLS (disabled) |
| `izorigin` | Country of Origin | File → Item → Country of Origin |

#### Customer Management (10 forms)
| Form Name | Description | Menu Location |
|-----------|-------------|---------------|
| `icustom` | Customer | File → Customer → Customer |
| `icustinv` | Customer Invoice Parameter | File → Customer → Customer Invoice Parameter |
| `iskn` | SKN No. | File → Customer → SKN No. |
| `ishipmark` | Ship Mark | File → Customer → Ship Mark |
| `ipayterm` | Payment Terms | File → Customer → Payment Terms |
| `ifobport` | FOB Port | File → Customer → FOB Port |
| `ifobterm` | Input FOB Terms | File → Customer → Input FOB Terms |
| `ittrgp` | Input TTR Group | File → Customer → Input TTR Group |
| `itest` | Input Testing/Inspection/Sample Approval | File → Customer → Input Testing/Inspection/Sample Approval |
| `ishippara` | Customer Shipment Parameter | File → Customer → Customer Shipment Parameter |

#### Vendor Management (2 forms)
| Form Name | Description | Menu Location |
|-----------|-------------|---------------|
| `ivendor` | Vendor | File → Vendor → Vendor |
| `imftr` | Input Manufacturer | File → Vendor → Input Manufacturer |

#### System Administration (4 forms)
| Form Name | Description | Menu Location |
|-----------|-------------|---------------|
| `iuser` | Input User Account | File → Input User Account |
| `ipara2` | Input Company Info | File → Input Company Info. |
| `isuspended_item` | Input Suspended Item | File → Input Suspended Item |
| `zdel_data` | Delete Data | File → Delete Data |

#### Data Conversion (3 forms)
| Form Name | Description | Menu Location |
|-----------|-------------|---------------|
| `zvencon` | Vendor Code Conversion | File → Vendor Code Conversion |
| `zdr_so_conv` | Data Conv - DR SO | File → Data Conv - DR SO |
| `zdr_dn_conv` | Data Conv - DR DN | File → Data Conv - DR DN |
| `zchange_item` | Data Conv - Change Item No. | File → Data Conv - Change Item No. |

### Order Enquiry Forms (20 forms)

#### OE Control (4 forms)
| Form Name | Description | Menu Location |
|-----------|-------------|---------------|
| `ioectrl` | Input OE Control File | Order Enquiry → OE Control → Input OE Control File |
| `eoectrl` | OE Control File Enquiry | Order Enquiry → OE Control → OE Control File Enquiry |
| `eoeact` | OE Activity Enquiry | Order Enquiry → OE Control → OE Activity Enquiry |
| `eoerecord` | OE Record Enquiry | Order Enquiry → OE Control → OE Record Enquiry |

#### OE Import/Input/Print (10 forms)
| Form Name | Description | Menu Location |
|-----------|-------------|---------------|
| `uoexls` | Import OE from Excel File | Order Enquiry → Import/Input/Print Order Enquiry → Import OE from Excel File |
| `ioe1@` | Input OE (New) | Order Enquiry → Import/Input/Print Order Enquiry → Input OE (New) |
| `pordenq2` | Print Order Enquiry (New) | Order Enquiry → Import/Input/Print Order Enquiry → Print Order Enquiry (New) |
| `poedoc` | Print OE Doc (OE, OC, CONT) | Order Enquiry → Import/Input/Print Order Enquiry → Print OE Doc (OE, OC, CONT) |
| `uwalxls` | Import OE from Walmart XLS File | Order Enquiry → Import/Input/Print Order Enquiry → Import OE from Walmart XLS File |
| `unewoexls` | Import OE (New Format Excel File) | Order Enquiry → Import/Input/Print Order Enquiry → Import OE (New Format Excel File) |
| `uoexls2` | Import OE from XLS (Multi Item Block) | Order Enquiry → Import/Input/Print Order Enquiry → Import OE from XLS (Multi Item Block) |
| `zoexls_batch` | Export OE to XLS (Batch Mode) | Order Enquiry → Import/Input/Print Order Enquiry → Export OE to XLS (Batch Mode) |
| `uoexls_2013` | Import OE from Excel File (2013 - CSV) | Order Enquiry → Import/Input/Print Order Enquiry → Import OE from Excel File (2013 - CSV) |
| `uoexls_2013_xls` | Import OE from Excel File (2013 - XLS) | Order Enquiry → Import/Input/Print Order Enquiry → Import OE from Excel File (2013 - XLS) |

#### Qty Breakdown (4 forms)
| Form Name | Description | Menu Location |
|-----------|-------------|---------------|
| `iqtybrk2` | Input Qty Breakdown By PO | Order Enquiry → Input/Print Qty Breakdown → Input Qty Breakdown By PO |
| `ppobrk` | Print OE Qty Breakdown By PO No. | Order Enquiry → Input/Print Qty Breakdown → Print OE Qty Breakdown By PO No. |
| `uqty_breakdown` | Import Qty Breakdown (CSV) | Order Enquiry → Input/Print Qty Breakdown → Import Qty Breakdown (CSV) |
| `uqty_breakdown_xls` | Import Qty Breakdown (XLS) | Order Enquiry → Input/Print Qty Breakdown → Import Qty Breakdown (XLS) |

#### Other Enquiry (2 forms)
| Form Name | Description | Menu Location |
|-----------|-------------|---------------|
| `poeerr` | Check OE Data | Order Enquiry → Other Enquiry → Check OE Data |
| `eoebypo` | OE Enquiry By PO No. | Order Enquiry → Other Enquiry → OE Enquiry By PO No. |
| `ioedeldate` | Input O.E. Shipment Status | Order Enquiry → Other Enquiry → Input O.E. Shipment Status |
| `ichangepo` | Change PO No. (Not in Use) | Order Enquiry → Change PO No. (Not in Use) (disabled) |
| `ichangecustno` | Change Customer No. (All Documents) | Order Enquiry → Change Customer No. (All Documents) |

### Order Confirmation Forms (4 forms)

| Form Name | Description | Menu Location |
|-----------|-------------|---------------|
| `upostoe` | Post OE/Post OC | Order Confirmation → Post OE/Post OC |
| `iordhd` | Input Order Confirmation | Order Confirmation → Input Order Confirmation |
| `pconfirm` | Print Order Confirmation | Order Confirmation → Print Order Confirmation |
| `pocbrk` | Print OC Qty Breakdown By O/C No. | Order Confirmation → Print OC Qty Breakdown By O/C No. |

### Contract Forms (6 forms)

| Form Name | Description | Menu Location |
|-----------|-------------|---------------|
| `pitname` | Print Item Desp for Carton Making | Contract → Print Item Desp for Carton Making |
| `pcontbrk` | Print Contract Qty Breakdown By Vendor | Contract → Print Contract Qty Breakdown By Vendor |
| `pcontamdrmk` | Print Contract Amendment | Contract → Print Contract Amendment |
| `isetcont@@` | Input Contract (2018) | Contract → Input Contract (2018) |
| `pcontract@_2018` | Print Contract (2018) | Contract → Print Contract (2018) |
| `isetcont@@_2018` | Input Contract (2018 Fast) | Contract → Input Contract (2018 Fast) |

### Shipping Order Forms (3 forms)

| Form Name | Description | Menu Location |
|-----------|-------------|---------------|
| `isetso` | Input Shipping Order | Shipping Order → Input Shipping Order |
| `pso` | Print Shipping Order | Shipping Order → Print Shipping Order |
| `isoformat` | Input Shipping Order Format | Shipping Order → Input Shipping Order Format |

### Delivery Note Forms (6 forms)

| Form Name | Description | Menu Location |
|-----------|-------------|---------------|
| `idn` | Input D/N | DN → Input D/N |
| `pdn_xls` | Create D/N Excel File | DN → Create D/N Excel File |
| `iload` | Input Loading Master | DN → Input Loading Master |
| `isetla` | Input Loading Advice | DN → Input Loading Advice |
| `pla` | Print Loading Advice | DN → Print Loading Advice |
| `pdnorg` | Print D/N Original List | DN → Print D/N Original List |

### Invoice Forms (10 forms)

| Form Name | Description | Menu Location |
|-----------|-------------|---------------|
| `PPACKLIST` | Print Packing List | Invoice → Print Packing List |
| `pshadvice` | Print Shipment Advice | Invoice → Print Shipment Advice |
| `iinvhd@` | Input Invoice (New) | Invoice → Input Invoice (New) |
| `pinv@` | Print Invoice (New) | Invoice → Print Invoice (New) |
| `ppacklist_new` | Print Packing List (New) | Invoice → Print Packing List (New) |
| `pinv_xls` | Print Invoice to XLS | Invoice → Print Invoice to XLS |
| `ppacklist_xls` | Print Packing List to XLS | Invoice → Print Packing List to XLS |
| `einvoice` | Enquiry By Invoice | Invoice → Enquiry By Invoice |
| `pdebitnote` | Print Debit Note | Invoice → Print Debit Note |
| `ppacklist_xls_spencer` | Print Packing List to XLS (Spencer Format) | Invoice → Print Packing List to XLS (Spencer Format) |

### Delivery Report Forms (4 forms)

| Form Name | Description | Menu Location |
|-----------|-------------|---------------|
| `ideldate` | Input Actual Delivery Date | Delivery Report → Input Actual Delivery Date |
| `iauthpay` | Check / Authorize Maker Invoice | Delivery Report → Check / Authorize Maker Invoice |
| `emkinvstat` | Delivery Report Enquiry | Delivery Report → Delivery Report Enquiry |
| `epaystat` | Enquiry By Payment Status | Delivery Report → Enquiry By Payment Status |

### Document Printing Forms (3 forms) - Disabled Menu

| Form Name | Description | Menu Location |
|-----------|-------------|---------------|
| `ibdrfreq` | Input / Print Bank Draft Request | Document Printing → Input / Print Bank Draft Request (disabled) |
| `Icolord` | Input / Print Collection Order | Document Printing → Input / Print Collection Order (disabled) |
| `pshipreq` | Print Shipping Document Requirement | Document Printing → Print Shipping Document Requirement (disabled) |

### Enquiry Forms (13 forms)

| Form Name | Description | Menu Location |
|-----------|-------------|---------------|
| `sabycust` | Detail Sales Analysis By Customer | Enquiry → Detail Sales Analysis By Customer |
| `esabycd` | Sales Analysis By Customer - Date | Enquiry → Sales Analysis By Customer - Date |
| `esabyid` | Sales Analysis By Item - Date | Enquiry → Sales Analysis By Item - Date |
| `enqbyitem` | Enquiry By Item | Enquiry → Enquiry By Item |
| `enqbyso` | Enquiry By S/O | Enquiry → Enquiry By S/O |
| `ecostbrk` | Cost Breakdown Enquiry | Enquiry → Cost Breakdown Enquiry |
| `eoesumry` | OE Summary Enquiry / Report | Enquiry → OE Summary Enquiry / Report |
| `eocsumry` | OC Summary Enquiry / Report | Enquiry → OC Summary Enquiry / Report |
| `econtsumry` | Contract Summary Enquiry / Report | Enquiry → Contract Summary Enquiry / Report |
| `einvsumry` | Invoice Summary Enquiry | Enquiry → Invoice Summary Enquiry |
| `enqbyso2` | Enquiry By S/O Multiple Search | Enquiry → Enquiry By S/O Multiple Search |
| `eisbystd` | Invoice Sales By Standard Code | Enquiry → Invoice Sales By Standard Code |
| `enqbyitem_new` | Enquiry By Item (New Format) | Enquiry → Enquiry By Item (New Format) |

### Report Forms (14 forms)

| Form Name | Description | Menu Location |
|-----------|-------------|---------------|
| `pocqty` | OC Qty & Pricing Report | Report → OC Qty & Pricing Report |
| `pordbyitem` | Order Report By Item | Report → Order Report By Item |
| `psabycust` | Sales Report By Customer | Report → Sales Report By Customer |
| `pitem` | Item Detail Report | Report → Item Detail Report |
| `pitemsum` | Item Bought (Excel File) | Report → Item Bought (Excel File) |
| `pitemmeas` | Item Measurement (Excel File) | Report → Item Measurement (Excel File) |
| `poe_08_10` | OE LIST 08 - 10 | Report → OE LIST 08 - 10 |
| `pinv_08_10` | INV LIST 08 - 10 | Report → INV LIST 08 - 10 |
| `psabydt` | Sales Analysis By Customer | Report → Sales Analysis By Customer |
| `psabyitem` | Sales Analysis By Customer, Item No. | Report → Sales Analysis By Customer, Item No. |
| `polbymk` | Order List By Maker | Report → Order List By Maker |
| `itemlist_by_oe` | Item List By OE Date | Report → Item List By OE Date |
| `psm_to_xls` | Print Shipmark to XLS | Report → Print Shipmark to XLS |
| `isetcont@@_test` | Contract Speed Check | Report → Contract Speed Check |

### Acrobat/PDF Forms (4 forms)

| Form Name | Description | Menu Location |
|-----------|-------------|---------------|
| `pordenq_pdf` | Order Enquiry | Acrobat File → Order Enquiry |
| `pconfirm` | Order Confirmation | Acrobat File → Order Confirmation |
| `pcontract_pdf` | Contract | Acrobat File → Contract |
| `pinv_pdf` | Invoice | Acrobat File → Invoice |

## Form Statistics

### By Category
- **Authentication:** 1 form
- **Master Data Entry:** 21 forms
- **Order Enquiry:** 20 forms
- **Order Confirmation:** 4 forms
- **Contract:** 6 forms
- **Shipping Order:** 3 forms
- **Delivery Note:** 6 forms
- **Invoice:** 10 forms
- **Delivery Report:** 4 forms
- **Document Printing:** 3 forms (disabled)
- **Enquiry:** 13 forms
- **Report:** 14 forms
- **Acrobat/PDF:** 4 forms

**Total Menu Forms:** 109 active forms + 9 disabled/utility = 118+ forms

### By Function Type
- **Input/Entry Forms (i prefix):** 40+ forms
- **Print/Report Forms (p prefix):** 30+ forms
- **Enquiry Forms (e/enq prefix):** 20+ forms
- **Utility Forms (z/u prefix):** 15+ forms
- **Import Forms (u prefix):** 10+ forms

## Form-to-Module Mapping

See `docs/03-application-modules/module-inventory.md` for detailed module-to-form mapping.

### Module Summary

| Module | Form Count | Key Forms |
|--------|------------|-----------|
| File Management | 21 | iitem, icustom, ivendor, iuser, ipara2 |
| Order Enquiry | 20 | ioe1@, ioectrl, uoexls_2013, iqtybrk2 |
| Order Confirmation | 4 | upostoe, iordhd, pconfirm |
| Contract | 6 | isetcont@@_2018, iconthd_2018, pcontract@_2018 |
| Shipping Order | 3 | isetso, isetsodt, pso |
| Delivery Note | 6 | idn, iload, isetla, pla |
| Invoice | 10 | iinvhd@, iinvdt2@, pinv@, ppacklist_new |
| Delivery Report | 4 | ideldate, iauthpay, emkinvstat |
| Enquiry | 13 | enqbyitem, enqbyso, eoesumry, einvsumry |
| Report | 14 | pocqty, psabycust, pitem, polbymk |
| Acrobat/PDF | 4 | pordenq_pdf, pcontract_pdf, pinv_pdf |

## Form Naming Conventions

### Input Forms
- **Prefix `i`:** Input/Entry forms (e.g., `iitem`, `icustom`, `ioe1@`)
- **Prefix `iset`:** Setup/Configuration forms (e.g., `isetso`, `isetcont@@_2018`)

### Print Forms
- **Prefix `p`:** Print/Report forms (e.g., `pinv@`, `pso`, `pconfirm`, `ppacklist_new`)

### Enquiry Forms
- **Prefix `e`:** Enquiry forms (e.g., `einvoice`, `eoesumry`, `eocsumry`)
- **Prefix `enq`:** Enquiry forms (e.g., `enqbyitem`, `enqbyso`)

### Utility Forms
- **Prefix `z`:** Utility/Conversion forms (e.g., `zvencon`, `zchange_item`, `zdel_data`)
- **Prefix `u`:** Import/Utility forms (e.g., `uoexls`, `uimport_item`, `uqty_breakdown`)

### Special Characters
- **`@` suffix:** New/updated version of form (e.g., `ioe1@`, `iinvhd@`, `pinv@`)
- **`_2018` suffix:** 2018 version of form (e.g., `isetcont@@_2018`, `iconthd_2018`)
- **`_xls` suffix:** Excel export form (e.g., `ppacklist_xls`, `pinv_xls`)
- **`_pdf` suffix:** PDF generation form (e.g., `pordenq_pdf`, `pinv_pdf`)

## Form Files

### Structure
- **`.scx`** - Form file (binary, contains form structure and layout)
- **`.sct`** - Form memo file (text format, contains form code, event handlers, and methods)

### Location
- All forms in `source/` directory
- Forms referenced by menu system (`BATMENUS.MPR`)
- Forms may call other forms or programs

### Form Code Location
- Form logic is stored in `.SCT` files (readable text format)
- Event handlers: `Load`, `Init`, `GotFocus`, `Valid`, `Click`, `Refresh`, `Unload`
- Custom methods defined in formset or form level
- Data environment cursors defined in form

## Form Dependencies

### Forms That Call Other Forms
- `ioe1@` → calls `ioe2` (for item entry)
- `iitem` → calls `iitemven` (for item-vendor relationship)
- `iitem` → calls `zcopyitem` (for copying items)
- `iinvdt2@` → calls `iinvdtmftr` (for item entry)
- Many forms call lookup/search forms

### Forms That Call Programs
- Excel import forms call `.prg` files for processing
- Report forms call `.prg` files for data preparation
- Utility forms may call `.prg` files for batch operations

## Summary

The system has **118+ forms** organized by functional module. Forms follow consistent naming conventions and are mapped to business processes. Each form contains extensive logic in `.SCT` files including:

- Event handlers for user interactions
- Validation rules and business logic
- Database operations (SELECT, APPEND, REPLACE, DELETE)
- Grid population and data binding
- Form-to-form navigation

Detailed form logic documentation is available in category-specific documentation files.



