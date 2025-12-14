# Validation Rules Catalog

## Overview

This document catalogs all validation rules found in form `Valid` event handlers across the system. Validation ensures data integrity and business rule compliance.

## Validation Types

### 1. Field-Level Validation

Validates individual field values against rules.

### 2. Cross-Field Validation

Validates relationships between multiple fields.

### 3. Database Validation

Validates against existing database records.

### 4. Business Rule Validation

Validates business logic and workflow rules.

## Validation Rules by Form

### Authentication Forms

#### ilogon (Login Form)

**Field: Password**
- **Rule**: Password must match encrypted value in `muser`
- **Error**: "Invalid Password"
- **Location**: `check` method

**Field: Company Selection**
- **Rule**: Company code must exist in `mcomp`
- **Error**: "Invalid Company"

### Master Data Forms

#### iitem (Input Item Detail)

**Field: Item Number**
- **Rule**: Must be unique in `mitem` table
- **Error**: "Item Number Already Exists"
- **Location**: `Txtbox1.Valid`

**Field: Price**
- **Rule**: Must be >= 0
- **Error**: "Price Must Be Positive"

**Field: Cost**
- **Rule**: Must be >= 0
- **Error**: "Cost Must Be Positive"

#### icustom (Input Customer)

**Field: Customer Number**
- **Rule**: Must be unique in `mcustom` table
- **Error**: "Customer Number Already Exists"
- **Location**: `Txtbox1.Valid`

**Field: Customer Name**
- **Rule**: Must not be empty
- **Error**: "Customer Name Required"

#### ivendor (Input Vendor)

**Field: Vendor Number**
- **Rule**: Must be unique in `mvendor` table
- **Error**: "Vendor Number Already Exists"
- **Location**: `Txtbox1.Valid`

### Order Enquiry Forms

#### ioe1@ (Input Order Enquiry)

**Field: OE Number**
- **Rule**: Must be unique in `moehd` table
- **Error**: "OE Number Already Exists"
- **Location**: `Txtbox1.Valid`

**Field: Customer**
- **Rule**: Must exist in `mcustom` table
- **Error**: "Customer Not Found"
- **Location**: `Combofield1.Valid`

**Field: Item Number**
- **Rule**: Must exist in `mitem` table
- **Error**: "Item Not Found"
- **Location**: Item entry form

**Field: Quantity**
- **Rule**: Must be > 0
- **Error**: "Quantity Must Be Greater Than Zero"
- **Location**: `Txtbox5.Valid`

**Field: Price**
- **Rule**: Must be >= 0
- **Error**: "Price Must Be Positive"

**Cross-Field: Date Range**
- **Rule**: `to_date` must be >= `from_date`
- **Error**: "To Date Must Be >= From Date"
- **Location**: `Txtbox3.Valid` (to_date)

### Order Confirmation Forms

#### upostoe (Post OE/Post OC)

**Pre-Posting Validation:**
- **Rule**: At least one OE must be selected
- **Error**: "No OEs Selected"
- **Location**: `Command1.Click`

- **Rule**: OE must not already be posted (status = 0)
- **Error**: "OE Already Posted"
- **Location**: Posting loop

- **Rule**: OE must have items in `moe` table
- **Error**: "OE Has No Items"
- **Location**: Posting loop

#### iordhd (Input Order Confirmation)

**Field: OC Number**
- **Rule**: Format validation based on company:
  - HT: "HT-OC/" + 10 characters
  - BAT: "BTL-" + 12 characters
  - HFW: "HFW-OC/" + 12 characters
  - INSP: "IN-OC/" + 10 characters
- **Error**: "Invalid OC Number Format"
- **Location**: `Txtbox1.Valid`

**Field: Customer**
- **Rule**: Must exist in `mcustom` table
- **Error**: "Customer Not Found"
- **Location**: `Combofield1.Valid`

### Contract Forms

#### iconthd_2018 (Contract Header)

**Cross-Field: Date Range**
- **Rule**: Both `req_date_f` and `req_date_t` must be empty, or both must be filled
- **Error**: "Invalid Date !" (if one empty, other filled)
- **Location**: `Txtbox8.Valid`

- **Rule**: `req_date_t` must be >= `req_date_f`
- **Error**: "Invalid Date !" (if To Date < From Date)
- **Location**: `Txtbox8.Valid`

**Validation Code:**
```foxpro
PROCEDURE Txtbox8.Valid
IF empty(thisform.txtbox7.value) AND !empty(thisform.txtbox8.value)
    Messagebox("Invalid Date !", 16, "Error!")
    return .f.
ENDIF

IF !empty(thisform.txtbox7.value) AND empty(thisform.txtbox8.value)
    Messagebox("Invalid Date !", 16, "Error!")
    return .f.
ENDIF

IF !empty(thisform.txtbox7.value) OR !empty(thisform.txtbox8.value)
    IF this.value < thisform.txtbox7.value
        Messagebox("Invalid Date !", 16, "System Message!")
        this.value = {//}
    ENDIF
ENDIF
ENDPROC
```

#### isetcont@@_2018 (Input Contract 2018 Fast)

**Field: Contract Number**
- **Rule**: Format validation based on company:
  - HT/HFW/INSP: `w_po_head1 + Txtbox1.value`
  - BAT: `w_po_head1 + "-" + Txtbox1.value`
- **Error**: "Invalid Contract Number Format"

**Field: OC Number**
- **Rule**: Must exist in `mordhd` table
- **Error**: "OC Not Found"
- **Location**: `Txtbox2.Valid`

### Shipping Order Forms

#### isetso (Input Shipping Order)

**Field: SO Number**
- **Rule**: Must be unique in `mso` table
- **Error**: "SO Number Already Exists"

**Field: OC Number**
- **Rule**: Must exist in `mordhd` table
- **Error**: "OC Not Found"

**Cross-Field: Quantity**
- **Rule**: SO quantity must not exceed Contract quantity
- **Error**: "Insufficient Contract Quantity"
- **Location**: SO creation logic

### Delivery Note Forms

#### idn (Input D/N)

**Field: DN Number**
- **Rule**: Must be unique in `mdnhd` table
- **Error**: "DN Number Already Exists"

**Field: Customer**
- **Rule**: Must exist in `mcustom` table
- **Error**: "Customer Not Found"
- **Location**: `cboCustCode.Valid`

**Cross-Field: Date Range**
- **Rule**: `txtToDate` must be >= `txtFromDate`
- **Error**: "To Date Must Be >= From Date"
- **Location**: `txtToDate.Valid`

**Cross-Field: Quantity**
- **Rule**: DN quantity must not exceed SO quantity
- **Error**: "Insufficient SO Quantity"
- **Location**: DN creation logic

### Invoice Forms

#### iinvdt2@ (Input Invoice Detail New)

**Field: Invoice Number**
- **Rule**: Must exist in `minvhd` table
- **Error**: "Invoice Not Found"
- **Location**: Form Init

**Cross-Field: Date Range**
- **Rule**: Both `inv_dt_fr_date` and `inv_dt_to_date` must be empty, or both must be filled
- **Error**: "Invalid Date !" (if one empty, other filled)
- **Location**: `Txtbox5.Valid`

- **Rule**: `inv_dt_to_date` must be >= `inv_dt_fr_date`
- **Error**: "Invalid Date !" (if To Date < From Date)
- **Location**: `Txtbox5.Valid`

**Field: Quantity (Txtbox5)**
- **Rule**: Invoice quantity should match SO quantity
- **Warning**: "Qty. not Match With Shipping Order Qty.! Continue?"
- **Action**: User can override with confirmation
- **Location**: `Txtbox5.Valid`

**Validation Code:**
```foxpro
PROCEDURE Valid
IF in_qty <> this.value
    SELECT mso
    LOCATE FOR alltrim(mso.conf_no) == alltrim(vinvdtform2.conf_no);
        AND alltrim(mso.item_no) == alltrim(vinvdtform2.item_no)
    IF found()
        IF mso.qty <> this.value
            IF messagebox("Qty. not Match With Shipping Order Qty.!" +;
                chr(10) + "Continue?", 64+4, "System Message!") = 6
                * User confirmed, allow override
            ELSE
                return .f.
            ENDIF
        ENDIF
    ENDIF
ENDIF
thisform.txtbox7.value = round(this.value * thisform.txtbox6.value, 2)
ENDPROC
```

**Field: Carton (Txtbox4)**
- **Rule**: Invoice carton should match SO carton
- **Warning**: "Carton no not Match With Shipping Order Carton no.! Continue?"
- **Action**: User can override with confirmation
- **Location**: `Txtbox4.Valid`

**Validation Code:**
```foxpro
PROCEDURE Valid
IF in_ctn <> this.value
    SELECT mso
    LOCATE FOR alltrim(mso.conf_no) == alltrim(vinvdtform2.conf_no);
        AND alltrim(mso.item_no) == alltrim(vinvdtform2.item_no)
    IF found()
        IF mso.ctn <> this.value
            IF messagebox("Carton no not Match With Shipping Order Carton no.!" +;
                chr(10) + "Continue?", 64+4, "System Message!") = 6
                * User confirmed, allow override
            ELSE
                return .f.
            ENDIF
        ENDIF
    ENDIF
ENDIF
ENDPROC
```

**Field: Price**
- **Rule**: Must be >= 0
- **Error**: "Price Must Be Positive"
- **Location**: `Txtbox6.Valid`

**Field: Amount**
- **Rule**: Auto-calculated: `amount = round(qty * price, 2)`
- **Location**: `Txtbox5.Valid`, `Txtbox6.Valid`

#### iinvhd@ (Input Invoice Header)

**Field: Invoice Number**
- **Rule**: Must be unique in `minvhd` table
- **Error**: "Invoice Number Already Exists"
- **Location**: `Txtbox1.Valid`

**Field: Customer**
- **Rule**: Must exist in `mcustom` table
- **Error**: "Customer Not Found"
- **Location**: `Combofield1.Valid`

## Common Validation Patterns

### 1. Uniqueness Validation

**Pattern:**
```foxpro
PROCEDURE Valid
SELECT table
LOCATE FOR alltrim(field) == alltrim(this.value)
IF found() AND recno() <> thisform.old_recno
    Messagebox("Field Already Exists", 16, "Error!")
    return .f.
ENDIF
ENDPROC
```

### 2. Existence Validation

**Pattern:**
```foxpro
PROCEDURE Valid
SELECT master_table
SEEK this.value
IF !found()
    Messagebox("Field Not Found", 16, "Error!")
    return .f.
ENDIF
ENDPROC
```

### 3. Range Validation

**Pattern:**
```foxpro
PROCEDURE Valid
IF this.value < min_value OR this.value > max_value
    Messagebox("Value Out of Range", 16, "Error!")
    return .f.
ENDIF
ENDPROC
```

### 4. Cross-Field Validation

**Pattern:**
```foxpro
PROCEDURE Valid
IF !empty(thisform.field1.value) AND this.value < thisform.field1.value
    Messagebox("Invalid Relationship", 16, "Error!")
    return .f.
ENDIF
ENDPROC
```

### 5. Conditional Validation with Override

**Pattern:**
```foxpro
PROCEDURE Valid
IF this.value <> expected_value
    IF messagebox("Value Does Not Match Expected. Continue?", 64+4, "Warning!") = 6
        * User confirmed, allow override
    ELSE
        return .f.
    ENDIF
ENDIF
ENDPROC
```

## Validation Summary by Category

### Required Fields
- Item Number, Customer Number, Vendor Number
- OE Number, OC Number, Contract Number, SO Number, DN Number, Invoice Number
- Customer selection in all order forms
- Date fields (when one filled, both must be filled)

### Format Validation
- Company-specific number formats (HT, BAT, HFW, INSP)
- Date formats
- Currency codes

### Business Rule Validation
- Quantity must be > 0
- Price must be >= 0
- Date ranges (To Date >= From Date)
- Cross-document quantity validation (SO vs Contract, DN vs SO, Invoice vs SO)

### Data Integrity Validation
- Uniqueness checks
- Existence checks (master data references)
- Referential integrity

## Summary

Validation rules ensure:
1. **Data Integrity**: Uniqueness, existence, referential integrity
2. **Business Rules**: Quantity limits, date ranges, workflow compliance
3. **User Guidance**: Clear error messages, warnings with override options
4. **Data Quality**: Format validation, range checks, cross-field validation

The system uses a combination of strict validation (preventing invalid data) and warning-based validation (allowing overrides with user confirmation) to balance data integrity with operational flexibility.
