# Core Algorithms

## Overview

This document describes reusable core algorithms used throughout the system for BOM calculations, quantity breakdowns, and other common business logic operations.

## BOM Calculation Algorithm

### Purpose

Calculate sub-item quantities for Bill of Materials (BOM) items. This algorithm is reused in multiple processes:
- OE to OC posting
- OC to Contract generation
- Contract updates
- OC updates

### Algorithm Flow

```mermaid
flowchart TD
    Start([BOM Calculation Start]) --> GetHeadItem[Get Head Item<br/>w_head_item = parent item_no<br/>w_head_qty = parent qty]
    GetHeadItem --> CalcTotalBOM[SELECT SUM qty as total_qty<br/>FROM mprodbom<br/>WHERE item_no == w_head_item<br/>INTO CURSOR sum_qty]
    
    CalcTotalBOM --> CheckHasBOM{sum_qty.total_qty<br/>> 0?}
    CheckHasBOM -->|No| NoBOM[No BOM Processing<br/>Return]
    CheckHasBOM -->|Yes| SkipToSubItems[SKIP to next record<br/>Go to first sub-item]
    
    SkipToSubItems --> SubItemLoop{Current record<br/>head == .F.?}
    
    SubItemLoop -->|No| EndBOMCalc[End BOM Calculation]
    SubItemLoop -->|Yes| LocateBOMRecord[SELECT mprodbom<br/>LOCATE FOR<br/>item_no == w_head_item<br/>AND sub_item == current item_no]
    
    LocateBOMRecord --> CheckFound{Found<br/>in mprodbom?}
    CheckFound -->|No| SkipSubItem[SKIP to next record<br/>Continue Loop]
    CheckFound -->|Yes| CalcSubQty[Calculate Sub-item Quantity<br/>sub_qty = w_head_qty *<br/>mprodbom.qty / sum_qty.total_qty]
    
    CalcSubQty --> ReplaceSubQty[REPLACE current record.qty<br/>= calculated sub_qty<br/>REPLACE for:<br/>- morddt.qty OR<br/>- mcontdt.qty OR<br/>- Other detail table]
    
    ReplaceSubQty --> SkipNext[SKIP to next record<br/>Continue Loop]
    SkipNext --> SubItemLoop
    SkipSubItem --> SubItemLoop
    
    NoBOM --> EndBOMCalc
    EndBOMCalc --> End([Algorithm Complete])
```

### Formula

```
sub_item_qty = (head_qty * bom_qty) / total_bom_qty
```

Where:
- `head_qty` = Quantity of parent/head item
- `bom_qty` = Quantity of sub-item per parent from `mprodbom.qty`
- `total_bom_qty` = Sum of all `mprodbom.qty` for the parent item

### Usage Contexts

1. **OE to OC Posting** (`uordcont.prg` lines 40-56)
   - Applied to `morddt` records
   - Processes sub-items after head item is copied

2. **OC to Contract** (`uordcont.prg` lines 63-79)
   - Applied to `mcontdt` records
   - Uses same logic with contract detail table

3. **Contract Updates** (`uordcont.prg`)
   - Recalculates BOM quantities when contract items updated

**Code Reference:** `source/uordcont.prg` (procedures `update_morddt`, `update_mcontdt`)

## Quantity Breakdown Algorithm

### Purpose

Process quantity breakdowns by size, color, style, or port. Used in:
- OE Excel import
- Manual quantity breakdown entry
- Port-based quantity allocation

### Algorithm Flow

```mermaid
flowchart TD
    Start([Quantity Breakdown Start]) --> DetectBreakdownField[Detect Breakdown Field<br/>PORT CODE, SIZE, COLOR, etc.<br/>Store field position]
    DetectBreakdownField --> GroupByItem[GROUP items by<br/>OE number and Item number<br/>INTO CURSOR vtempoe]
    
    GroupByItem --> ItemLoop{For Each<br/>Item Group}
    ItemLoop -->|No More| EndQtyBrk
    ItemLoop -->|Yes| GetItemCode[Get item_code<br/>from grouped items]
    
    GetItemCode --> CountBreakdowns[COUNT breakdown rows<br/>for this item<br/>FROM woexlst or source table]
    CountBreakdowns --> CheckMultipleBreakdowns{Count<br/>> 1?}
    
    CheckMultipleBreakdowns -->|No| SkipItem[Skip Item<br/>No breakdown needed]
    CheckMultipleBreakdowns -->|Yes| SelectBreakdownRows[SELECT breakdown rows<br/>FROM source table<br/>WHERE oe_no = w_oe_no<br/>AND item_no = item_code<br/>INTO CURSOR temp]
    
    SelectBreakdownRows --> BreakdownLoop{More Breakdown<br/>Rows?}
    BreakdownLoop -->|No| SkipItem
    BreakdownLoop -->|Yes| CheckBreakdownEmpty{Breakdown Field<br/>Empty?}
    
    CheckBreakdownEmpty -->|Yes| SkipRow[SKIP row<br/>Continue Loop]
    CheckBreakdownEmpty -->|No| CreateBreakdownRecord[APPEND BLANK to mqtybrk<br/>Create breakdown record]
    
    CreateBreakdownRecord --> SetBreakdownFields[REPLACE mqtybrk.oe_no<br/>= w_oe_prefix + w_oe_no<br/>REPLACE mqtybrk.item_no = item_code<br/>REPLACE mqtybrk.port = port_code<br/>or size/color code]
    
    SetBreakdownFields --> SetBreakdownQty{Breakdown Type?}
    SetBreakdownQty -->|Port Qty Column| SetPortQty[REPLACE mqtybrk.qty<br/>= NUMVAL port_qty_field]
    SetBreakdownQty -->|Port Code Column| CalcQtyFromPort[Check if inner > 0<br/>REPLACE mqtybrk.qty<br/>= port_code * master<br/>if inner > 0]
    
    SetPortQty --> SetOtherFields
    CalcQtyFromPort --> SetOtherFields[REPLACE mqtybrk.po_no<br/>REPLACE mqtybrk.del_from<br/>REPLACE mqtybrk.del_to<br/>REPLACE user_id, mod_date, mod_time]
    
    SetOtherFields --> SkipRow
    SkipRow --> BreakdownLoop
    
    SkipItem --> ItemLoop
    EndQtyBrk[End Quantity Breakdown] --> End([Algorithm Complete])
```

### Usage Contexts

1. **Excel Import** (`uoexls_2013.prg`, procedure `update_mqtybrk`)
   - Processes PORT CODE based breakdowns
   - Creates `mqtybrk` records from Excel data

2. **Port-based Breakdown** (`uoexls_2013.prg`, procedure `process_qty_breakdown`)
   - Processes PORT columns from Excel
   - Handles Q-column (quantity) vs code-based breakdowns

3. **Manual Entry** (Form `iqtybrk2`)
   - User enters breakdowns manually
   - Validates totals match item quantity

**Code Reference:** `source/uoexls_2013.prg` (procedures `update_mqtybrk`, `process_qty_breakdown`)

## Report Generation Flow

### Purpose

Generic pattern for report generation used across all report types in the system.

### Algorithm Flow

```mermaid
flowchart TD
    Start([Report Generation Start]) --> UserSelect[User Selects Report<br/>Parameters Date Range, Customer, etc.]
    UserSelect --> ValidateParams{Validate<br/>Parameters}
    
    ValidateParams -->|Invalid| ShowError[Show Error Message<br/>Return to Selection]
    ValidateParams -->|Valid| BuildQuery[Build Query<br/>SELECT FROM source tables<br/>Apply filters WHERE conditions]
    
    BuildQuery --> ExecuteQuery[Execute Query<br/>INTO CURSOR temp_result<br/>or INTO TABLE result_table]
    ExecuteQuery --> CheckResults{Results<br/>Found?}
    
    CheckResults -->|No| ShowNoData[Show No Data Message<br/>End Report]
    CheckResults -->|Yes| FormatData[Format Data<br/>Calculate totals, subtotals<br/>Group by categories]
    
    FormatData --> PrepareReport[Prepare Report Data<br/>Set report variables<br/>Set page breaks]
    PrepareReport --> GenerateReport[DO FORM report_name<br/>or REPORT FORM report_name<br/>Generate report output]
    
    GenerateReport --> OutputFormat{Output<br/>Format?}
    OutputFormat -->|Print| SendToPrinter[Send to Printer]
    OutputFormat -->|Preview| ShowPreview[Display Preview]
    OutputFormat -->|Excel| ExportExcel[Export to Excel<br/>Generate XLS file]
    OutputFormat -->|PDF| ExportPDF[Generate PDF<br/>Save or Email]
    
    SendToPrinter --> EndReport
    ShowPreview --> EndReport
    ExportExcel --> EndReport
    ExportPDF --> EndReport
    ShowNoData --> EndReport
    ShowError --> EndReport
    
    EndReport[End Report Generation] --> End([Process Complete])
```

### Usage Pattern

This pattern is used in:
- Order Enquiry reports
- Order Confirmation reports
- Contract reports
- Invoice reports
- Shipping Order reports
- Analysis and summary reports

**Code Reference:** Multiple report forms (.frx files) and report generation programs





