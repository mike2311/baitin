# Application Modernization Plan

## Overview

This document provides a comprehensive module-by-module plan for modernizing the BAITIN Trading Management System. Each module is analyzed for current functionality, target functionality, forms/screens to rebuild, business logic to migrate, and dependencies. This plan ensures 100% feature parity while identifying opportunities for enhancement.

## Modernization Approach

### Principles
1. **Feature Parity First:** Maintain all existing functionality
2. **Enhancement Opportunities:** Identify and prioritize enhancements
3. **Incremental Delivery:** Module-by-module modernization
4. **User-Centric:** Prioritize user experience improvements
5. **Data Integrity:** Maintain data relationships and business rules

### Module Priority
1. **Phase 1 (PoC):** Master Data, Order Enquiry (core)
2. **Phase 2 (MVP):** Order Enquiry (complete), Order Confirmation, Contract
3. **Phase 3 (Full):** Shipping Order, Delivery Note, Invoice, Enquiry, Reporting

## Module 1: File Management (Master Data)

### Current State

#### Forms
- `iitem` - Input Item
- `icustom` - Customer
- `ivendor` - Vendor
- `iuser` - User Account
- `ipara2` - Company Info
- `isuspended_item` - Suspended Item
- Various enquiry forms

#### Programs
- `xitem.prg` - Item import
- `xcustom.prg` - Customer import
- `xvendor.prg` - Vendor import

#### Tables
- `mitem` - Item Master
- `mitemmftr` - Item Manufacturer
- `mitemven` - Item Vendor
- `mprodbom` - Product BOM
- `mcustom` - Customer Master
- `mvendor` - Vendor Master
- `zmftr` - Manufacturer
- Reference tables (zstdcode, zorigin, etc.)

### Target State

#### Features
- **Item Management:**
  - Create, edit, view, delete items
  - Item lookup/search (type-to-search)
  - Item list with filtering
  - Item import/export
  - BOM management
  - Item manufacturer/vendor relationships

- **Customer Management:**
  - Create, edit, view, delete customers
  - Customer lookup/search
  - Customer list with filtering
  - Customer import/export

- **Vendor Management:**
  - Create, edit, view, delete vendors
  - Vendor lookup/search
  - Vendor list with filtering
  - Vendor import/export

- **User Management:**
  - Create, edit, view, delete users
  - Role assignment (SUPERVISOR/REGULAR_USER)
  - Password management
  - User activity tracking

- **System Configuration:**
  - Company information
  - System parameters
  - Reference data management

#### Screens to Build
1. **Item Entry Screen:**
   - Header form (Item No, Description, Standard Code, etc.)
   - Tab sections (Pricing, Dimensions, Packaging, BOM, etc.)
   - Related data (Manufacturers, Vendors)

2. **Item List Screen:**
   - Search/filter grid
   - Quick actions (Edit, Delete, View)
   - Export functionality

3. **Customer Entry Screen:**
   - Customer form
   - Shipping parameters
   - Notes/remarks

4. **Customer List Screen:**
   - Search/filter grid
   - Quick actions

5. **Vendor Entry Screen:**
   - Vendor form
   - Payment terms
   - Contact information

6. **Vendor List Screen:**
   - Search/filter grid
   - Quick actions

7. **User Management Screen:**
   - User list
   - User entry form
   - Role assignment

8. **System Configuration Screen:**
   - Company information
   - System parameters
   - Reference data

#### Business Logic to Migrate
- Item validation rules
- Customer validation rules
- Vendor validation rules
- BOM calculation logic
- Import/export logic

#### Dependencies
- **Prerequisites:** None (foundational module)
- **Used By:** All transaction modules

#### Enhancement Opportunities
- **Bulk Operations:** Bulk edit, bulk import
- **Advanced Search:** Full-text search, advanced filters
- **Data Validation:** Enhanced validation rules
- **Audit Trail:** Complete audit logging

## Module 2: Order Enquiry (OE)

### Current State

#### Forms
- `ioectrl` - Input OE Control File
- `ioe1@` - Input OE (New)
- `uoexls` - Import OE from Excel
- `uoexls_2013` - Import OE (2013 CSV) - 1,747 lines
- `uoexls_2013_xls` - Import OE (2013 XLS)
- `unewoexls` - Import OE (New Format)
- `uwalxls` - Import OE (Walmart)
- `uoexls2` - Import OE (Multi Item Block)
- `iqtybrk2` - Input Qty Breakdown
- `uqty_breakdown` - Import Qty Breakdown
- Various enquiry/print forms

#### Programs
- `uoexls_2013.prg` - Excel import (1,747 lines - most complex)
- `uoexls.prg` - Standard Excel import
- `unewoexls.prg` - New format import
- `uwalxls.prg` - Walmart format
- `uqty_breakdown.prg` - Qty breakdown import

#### Tables
- `moehd` - OE Header
- `moe` - OE Detail
- `moectrl` - OE Control
- `mqtybrk` - Quantity Breakdown
- `moebom` - OE BOM

### Target State

#### Features
- **OE Control:**
  - Create, edit, view OE Control records
  - Search/filter OE Control
  - Validation (OE No, Customer, Date)

- **OE Manual Entry:**
  - Header form (OE No, Date, Customer, PO No)
  - Detail grid (Item, Qty, Price, Total)
  - Item lookup with auto-fill
  - Auto-save
  - Validation

- **OE Excel Import:**
  - Multiple format support (Standard, Walmart, CSV, 2013, etc.)
  - File upload
  - Field mapping (auto-detect + manual)
  - Data validation
  - Error reporting
  - Import execution

- **Quantity Breakdown:**
  - Manual entry (by size/color/style/port)
  - Excel import
  - Validation (totals match item quantity)

- **BOM Processing:**
  - Automatic BOM expansion
  - BOM quantity calculations
  - Sub-item creation

- **OE Enquiry:**
  - Search/filter OEs
  - View OE details
  - OE reports

#### Screens to Build
1. **OE Control Entry Screen:**
   - OE Control form
   - Validation
   - Search functionality

2. **OE Entry Screen:**
   - Header form
   - Detail grid (Excel-like)
   - Item lookup
   - Auto-save indicator
   - Validation messages

3. **OE Excel Import Screen:**
   - File upload
   - Format selection
   - Field mapping
   - Preview
   - Validation
   - Import execution
   - Error reporting

4. **Quantity Breakdown Screen:**
   - Breakdown entry form/grid
   - Excel import
   - Validation

5. **OE Enquiry List Screen:**
   - Search/filter grid
   - View details
   - Export

6. **OE Detail View Screen:**
   - Header information
   - Detail grid
   - Quantity breakdown
   - BOM items
   - Related documents

#### Business Logic to Migrate
- **Excel Import Logic:**
  - Dynamic field detection (from `uoexls_2013.prg`)
  - Field mapping
  - Data validation
  - BOM processing
  - Quantity breakdown processing

- **Validation Rules:**
  - OE Control validation
  - Customer validation
  - Item validation
  - Quantity validation

- **BOM Calculations:**
  - BOM quantity calculations
  - Sub-item creation

#### Dependencies
- **Prerequisites:** Master Data (Items, Customers)
- **Used By:** Order Confirmation

#### Enhancement Opportunities
- **Improved Excel Import:**
  - Better error messages
  - Interactive field mapping
  - Preview before import
  - Batch import

- **Enhanced Validation:**
  - Real-time validation
  - Better error messages
  - Validation rules configuration

- **Workflow:**
  - Draft/Save workflow
  - Approval workflow (future)

## Module 3: Order Confirmation (OC)

### Current State

#### Forms
- `upostoe` - Post OE/Post OC
- `iordhd` - Input Order Confirmation
- `iorddt1`, `iorddt2` - OC Detail Entry
- `pconfirm` - Print Order Confirmation
- `pocbrk` - Print OC Qty Breakdown

#### Programs
- `uordcont.prg` - Update OC/Contract
- `uworderconf.prg` - Order confirmation processing

#### Tables
- `mordhd` - OC Header
- `morddt` - OC Detail
- `mordadj` - Order Adjustment

### Target State

#### Features
- **Post OE to OC:**
  - Select OE to post
  - Validation
  - Create OC from OE
  - BOM processing
  - Status update

- **OC Entry:**
  - Header form (OC No, Date, Customer)
  - Detail grid
  - Item lookup
  - Auto-save
  - Validation

- **OC Enquiry:**
  - Search/filter OCs
  - View OC details
  - OC reports

#### Screens to Build
1. **Post OE to OC Screen:**
   - OE selection
   - Preview
   - Post execution
   - Results

2. **OC Entry Screen:**
   - Header form
   - Detail grid
   - Item lookup
   - Auto-save
   - Validation

3. **OC Enquiry List Screen:**
   - Search/filter grid
   - View details
   - Export

4. **OC Detail View Screen:**
   - Header information
   - Detail grid
   - Related OE
   - Related Contracts

#### Business Logic to Migrate
- **Post OE Logic:**
  - Copy OE to OC
  - BOM quantity calculations
  - Status updates

- **Validation Rules:**
  - OC validation
  - Item validation
  - Quantity validation

#### Dependencies
- **Prerequisites:** Order Enquiry
- **Used By:** Contract

#### Enhancement Opportunities
- **Workflow:**
  - Approval workflow
  - Status tracking

- **Integration:**
  - Email notifications
  - Document generation

## Module 4: Contract

### Current State

#### Forms
- `isetcont@@_2018` - Input Contract
- `iconthd_2018` - Contract Header
- `icontdt_2018` - Contract Detail
- `pcontract@_2018` - Print Contract
- `pcontbrk` - Print Contract Qty Breakdown
- `pcontamdrmk` - Print Contract Amendment

#### Programs
- `uordcont.prg` - Update OC/Contract
- `uwcontract.prg` - Contract generation

#### Tables
- `mconthd` - Contract Header
- `mcontdt` - Contract Detail
- `mcontamdrmk` - Contract Amendment Remark

### Target State

#### Features
- **Generate Contract from OC:**
  - Select OC
  - Group by vendor
  - Generate contracts
  - Payment terms

- **Contract Entry:**
  - Header form (Contract No, Vendor, Date)
  - Detail grid
  - Payment terms
  - Auto-save
  - Validation

- **Contract Amendment:**
  - Amendment entry
  - Amendment tracking
  - Amendment reports

- **Contract Enquiry:**
  - Search/filter contracts
  - View contract details
  - Contract reports

#### Screens to Build
1. **Generate Contract Screen:**
   - OC selection
   - Vendor grouping
   - Preview
   - Generate execution

2. **Contract Entry Screen:**
   - Header form
   - Detail grid
   - Payment terms
   - Auto-save
   - Validation

3. **Contract Amendment Screen:**
   - Amendment entry
   - Amendment tracking

4. **Contract Enquiry List Screen:**
   - Search/filter grid
   - View details
   - Export

5. **Contract Detail View Screen:**
   - Header information
   - Detail grid
   - Related OC
   - Amendments
   - Related SOs

#### Business Logic to Migrate
- **Contract Generation:**
  - Vendor grouping
  - Contract creation
  - BOM processing

- **Validation Rules:**
  - Contract validation
  - Payment terms validation

#### Dependencies
- **Prerequisites:** Order Confirmation
- **Used By:** Shipping Order

#### Enhancement Opportunities
- **Workflow:**
  - Approval workflow
  - Status tracking

- **Integration:**
  - Email to vendors
  - Document generation

## Module 5: Shipping Order (SO)

### Current State

#### Forms
- `isetso` - Input Shipping Order
- `isetsodt` - SO Detail
- `pso` - Print Shipping Order
- `isoformat` - Input SO Format

#### Programs
- `pso.prg` - SO printing
- `xpostozso.prg` - Post to SO

#### Tables
- `mso` - Shipping Order
- `zsoformat` - SO Format configuration

### Target State

#### Features
- **SO Creation:**
  - Create from contracts/OCs
  - SO entry
  - Customizable formats per customer

- **SO Entry:**
  - Header form
  - Detail grid
  - Format configuration
  - Auto-save
  - Validation

- **SO Enquiry:**
  - Search/filter SOs
  - View SO details
  - SO reports

#### Screens to Build
1. **SO Entry Screen:**
   - Header form
   - Detail grid
   - Format selection
   - Auto-save
   - Validation

2. **SO Format Configuration Screen:**
   - Format editor
   - Customer assignment

3. **SO Enquiry List Screen:**
   - Search/filter grid
   - View details
   - Export

4. **SO Detail View Screen:**
   - Header information
   - Detail grid
   - Related contracts
   - Related DNs
   - Related Invoices

#### Business Logic to Migrate
- **SO Creation Logic:**
  - Create from contracts
  - Format application

- **Validation Rules:**
  - SO validation

#### Dependencies
- **Prerequisites:** Contract
- **Used By:** Delivery Note, Invoice

## Module 6: Delivery Note (DN)

### Current State

#### Forms
- `idn` - Input D/N
- `idnbrk` - DN Breakdown
- `iload` - Input Loading Master
- `isetla` - Input Loading Advice
- `pla` - Print Loading Advice
- `pdnorg` - Print D/N Original List
- `pdn_xls` - Create D/N Excel File

#### Programs
- DN processing programs

#### Tables
- `mdnhd` - DN Header
- `mdndt` - DN Detail
- `mdnbrk` - DN Breakdown
- `mlahd` - Loading Advice Header
- `mladt` - Loading Advice Detail
- `mload` - Loading Master

### Target State

#### Features
- **DN Creation:**
  - Create from SO
  - DN entry
  - DN breakdown

- **Loading Management:**
  - Loading master
  - Loading advice
  - Loading reports

- **DN Enquiry:**
  - Search/filter DNs
  - View DN details
  - DN reports

#### Screens to Build
1. **DN Entry Screen:**
   - Header form
   - Detail grid
   - Breakdown grid
   - Auto-save
   - Validation

2. **Loading Master Screen:**
   - Loading entry
   - Loading tracking

3. **Loading Advice Screen:**
   - Loading advice entry
   - Loading advice reports

4. **DN Enquiry List Screen:**
   - Search/filter grid
   - View details
   - Export

#### Business Logic to Migrate
- **DN Creation Logic:**
  - Create from SO
  - Breakdown processing

- **Loading Logic:**
  - Loading master
  - Loading advice

#### Dependencies
- **Prerequisites:** Shipping Order
- **Used By:** Invoice

## Module 7: Invoice

### Current State

#### Forms
- `iinvhd@` - Input Invoice (New)
- `iinvdt2@` - Invoice Detail (New)
- `pinv@` - Print Invoice (New)
- `ppacklist_new` - Print Packing List (New)
- `ppacklist_xls` - Print Packing List to XLS
- `ppacklist_xls_spencer` - Packing List (Spencer Format)
- `pinv_xls` - Print Invoice to XLS
- `pshadvice` - Print Shipment Advice
- `pdebitnote` - Print Debit Note
- `einvoice` - Enquiry By Invoice

#### Programs
- `pinv.prg` - Invoice printing logic
- `ppacklist1_new.prg` - Packing list
- `uwinv.prg` - Invoice processing

#### Tables
- `minvhd` - Invoice Header
- `minvdt` - Invoice Detail
- `minvadj` - Invoice Adjustment
- `minvbd` - Invoice Breakdown
- `minvqtybrk` - Invoice Quantity Breakdown

### Target State

#### Features
- **Invoice Creation:**
  - Create from SO/DN
  - Invoice entry
  - Multi-page invoice support

- **Packing List:**
  - Packing list generation
  - Multiple formats
  - Excel export

- **Invoice Enquiry:**
  - Search/filter invoices
  - View invoice details
  - Invoice reports

#### Screens to Build
1. **Invoice Entry Screen:**
   - Header form
   - Detail grid
   - Auto-save
   - Validation

2. **Packing List Screen:**
   - Packing list generation
   - Format selection
   - Export

3. **Invoice Enquiry List Screen:**
   - Search/filter grid
   - View details
   - Export

4. **Invoice Detail View Screen:**
   - Header information
   - Detail grid
   - Related SO/DN
   - Packing list
   - Payment status

#### Business Logic to Migrate
- **Invoice Creation Logic:**
  - Create from SO/DN
  - Multi-page logic

- **Packing List Logic:**
  - Packing list generation
  - Format application

#### Dependencies
- **Prerequisites:** Shipping Order, Delivery Note
- **Used By:** Reporting

## Module 8: Enquiry

### Current State

#### Forms
- Various enquiry forms for sales analysis, item enquiry, SO enquiry, etc.

#### Programs
- Enquiry processing programs

### Target State

#### Features
- **Sales Analysis:**
  - By customer, item, date
  - Various analysis views
  - Export functionality

- **Item Enquiry:**
  - Item search
  - Item details
  - Item history

- **SO Enquiry:**
  - SO search
  - SO details
  - SO status

- **Summary Enquiries:**
  - Various summary views
  - Export functionality

#### Screens to Build
1. **Sales Analysis Screen:**
   - Filter options
   - Analysis grid/charts
   - Export

2. **Item Enquiry Screen:**
   - Search
   - Item details
   - Item history

3. **SO Enquiry Screen:**
   - Search
   - SO details
   - SO status

#### Business Logic to Migrate
- **Analysis Logic:**
  - Sales analysis calculations
  - Summary calculations

#### Dependencies
- **Prerequisites:** All transaction modules

## Module 9: Reporting

### Current State

#### Reports
- 116+ reports (.frx files)
- Various report types (transaction, summary, analysis, export)

### Target State

#### Features
- **Report Generation:**
  - On-demand report generation
  - Scheduled reports
  - Report export (PDF, Excel)

- **Report Types:**
  - Transaction reports (OE, OC, Contract, SO, DN, Invoice)
  - Summary reports
  - Analysis reports
  - Export reports

#### Screens to Build
1. **Report Selection Screen:**
   - Report categories
   - Report list
   - Report parameters

2. **Report Generation Screen:**
   - Parameter entry
   - Report preview
   - Export options

#### Business Logic to Migrate
- **Report Logic:**
  - All 116+ report definitions
  - Report formatting
  - Export logic

#### Dependencies
- **Prerequisites:** All modules

#### Enhancement Opportunities
- **Modern Reporting:**
  - Interactive dashboards
  - Real-time reports
  - Scheduled email reports

## Summary

The application modernization plan provides a comprehensive module-by-module approach to modernizing the BAITIN system. Each module is analyzed for current functionality, target functionality, and implementation requirements. The plan ensures 100% feature parity while identifying enhancement opportunities.

## Next Steps

1. **Prioritize Modules:** Finalize module priority based on business needs
2. **Detailed Design:** Create detailed designs for each module
3. **Begin Development:** Start with PoC modules
4. **Iterate:** Continuous development and refinement

## Document References

- **Phased Delivery Plan:** `../11-phased-delivery-plan/`
- **PoC Strategy:** `../15-poc-strategy/`
- **UX/UI Strategy:** `../06-ux-ui-strategy/`
