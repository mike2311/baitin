# Excel Import Logic

## Overview

The Excel import functionality is one of the most complex parts of the system. The primary import program `uoexls_2013.prg` contains 1,747 lines of code handling multiple Excel formats, dynamic field detection, validation, and data processing.

## Primary Import Program

### uoexls_2013.prg

**Size:** 1,747 lines  
**Purpose:** Import Order Enquiry from Excel (2013 CSV format)  
**Complexity:** Most complex program in the system

## Dynamic Field Detection

### Process

The system dynamically detects column positions by searching for keywords in the Excel header row.

### Field Detection Logic

**Item Number:**
```foxpro
do while (w_field_no < 50 and finished<> .t.)
    field_name="f"+strzero(w_field_no,2)
    if  at("ITEM",upper(&field_name))> 0 
        n_item=field_name
        n_item_no="woexls.f"+strzero(w_field_no,2)
        finished=.t.
    endif    
    w_field_no=w_field_no+ 1
enddo
```

**Quantity:**
```foxpro
if  at("TOTAL PIECE",upper(&field_name))> 0 OR at("TOTAL QTY",upper(&field_name))> 0 OR;
     at("TOT PIECE",upper(&field_name))> 0 OR at("TOT QTY",upper(&field_name))> 0 
    n_qty=field_name
    finished=.t.
endif
```

**Sub SKN:**
```foxpro
if  at("SUB SKN",upper(&field_name))> 0 or at("SUB SKU #",upper(&field_name))> 0
    n_sub_skn=field_name
    finished=.t.
endif
```

### Detected Fields

- **Item:** "ITEM"
- **Sub SKN:** "SUB SKN", "SUB SKU #"
- **SKU:** "SKU #"
- **Quantity:** "TOTAL PIECE", "TOTAL QTY", "TOT PIECE", "TOT QTY"
- **Ship From/To:** Dynamic date field detection
- **Customer Ship From/To:** Dynamic date field detection
- **Remark:** "COMMENT"
- **Retail 1:** "RETAIL1", "RETAIL PRICE 1"
- **Retail 2:** "RETAIL2", "RETAIL PRICE 2"

## Import Process Flow

### Step 1: File Loading

1. Excel file loaded into temporary table `woexlst`
2. File parsed row by row
3. Header row identified

### Step 2: OE Number Extraction

```foxpro
select distinct woexlst.f01 from woexlst where recno() => w_detail_pos + 1 into cursor voeno
```

- Extract distinct OE numbers from first column
- Process each OE number separately

### Step 3: Validation

**OE Control Validation:**
```foxpro
IF ALLTRIM(w_password)="INSP"
    w_oe_no="IN-"+ALLTRIM(w_oe_no)   
ELSE 
    select moectrl
    set order to OE_NO
    seek w_oe_no
    if eof()
        messagebox(w_oe_no+" --- No OE Control Record"+ chr(10)+"Import Skipped", 0+16, "Syster Message")
        loop
    ENDIF
ENDIF
```

**Customer Validation:**
```foxpro
if alltrim(w_cust_no)<>alltrim(moectrl.cust_no) and !empty(w_oe_no)
    messagebox("OE No.:"+alltrim(w_oe_no) +" --- OE Control Record Cust Code Not Match"+ chr(10)+"Import Skipped", 0+16, "Syster Message")
    loop
ENDIF
```

### Step 4: Data Processing

**Append to Work Table:**
```foxpro
select woexls
ZAP
append from woexlst for recno()=1
do append_woexls
do set_qty
```

**Process Items:**
- Group items (handle "SEE BELOW" for sub-items)
- Process "SEE ABOVE" for SKU references
- Extract quantities and dates

### Step 5: OE Creation

**Create Header:**
```foxpro
select moehd
set order to oe_no
seek w_oe_no
if eof() 
    append blank
    replace moehd.oe_no with w_oe_no
    replace moehd.oe_date with w_oe_date
    replace moehd.cre_date with date()
    replace moehd.user_id with sysuserid
    replace moehd.cre_user with sysuserid
endif
```

**Create Details:**
```foxpro
do update_moe
do update_mqtybrk
Do Process_Moe
do process_qty_breakdown
```

## Special Handling

### "SEE BELOW" Processing

**Sub-items with "SEE BELOW":**
```foxpro
if alltrim(&n_sub_skn)='SEE BELOW'
    w_item_no=alltrim(&n_item_no)
    select woexlst
    locate for f01=w_oe_no_save and alltrim(&n_item)==alltrim(w_item_no)
    if !eof()
        skip
    endif     
    do while alltrim(&n_sku)=='SEE ABOVE' and !eof() 
        scatter to field_array
        select woexls
        append blank
        gather from field_array
        select woexlst
        skip
    enddo  
endif
```

### Quantity Aggregation

**Sum quantities for same item:**
```foxpro
select sum(val(&n_qty)) as tot_qty from woexlst into cursor temp where f01=w_oe_no_save and &n_item=&w_item_field
replace &n_qty with alltrim(str(temp.tot_qty))
```

### Date Range Extraction

**Ship From/To dates:**
```foxpro
select min(&w_ship_from_fld) as w_date from woexlst into cursor vtemp where  f01=w_oe_no_save and &n_item=&w_item_field
w_ship_from = ctod(alltrim(vtemp.w_date))

select max(&w_ship_to_fld) as w_date from woexlst into cursor vtemp where  f01=w_oe_no_save and &n_item=&w_item_field
w_ship_to= ctod(alltrim(vtemp.w_date))
```

## Multi-Format Support

### Supported Formats

1. **Standard Format** - Generic Excel template
2. **Walmart Format** - Walmart-specific layout (`uwalxls.prg`)
3. **CSV Format (2013)** - Comma-separated values (`uoexls_2013.prg`)
4. **XLS Format (2013)** - Excel 2013 format (`uoexls_2013_xls.prg`)
5. **Multi-Item Block** - Items grouped in blocks (`uoexls2.prg`)
6. **New Format** - Updated Excel template (`unewoexls.prg`)

### Format-Specific Logic

Each format has its own import program with format-specific parsing logic.

## Error Handling

### Validation Errors

**OE Control Not Found:**
- Error message displayed
- Import skipped for that OE
- Continue with next OE

**Customer Mismatch:**
- Error message displayed
- Import skipped
- Validation prevents incorrect data

**Invalid Items:**
- Item line skipped
- Error logged
- Continue processing

### Processing Errors

**Quantity Errors:**
- Negative quantities handled
- Zero quantities validated
- Mismatched totals checked

**Date Errors:**
- Invalid date formats handled
- Missing dates use defaults
- Date range validation

## Performance Considerations

### Large File Handling

- Processes one OE at a time
- Uses temporary tables for processing
- Clears work tables between OEs

### Memory Management

- Uses cursors for temporary data
- Clears arrays between operations
- Releases tables when done

## Summary

The Excel import logic is highly sophisticated, supporting multiple formats with dynamic field detection. It handles complex data structures including sub-items, quantity breakdowns, and date ranges. The validation ensures data integrity, and error handling allows partial imports to succeed even when some records fail.



