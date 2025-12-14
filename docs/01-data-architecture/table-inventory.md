# Table Inventory

## Complete List of DBF Tables

This document provides a comprehensive inventory of all 186 DBF tables identified in the system.

## Table Categorization

### Transaction Tables (Header/Detail)

#### Order Enquiry (OE)
- `moe` - Order Enquiry Detail
- `moehd` - Order Enquiry Header
- `moectrl` - Order Enquiry Control
- `loe` - Legacy Order Enquiry

#### Order Confirmation (OC)
- `mordhd` - Order Confirmation Header
- `morddt` - Order Confirmation Detail
- `mordadj` - Order Adjustment

#### Contract
- `mconthd` - Contract Header
- `mcontdt` - Contract Detail
- `mcontamdrmk` - Contract Amendment Remark

#### Shipping Order
- `mso` - Shipping Order

#### Delivery Note (DN)
- `mdnhd` - Delivery Note Header
- `mdndt` - Delivery Note Detail
- `mdnbrk` - Delivery Note Breakdown

#### Invoice
- `minvhd` - Invoice Header
- `minvdt` - Invoice Detail
- `minvadj` - Invoice Adjustment
- `minvbd` - Invoice Breakdown
- `minvqtybrk` - Invoice Quantity Breakdown

#### Loading
- `mlahd` - Loading Advice Header
- `mladt` - Loading Advice Detail
- `mload` - Loading Master

### Master Data Tables

#### Items
- `mitem` - Item Master
- `mitemmftr` - Item Manufacturer
- `mitemven` - Item Vendor relationships

#### Customers
- `mcustom` - Customer Master

#### Vendors
- `mvendor` - Vendor Master
- `zmftr` - Manufacturer

#### BOM (Bill of Materials)
- `mprodbom` - Product BOM
- `moebom` - Order Enquiry BOM

### Supporting/Reference Tables

#### Quantity & Pricing
- `mqtybrk` - Quantity Breakdown
- `mspecprice` - Special Pricing

#### Codes & Standards
- `zstdcode` - Standard Code
- `zorigin` - Country of Origin
- `zfobport` - FOB Port
- `zfobterm` - FOB Terms
- `zpayterm` - Payment Terms
- `zcurcode` - Currency Code
- `zpurunit` - Purchase Unit
- `zcountry` - Country
- `zountry` - Country (alternate)

#### Shipping & Logistics
- `mshipmark` - Shipping Mark
- `mshipqty` - Shipping Quantity
- `misship` - Shipment Information

#### Business Rules
- `mskn` - SKN Number
- `mactivity` - Activity Log
- `zpara` - System Parameters
- `zsoformat` - Shipping Order Format
- `zsoformat1` - Shipping Order Format 1
- `zsoformat2` - Shipping Order Format 2
- `zsoformat@` - Shipping Order Format (alternate)
- `zchgso` - Change Shipping Order
- `zvencon` - Vendor Conversion

#### Payment & Banking
- `mpayhd` - Payment Header
- `mbankin` - Bank Information
- `mbdrfreq` - Bank Draft Request
- `mcolord` - Collection Order

#### Other Business
- `mforward` - Forward
- `mordsm` - Order SM
- `mmaker` - Maker
- `mvenmaker` - Vendor Maker
- `minstore` - In Store
- `mact` - Activity

### User & Security Tables
- `user` - User Accounts
- `user#` - User Accounts (backup)
- `rights` - User Rights
- `rights#` - User Rights (backup)
- `MLOGPARA` - Login Parameters

### Work/Temporary Tables
- `woexls` - Work OE Excel
- `woexlst` - Work OE Excel List
- `wsknlog` - Work SKN Log
- `wsuspend` - Work Suspend
- `wcontract` - Work Contract
- `wpa` - Work PA
- `wpdn` - Work PDN
- `wsetcontgrid1` - Work Set Contract Grid
- `w_array` - Work Array
- `wibankingrid1` - Work Banking Grid
- `wtempoe` - Work Temp OE
- `wIL51620` - Work IL (temporary)
- `wIL95755` - Work IL (temporary)
- `wIL66845` - Work IL (temporary)
- `wIL64838` - Work IL (temporary)
- `wIL94154` - Work IL (temporary)
- `wIL88367` - Work IL (temporary)
- `wIL54196` - Work IL (temporary)
- `wIL48170` - Work IL (temporary)
- `wIL34820` - Work IL (temporary)
- `wIL59622` - Work IL (temporary)
- `wIL13336` - Work IL (temporary)
- `wIL99359` - Work IL (temporary)
- `wIL40290` - Work IL (temporary)
- `wIL55116` - Work IL (temporary)

### Cursor/Query Result Tables
- `voe1` - View OE 1
- `vocsumry1` - View OC Summary
- `vcontsumry1` - View Contract Summary
- `voesumry1` - View OE Summary
- `vQueryCursor` - View Query Cursor
- `vcontdt` - View Contract Detail
- `CUS` - Customer (cursor)
- `CUS_CUSTOR` - Customer Cursor

### Temporary/Test Tables
- `TEMP` - Temporary
- `test` - Test
- `test_table` - Test Table
- `temptable` - Temp Table
- `temp_table` - Temp Table
- `temp_grid1` - Temp Grid 1
- `temp_grid2` - Temp Grid 2
- `temp_morddt` - Temp Order Detail
- `temp_ship` - Temp Ship
- `temp_oe` - Temp OE
- `xx` - Temporary X
- `x` - Temporary

### Legacy/Backup Tables
- `moe_20230705 - 複製` - OE Backup (2023-07-05)
- `minvhd - 複製` - Invoice Header Backup
- `minvdt - 複製` - Invoice Detail Backup
- `minvhd#` - Invoice Header Backup
- `minvhd# - 複製` - Invoice Header Backup Copy
- `mitem#` - Item Backup
- `mconthd#` - Contract Header Backup
- `mcontdt#` - Contract Detail Backup
- `mconthd_20130315` - Contract Header (2013-03-15)
- `mcontdt_20130315` - Contract Detail (2013-03-15)

### Data Conversion Tables
- `oe_xls` - OE Excel
- `so_temp_table` - SO Temp Table
- `update_mcontdt_temp_table` - Update Contract Detail Temp
- `pso_dbf` - PSO DBF
- `toe` - Temp OE

### Special Purpose Tables
- `seritem` - Serial Item
- `zseritem` - Serial Item (alternate)
- `zchitem` - Change Item
- `zttrgp` - TTR Group
- `zcustcostbrk` - Customer Cost Breakdown
- `zdr_dn_conv` - DR DN Conversion
- `zdr_so_conv` - DR SO Conversion
- `&w_Wplicense` - Work License (dynamic name)
- `&w_wcontdt` - Work Contract Detail (dynamic)
- `&w_wiorddt` - Work Order Detail (dynamic)
- `&w_wpdn` - Work PDN (dynamic)
- `&w_sogrid` - Work SO Grid (dynamic)
- `&w_drgrid` - Work DR Grid (dynamic)
- `&w_smxls` - Work SM Excel (dynamic)
- `&w_stdcode` - Work Standard Code (dynamic)
- `&witemlog` - Work Item Log (dynamic)
- `&w_wenqbyitem` - Work Enquiry By Item (dynamic)
- `&vocsumry1` - View OC Summary (dynamic)
- `&w_vcontsumry1` - View Contract Summary (dynamic)

### Report/Summary Tables
- `wsabycust2` - Work Sales By Customer 2
- `REP` - Report
- `rite` - Right

### System Tables
- `FOXUSER` - FoxPro User
- `FOXUSER.DBF` - FoxPro User (in subdirectories)

### Subdirectory Tables

#### revised_data_20180503/
- `mconthd`
- `mcontdt`
- `morddt`
- `mordhd`

#### data_2-12-18/
- `minvhd`
- `minvdt`
- `morddt`
- `moe`
- `mitemmftr`
- `mitem`
- `mitemven`
- `moehd`
- `zmftr`
- `mvendor`
- `mconthd`
- `mcontdt`
- `mordhd`
- `mso`
- `moectrl`

#### mconthd_dt_revised_20160419B/
- `mconthd`
- `mcontdt`

#### SEKIwork/
- `morddt`
- `moe`
- `moehd`
- `mso`
- `mconthd`
- `mcontdt`
- `mordhd`
- `mdnhd`
- `mdndt`

#### JOYCEwork/
- `moectrl`
- `moe`
- `moehd`
- `mqtybrk`
- `mcustom`

#### vfpproj5/
- `FOXUSER`

#### vfpproj6/
- `FOXUSER`

## Naming Conventions

### Prefix Patterns

**`m` prefix:** Master/Transaction tables
- `moe`, `mordhd`, `mitem`, `mcustom`

**`z` prefix:** Reference/Lookup tables
- `zstdcode`, `zorigin`, `zfobport`

**`w` prefix:** Work/Temporary tables
- `woexls`, `wcontract`, `wtempoe`

**`v` prefix:** View/Cursor tables
- `voe1`, `vocsumry1`

**Dynamic names:** Tables with `&` prefix
- `&w_Wplicense` - Runtime generated names

### Suffix Patterns

**`#` suffix:** Backup/alternate versions
- `mitem#`, `user#`

**Date suffixes:** Historical versions
- `mconthd_20130315`

**`_複製` suffix:** Copy/backup (Chinese)
- `moe_20230705 - 複製`

## Table Relationships Overview

### Primary Relationships

1. **Order Enquiry Flow:**
   `moectrl` → `moehd` → `moe` → `mqtybrk` → `moebom`

2. **Order Confirmation Flow:**
   `moe` → `mordhd` → `morddt`

3. **Contract Flow:**
   `morddt` → `mconthd` → `mcontdt`

4. **Shipping Flow:**
   `mordhd` → `mso`

5. **Invoice Flow:**
   `mso` → `minvhd` → `minvdt`

6. **Master Data:**
   `mitem` → `mitemven` → `mvendor`
   `mitem` → `mprodbom`
   `mcustom` (referenced by transactions)
   `mvendor` (referenced by contracts)

## Table Count Summary

| Category | Count |
|----------|-------|
| Transaction Tables | ~30 |
| Master Data Tables | ~15 |
| Supporting/Reference Tables | ~40 |
| Work/Temporary Tables | ~50 |
| Legacy/Backup Tables | ~20 |
| System Tables | ~5 |
| **Total** | **~186** |

## Notes

- Some tables appear in multiple locations (subdirectories, backups)
- Dynamic table names (with `&` prefix) are runtime-generated
- Work tables are temporary and may be recreated
- Legacy tables are kept for historical reference
- Backup tables follow various naming patterns



