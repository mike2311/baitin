# Module Inventory

## Complete List of Functional Modules

The system is organized into functional modules based on the menu structure. Each module contains related forms, programs, and business logic.

## Module Structure

### 1. File Management Module
**Menu:** File  
**Purpose:** Master data and system administration

**Sub-modules:**
- Item Management
- Customer Management
- Vendor Management
- User Management
- System Configuration
- Data Maintenance

### 2. Order Enquiry Module
**Menu:** Order Enquiry  
**Purpose:** Order enquiry creation and management

**Sub-modules:**
- OE Control
- OE Import/Input/Print
- Qty Breakdown
- Other Enquiry

### 3. Order Confirmation Module
**Menu:** Order Confirmation  
**Purpose:** Order confirmation processing

**Sub-modules:**
- Post OE/Post OC
- Input Order Confirmation
- Print Order Confirmation
- OC Qty Breakdown

### 4. Contract Module
**Menu:** Contract  
**Purpose:** Contract generation and management

**Sub-modules:**
- Contract Input
- Contract Printing
- Contract Amendments
- Contract Reports

### 5. Shipping Order Module
**Menu:** Shipping Order  
**Purpose:** Shipping order creation and management

**Sub-modules:**
- Input Shipping Order
- Print Shipping Order
- SO Format Configuration

### 6. Delivery Note Module
**Menu:** DN  
**Purpose:** Delivery note processing

**Sub-modules:**
- Input D/N
- Create D/N Excel
- Loading Master
- Loading Advice
- Print Functions

### 7. Invoice Module
**Menu:** Invoice  
**Purpose:** Invoice generation and packing lists

**Sub-modules:**
- Input Invoice
- Print Invoice
- Packing List
- Shipment Advice
- Debit Note

### 8. Delivery Report Module
**Menu:** Delivery Report  
**Purpose:** Delivery and payment tracking

**Sub-modules:**
- Actual Delivery Date
- Authorize Maker Invoice
- Delivery Report Enquiry
- Payment Status

### 9. Enquiry Module
**Menu:** Enquiry  
**Purpose:** Data enquiry and analysis

**Sub-modules:**
- Sales Analysis
- Item Enquiry
- SO Enquiry
- Summary Enquiries

### 10. Report Module
**Menu:** Report  
**Purpose:** Business reports

**Sub-modules:**
- Transaction Reports
- Summary Reports
- Analysis Reports
- Export Reports

### 11. Acrobat File Module
**Menu:** Acrobat File  
**Purpose:** PDF generation

**Sub-modules:**
- OE PDF
- OC PDF
- Contract PDF
- Invoice PDF

## Module Dependencies

### Dependency Flow

```
File Management (Master Data)
  ↓
Order Enquiry
  ↓
Order Confirmation
  ↓
Contract
  ↓
Shipping Order
  ↓
Delivery Note
  ↓
Invoice
```

### Cross-Module Dependencies

- **All modules** depend on **File Management** (master data)
- **Order Confirmation** depends on **Order Enquiry**
- **Contract** depends on **Order Confirmation**
- **Shipping Order** depends on **Contract/OC**
- **Invoice** depends on **Shipping Order/DN**
- **Enquiry/Report** modules read from all transaction modules

## Menu Structure Mapping

### Main Menu Pads (BATMENUS.MPR)

1. **File** (ALT+F)
2. **Order Enquiry** (ALT+O)
3. **Order Confirmation** (ALT+O)
4. **Contract** (ALT+C)
5. **Shipping Order** (ALT+S)
6. **DN** (ALT+D)
7. **Invoice** (ALT+I)
8. **Delivery Report** (ALT+D)
9. **Document Printing** (ALT+D) - Disabled
10. **Enquiry** (ALT+E)
11. **Report** (ALT+R)
12. **Acrobat File** (ALT+A)
13. **LogOut** (ALT+L)
14. **Exit** (ALT+E)

### Menu Differences

**SUPERVISOR Menu (BATMENUS.MPR):**
- Full access to all functions
- Administrative functions enabled
- Data conversion tools available

**REGULAR_USER Menu (BATMENU.MPR):**
- Limited access
- No administrative functions
- Limited data conversion

## Module-to-Form Mapping

### File Management Forms
- `iitem` - Input Item
- `icustom` - Customer
- `ivendor` - Vendor
- `iuser` - User Account
- `ipara2` - Company Info
- `isuspended_item` - Suspended Item
- `systemtools.prg` - Data Recovery
- `zdel_data` - Delete Data
- `zvencon` - Vendor Code Conversion
- Various data conversion forms

### Order Enquiry Forms
- `ioectrl` - OE Control
- `ioe1@` - Input OE (New)
- `uoexls` - Import OE from Excel
- `uoexls_2013` - Import OE (2013 CSV)
- `uoexls_2013_xls` - Import OE (2013 XLS)
- `unewoexls` - Import OE (New Format)
- `uwalxls` - Import OE (Walmart)
- `uoexls2` - Import OE (Multi Item Block)
- `zoexls_batch` - Export OE to XLS
- `iqtybrk2` - Input Qty Breakdown
- `ppobrk` - Print OE Qty Breakdown
- `pordenq2` - Print Order Enquiry
- Various enquiry forms

### Order Confirmation Forms
- `upostoe` - Post OE/Post OC
- `iordhd` - Input Order Confirmation
- `iorddt1`, `iorddt2` - OC Detail Entry
- `pconfirm` - Print Order Confirmation
- `pocbrk` - Print OC Qty Breakdown

### Contract Forms
- `isetcont@@_2018` - Input Contract (2018)
- `isetcont@@_2018` - Input Contract (2018 Fast)
- `iconthd_2018` - Contract Header
- `icontdt_2018` - Contract Detail
- `pcontract@_2018` - Print Contract (2018)
- `pcontbrk` - Print Contract Qty Breakdown
- `pcontamdrmk` - Print Contract Amendment
- `pitname` - Print Item Description for Carton

### Shipping Order Forms
- `isetso` - Input Shipping Order
- `isetsodt` - SO Detail
- `pso` - Print Shipping Order
- `isoformat` - Input SO Format

### Delivery Note Forms
- `idn` - Input D/N
- `idnbrk` - DN Breakdown
- `iload` - Input Loading Master
- `isetla` - Input Loading Advice
- `pla` - Print Loading Advice
- `pdnorg` - Print D/N Original List
- `pdn_xls` - Create D/N Excel File

### Invoice Forms
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

## Module-to-Program Mapping

### Key Programs by Module

**File Management:**
- `xitem.prg` - Item import
- `xcustom.prg` - Customer import
- `xvendor.prg` - Vendor import
- `zdoc.prg` - Reindex utility
- `systemtools.prg` - System tools

**Order Enquiry:**
- `uoexls_2013.prg` - Excel import (1,747 lines - most complex)
- `uoexls.prg` - Standard Excel import
- `unewoexls.prg` - New format import
- `uwalexls.prg` - Walmart format
- `upostoe.prg` - Post OE to OC

**Order Confirmation:**
- `uordcont.prg` - Update OC/Contract
- `uworderconf.prg` - Order confirmation processing

**Contract:**
- `uwcontract.prg` - Contract generation
- `pcontract.prg` - Contract printing

**Shipping:**
- `pso.prg` - SO printing
- `xpostozso.prg` - Post to SO

**Invoice:**
- `pinv.prg` - Invoice printing logic
- `ppacklist1_new.prg` - Packing list
- `uwinv.prg` - Invoice processing

## Module Access Control

### SUPERVISOR Access
- All modules fully accessible
- Administrative functions enabled
- Data conversion tools available

### REGULAR_USER Access
- Limited module access
- No administrative functions
- Limited data conversion
- Read-only access to some modules

## Module Communication

### Data Flow Between Modules

```
File Management (Master Data)
  ↓ Provides data to ↓
Order Enquiry
  ↓ Posts to ↓
Order Confirmation
  ↓ Generates ↓
Contract
  ↓ Creates ↓
Shipping Order
  ↓ Links to ↓
Delivery Note
  ↓ Generates ↓
Invoice
```

### Shared Data

- **Master Data:** Used by all transaction modules
- **Transaction Data:** Flows through modules in sequence
- **Reference Data:** Used across modules

## Summary

The system is organized into 11 main functional modules, each handling a specific aspect of the trading workflow. Modules are accessed through the menu system, with different access levels for SUPERVISOR and REGULAR_USER roles. The modules follow a sequential workflow from master data setup through order processing to final invoicing.



