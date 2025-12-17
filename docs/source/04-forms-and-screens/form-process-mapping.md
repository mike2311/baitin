# Form-to-Business-Process Mapping

## Overview

This document maps forms to business processes and shows dependencies between forms. Understanding these relationships is crucial for system maintenance and workflow comprehension.

## Business Process Flow

```
Order Enquiry → Order Confirmation → Contract → Shipping Order → Delivery Note → Invoice
```

## Form Dependencies by Process

### 1. Order Enquiry Process

**Primary Forms:**
- `ioe1@` - Input Order Enquiry (main entry)
- `ioectrl` - OE Control
- `iqtybrk2` - Quantity Breakdown Entry
- `uoexls` - Export OE to Excel
- `poe` - Print OE

**Dependencies:**
- Requires: `iitem` (item master), `icustom` (customer master)
- Called by: `upostoe` (Post OE to OC)
- Calls: `iqtybrk2` (quantity breakdown)

**Data Flow:**
- Input: `moe`, `moehd`
- Output: Used by `upostoe` to create OC

### 2. Order Confirmation Process

**Primary Forms:**
- `upostoe` - Post OE to OC (automated posting)
- `iordhd` - Input Order Confirmation (manual entry)
- `iorddt1`, `iorddt2` - OC Detail Entry
- `pconfirm` - Print OC
- `pocbrk` - Print OC Qty Breakdown

**Dependencies:**
- Requires: `ioe1@` (OE source), `iitem`, `icustom`
- Called by: `isetcont@@_2018` (Contract creation)
- Calls: `iorddt1`, `iorddt2` (detail entry)

**Data Flow:**
- Input: `moe`, `moehd` (from OE)
- Output: `mordhd`, `morddt` (OC data)
- Used by: Contract forms

### 3. Contract Process

**Primary Forms:**
- `isetcont@@_2018` - Input Contract 2018 Fast
- `iconthd_2018` - Contract Header Entry
- `icontdt_2018` - Contract Detail Entry
- `pcontract@_2018` - Print Contract 2018
- `pcontbrk` - Print Contract Qty Breakdown
- `pcontamdrmk` - Print Contract Amendment

**Dependencies:**
- Requires: `iordhd` (OC source), `ivendor` (vendor master)
- Called by: `isetso` (SO creation)
- Calls: `icontdt_2018` (detail entry)

**Data Flow:**
- Input: `mordhd`, `morddt` (from OC)
- Output: `mconthd`, `mcontdt` (Contract data)
- Used by: Shipping Order forms

### 4. Shipping Order Process

**Primary Forms:**
- `isetso` - Input Shipping Order
- `isetsodt` - SO Detail Entry
- `pso` - Print Shipping Order
- `isoformat` - Input SO Format

**Dependencies:**
- Requires: `iconthd_2018` (Contract source)
- Called by: `idn` (DN creation)
- Calls: `isetsodt` (detail entry)

**Data Flow:**
- Input: `mconthd`, `mcontdt` (from Contract)
- Output: `mso` (SO data)
- Used by: Delivery Note forms

### 5. Delivery Note Process

**Primary Forms:**
- `idn` - Input D/N
- `idnbrk` - DN Breakdown Entry
- `iload` - Input Loading Master
- `isetla` - Input Loading Advice
- `pla` - Print Loading Advice
- `pdnorg` - Print D/N Original List
- `pdn_xls` - Create D/N Excel File

**Dependencies:**
- Requires: `isetso` (SO source)
- Called by: `iinvdt2@` (Invoice creation)
- Calls: `idnbrk` (breakdown entry)

**Data Flow:**
- Input: `mso` (from SO)
- Output: `mdnhd`, `mdndt` (DN data), `mload` (loading data)
- Used by: Invoice forms

### 6. Invoice Process

**Primary Forms:**
- `iinvhd@` - Input Invoice Header New
- `iinvdt2@` - Input Invoice Detail New (complex)
- `pinv@` - Print Invoice New
- `ppacklist_new` - Print Packing List New
- `ppacklist_xls` - Print Packing List to XLS
- `ppacklist_xls_spencer` - Packing List Spencer Format
- `pinv_xls` - Print Invoice to XLS
- `pshadvice` - Print Shipment Advice
- `pdebitnote` - Print Debit Note

**Dependencies:**
- Requires: `idn` (DN source), `iload` (container data)
- Calls: `iinvdtmftr` (item manufacturer form)

**Data Flow:**
- Input: `mdnhd`, `mdndt`, `mload` (from DN)
- Output: `minvhd`, `minvdt` (Invoice data)
- Final document in workflow

## Cross-Process Forms

### Master Data Forms

**Forms:**
- `iitem` - Item Master
- `icustom` - Customer Master
- `ivendor` - Vendor Master

**Used By:**
- All process forms (OE, OC, Contract, SO, DN, Invoice)

### Enquiry Forms

**Forms:**
- `enqbyitem` - Enquiry By Item
- `enqbyso` - Enquiry By S/O
- `eoesumry` - OE Summary
- `eocsumry` - OC Summary
- `econtsumry` - Contract Summary
- `einvsumry` - Invoice Summary

**Dependencies:**
- Read-only access to all process tables
- No dependencies on other forms

### Report Forms

**Forms:**
- `pocqty` - OC Qty & Pricing Report
- `pordbyitem` - Order Report By Item
- `psabycust` - Sales Report By Customer
- `pitem` - Item Detail Report

**Dependencies:**
- Read-only access to process tables
- May aggregate data across processes

### Utility Forms

**Forms:**
- `zdel_data` - Delete Data
- `zvencon` - Vendor Code Conversion
- `zchange_item` - Change Item No.
- `uimport_item` - Import Item

**Dependencies:**
- May modify data across all processes
- Requires careful validation

## Form Dependency Matrix

| Form | Requires | Called By | Calls |
|------|----------|-----------|-------|
| `ioe1@` | `iitem`, `icustom` | `upostoe` | `iqtybrk2` |
| `upostoe` | `ioe1@` | `iordhd` | - |
| `iordhd` | `upostoe`, `iitem`, `icustom` | `isetcont@@_2018` | `iorddt1`, `iorddt2` |
| `isetcont@@_2018` | `iordhd`, `ivendor` | `isetso` | `icontdt_2018` |
| `isetso` | `iconthd_2018` | `idn` | `isetsodt` |
| `idn` | `isetso` | `iinvdt2@` | `idnbrk`, `iload` |
| `iinvdt2@` | `idn`, `iload` | - | `iinvdtmftr` |
| `iitem` | - | All process forms | - |
| `icustom` | - | All process forms | - |
| `ivendor` | - | Contract, SO forms | - |

## Workflow Dependencies

### Forward Dependencies (Data Flow)

1. **OE → OC**: `upostoe` reads `moe`, `moehd`, creates `mordhd`, `morddt`
2. **OC → Contract**: `isetcont@@_2018` reads `mordhd`, `morddt`, creates `mconthd`, `mcontdt`
3. **Contract → SO**: `isetso` reads `mconthd`, `mcontdt`, creates `mso`
4. **SO → DN**: `idn` reads `mso`, creates `mdnhd`, `mdndt`
5. **DN → Invoice**: `iinvdt2@` reads `mdnhd`, `mdndt`, `mload`, creates `minvhd`, `minvdt`

### Backward Dependencies (Validation)

- OC validates against OE quantities
- Contract validates against OC items
- SO validates against Contract quantities
- DN validates against SO quantities
- Invoice validates against DN quantities and cartons

## Summary

Forms are organized in a linear workflow:
1. **Master Data** → Foundation for all processes
2. **Order Enquiry** → Customer order entry
3. **Order Confirmation** → Confirmed orders
4. **Contract** → Vendor commitments
5. **Shipping Order** → Shipping plans
6. **Delivery Note** → Actual shipments
7. **Invoice** → Final billing

Each process depends on the previous process's data, creating a clear dependency chain. Enquiry, Report, and Utility forms provide cross-cutting functionality across all processes.
