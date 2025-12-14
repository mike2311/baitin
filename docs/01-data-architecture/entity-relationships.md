# Entity Relationships

## Overview

The FoxPro system uses **manual relationships** between tables. There are no enforced foreign key constraints at the database level. Relationships are maintained through application logic and field matching.

## Relationship Patterns

### Header/Detail Pattern

The system extensively uses a header/detail pattern for transaction tables:

```mermaid
erDiagram
    MOEHD ||--o{ MOE : "has details"
    MORDHD ||--o{ MORDDT : "has details"
    MCONTHD ||--o{ MCONTDT : "has details"
    MINVHD ||--o{ MINVDT : "has details"
    MDNHD ||--o{ MDNDT : "has details"
    MLAHD ||--o{ MLADT : "has details"
    
    MOEHD {
        string oe_no PK
        date oe_date
        string cust_no FK
    }
    
    MOE {
        string oe_no FK
        string item_no FK
        decimal qty
        decimal price
    }
```

## Core Transaction Flow Relationships

### Order Enquiry to Order Confirmation

```mermaid
erDiagram
    MOECTRL ||--o{ MOEHD : "controls"
    MOEHD ||--o{ MOE : "contains"
    MOE ||--o{ MQTYBRK : "has breakdown"
    MOE ||--o{ MOEBOM : "has BOM"
    MOE ||--o| MORDDT : "posts to"
    
    MOECTRL {
        string oe_no PK
        string cust_no FK
        date oe_date
    }
    
    MOEHD {
        string oe_no PK
        date oe_date
        string cust_no FK
    }
    
    MOE {
        string oe_no FK
        string item_no FK
        string po_no
        string vendor_no FK
    }
    
    MORDDT {
        string conf_no PK
        string item_no FK
        string oe_no FK
    }
```

**Relationship Logic:**
- `MOE.oe_no` → `MORDDT.oe_no` (when posting OE to OC)
- `MOE.item_no` → `MORDDT.item_no`
- `MOE` records are copied to `MORDDT` during posting

### Order Confirmation to Contract

```mermaid
erDiagram
    MORDHD ||--o{ MORDDT : "contains"
    MORDDT ||--o{ MCONTHD : "generates"
    MCONTHD ||--o{ MCONTDT : "contains"
    
    MORDHD {
        string conf_no PK
        string cust_no FK
        date date
    }
    
    MORDDT {
        string conf_no FK
        string item_no FK
        string vendor_no FK
    }
    
    MCONTHD {
        string cont_no PK
        string conf_no FK
        string vendor_no FK
    }
    
    MCONTDT {
        string cont_no FK
        string item_no FK
        string conf_no FK
    }
```

**Relationship Logic:**
- `MORDDT.conf_no` → `MCONTHD.conf_no`
- Contracts are grouped by `vendor_no` from `MORDDT`
- `MORDDT.item_no` → `MCONTDT.item_no`

### Contract to Shipping Order

```mermaid
erDiagram
    MCONTHD ||--o{ MSO : "ships via"
    MORDHD ||--o{ MSO : "references"
    
    MCONTHD {
        string cont_no PK
        string conf_no FK
    }
    
    MSO {
        string so_no PK
        string conf_no FK
        string cont_no FK
        string item_no FK
    }
```

**Relationship Logic:**
- `MSO.conf_no` links to `MORDHD.conf_no`
- `MSO.cont_no` links to `MCONTHD.cont_no`

### Shipping Order to Invoice

```mermaid
erDiagram
    MSO ||--o{ MINVHD : "invoices"
    MINVHD ||--o{ MINVDT : "contains"
    
    MSO {
        string so_no PK
        string conf_no FK
    }
    
    MINVHD {
        string inv_no PK
        string oc_no FK
        string cust_no FK
    }
    
    MINVDT {
        string inv_no FK
        string item_no FK
        string so_no FK
    }
```

**Relationship Logic:**
- `MINVHD.oc_no` links to `MORDHD.conf_no`
- `MINVDT.so_no` links to `MSO.so_no`

## Master Data Relationships

### Item Relationships

```mermaid
erDiagram
    MITEM ||--o{ MITEMVEN : "sold by"
    MITEMVEN }|--|| MVENDOR : "references"
    MITEM ||--o| MPRODBOM : "has BOM"
    MPRODBOM }|--|| MITEM : "sub-item"
    MITEM ||--o{ MOE : "ordered in"
    MITEM ||--o{ MORDDT : "confirmed in"
    MITEM ||--o{ MCONTDT : "contracted in"
    MITEM ||--o{ MINVDT : "invoiced in"
    
    MITEM {
        string item_no PK
        string desp
        decimal price
    }
    
    MITEMVEN {
        string item_no FK
        string vendor_no FK
    }
    
    MPRODBOM {
        string item_no FK
        string sub_item FK
        decimal qty
    }
```

**Relationship Logic:**
- `MITEM.item_no` is the primary key
- `MITEMVEN` creates many-to-many relationship between items and vendors
- `MPRODBOM` creates parent-child relationships for BOM items

### Customer Relationships

```mermaid
erDiagram
    MCUSTOM ||--o{ MOEHD : "orders from"
    MCUSTOM ||--o{ MORDHD : "confirms with"
    MCUSTOM ||--o{ MINVHD : "invoices"
    
    MCUSTOM {
        string cust_no PK
        string ename
    }
    
    MOEHD {
        string cust_no FK
    }
    
    MORDHD {
        string cust_no FK
    }
    
    MINVHD {
        string cust_no FK
    }
```

**Relationship Logic:**
- `MCUSTOM.cust_no` is referenced by all transaction headers
- Customer validation occurs during OE import and transaction creation

### Vendor Relationships

```mermaid
erDiagram
    MVENDOR ||--o{ MCONTDT : "contracted with"
    MVENDOR ||--o{ MOE : "supplies for"
    MVENDOR ||--o{ MITEMVEN : "sells items"
    
    MVENDOR {
        string vendor_no PK
        string ename
        int type
    }
    
    MCONTDT {
        string vendor_no FK
    }
    
    MOE {
        string vendor_no FK
    }
```

**Relationship Logic:**
- `MVENDOR.vendor_no` links to contracts and OEs
- `MVENDOR.type` distinguishes between VENDOR (1) and MAKER (2)

## Supporting Table Relationships

### Quantity Breakdown

```mermaid
erDiagram
    MOE ||--o{ MQTYBRK : "has breakdown"
    MQTYBRK {
        string oe_no FK
        string item_no FK
        string size_code
        string color_code
        decimal qty
    }
```

**Relationship Logic:**
- `MQTYBRK.oe_no` + `MQTYBRK.item_no` links to `MOE`

### BOM Relationships

```mermaid
erDiagram
    MPRODBOM ||--o{ MOEBOM : "used in OE"
    MOE ||--o{ MOEBOM : "has BOM items"
    
    MPRODBOM {
        string item_no PK
        string sub_item PK
        decimal qty
    }
    
    MOEBOM {
        string oe_no FK
        string item_no FK
        string sub_item FK
    }
```

**Relationship Logic:**
- `MPRODBOM` defines product BOM structure
- `MOEBOM` applies BOM to specific OE
- BOM quantities are calculated from `MPRODBOM.qty`

## Lookup Table Relationships

### Reference Data

```mermaid
erDiagram
    ZSTDCODE ||--o{ MITEM : "classifies"
    ZORIGIN ||--o{ MITEM : "originates from"
    ZFOBPORT ||--o{ MSO : "ships from"
    ZPAYTERM ||--o{ MCONTHD : "uses payment"
    
    ZSTDCODE {
        string std_code PK
        string std_desp
    }
    
    MITEM {
        string std_code FK
    }
```

**Relationship Logic:**
- Lookup tables provide reference data
- Relationships are via code matching (not enforced)

## Manual Relationship Enforcement

### Application-Level Validation

Relationships are enforced in application code:

**Example from `uoexls_2013.prg`:**
```foxpro
select moectrl
set order to OE_NO
seek w_oe_no
if eof()
    messagebox(w_oe_no+" --- No OE Control Record"+ chr(10)+"Import Skipped", 0+16, "Syster Message")
    loop
ENDIF
```

**Example from `uordcont.prg`:**
```foxpro
locate for alltrim(morddt.conf_no)==alltrim(voe1.oc_no) and alltrim(morddt.item_no)==alltrim(voe1.item_no)
```

### Key Field Patterns

**Primary Keys (inferred from usage):**
- `oe_no` - Order Enquiry number
- `conf_no` - Order Confirmation number
- `cont_no` - Contract number
- `so_no` - Shipping Order number
- `inv_no` - Invoice number
- `item_no` - Item number
- `cust_no` - Customer number
- `vendor_no` - Vendor number

**Foreign Key Patterns:**
- Transaction headers reference `cust_no`
- Transaction details reference `item_no`
- Contracts reference `vendor_no`
- All transactions link via document numbers

## Relationship Integrity Risks

### No Foreign Key Constraints

**Risks:**
1. **Orphaned Records:** Detail records without headers
2. **Invalid References:** Non-existent customer/vendor/item codes
3. **Data Inconsistency:** Mismatched document numbers
4. **Cascade Issues:** No automatic deletion of related records

### Manual Validation Required

**Validation Points:**
1. **OE Import:** Validates OE Control, Customer, Item
2. **Post OE to OC:** Validates OE exists
3. **Contract Generation:** Validates OC exists
4. **Invoice Creation:** Validates SO/DN exists

## Summary

The system relies on **application-level relationship management** rather than database constraints. This provides flexibility but requires careful validation in code to maintain data integrity.



