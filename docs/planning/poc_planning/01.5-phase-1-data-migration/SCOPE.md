# Phase 1.5: Legacy Data Migration Scope

## Overview

This document defines the scope of legacy data migration for Phase 1.5 (PoC PostgreSQL). This scope is a **stakeholder acceptance gate** - the PoC is not considered complete unless relevant legacy data is migrated and verified.

## Purpose

Migrate relevant legacy FoxPro data into the PoC PostgreSQL database to enable evaluation of the PoC using real-world data. This migration is focused on data required for PoC modules (Phase 1 Master Data and Phase 2 Order Enquiry).

## In-Scope Data

### Master Data Tables

1. **Items** (`mitem` → `item`)
   - All item master records
   - Required for: Item master module, OE validation, item lookup
   - Notes: Includes memo field (desp) stored in FPT file

2. **Customers** (`mcustom` → `customer`)
   - All customer master records
   - Required for: Customer master module, OE validation (cust_no must exist)
   - Notes: Includes memo fields stored in FPT file

3. **Vendors** (`mvendor` → `vendor`)
   - All vendor master records
   - Required for: Vendor master module, OE detail vendor assignment
   - Notes: Type field (1=Vendor, 2=Maker)

### Reference Data Tables

1. **Standard Codes** (`zstdcode` → `zstdcode`)
   - All standard code records
   - Required for: Item validation (std_code foreign key)

2. **Origins** (`zorigin` → `zorigin`)
   - All origin records
   - Required for: Item validation (origin foreign key)

3. **Companies** (if applicable)
   - Company codes: HT, BAT, INSP, HFW
   - Required for: OE company code validation

### Order Enquiry Transaction Tables (PoC Subset)

1. **OE Control** (`moectrl` → `order_enquiry_control`)
   - All OE control records
   - Required for: OE validation workflow (control must exist before OE import, except INSP)
   - Notes: Special case for INSP company (adds "IN-" prefix automatically)

2. **OE Header** (`moehd` → `order_enquiry_header`)
   - All OE header records
   - Required for: Order Enquiry module (Phase 2)
   - Relationships: References customer (cust_no)

3. **OE Detail** (`moe` → `order_enquiry_detail`)
   - All OE detail/line items
   - Required for: Order Enquiry module (Phase 2)
   - Relationships: References OE header (oe_no), item (item_no), vendor (vendor_no)

### Users / Security Seed

- Users and roles needed for PoC access
- Scope to be determined based on authentication requirements
- May include test users for demo purposes

## Data Filters

### Company Scope
- **All Companies**: HT, BAT, INSP, HFW
- No company filtering for PoC (migrate all companies)

### Date Range
- **No date filtering** for master data and reference data (migrate all records)
- Transaction data (OE): May apply date filters if dataset is too large for PoC evaluation
  - Default: All OE records
  - Optional: Last 12 months if dataset is too large

### Exclusions

1. **Archived Data**: None (migrate all active and archived records)
2. **Test Companies**: Exclude if identifiable (to be confirmed with owner)
3. **Deleted Records**: Include logically deleted records if marked with suspend_flag or similar
4. **Temporary Data**: Exclude temporary or work-in-progress tables

## Table Mapping Summary

| Legacy Table | PostgreSQL Table | Load Order | Primary Key | Notes |
|--------------|------------------|------------|-------------|-------|
| `zstdcode` | `zstdcode` | 1 (Reference) | `std_code` | Reference data |
| `zorigin` | `zorigin` | 1 (Reference) | `origin` | Reference data |
| `mitem` | `item` | 2 (Master) | `item_no` | Includes FPT memo field |
| `mcustom` | `customer` | 2 (Master) | `cust_no` | Includes FPT memo fields |
| `mvendor` | `vendor` | 2 (Master) | `vendor_no` | Type field (1=Vendor, 2=Maker) |
| `moectrl` | `order_enquiry_control` | 3 (Transaction) | `oe_no` | Validation checkpoint |
| `moehd` | `order_enquiry_header` | 3 (Transaction) | `oe_no` | References customer |
| `moe` | `order_enquiry_detail` | 3 (Transaction) | `oe_no` + `line_no` | References header, item, vendor |

## Load Order

Data must be loaded in dependency order to satisfy foreign key constraints:

1. **Reference Tables** (Load Order 1)
   - `zstdcode`
   - `zorigin`
   - Any other reference/lookup tables

2. **Master Data** (Load Order 2)
   - `item` (depends on: zstdcode, zorigin)
   - `customer` (no dependencies)
   - `vendor` (no dependencies)

3. **Transaction Data** (Load Order 3)
   - `order_enquiry_control` (depends on: customer)
   - `order_enquiry_header` (depends on: customer)
   - `order_enquiry_detail` (depends on: order_enquiry_header, item, vendor)

4. **Users / Security** (Load Order 4)
   - Users and roles (to be determined)

## Data Quality Considerations

### Known Issues

1. **Encoding**: Legacy DBF files may use Windows-1252 or other legacy encodings
   - Must convert to UTF-8 during extraction
   - Memo fields (FPT) may have encoding issues

2. **Date Formats**: FoxPro dates stored in specific format
   - Must convert to PostgreSQL DATE/TIMESTAMP format
   - Handle null/empty dates appropriately

3. **Boolean Values**: FoxPro uses .T./.F. for logical fields
   - Must convert to PostgreSQL boolean (true/false)

4. **Numeric Precision**: Maintain precision for decimal fields
   - Use appropriate precision/scale in PostgreSQL

5. **Memo Fields**: Stored in separate FPT files
   - Must read FPT file and map memo blocks to DBF records
   - Convert to PostgreSQL TEXT type

### Validation Rules

1. **Referential Integrity**: All foreign keys must resolve
   - Item.std_code must exist in zstdcode
   - Item.origin must exist in zorigin
   - OE header/detail cust_no must exist in customer
   - OE detail item_no must exist in item
   - OE detail vendor_no must exist in vendor (if provided)

2. **Uniqueness**: Primary keys must be unique
   - item_no, cust_no, vendor_no, oe_no must be unique within their tables

3. **Required Fields**: Required fields must not be null
   - item.item_no, customer.cust_no, vendor.vendor_no required
   - OE header/detail oe_no required

## Success Criteria

- [ ] All in-scope tables migrated with zero data loss
- [ ] Referential integrity checks pass for all relationships
- [ ] Validation rules from Phase 1 can be exercised against migrated data
- [ ] Owner sign-off on migrated data completeness and accuracy
- [ ] Reconciliation reports show 100% row count match (extracted vs loaded)

## Exclusions

The following are explicitly **out of scope** for Phase 1.5:

- Full production migration (all 186 tables)
- Non-PoC modules (Order Confirmation, Contract, Shipping, Invoice, etc.)
- Production cutover procedures
- Parallel run workflows
- Advanced data quality cleanup (beyond basic validation)

## Owner Approval

**Status**: Pending Owner Approval

**Approved By**: _________________ Date: ___________

**Notes**: 
- Scope subject to owner review and approval
- Date range filters for transaction data may be adjusted based on dataset size
- Additional reference tables may be added if required for validation

---

**Document Version**: 1.0  
**Created**: 2025-01-XX  
**Last Updated**: 2025-01-XX


