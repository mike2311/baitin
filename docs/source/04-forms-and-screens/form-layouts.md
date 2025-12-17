# Form Layouts and UI Components

## Overview

This document describes form layouts and UI components extracted from `.SCT` file properties. Visual FoxPro forms store layout information including position (Top, Left), size (Width, Height), and control properties.

## Layout Properties

### Form Properties

Forms have the following layout properties:
- **Height** - Form height in pixels
- **Width** - Form width in pixels
- **Top** - Vertical position (usually 0 for AutoCenter forms)
- **Left** - Horizontal position (usually 0 for AutoCenter forms)
- **AutoCenter** - Automatically center form on screen
- **Caption** - Form title text
- **WindowType** - 0=Normal, 1=Modal, 2=Read
- **MaxButton** - Show maximize button
- **MinButton** - Show minimize button
- **Closable** - Allow form to be closed

### Control Properties

Controls have the following layout properties:
- **Top** - Vertical position relative to form
- **Left** - Horizontal position relative to form
- **Height** - Control height in pixels
- **Width** - Control width in pixels
- **TabIndex** - Tab order sequence
- **Enabled** - Control enabled state
- **Visible** - Control visible state
- **ControlSource** - Data binding field
- **Caption** - Display text (labels, buttons)
- **Format** - Input format (e.g., "K" for keyboard entry)

## Common Form Layouts

### Master Data Forms

#### iitem (Input Item Detail)

**Form Properties:**
- Height: 477
- Width: 637
- AutoCenter: .T.
- Caption: "Input Item Detail"
- WindowType: 0 (Normal)

**Structure:**
- Formset: `fmsmall2`
- Pageframe: `Pageframe1` (2 pages)
  - Page1: "Input Data" (Input tab)
  - Page2: "Multi Search" (Search tab)
- Navigation: `Picbtns1` (Top, End, Prev, Next, Add, Edit, Delete, Exit)

**Key Controls:**
- Item Number field
- Description fields
- Price, Cost fields
- Measurement fields (Weight, Cube, Net)
- Grid for item list

#### icustom (Input Customer)

**Form Properties:**
- Similar structure to iitem
- Customer-specific fields
- Address fields
- Payment terms

#### ivendor (Input Vendor)

**Form Properties:**
- Similar structure to iitem
- Vendor-specific fields
- Maker information

### Order Enquiry Forms

#### ioe1@ (Input OE)

**Form Properties:**
- Height: ~600
- Width: ~900
- AutoCenter: .T.
- Caption: "Input Order Enquiry"

**Key Controls:**
- OE Number field
- Customer selection
- Date fields
- Grid: OE items (wioegrid)
- Grid: Quantity breakdown (wqtybrkgrid)
- Buttons: Add Item, Edit Item, Delete Item, Save, Cancel

### Order Confirmation Forms

#### iordhd (Input Order Confirmation)

**Form Properties:**
- Formset: `Formset1`
- Form1: OC header entry
- Form2: OC detail entry (iorddt1, iorddt2)

**Key Controls:**
- OC Number field
- Customer selection
- Date fields
- Grid: OC items

### Contract Forms

#### iconthd_2018 (Edit Contract 2018 fast)

**Form Properties:**
- Height: 479
- Width: 753
- AutoCenter: .T.
- Caption: "Edit Contract 2018 fast"
- Closable: .F.
- MaxButton: .F.
- MinButton: .F.
- WindowType: 1 (Modal)

**Key Controls:**
- Txtbox1: Contract Number
- Txtbox6: OC Number (conf_no)
- Txtbox7: Request Date From (req_date_f)
- Txtbox8: Request Date To (req_date_t)
- Txtbox2: Vendor Number
- Txtbox3: Vendor Name (display)
- Grid: Contract items

### Invoice Forms

#### iinvdt2@ (Input Invoice Detail New)

**Form Properties:**
- Formset: `Formset2`
- Form1: Container selection and item grid
  - Height: 440
  - Width: 788
  - Caption: "Input Invoice Detail (By Container No. )"
  - Closable: .F.
  - FontName: "Courier"
- Form2: Item detail entry form

**Form1 Key Controls:**
- Txtbox1: Invoice Number (display)
- Txtbox2: Customer Number (display)
- Txtbox3: Customer Name (display)
- Txtbox4: Invoice Date From
- Txtbox5: Invoice Date To
- Txtbox6: Container Number
- Combofield1: Container selection dropdown
- Grid1: Invoice items grid (winvdtgrid)
- Grid2: Available items grid (vinvdt)
- Command1: Select All button
- Command3: Reset button
- Command4: Item Mftr button
- OptionGroup1: Filter option (Head items only / All items)

**Form2 Key Controls:**
- Txtbox1: Invoice Number
- Txtbox4: Carton (ctn)
- Txtbox5: Quantity (qty)
- Txtbox6: Price
- Txtbox7: Amount (calculated)
- Edboxdesp3: Description memo
- Command1: Save button
- Command2: Cancel button

### Delivery Note Forms

#### idn (Input D/N)

**Form Properties:**
- Height: 491
- Width: 983
- AutoCenter: .T.
- Caption: "Input D/N"
- MaxButton: .F.
- BufferMode: 2

**Key Controls:**
- cboCustCode: Customer selection
- cboPort: Port selection
- txtFromDate: From Date
- txtToDate: To Date
- grdSelDn: DN selection grid
- grdCont: Container grid
- grdOc_no: OC number grid

## Common Control Patterns

### Textbox Controls

**Common Properties:**
- Height: 24 (standard)
- Format: "K" (keyboard entry), "!K" (uppercase keyboard)
- ControlSource: Bound to data field
- Enabled: .T. or .F. (read-only)
- TabIndex: Sequential tab order

**Example:**
```
Txtbox1
  ControlSource = "mconthd.cont_no"
  Format = "!K"
  Height = 24
  Left = 105
  TabIndex = 1
  Top = 14
  Width = 119
```

### Grid Controls

**Common Properties:**
- ColumnCount: Number of columns
- RecordSource: Data source cursor/table
- ScrollBars: 3 (both), 2 (vertical), 1 (horizontal), 0 (none)
- DeleteMark: .F. (hide delete column)
- ReadOnly: .T. or .F.

**Example:**
```
Grid1
  ColumnCount = 9
  DeleteMark = .F.
  Height = 289
  Left = 300
  Panel = 1
  ReadOnly = .T.
  RecordSource = "vinvdt"
  ScrollBars = 3
  TabIndex = 15
  Top = 132
  Width = 474
```

### Combobox Controls

**Common Properties:**
- RowSourceType: 3 (SQL Statement)
- RowSource: SQL SELECT statement
- ColumnCount: Number of display columns
- Height: 24 (standard)

**Example:**
```
Combofield1
  FontName = "Courier"
  ColumnCount = 2
  RowSourceType = 3
  RowSource = "SELECT cntr_no, ref_no FROM temp..."
  Height = 24
  Left = 207
  TabIndex = 10
  Top = 101
  Width = 21
```

### Command Buttons

**Common Properties:**
- Height: 19-25 (standard)
- Width: 50-100 (varies)
- Caption: Button text
- TabIndex: Sequential
- Cancel: .T. (for Exit buttons)

**Example:**
```
Command1
  Top = 144
  Left = 25
  Height = 19
  Width = 50
  Caption = "Select All"
  TabIndex = 5
```

### Date Controls

**Common Properties:**
- Format: "K" (keyboard entry)
- ControlSource: Date field
- Height: 24 (standard)
- DisabledForeColor: 0,0,255 (blue for disabled)

**Example:**
```
Txtbox7 (Date From)
  ControlSource = "mconthd.req_date_f"
  Format = "K"
  Height = 24
  Left = 344
  TabIndex = 4
  Top = 36
  Width = 80
  DisabledForeColor = 0,0,255
```

## Layout Patterns

### Single Form Layout

- Header section: Top of form (labels, key fields)
- Data entry section: Middle (textboxes, comboboxes)
- Grid section: Bottom (data display)
- Button bar: Bottom (Save, Cancel, etc.)

### Formset Layout

- Form1: Main data entry form
- Form2: Detail entry form (modal)
- Shared data environment
- Common methods

### Pageframe Layout

- Page1: Input/Entry tab
- Page2: Search/Enquiry tab
- Common navigation buttons
- Shared data source

## Color Schemes

### Standard Colors

- **BackColor**: 192,192,192 (light gray) for forms
- **ForeColor**: 0,0,0 (black) for text
- **DisabledForeColor**: 0,0,255 (blue) for disabled fields
- **Grid BackColor**: 255,255,255 (white)
- **Selected Row**: rgb(213,213,255) (light blue)

### Dynamic Colors

Grid rows use dynamic back color:
```foxpro
DynamicBackColor = 'iif(winvdtgrid.select = .t., ;
    rgb(213,213,255), rgb(255,255,255))'
```

## Font Properties

### Standard Fonts

- **FontName**: "Courier" (monospace) for data entry
- **FontName**: "Arial" (default) for labels
- **FontSize**: 9-14 (varies by control)
- **FontBold**: .T. for headers, important fields

## Summary

Form layouts follow consistent patterns:
- **Standard heights**: 24px for textboxes, 19-25px for buttons
- **Grid layouts**: Full-width, scrollable, multi-column
- **Tab order**: Sequential TabIndex values
- **Color coding**: Blue for disabled, light blue for selected
- **Font consistency**: Courier for data, Arial for labels
- **Button placement**: Bottom of form, right-aligned
- **Modal forms**: WindowType = 1, Closable = .F.

These patterns ensure consistent user experience across all forms in the system.
