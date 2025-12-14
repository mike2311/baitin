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

### Invoice Creation from SO/DN Detailed Flow

```mermaid
flowchart TD
    Start([Invoice Creation Start]) --> UserSelectSource[User Selects Source Document<br/>SO so_no OR<br/>DN dn_no]
    UserSelectSource --> CheckSourceType{Source<br/>Type?}
    
    CheckSourceType -->|SO| SelectSOItems[SELECT FROM mso<br/>WHERE so_no = selected SO<br/>Retrieve SO items<br/>Get quantities, item_no]
    CheckSourceType -->|DN| SelectDNItems[SELECT FROM mdndt<br/>WHERE dn_no = selected DN<br/>Retrieve DN items<br/>Get quantities, item_no]
    
    SelectSOItems --> GetCustomerInfo[Get Customer Information<br/>FROM mcustom<br/>WHERE cust_no = SO/DN customer<br/>Get customer details]
    SelectDNItems --> GetCustomerInfo
    
    GetCustomerInfo --> DisplayItems[Display Items in Form<br/>Show quantities<br/>Show prices from source<br/>User can adjust]
    
    DisplayItems --> UserEnterDetails[User Enters Invoice Details<br/>Invoice Date<br/>Delivery Date<br/>Shipment Info<br/>Loading Port<br/>Destination]
    
    UserEnterDetails --> UserConfirm{User<br/>Confirms<br/>Creation?}
    UserConfirm -->|Cancel| EndCancel[Cancel Invoice Creation]
    UserConfirm -->|Yes| GenerateInvNo[Generate Invoice Number<br/>inv_no<br/>Sequential or custom format]
    
    GenerateInvNo --> CreateInvHeader[APPEND BLANK to minvhd<br/>Create Invoice Header]
    
    CreateInvHeader --> SetInvHeaderFields[REPLACE minvhd.inv_no = inv_no<br/>REPLACE minvhd.cust_no = cust_no<br/>REPLACE minvhd.date = invoice date<br/>REPLACE minvhd.del_date = delivery date]
    
    SetInvHeaderFields --> SetInvHeaderSource[REPLACE minvhd.oc_no = oc_no<br/>if from OC<br/>REPLACE minvhd.ship = ship info<br/>REPLACE minvhd.loading = loading port<br/>REPLACE minvhd.dest = destination]
    
    SetInvHeaderSource --> SetInvHeaderAddr[REPLACE minvhd.cust_name<br/>= customer name<br/>REPLACE minvhd.addr_1-4<br/>= customer address]
    
    SetInvHeaderAddr --> ItemLoop{For Each<br/>Item from Source}
    
    ItemLoop -->|No More| Complete
    ItemLoop -->|Yes| CreateInvDetail[APPEND BLANK to minvdt<br/>Create Invoice Detail Record]
    
    CreateInvDetail --> SetInvDetailFields[REPLACE minvdt.inv_no = inv_no<br/>REPLACE minvdt.item_no = item_no<br/>REPLACE minvdt.qty = qty<br/>REPLACE minvdt.price = price]
    
    SetInvDetailFields --> SetInvDetailSource[REPLACE minvdt.so_no = so_no<br/>if from SO<br/>REPLACE minvdt.oc_no = oc_no<br/>REPLACE minvdt.conf_no = conf_no]
    
    SetInvDetailSource --> GetItemDesc[SELECT FROM mitem<br/>LOCATE FOR item_no<br/>Get item description<br/>Get packing info]
    
    GetItemDesc --> SetItemInfo[REPLACE minvdt.desp_memo<br/>= item description memo<br/>REPLACE minvdt.ctn = carton qty<br/>REPLACE minvdt.qctn = qty per carton]
    
    SetItemInfo --> CalcWeights[Calculate Net Weight<br/>Calculate Gross Weight<br/>Calculate Cube/Dimensions<br/>REPLACE minvdt.net, wt, cube, dim]
    
    CalcWeights --> NextItem[Next Item<br/>Continue Loop]
    NextItem --> ItemLoop
    
    Complete[Invoice Creation Complete] --> EndCancel
    EndCancel --> End([Process Complete])
```

**Code Reference:** Form `iinvhd@` - Invoice creation logic

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

### Packing List Generation Detailed Flow

```mermaid
flowchart TD
    Start([Packing List Generation]) --> SelectInvoice[User Selects Invoice Number<br/>w_inv_no]
    SelectInvoice --> SelectInvHeader[SELECT FROM minvhd<br/>WHERE inv_no = w_inv_no<br/>INTO CURSOR minvhd_cursor<br/>Get invoice header info]
    
    SelectInvHeader --> SelectInvDetail[SELECT FROM minvdt<br/>WHERE inv_no = w_inv_no<br/>AND !EMPTY item_no<br/>INTO CURSOR minvdt_cursor<br/>Get invoice detail items]
    
    SelectInvDetail --> ExtractDespMemo[Extract Description Memo<br/>ALLTRIM MLINE minvdt.desp_memo,1,1<br/>Get first line of memo]
    ExtractDespMemo --> JoinHeaderDetail[INNER JOIN minvhd_cursor<br/>with minvdt_cursor<br/>ON inv_no<br/>INTO CURSOR join_cursor]
    
    JoinHeaderDetail --> JoinCustomer[LEFT OUTER JOIN mcustom<br/>ON cust_no = cust_no<br/>Get customer weight unit<br/>wt_unit field]
    
    JoinCustomer --> CheckWeightUnit{Check mcustom<br/>wt_unit<br/>== 2?}
    CheckWeightUnit -->|Yes| ConvertWeight[Convert Weight to LBS<br/>net = net / 2.2<br/>wt = wt / 2.2]
    CheckWeightUnit -->|No| KeepWeight[Keep Weight as is<br/>net = net<br/>wt = wt]
    
    ConvertWeight --> CreateTempTable
    KeepWeight --> CreateTempTable[SELECT INTO TABLE<br/>temp_packlist_table<br/>Include all fields from join<br/>with converted weights]
    
    CreateTempTable --> AppendToResult[SELECT wpacklist<br/>ZAP if exists<br/>APPEND FROM temp_packlist_table]
    AppendToResult --> Cleanup[USE temp tables<br/>DELETE FILE temp_packlist_table.*<br/>Close cursors]
    Cleanup --> GenerateReport[Generate Packing List Report<br/>Display or Print]
    GenerateReport --> End([Packing List Complete])
```

**Code Reference:** `source/uwpacklist.prg` (packing list generation logic)

### Packing List Logic

**Carton Breakdown:**
- Items grouped by carton number
- Quantities per carton
- Total cartons calculated
- Carton dimensions and weight
- Weight unit conversion (kg to lbs if wt_unit = 2)

### Packing List Formats

**Standard Format:** `ppacklist_new`
**Spencer Format:** `ppacklist_xls_spencer`
**Excel Format:** `ppacklist_xls`

## Multi-Page Invoice Logic

### Page Management

**Function:** `Pinv()` in `pinv.prg`

**Purpose:** Manage multi-page invoices with page arrays

### Multi-Page Invoice Logic Detailed Flow

```mermaid
flowchart TD
    Start([Multi-Page Invoice Start]) --> CheckFunctionType{Function Type<br/>cType?}
    
    CheckFunctionType -->|PA| InitializePageArray[cType == PA<br/>Initialize Page Array]
    CheckFunctionType -->|CP| CheckPageNumber[cType == CP<br/>Check/Set Page Number]
    CheckFunctionType -->|CT| ReplaceCarton[cType == CT<br/>Replace Carton Number]
    
    InitializePageArray --> SetPageCount[pa_cnt = input<br/>if pa_cnt = 0, set to 1]
    SetPageCount --> DimArray[DIMENSION Page_array pa_cnt,2<br/>Create 2D array]
    DimArray --> InitializeArray[DO WHILE narray_cnt > 0<br/>page_array narray_cnt,1 = empty<br/>page_array narray_cnt,2 = 0<br/>narray_cnt = narray_cnt - 1]
    InitializeArray --> ReturnInit[cOutPut = space<br/>Return]
    
    CheckPageNumber --> SetSearchVars[nloop_cnt = 1<br/>lfound_flag = .F.]
    SetSearchVars --> SearchLoop{Search Page Array<br/>nloop_cnt <= pa_cnt?}
    
    SearchLoop -->|More| CheckPageID{page_array nloop_cnt,1<br/>== ALLTRIM x<br/>page identifier?}
    CheckPageID -->|Yes| SetFound[lfound_flag = .T.<br/>EXIT loop]
    CheckPageID -->|No| IncrLoop[nloop_cnt = nloop_cnt + 1]
    IncrLoop --> SearchLoop
    
    SetFound --> CheckFound{Page ID<br/>Found?}
    SearchLoop -->|No More| CheckFound
    
    CheckFound -->|Yes| ComparePage{input page number<br/>< page_array nloop_cnt,2<br/>max page?}
    ComparePage -->|Yes| UpdateMaxPage[page_array nloop_cnt,2<br/>= input<br/>Update max page]
    ComparePage -->|No| UseMaxPage[input = page_array nloop_cnt,2<br/>Use existing max]
    
    CheckFound -->|No| FindEmptySlot[nloop_cnt = nloop_cnt - 1<br/>Search backwards for empty slot]
    FindEmptySlot --> BackwardLoop{nloop_cnt > 0?}
    
    BackwardLoop -->|Yes| CheckSlotEmpty{!EMPTY<br/>page_array nloop_cnt,1?}
    CheckSlotEmpty -->|Yes| SetNextSlot[page_array nloop_cnt + 1,1<br/>= ALLTRIM x<br/>page_array nloop_cnt + 1,2 = input<br/>EXIT]
    CheckSlotEmpty -->|No| CheckFirstSlot{nloop_cnt<br/>== 1?}
    CheckFirstSlot -->|Yes| SetFirstSlot[page_array 1,1 = ALLTRIM x<br/>page_array 1,2 = input<br/>EXIT]
    CheckFirstSlot -->|No| DecrLoop[nloop_cnt = nloop_cnt - 1]
    DecrLoop --> BackwardLoop
    BackwardLoop -->|No| ReturnPage
    
    UpdateMaxPage --> ReturnPage[cOutPut = input<br/>Return page number]
    UseMaxPage --> ReturnPage
    SetNextSlot --> ReturnPage
    SetFirstSlot --> ReturnPage
    
    ReplaceCarton --> SetCartonVar[w_carton = ALLTRIM STR x<br/>w_str = input text]
    SetCartonVar --> InitCounter[i = 1<br/>Start character loop]
    InitCounter --> CharLoop{i <= LEN w_str?}
    
    CharLoop -->|Yes| GetChar[w_cut = SUBSTR w_str, i, 1<br/>Get current character]
    GetChar --> CheckExclamation{w_cut<br/>== !?}
    CheckExclamation -->|Yes| ExtractParts[w_char1 = SUBSTR w_str, 1, i-1<br/>w_char = changechar SUBSTR w_str, i, 2<br/>w_char2 = SUBSTR w_str, i+2]
    ExtractParts --> ReplaceStr[w_str = w_char1 + w_char + w_char2<br/>i = i + LEN w_char - 1]
    ReplaceStr --> IncrCounter[i = i + 1]
    CheckExclamation -->|No| IncrCounter
    IncrCounter --> CharLoop
    CharLoop -->|No| ReturnCarton[cOutPut = w_str<br/>Return text with carton replaced]
    
    ReturnInit --> End
    ReturnPage --> End
    ReturnCarton --> End
    End([Function Complete])
```

### Page Array Structure

**Array:** `Page_array(pa_cnt, 2)`

**Fields:**
- `Page_array(n, 1)` - Page identifier (string)
- `Page_array(n, 2)` - Maximum page number (numeric)

**Usage:**
- Track which items on which page
- Calculate page breaks
- Manage page numbering
- Handle multiple items per page identifier

### Carton Replacement Function

**Function:** `changechar()` in `pinv.prg`

**Purpose:** Replace "!C" with carton number in text

```mermaid
flowchart TD
    Start([changechar Function]) --> CheckParam{cVar ==<br/>!C?}
    CheckParam -->|Yes| ReturnCarton[RETURN ALLTRIM w_carton<br/>Replace !C with carton number]
    CheckParam -->|No| ReturnError[RETURN Error<br/>Unsupported parameter]
    ReturnCarton --> End
    ReturnError --> End
    End([Return])
```

**Code Reference:** `source/pinv.prg` (lines 1-88)

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

## Invoice Printing & Export

### Invoice Printing & Export Detailed Flow

```mermaid
flowchart TD
    Start([Invoice Printing/Export Start]) --> UserSelectInvoice[User Selects Invoice<br/>inv_no<br/>to Print/Export]
    UserSelectInvoice --> UserSelectFormat{User Selects<br/>Output<br/>Format?}
    
    UserSelectFormat -->|Standard Print| StandardPrint
    UserSelectFormat -->|PDF| PDFExport
    UserSelectFormat -->|Excel| ExcelExport
    UserSelectFormat -->|Packing List| PackingList
    
    StandardPrint[Standard Invoice Print] --> LoadInvoice[SELECT FROM minvhd<br/>WHERE inv_no = inv_no<br/>Load invoice header]
    LoadInvoice --> LoadInvoiceItems[SELECT FROM minvdt<br/>WHERE inv_no = inv_no<br/>Load invoice items]
    
    LoadInvoiceItems --> InitPageArray[Initialize Page Array<br/>DO Pinv PA, page_count<br/>Setup multi-page management]
    InitPageArray --> FormatInvoice[Format Invoice Data<br/>Apply invoice template<br/>pinv@ or pinv.frx]
    
    FormatInvoice --> ApplyPageBreaks[Apply Page Breaks<br/>DO Pinv CP, page_num, identifier<br/>Manage multi-page layout]
    ApplyPageBreaks --> ReplaceCartonTags[Replace Carton Tags<br/>DO Pinv CT, text, carton_no<br/>Replace !C with carton number]
    
    ReplaceCartonTags --> GenerateReport[REPORT FORM pinv<br/>TO PRINTER<br/>or PREVIEW<br/>Generate invoice report]
    GenerateReport --> EndPrint
    
    PDFExport[PDF Export] --> LoadInvoicePDF[Load Invoice Data<br/>Same as Standard Print]
    LoadInvoicePDF --> InitPageArrayPDF[Initialize Page Array<br/>Setup multi-page]
    InitPageArrayPDF --> FormatInvoicePDF[Format Invoice Data<br/>Apply template]
    
    FormatInvoicePDF --> GeneratePDFReport[REPORT FORM pinv_pdf<br/>TO FILE invoice.pdf<br/>Generate PDF file]
    GeneratePDFReport --> SavePDF[Save PDF File<br/>to specified location<br/>or email attachment]
    SavePDF --> EndPDF
    
    ExcelExport[Excel Export] --> LoadInvoiceXLS[Load Invoice Data<br/>SELECT invoice items<br/>into cursor]
    LoadInvoiceXLS --> CreateExcelObject[Create Excel Application Object<br/>SET COMPATIBLE OFF<br/>oExcel = CREATEOBJECT Excel.Application]
    
    CreateExcelObject --> CreateWorkbook[Create New Workbook<br/>oWorkbook = oExcel.Workbooks.Add<br/>oWorksheet = oWorkbook.Worksheets 1]
    
    CreateWorkbook --> WriteHeader[Write Invoice Header<br/>Customer Name, Address<br/>Invoice Number, Date<br/>to Excel cells]
    
    WriteHeader --> WriteItems[Write Invoice Items<br/>Loop through minvdt<br/>Write item_no, description<br/>qty, price, amount<br/>to Excel rows]
    
    WriteItems --> FormatExcel[Format Excel Cells<br/>Apply formatting<br/>Currency, borders<br/>Fonts, alignment]
    
    FormatExcel --> SaveExcel[Save Excel File<br/>oWorkbook.SaveAs filename<br/>oExcel.Quit<br/>Release objects]
    SaveExcel --> EndExcel
    
    PackingList[Packing List Generation] --> LoadInvoicePL[Load Invoice Data<br/>SELECT FROM minvhd, minvdt<br/>WHERE inv_no = inv_no<br/>Join with mcustom]
    
    LoadInvoicePL --> CheckWeightUnit{Check mcustom<br/>wt_unit<br/>== 2?}
    CheckWeightUnit -->|Yes| ConvertWeights[Convert Weights to LBS<br/>net = net / 2.2<br/>wt = wt / 2.2]
    CheckWeightUnit -->|No| KeepWeights[Keep Weights as is]
    
    ConvertWeights --> GroupByCarton
    KeepWeights --> GroupByCarton[Group Items by Carton<br/>Sort by carton number<br/>Calculate totals per carton]
    
    GroupByCarton --> FormatPackingList[Format Packing List<br/>Apply packing list template<br/>ppacklist_new.frx]
    
    FormatPackingList --> PackingListOutput{Packing List<br/>Output<br/>Format?}
    
    PackingListOutput -->|Print| PrintPL[REPORT FORM ppacklist_new<br/>TO PRINTER<br/>Print packing list]
    PackingListOutput -->|Excel| ExportPLXLS[Generate Excel Packing List<br/>ppacklist_xls<br/>Export to Excel format]
    PackingListOutput -->|Spencer| ExportPLSpencer[Generate Spencer Format<br/>ppacklist_xls_spencer<br/>Spencer-specific Excel format]
    
    PrintPL --> EndPL
    ExportPLXLS --> EndPL
    ExportPLSpencer --> EndPL
    
    EndPrint[Print Complete] --> End
    EndPDF[PDF Export Complete] --> End
    EndExcel[Excel Export Complete] --> End
    EndPL[Packing List Complete] --> End
    End([Process Complete])
```

### Invoice Reports

1. **Invoice Report (New):**
   - Form: `pinv@`
   - Standard invoice format
   - Multi-page support
   - Uses Pinv() function for page management

2. **Invoice PDF:**
   - Form: `pinv_pdf`
   - PDF format for email/printing
   - Same layout as standard print

3. **Packing List:**
   - Form: `ppacklist_new`
   - Detailed packing information
   - Carton breakdown
   - Weight unit conversion

4. **Packing List Excel:**
   - Form: `ppacklist_xls`
   - Excel format for customer
   - Standard Excel format

5. **Packing List Spencer:**
   - Form: `ppacklist_xls_spencer`
   - Spencer-specific format
   - Custom Excel layout

**Code Reference:** `source/pinv.prg`, `source/uwpacklist.prg`, Report forms (.frx files)

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



