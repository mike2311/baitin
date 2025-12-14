# Form Inventory

## Overview

The system contains 195+ forms (.scx files) providing user interfaces for all system functions.

## Form Count

- **Total Forms:** 195+ (.scx files identified)
- **Categories:** Entry forms, enquiry forms, report forms, utility forms

## Form Categorization

### Authentication Forms
- `ilogon` - Login form

### Master Data Entry Forms
- `iitem` - Input Item
- `icustom` - Input Customer
- `ivendor` - Input Vendor
- `imftr` - Input Manufacturer
- `iuser` - Input User Account
- `ipara2` - Input Company Info

### Order Enquiry Forms
- `ioe1@` - Input OE (New)
- `ioectrl` - Input OE Control
- `iqtybrk2` - Input Qty Breakdown
- `uoexls` - Import OE from Excel (form wrapper)
- `uoexls_2013` - Import OE 2013 (form wrapper)
- `pordenq2` - Print Order Enquiry

### Order Confirmation Forms
- `iordhd` - Input Order Confirmation Header
- `iorddt1` - Input OC Detail 1
- `iorddt2` - Input OC Detail 2
- `upostoe` - Post OE/Post OC
- `pconfirm` - Print Order Confirmation

### Contract Forms
- `isetcont@@_2018` - Input Contract (2018)
- `iconthd_2018` - Contract Header
- `icontdt_2018` - Contract Detail
- `pcontract@_2018` - Print Contract (2018)

### Shipping Order Forms
- `isetso` - Input Shipping Order
- `isetsodt` - SO Detail
- `pso` - Print Shipping Order
- `isoformat` - Input SO Format

### Invoice Forms
- `iinvhd@` - Input Invoice Header (New)
- `iinvdt2@` - Input Invoice Detail (New)
- `pinv@` - Print Invoice (New)
- `ppacklist_new` - Print Packing List (New)
- `ppacklist_xls` - Packing List to XLS

### Enquiry Forms
- `enqbyitem` - Enquiry By Item
- `enqbyso` - Enquiry By SO
- `einvoice` - Enquiry By Invoice
- `eoesumry` - OE Summary
- `eocsumry` - OC Summary
- `einvsumry` - Invoice Summary

### Report Forms
- Multiple report forms (see Reporting section)

## Form-to-Module Mapping

See `docs/03-application-modules/module-inventory.md` for detailed module-to-form mapping.

## Form Naming Conventions

### Input Forms
- **Prefix `i`:** Input/Entry forms (e.g., `iitem`, `icustom`)
- **Prefix `iset`:** Setup/Configuration forms (e.g., `isetso`, `isetcont`)

### Print Forms
- **Prefix `p`:** Print/Report forms (e.g., `pinv`, `pso`, `pconfirm`)

### Enquiry Forms
- **Prefix `e`:** Enquiry forms (e.g., `einvoice`, `eoesumry`)
- **Prefix `enq`:** Enquiry forms (e.g., `enqbyitem`, `enqbyso`)

### Utility Forms
- **Prefix `z`:** Utility/Conversion forms (e.g., `zvencon`, `zchange_item`)

## Form Files

### Structure
- **`.scx`** - Form file (binary)
- **`.sct`** - Form memo file (text, contains form code)

### Location
- All forms in `source/` directory
- Forms referenced by menu system

## Summary

The system has 195+ forms organized by function. Forms follow naming conventions and are mapped to functional modules. Detailed form analysis requires examination of individual .scx/.sct files.



