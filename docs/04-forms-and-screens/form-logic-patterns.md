# Form Logic Patterns

## Overview

This document describes common patterns and conventions used across forms in the system. Understanding these patterns helps in analyzing individual forms and maintaining consistency.

## Form Structure

### Form Types

1. **Single Form** - Standalone form with no formset
2. **Formset** - Container with multiple forms (Form1, Form2, etc.)
3. **Pageframe Forms** - Forms with tabbed pages (Page1, Page2, etc.)

### Common Form Properties

- **DataSession:** Usually 2 (private data session) or 1 (default)
- **AutoRelease:** .T. (automatically release when closed)
- **WindowType:** 0 (normal) or 1 (modal)
- **AutoCenter:** .T. (center form on screen)

## Event Handlers

### Form-Level Events

#### Load Event
**Purpose:** Initialize form-level variables and settings

**Common Patterns:**
```foxpro
PROCEDURE Load
SET TALK OFF
SET HOUR TO 24
SET SAFETY OFF
SET CENTURY ON
SET DELETED ON
SET DATE MDY

PUBLIC w_variable1, w_variable2
w_variable1 = ""
w_variable2 = .F.
ENDPROC
```

**Typical Operations:**
- Set environment variables (TALK, SAFETY, CENTURY, etc.)
- Declare public variables
- Initialize default values
- Set database paths

#### Init Event
**Purpose:** Initialize form objects and load data

**Common Patterns:**
```foxpro
PROCEDURE Init
PUBLIC check_change, record_point
check_change = 0
record_point = ""

SELECT mitem
SET ORDER TO item_no
GO TOP

thisform.refresh
ENDPROC
```

**Typical Operations:**
- Initialize form-specific variables
- Open and position database tables
- Set index orders
- Load initial data
- Call refresh methods

#### GotFocus Event
**Purpose:** Handle form focus and refresh data

**Common Patterns:**
```foxpro
PROCEDURE GotFocus
IF check_change <> 0
    thisform.label4.caption = "Please Wait..............."
    SELECT voe1
    strOeNo = alltrim(w_oe_prefix) + alltrim(thisform.txtbox1.value)
    thisformset.requeryGrid(strOeNo)
    thisform.label4.caption = ""
    check_change = 0
ENDIF
thisform.refresh
ENDPROC
```

**Typical Operations:**
- Check for data changes
- Refresh grids and data
- Update display labels
- Reset change flags

#### Refresh Event
**Purpose:** Update form display with current data

**Common Patterns:**
```foxpro
PROCEDURE Refresh
SELECT mitem
thisform.txtbox1.value = mitem.item_no
thisform.txtbox2.value = mitem.short_name
thisform.grid1.refresh
ENDPROC
```

**Typical Operations:**
- Update control values from current record
- Refresh grids
- Update calculated fields
- Enable/disable controls based on state

#### Unload Event
**Purpose:** Cleanup when form closes

**Common Patterns:**
```foxpro
PROCEDURE Unload
IF used("temp_cursor")
    SELECT temp_cursor
    USE
ENDIF
RELEASE PUBLIC w_variable1
ENDPROC
```

**Typical Operations:**
- Close temporary cursors
- Release public variables
- Clean up resources

### Control-Level Events

#### Valid Event (Field Validation)
**Purpose:** Validate field input before leaving control

**Common Patterns:**

**Required Field Validation:**
```foxpro
PROCEDURE Valid
IF EMPTY(this.value)
    MESSAGEBOX("Field Cannot Be Empty!", 16, "Error")
    RETURN .F.
ENDIF
RETURN .T.
ENDPROC
```

**Format Validation:**
```foxpro
PROCEDURE Valid
IF !empty(this.value)
    IF len(alltrim(this.value)) > 10
        messagebox("Length of Item number > 10", 16, "Error Message!")
        return .f.
    ENDIF
ENDIF
RETURN .T.
ENDPROC
```

**Database Existence Check:**
```foxpro
PROCEDURE Valid
IF !empty(this.value)
    SELECT mcustom
    LOCATE FOR ALLTRIM(mcustom.cust_no) == ALLTRIM(this.value)
    IF !FOUND()
        Messagebox("Invalid Client No!", 16, "System Message!")
        thisform.txtbox4.value = ""
        return .f.
    ELSE
        thisform.txtbox4.value = mcustom.ename
    ENDIF
ENDIF
RETURN .T.
ENDPROC
```

**Uniqueness Check:**
```foxpro
PROCEDURE Valid
IF !empty(this.value)
    SELECT * FROM mitem WHERE item_no == alltrim(this.value) INTO CURSOR item_cursor
    IF !eof()
        messagebox("Item number had been existed!", 16, "Error Message!")
        return .f.
    ENDIF
ENDIF
RETURN .T.
ENDPROC
```

**Cross-Field Validation (Date Range):**
```foxpro
PROCEDURE Valid
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
RETURN .T.
ENDPROC
```

#### GotFocus Event (Control)
**Purpose:** Handle control focus

**Common Patterns:**
```foxpro
PROCEDURE GotFocus
IF Empty(this.value)
    this.value = date()
ENDIF
ENDPROC
```

**Typical Operations:**
- Set default values
- Change visual appearance (forecolor)
- Enable/disable related controls

#### Click Event (Button)
**Purpose:** Handle button clicks

**Common Patterns:**

**Add Record:**
```foxpro
PROCEDURE Click
IF empty(alltrim(thisform.txtbox1.value))
    messagebox("Oe No Can not Empty!", 16, "System Message!")
    thisform.txtbox1.setfocus
    return .f.
ENDIF

IF empty(thisform.TXTBOX2.value)
    Messagebox("Invalid Client Code!", 16, "System Message!")
    thisform.txtbox2.setfocus
ELSE
    DO FORM ioe2 WITH alltrim(w_oe_prefix) + alltrim(thisform.txtbox1.value), "", alltrim(thisform.txtbox2.value)
    check_change = 1
ENDIF
ENDPROC
```

**Delete Record:**
```foxpro
PROCEDURE Click
IF MESSAGEBOX("Delete All Record ?", 4+64, "System Message") = 6
    SELECT moe
    SET FILTER TO alltrim(moe.oe_no) == alltrim(w_oe_prefix) + alltrim(thisform.txtbox1.value)
    DELETE ALL
    SET FILTER TO
    
    thisformset.requeryGrid(strOeNo)
    thisform.txtbox1.value = ""
    thisform.refresh
ENDIF
ENDPROC
```

**Save Record:**
```foxpro
PROCEDURE Click
SELECT moe
LOCATE FOR alltrim(oe_no) == alltrim(thisform.txtbox1.value)
IF !found()
    MESSAGEBOX("OE Must Have Items", 16, "Error")
    RETURN .F.
ENDIF

SELECT moehd
LOCATE FOR alltrim(oe_no) == alltrim(thisform.txtbox1.value)
IF found()
    REPLACE mod_date WITH DATE()
    REPLACE mod_user WITH sysUserId
ENDIF

thisformset.release
ENDPROC
```

## Validation Patterns

### Field-Level Validation

#### Required Field
- Check if field is empty
- Show error message
- Return .F. to prevent leaving control
- Set focus back to field

#### Format Validation
- Check length (e.g., max 10 characters)
- Check format (e.g., numeric, date)
- Check pattern (e.g., specific format)

#### Range Validation
- Check numeric ranges
- Check date ranges
- Check value constraints

### Cross-Field Validation

#### Date Range Validation
- Both dates must be empty or both filled
- To date must be >= From date
- Validate date relationships

#### Dependency Validation
- Field B required if Field A has value
- Field C must match Field A
- Related fields must be consistent

### Database Validation

#### Existence Check
- Check if record exists in lookup table
- Validate foreign key relationships
- Check master data existence

#### Uniqueness Check
- Check if value already exists
- Prevent duplicate records
- Validate primary key constraints

#### Business Rule Validation
- Check business-specific rules
- Validate status transitions
- Check workflow constraints

## Data Operation Patterns

### Grid Population

#### Simple Grid
```foxpro
SELECT * FROM mitem INTO CURSOR Gridsource_cursor ORDER BY item_no
thisform.grid1.recordsource = "Gridsource_cursor"
thisform.grid1.column1.controlsource = "Gridsource_cursor.item_no"
thisform.grid1.column2.controlsource = "Gridsource_cursor.short_name"
```

#### Grid with Joins
```foxpro
SELECT Mitem.item_no, Mitem.short_name, mitem.std_code,;
       nvl(Zstdcode.std_desp,"");
FROM baitin!mitem LEFT OUTER JOIN baitin!zstdcode;
     ON Mitem.std_code = Zstdcode.std_code;
INTO CURSOR Gridsource_cursor;
ORDER BY 1

thisform.grid1.recordsource = "Gridsource_cursor"
```

#### Grid with Aggregations
```foxpro
SELECT oe_no, item_no, sum(qty) as BrkQty;
FROM mqtybrk;
WHERE oe_no = strOENo;
GROUP BY 1,2;
INTO CURSOR voebrk

SELECT a.*, nvl(b.BrkQty,000000) as brkQty;
FROM voe3 a LEFT OUTER JOIN voebrk b;
     ON a.oe_no = b.oe_no AND a.item_no = b.item_no;
INTO CURSOR voe1
```

#### Dynamic Grid with Calculations
```foxpro
SELECT a.*, round(a.qty/a.ctn*a.price,2) as ctncost,;
       nvl(b.BrkQty,000000) as brkQty;
FROM voe3 a LEFT OUTER JOIN voebrk b;
     ON a.oe_no = b.oe_no AND a.item_no = b.item_no;
INTO CURSOR voe1

thisformset.form1.grid1.column5.controlsource =;
    "iif(voe1.cost <=0,100,round(((voe1.price *getExRate('US$'))-;
     (voe1.cost * getExRate(cur_code))) / (voe1.cost * getExRate(cur_code))* 100,2))"
```

#### Grid with Conditional Formatting
```foxpro
thisformset.form1.grid1.column2.dynamicbackcolor =;
    "iif(qty # brkQty AND BrkQty > 0, RGB(255,221,221), RGB(255,255,255))"

thisformset.form1.grid1.column2.dynamicforecolor =;
    "iif(qty # brkQty AND BrkQty > 0, RGB(255,0,0), RGB(0,0,0))"
```

### Data Binding Patterns

#### Direct Binding
```foxpro
thisform.txtbox1.controlsource = "mitem.item_no"
thisform.txtbox2.controlsource = "mitem.short_name"
```

#### Calculated Binding
```foxpro
thisform.txtbox3.controlsource = "round(qty * price, 2)"
```

#### Conditional Binding
```foxpro
thisform.txtbox4.controlsource = "iif(mitem.suspend_flag = 'Y', 'Suspended', 'Active')"
```

### Save Operations

#### Append New Record
```foxpro
SELECT mitem
APPEND BLANK
REPLACE item_no WITH thisform.txtbox1.value
REPLACE short_name WITH thisform.txtbox2.value
REPLACE cre_date WITH DATE()
REPLACE cre_user WITH sysUserId
```

#### Update Existing Record
```foxpro
SELECT mitem
LOCATE FOR alltrim(item_no) == alltrim(thisform.txtbox1.value)
IF found()
    REPLACE short_name WITH thisform.txtbox2.value
    REPLACE mod_date WITH DATE()
    REPLACE mod_user WITH sysUserId
ENDIF
```

#### Save with Validation
```foxpro
IF empty(thisform.txtbox1.value)
    MESSAGEBOX("Item No Cannot Be Empty!", 16, "Error")
    RETURN .F.
ENDIF

SELECT mitem
LOCATE FOR alltrim(item_no) == alltrim(thisform.txtbox1.value)
IF found() AND w_mode = "A"
    MESSAGEBOX("Item Already Exists!", 16, "Error")
    RETURN .F.
ENDIF

IF w_mode = "A"
    APPEND BLANK
ENDIF

REPLACE item_no WITH thisform.txtbox1.value
REPLACE short_name WITH thisform.txtbox2.value
```

### Delete Operations

#### Single Record Delete
```foxpro
IF MESSAGEBOX("Delete This Record?", 4+64, "Confirm") = 6
    SELECT mitem
    DELETE
    PACK
    thisform.refresh
ENDIF
```

#### Multiple Record Delete
```foxpro
IF MESSAGEBOX("Delete All Record ?", 4+64, "System Message") = 6
    SELECT moe
    SET FILTER TO alltrim(moe.oe_no) == alltrim(w_oe_prefix) + alltrim(thisform.txtbox1.value)
    DELETE ALL
    SET FILTER TO
    
    SELECT mqtybrk
    SET FILTER TO alltrim(mqtybrk.oe_no) == alltrim(w_oe_prefix) + alltrim(thisform.txtbox1.value)
    DELETE ALL
    SET FILTER TO
ENDIF
```

## Form Navigation Patterns

### Opening Child Forms
```foxpro
DO FORM ioe2 WITH alltrim(w_oe_prefix) + alltrim(thisform.txtbox1.value),;
                  "",;
                  alltrim(thisform.txtbox2.value),;
                  alltrim(thisform.txtbox4.value),;
                  0,;
                  THISFORM.TXTBOX10.VALUE,;
                  THISFORM.TXTBOX11.VALUE,;
                  ""
```

### Form Return Values
```foxpro
* In calling form:
DO FORM ioe2 WITH parameters
IF check_change = 1
    thisformset.requeryGrid(strOeNo)
ENDIF

* In called form:
PUBLIC check_change
check_change = 1
thisformset.release
```

### Form Visibility Control
```foxpro
thisformset.form2.visible = .T.
thisformset.form2.show
thisform.hide
```

## Common Methods

### Requery Grid Method
```foxpro
PROCEDURE requerygrid
PARAMETER strOENo

SET EXACT ON
thisformset.form1.grid1.recordsource = ""

SELECT * FROM moe INTO CURSOR voe3;
    WHERE oe_no = strOENo;
    ORDER BY item_no

SELECT oe_no, item_no, sum(qty) as BrkQty;
    FROM mqtybrk;
    WHERE oe_no = strOENo;
    GROUP BY 1,2;
    INTO CURSOR voebrk

SELECT a.*, round(a.qty/a.ctn*a.price,2) as ctncost,;
       nvl(b.BrkQty,000000) as brkQty;
    FROM voe3 a LEFT OUTER JOIN voebrk b;
         ON a.oe_no = b.oe_no AND a.item_no = b.item_no;
    INTO CURSOR voe1

thisformset.form1.grid1.recordsource = "voe1"
thisformset.form1.grid1.column1.controlsource = "voe1.item_no"
thisformset.form1.grid1.column2.controlsource = "voe1.qty"
* ... set other columns

ENDPROC
```

### Update Method
```foxpro
PROCEDURE update_winvdt
SELECT winvdtgrid
GO TOP
DO WHILE !EOF()
    SELECT minvdt
    LOCATE FOR alltrim(minvdt.inv_no) == alltrim(winvdtgrid.inv_no) AND;
               alltrim(minvdt.item_no) == alltrim(winvdtgrid.item_no)
    IF !found()
        APPEND BLANK
    ENDIF
    REPLACE inv_no WITH winvdtgrid.inv_no
    REPLACE item_no WITH winvdtgrid.item_no
    REPLACE qty WITH winvdtgrid.qty
    * ... replace other fields
    SELECT winvdtgrid
    SKIP
ENDDO
ENDPROC
```

## Error Handling Patterns

### Validation Error Messages
```foxpro
MESSAGEBOX("Error Message Text", 16, "Error Title")
RETURN .F.
```

**Message Box Types:**
- `16` - Stop icon (error)
- `32` - Question icon (confirmation)
- `48` - Exclamation icon (warning)
- `64` - Information icon

### User Confirmation
```foxpro
IF MESSAGEBOX("Delete This Record?", 4+32, "Confirm") = 6
    * User clicked Yes
    DELETE
ELSE
    * User clicked No
    RETURN
ENDIF
```

### Try-Catch Pattern (Error Handling)
```foxpro
ON ERROR DO error_handler

PROCEDURE error_handler
MESSAGEBOX("Error: " + MESSAGE(), 16, "System Error")
RETURN
ENDPROC
```

## State Management Patterns

### Mode Variables
```foxpro
PUBLIC w_mode
w_mode = ""  * Normal mode
w_mode = "A" * Add mode
w_mode = "M" * Modify mode

IF w_mode = "A" OR w_mode = "M"
    thisform.txtbox1.enabled = .T.
    thisform.txtbox2.enabled = .T.
ELSE
    thisform.txtbox1.enabled = .F.
    thisform.txtbox2.enabled = .F.
ENDIF
```

### Change Tracking
```foxpro
PUBLIC check_change
check_change = 0  * No changes
check_change = 1  * Changes made

PROCEDURE GotFocus
IF check_change <> 0
    thisformset.requeryGrid(strOeNo)
    check_change = 0
ENDIF
ENDPROC
```

### Record Point Tracking
```foxpro
PUBLIC record_point
record_point = ""

* Save current position
record_point = alltrim(mitem.item_no)

* Restore position
SELECT voe1
LOCATE FOR alltrim(item_no) == alltrim(record_point)
IF !found()
    GO TOP
ENDIF
```

## Best Practices

1. **Always validate before saving** - Check all required fields and business rules
2. **Use meaningful error messages** - Tell user exactly what's wrong
3. **Track changes** - Use flags to know when to refresh data
4. **Clean up resources** - Close cursors and release variables in Unload
5. **Use consistent naming** - Follow form naming conventions
6. **Handle edge cases** - Check for empty values, EOF conditions
7. **Provide user feedback** - Show "Please Wait" messages for long operations
8. **Enable/disable controls** - Based on form state and user permissions
9. **Use transactions** - For multi-table updates when possible
10. **Document complex logic** - Add comments for non-obvious code

## Summary

Forms in the system follow consistent patterns for:
- Event handling (Load, Init, GotFocus, Valid, Click, Refresh, Unload)
- Validation (field-level, cross-field, database, business rules)
- Data operations (grid population, data binding, save, delete)
- Form navigation (opening child forms, passing parameters)
- State management (mode tracking, change tracking)

Understanding these patterns helps in:
- Analyzing existing forms
- Creating new forms
- Debugging form issues
- Maintaining consistency across the system
