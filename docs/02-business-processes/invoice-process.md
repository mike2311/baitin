# Invoice Process

## Overview

Invoices are customer billing documents created from Shipping Orders (SO) or Delivery Notes (DN). They include packing lists, support multi-page formats, and can be exported to Excel or PDF.

## Invoice Creation from SO/DN

### Source Documents

**Primary Sources:**
1. Shipping Order (SO) - `mso.so_no`
2. Delivery Note (DN) - `mdnhd.dn_no`

### Creation Process

**Form:** `iinvhd@` (Input Invoice New)

**Process:**
1. User selects SO or DN
2. System retrieves items and quantities
3. User enters invoice details
4. System creates invoice records

### Invoice Table Structure

**Header Table:** `minvhd` (Invoice Header)

**Key Fields:**
- `inv_no` - Invoice number (Primary Key)
- `cust_no` - Customer number (links to mcustom)
- `date` - Invoice date
- `oc_no` - Order Confirmation number (links to mordhd)
- `ship` - Shipment information
- `del_date` - Delivery date

**Detail Table:** `minvdt` (Invoice Detail)

**Key Fields:**
- `inv_no` - Invoice number (links to minvhd)
- `item_no` - Item number (links to mitem)
- `qty` - Invoice quantity
- `price` - Invoice price
- `so_no` - Shipping Order number (links to mso)
- `oc_no` - Order Confirmation number (links to mordhd)

**File Sizes:**
- `minvhd.dbf` - 93MB
- `minvdt.dbf` - 123MB
- `minvdt.FPT` - 178MB (large memo fields)

## Packing List Generation

### Packing List Purpose

**Purpose:** Detailed list of items packed in cartons for shipping

**Form:** `ppacklist_new` (Print Packing List New)

**Process:**
1. Select invoice number
2. System retrieves invoice items
3. System groups items by carton
4. Generate packing list document

### Packing List Logic

**Carton Breakdown:**
- Items grouped by carton number
- Quantities per carton
- Total cartons calculated
- Carton dimensions and weight

**Code Reference:** `pinv.prg` (packing list functions)

### Packing List Formats

**Standard Format:** `ppacklist_new`
**Spencer Format:** `ppacklist_xls_spencer`
**Excel Format:** `ppacklist_xls`

## Multi-Page Invoice Logic

### Page Management

**Function:** `Pinv()` in `pinv.prg`

**Purpose:** Manage multi-page invoices with page arrays

**Process:**
1. Initialize page array with page count
2. Track items per page
3. Calculate page breaks
4. Generate multi-page invoice

**Code Reference:** `pinv.prg` (lines 1-75)

### Page Array Structure

**Array:** `Page_array(pa_cnt, 2)`

**Fields:**
- `Page_array(n, 1)` - Page identifier
- `Page_array(n, 2)` - Maximum page number

**Usage:**
- Track which items on which page
- Calculate page breaks
- Manage page numbering

### Carton Replacement

**Function:** `changechar()` in `pinv.prg`

**Purpose:** Replace "!C" with carton number in text

**Process:**
1. Search for "!C" in text
2. Replace with actual carton number
3. Used in invoice descriptions

**Code Reference:** `pinv.prg` (lines 79-88)

## Carton Breakdown

### Carton Calculation

**Process:**
1. Calculate items per carton from packing
2. Group items by carton
3. Calculate total cartons
4. Generate carton-level details

### Carton Information

**Fields:**
- Carton number
- Items in carton
- Quantity per carton
- Carton weight
- Carton dimensions

## Export Formats

### Excel Export

**Form:** `pinv_xls` (Print Invoice to XLS)

**Process:**
1. Select invoice number
2. Generate Excel file
3. Include all invoice details
4. Format for customer use

### PDF Export

**Form:** `pinv_pdf` (Print Invoice PDF)

**Process:**
1. Generate invoice report
2. Convert to PDF format
3. Save or email PDF

### Packing List Export

**Form:** `ppacklist_xls` (Print Packing List to XLS)

**Process:**
1. Generate packing list
2. Export to Excel format
3. Include carton breakdown

## Shipment Advice

### Shipment Advice Report

**Form:** `pshadvice` (Print Shipment Advice)

**Purpose:** Document sent to customer before shipment

**Contents:**
- Shipment details
- Item list
- Shipping dates
- Delivery information

## Invoice Printing

### Invoice Reports

1. **Invoice Report (New):**
   - Form: `pinv@`
   - Standard invoice format
   - Multi-page support

2. **Invoice PDF:**
   - Form: `pinv_pdf`
   - PDF format for email/printing

3. **Packing List:**
   - Form: `ppacklist_new`
   - Detailed packing information

4. **Packing List Excel:**
   - Form: `ppacklist_xls`
   - Excel format for customer

5. **Packing List Spencer:**
   - Form: `ppacklist_xls_spencer`
   - Spencer-specific format

## Debit Note

### Debit Note Process

**Form:** `pdebitnote` (Print Debit Note)

**Purpose:** Adjust invoices (additional charges, corrections)

**Process:**
1. Create debit note from invoice
2. Adjust quantities or prices
3. Generate debit note document

## Invoice Enquiry

### Invoice Enquiry Forms

1. **By Invoice:**
   - Form: `einvoice`
   - Search by invoice number
   - View invoice details

2. **Invoice Summary:**
   - Form: `einvsumry`
   - Summary by date/customer
   - Analysis reports

## Invoice Status

### Status Values

**Created:** Invoice created
**Sent:** Invoice sent to customer
**Paid:** Invoice paid

### Status Transitions

```
Created → Sent → Paid
```

## Data Flow

### SO to Invoice

```
mso (Shipping Order)
  ↓
minvhd (Invoice Header)
  ↓
minvdt (Invoice Detail)
  ↓
Packing List
  ↓
Shipment Advice
```

### DN to Invoice

```
mdnhd (DN Header)
  ↓
mdndt (DN Detail)
  ↓
minvhd (Invoice Header)
  ↓
minvdt (Invoice Detail)
```

## Error Handling

### Creation Errors

**No SO/DN:**
- Error: Source document not found
- Action: Cannot create invoice

**Invalid Items:**
- Error: Item not found
- Action: Item line skipped or error

**Quantity Errors:**
- Error: Quantity mismatch
- Action: Validation error shown

## Summary

The Invoice process creates customer billing documents from shipping orders or delivery notes. It supports multi-page invoices, generates packing lists with carton breakdowns, and exports to multiple formats (Excel, PDF). The process handles complex formatting requirements and customer-specific formats.



