# Transaction Tables - Detailed Schemas

## Order Enquiry (OE) Tables

### moe (Order Enquiry Detail)

**Purpose:** Stores individual line items for order enquiries

**Key Fields (inferred from code):**
- `oe_no` (C) - Order Enquiry number (links to moehd)
- `date` (D) - OE date
- `cust_no` (C) - Customer number (links to mcustom)
- `item_no` (C) - Item number (links to mitem)
- `qty` (N) - Quantity
- `unit` (C) - Unit of measure
- `ctn` (N) - Carton quantity
- `price` (N) - Unit price
- `cost` (N) - Unit cost
- `cur_code` (C) - Currency code
- `po_no` (C) - Purchase Order number
- `vendor_no` (C) - Vendor number (links to mvendor)
- `del_date` (D) - Delivery date
- `item_desc` (M) - Item description (memo field)
- `pack_pc_1` (N) - Pack pieces 1
- `pack_pc_2` (N) - Pack pieces 2
- `pack_pc_3` (N) - Pack pieces 3
- `pack_pc_4` (N) - Pack pieces 4
- `pack_desp` (C) - Pack description
- `cube` (N) - Cube measurement
- `meas` (N) - Measurement
- `lc_date` (D) - Letter of Credit date
- `remark` (M) - Remarks (memo field)
- `status` (N) - Status code
- `comp_code` (C) - Company code (HT, BAT, INSP, HFW)
- `user_id` (C) - User who created
- `cre_user` (C) - Creator user
- `cre_date` (D) - Creation date

**Business Rules:**
- Must have valid `oe_no` (exists in moehd)
- Must have valid `cust_no` (exists in mcustom)
- Must have valid `item_no` (exists in mitem)
- `comp_code` determined by OE number format (contains "/" = HT, else BAT)

**Indexes:**
- Primary: `oe_no`
- Secondary: `item_no`, `cust_no`, `vendor_no`

**Code Reference:** `xmoe.prg`, `uoexls_2013.prg`

### moehd (Order Enquiry Header)

**Purpose:** Header record for each Order Enquiry

**Key Fields:**
- `oe_no` (C) - Order Enquiry number (Primary Key)
- `oe_date` (D) - OE date
- `cre_date` (D) - Creation date
- `user_id` (C) - User ID
- `cre_user` (C) - Creator user

**Business Rules:**
- One header per OE number
- Created before or with first detail record
- `oe_date` comes from `moectrl` or user input

**Indexes:**
- Primary: `oe_no`

**Code Reference:** `uoexls_2013.prg` (lines 196-207)

### moectrl (Order Enquiry Control)

**Purpose:** Control file that validates OE creation

**Key Fields:**
- `oe_no` (C) - Order Enquiry number (Primary Key)
- `cust_no` (C) - Customer number
- `oe_date` (D) - OE date

**Business Rules:**
- Must exist before OE can be imported (except INSP company)
- `cust_no` must match OE import data
- Used for validation during Excel import

**Indexes:**
- Primary: `oe_no`

**Code Reference:** `uoexls_2013.prg` (lines 148-156, 174-183)

## Order Confirmation (OC) Tables

### mordhd (Order Confirmation Header)

**Purpose:** Header for confirmed orders

**Key Fields:**
- `conf_no` (C) - Order Confirmation number (Primary Key)
- `date` (D) - Confirmation date
- `cust_no` (C) - Customer number (links to mcustom)

**Business Rules:**
- Created when OE is posted to OC
- Links to original OE via item details

**Indexes:**
- Primary: `conf_no`
- Secondary: `cust_no`, `date`

**Code Reference:** `uordcont.prg`

### morddt (Order Confirmation Detail)

**Purpose:** Line items for confirmed orders

**Key Fields:**
- `conf_no` (C) - Order Confirmation number (links to mordhd)
- `item_no` (C) - Item number (links to mitem)
- `qty` (N) - Confirmed quantity
- `ctn` (N) - Carton quantity
- `price` (N) - Confirmed price
- `po_no` (C) - Purchase Order number
- `head` (L) - Head item flag (for BOM processing)
- `oe_no` (C) - Original OE number (links to moe)

**Business Rules:**
- Created from `moe` records during posting
- BOM items have `head = .F.`
- BOM quantities calculated from `mprodbom`

**Indexes:**
- Primary: `conf_no` + `item_no`
- Secondary: `item_no`, `oe_no`

**Code Reference:** `uordcont.prg` (lines 14-19, 33-56)

## Contract Tables

### mconthd (Contract Header)

**Purpose:** Purchase contracts with vendors

**Key Fields:**
- `cont_no` (C) - Contract number (Primary Key)
- `conf_no` (C) - Order Confirmation number (links to mordhd)
- `date` (D) - Contract date
- `vendor_no` (C) - Vendor number (links to mvendor)
- `payment` (C) - Payment terms
- `remark` (M) - Remarks (memo field)
- `req_date_fr` (D) - Required date from
- `req_date_to` (D) - Required date to
- `cur_code` (C) - Currency code
- `ship_to` (C) - Ship to location

**Business Rules:**
- Generated from OC, grouped by vendor
- One contract per vendor per OC
- Payment terms from vendor or default

**Indexes:**
- Primary: `cont_no`
- Secondary: `conf_no`, `vendor_no`

**Code Reference:** `uwcontract.prg` (lines 18-23)

### mcontdt (Contract Detail)

**Purpose:** Line items for contracts

**Key Fields:**
- `cont_no` (C) - Contract number (links to mconthd)
- `conf_no` (C) - Order Confirmation number (links to mordhd)
- `item_no` (C) - Item number (links to mitem)
- `qty` (N) - Contract quantity
- `price` (N) - Contract price
- `desc_memo` (M) - Description memo
- `item_memo` (M) - Item memo
- `head` (L) - Head item flag (for BOM)

**Business Rules:**
- Created from `morddt` records
- Grouped by `vendor_no` from `morddt`
- BOM quantities calculated from `mprodbom`

**Indexes:**
- Primary: `cont_no` + `item_no`
- Secondary: `conf_no`, `item_no`

**Code Reference:** `uwcontract.prg`, `uordcont.prg` (lines 58-79)

## Shipping Order Tables

### mso (Shipping Order)

**Purpose:** Shipping orders for delivery

**Key Fields (inferred):**
- `so_no` (C) - Shipping Order number (Primary Key)
- `conf_no` (C) - Order Confirmation number (links to mordhd)
- `item_no` (C) - Item number (links to mitem)
- `qty` (N) - Shipping quantity
- `ship_date` (D) - Shipping date
- `cont_no` (C) - Contract number (links to mconthd)

**Business Rules:**
- Created from confirmed orders
- Links to contracts and OCs
- Used for invoice generation

**Indexes:**
- Primary: `so_no`
- Secondary: `conf_no`, `item_no`

**File Size:** 279MB (largest transaction table)

## Delivery Note Tables

### mdnhd (Delivery Note Header)

**Purpose:** Header for delivery notes

**Key Fields:**
- `dn_no` (C) - Delivery Note number (Primary Key)
- `date` (D) - DN date
- Related header fields

### mdndt (Delivery Note Detail)

**Purpose:** Line items for delivery notes

**Key Fields:**
- `dn_no` (C) - Delivery Note number (links to mdnhd)
- `item_no` (C) - Item number
- `qty` (N) - Delivery quantity

### mdnbrk (Delivery Note Breakdown)

**Purpose:** Breakdown details for delivery notes

**Key Fields:**
- `dn_no` (C) - Delivery Note number
- Breakdown fields

## Invoice Tables

### minvhd (Invoice Header)

**Purpose:** Header for invoices

**Key Fields:**
- `inv_no` (C) - Invoice number (Primary Key)
- `cust_no` (C) - Customer number (links to mcustom)
- `date` (D) - Invoice date
- `oc_no` (C) - Order Confirmation number (links to mordhd)
- `ship` (C) - Shipment information
- `del_date` (D) - Delivery date

**Business Rules:**
- Created from SO or DN
- Links to original OC
- Used for packing list generation

**Indexes:**
- Primary: `inv_no`
- Secondary: `cust_no`, `oc_no`, `date`

**Code Reference:** `xinvhd.prg`

### minvdt (Invoice Detail)

**Purpose:** Line items for invoices

**Key Fields:**
- `inv_no` (C) - Invoice number (links to minvhd)
- `item_no` (C) - Item number (links to mitem)
- `qty` (N) - Invoice quantity
- `price` (N) - Invoice price
- `so_no` (C) - Shipping Order number (links to mso)
- `oc_no` (C) - Order Confirmation number (links to mordhd)

**Business Rules:**
- Created from SO or DN details
- Links to shipping orders
- Used for packing list

**Indexes:**
- Primary: `inv_no` + `item_no`
- Secondary: `item_no`, `so_no`

**File Size:** 123MB (large transaction table)
**Memo File:** 178MB (minvdt.FPT - large descriptions)

**Code Reference:** `xinvdt.prg`

## Loading Tables

### mlahd (Loading Advice Header)

**Purpose:** Header for loading advice

**Key Fields:**
- `la_no` (C) - Loading Advice number (Primary Key)
- `date` (D) - Loading date
- Related header fields

### mladt (Loading Advice Detail)

**Purpose:** Line items for loading advice

**Key Fields:**
- `la_no` (C) - Loading Advice number (links to mlahd)
- `item_no` (C) - Item number
- `qty` (N) - Loading quantity

**File Size:** 4.4MB
**Memo File:** 16MB (mladt.FPT)

### mload (Loading Master)

**Purpose:** Master loading information

**Key Fields:**
- Loading master fields

**File Size:** 10MB

## Common Patterns

### Header/Detail Relationship

All transaction tables follow this pattern:
1. **Header Table:** One record per document
   - Contains document number (Primary Key)
   - Contains customer/vendor reference
   - Contains dates and summary information

2. **Detail Table:** Multiple records per document
   - Contains document number (Foreign Key)
   - Contains item number (Foreign Key)
   - Contains quantities, prices, and item-specific data

### Linking Fields

**Document Flow:**
- `oe_no` → `conf_no` → `cont_no` → `so_no` → `inv_no`

**Master Data Links:**
- `cust_no` - Links to `mcustom`
- `vendor_no` - Links to `mvendor`
- `item_no` - Links to `mitem`

### Audit Fields

Most transaction tables include:
- `user_id` - User who last modified
- `cre_user` - User who created
- `cre_date` - Creation date

### Memo Fields

Large text stored in FPT files:
- Descriptions
- Remarks
- Memos
- Notes



