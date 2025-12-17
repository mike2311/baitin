# Shipping Process

## Overview

Shipping Orders (SO) are created to coordinate the shipping of confirmed orders. They link contracts and OCs to actual shipments and support customizable formats per customer.

## SO Creation Rules

### Source Documents

**Primary Sources:**
1. Order Confirmation (OC) - `mordhd.conf_no`
2. Contract - `mconthd.cont_no`

### Creation Process

**Form:** `isetso` (Input Shipping Order)

### SO Creation Detailed Flow

```mermaid
flowchart TD
    Start([SO Creation Start]) --> UserSelectSource[User Selects Source Document<br/>OC conf_no OR<br/>Contract cont_no]
    UserSelectSource --> CheckSourceType{Source<br/>Type?}
    
    CheckSourceType -->|OC| SelectOCItems[SELECT FROM morddt<br/>WHERE conf_no = selected OC<br/>Retrieve OC items]
    CheckSourceType -->|Contract| SelectContractItems[SELECT FROM mcontdt<br/>WHERE cont_no = selected Contract<br/>Retrieve Contract items]
    
    SelectOCItems --> DisplayItems[Display Items in Form<br/>User can select items<br/>to include in SO]
    SelectContractItems --> DisplayItems
    
    DisplayItems --> UserAssignItems[User Assigns Items<br/>Select quantities<br/>Set ship dates<br/>Assign to shipments]
    
    UserAssignItems --> UserConfirm{User<br/>Confirms<br/>Creation?}
    UserConfirm -->|Cancel| EndCancel[Cancel SO Creation]
    UserConfirm -->|Yes| GenerateSONo[Generate SO Number<br/>so_no<br/>Sequential or from OC/Contract]
    
    GenerateSONo --> ItemLoop{For Each<br/>Selected Item}
    ItemLoop -->|No More| SetShipMark
    ItemLoop -->|Yes| CreateSORecord[APPEND BLANK to mso<br/>Create SO record]
    
    CreateSORecord --> SetSOFields[REPLACE mso.so_no = so_no<br/>REPLACE mso.conf_no = conf_no<br/>if from OC<br/>REPLACE mso.cont_no = cont_no<br/>if from Contract]
    
    SetSOFields --> SetItemFields[REPLACE mso.item_no = item_no<br/>REPLACE mso.qty = selected qty<br/>REPLACE mso.ship_date = ship_date<br/>REPLACE mso.oc_no = oc_no<br/>if applicable]
    
    SetItemFields --> GetShipMark[Retrieve Ship Mark<br/>SELECT mcustom<br/>LOCATE FOR cust_no<br/>Get shipmark memo field]
    GetShipMark --> SetShipMarkFields[REPLACE mso.shipmark<br/>= customer shipmark<br/>or custom shipmark]
    
    SetShipMarkFields --> SetFOBTerms[REPLACE mso.fob_port<br/>= contract fob_port<br/>or default FOB port]
    SetFOBTerms --> SetOtherFields[REPLACE other SO fields<br/>ship_to, loading_port<br/>dest, remarks]
    SetOtherFields --> NextItem[Next Item<br/>Continue Loop]
    NextItem --> ItemLoop
    
    SetShipMark[Apply Ship Mark<br/>from Customer] --> GetCustomerInfo[SELECT mcustom<br/>Get customer shipmark<br/>from memo field]
    GetCustomerInfo --> ApplyShipMark[REPLACE SO records<br/>with ship mark<br/>from mcustom.shipmark]
    ApplyShipMark --> Complete[SO Creation Complete]
    EndCancel --> End
    Complete --> End([Process Complete])
```

**Code Reference:** Form `isetso` - Shipping Order creation logic

### SO Table Structure

**Table:** `mso` (Shipping Order)

**Key Fields:**
- `so_no` - Shipping Order number (Primary Key)
- `conf_no` - Order Confirmation number (links to mordhd)
- `cont_no` - Contract number (links to mconthd)
- `item_no` - Item number (links to mitem)
- `qty` - Shipping quantity
- `ship_date` - Shipping date
- Other shipping-specific fields

**File Size:** 279MB (largest transaction table)

## Format-Based SO Generation

### Customizable Formats

**Table:** `zsoformat` (Shipping Order Format)

**Purpose:** Store customer-specific SO format definitions

**Fields:**
- `so_key` - Format key (e.g., "GLOBE")
- `uniqueid` - Unique identifier for format element
- `vpos` - Vertical position
- `hpos` - Horizontal position
- `height` - Height
- `width` - Width

**Code Reference:** `pso.prg` (lines 4-7)

### Format Application

### SO Format Application Detailed Flow

```mermaid
flowchart TD
    Start([SO Format Application]) --> SelectSO[Select SO Number<br/>w_so_no]
    SelectSO --> GetSOData[SELECT FROM mso<br/>WHERE so_no = w_so_no<br/>Get SO records]
    
    GetSOData --> GetCustomer[Get Customer Number<br/>w_cust_no from SO<br/>or linked OC/Contract]
    GetCustomer --> LookupFormatKey[SELECT mcustom<br/>LOCATE FOR cust_no<br/>Get so_format_key<br/>or default format key]
    
    LookupFormatKey --> CheckFormatKey{Format Key<br/>Exists?}
    CheckFormatKey -->|No| UseDefaultFormat[Use Default Format<br/>Standard SO layout]
    CheckFormatKey -->|Yes| SelectFormat[SELECT FROM zsoformat<br/>WHERE so_key = format_key<br/>ORDER BY vpos, hpos<br/>Get format definition]
    
    SelectFormat --> CheckFormatFound{Format<br/>Definition<br/>Found?}
    CheckFormatFound -->|No| UseDefaultFormat
    CheckFormatFound -->|Yes| InitFormatArray[Initialize Format Array<br/>Store format elements<br/>vpos, hpos, height, width<br/>uniqueid]
    
    UseDefaultFormat --> GenerateReport
    InitFormatArray --> LoadReportTemplate[Load SO Report Template<br/>pso.frx or pso2.frx]
    LoadReportTemplate --> ApplyFormatElements{For Each<br/>Format Element<br/>in zsoformat}
    
    ApplyFormatElements -->|More| GetFormatElement[Get Format Element<br/>uniqueid, vpos, hpos<br/>height, width]
    GetFormatElement --> PositionElement[Position Report Element<br/>at vpos, hpos<br/>with height, width]
    PositionElement --> ApplyFormatElements
    
    ApplyFormatElements -->|No More| MapDataFields[Map SO Data to<br/>Format Elements<br/>Based on uniqueid]
    
    MapDataFields --> GenerateReport[Generate Formatted SO Report<br/>Apply format layout<br/>Fill with SO data]
    GenerateReport --> OutputReport{Output<br/>Format?}
    
    OutputReport -->|Print| SendToPrinter[Send to Printer]
    OutputReport -->|Preview| ShowPreview[Display Preview]
    OutputReport -->|PDF| GeneratePDF[Generate PDF File]
    OutputReport -->|Excel| ExportExcel[Export to Excel]
    
    SendToPrinter --> End
    ShowPreview --> End
    GeneratePDF --> End
    ExportExcel --> End
    End([Format Application Complete])
```

**Code Reference:** `source/pso.prg` (lines 1-29)

### Format Configuration

**Form:** `isoformat` or `isoformat2` (Input Shipping Order Format)

**Process:**
1. User selects customer
2. User defines format layout
3. System saves format to `zsoformat`
4. Format used for future SOs

## Ship Mark Handling

### Ship Mark Source

**Table:** `mshipmark` (Shipping Mark)

**Customer Field:** `mcustom.shipmark` (memo field)

**Construction:** From multiple memo fields (M11-M26) in legacy system

**Code Reference:** `xcustom.prg` (lines 45-50)

### Ship Mark Usage

**Process:**
1. Retrieve customer's ship mark from `mcustom.shipmark`
2. Apply to SO document
3. Include in shipping labels
4. Print on shipping documents

## FOB Terms

### FOB Port

**Table:** `zfobport` (FOB Port)

**Purpose:** Define FOB (Free On Board) ports

**Usage:**
- Specified in contracts
- Used in SO generation
- Printed on shipping documents

### FOB Terms

**Table:** `zfobterm` (FOB Terms)

**Purpose:** Define FOB terms (e.g., FOB Hong Kong, FOB Shanghai)

**Usage:**
- Contract terms
- SO terms
- Shipping documentation

## SO Printing

### SO Report

**Form:** `pso` (Print Shipping Order)

**Process:**
1. Select SO number
2. Apply customer format (if custom)
3. Generate formatted SO document
4. Print or save as PDF

**Code Reference:** `pso.prg`

### Format Application

**Process:**
1. Load format from `zsoformat`
2. Apply format to report template
3. Generate formatted output

## SO to Invoice Link

### Relationship

**SO → Invoice:**
- `minvdt.so_no` links to `mso.so_no`
- Invoices created from SO
- SO quantities used for invoicing

## SO Status

### Status Values

**Created:** SO created, not yet shipped
**Shipped:** Items shipped
**Invoiced:** Invoice created from SO

### Status Transitions

```
Created → Shipped → Invoiced
```

## Summary

The Shipping Order process coordinates the physical shipment of goods. It supports customizable formats per customer, handles ship marks and FOB terms, and links contracts to actual shipments. SOs serve as the basis for invoice generation.



