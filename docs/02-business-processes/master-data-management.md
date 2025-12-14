# Master Data Management

## Overview

Master data management covers the creation and maintenance of items, customers, vendors, and supporting reference data. This data forms the foundation for all transactions.

## Item Creation and Maintenance

### Item Entry Form

**Form:** `iitem` (Input Item)

### Item Master Data Management Detailed Flow

```mermaid
flowchart TD
    Start([Item Master Data Management]) --> UserAction{User<br/>Action?}
    
    UserAction -->|Create| CreateItem
    UserAction -->|Update| UpdateItem
    UserAction -->|BOM Setup| SetupBOM
    
    CreateItem[Create New Item] --> EnterItemNo[User Enters Item Number<br/>item_no]
    EnterItemNo --> ValidateUnique[SELECT mitem<br/>SEEK item_no<br/>Check if exists]
    
    ValidateUnique --> Duplicate{Item<br/>Already<br/>Exists?}
    Duplicate -->|Yes| ShowDuplicateError[Show Error<br/>Item Number Already Exists]
    Duplicate -->|No| EnterItemDetails[User Enters Item Details<br/>Description memo field<br/>Price, Cost<br/>Packing info pack_pc_1-4<br/>pack_desp_1-4]
    
    ShowDuplicateError --> EndCancel
    EnterItemDetails --> EnterDimensions[Enter Dimensions<br/>Weight wt<br/>Cube cube<br/>Dimensions dim]
    
    EnterDimensions --> EnterCodes[Enter Codes<br/>Origin origin<br/>HTC Code htc_no<br/>Standard Code std_code<br/>UPC Code upc_no]
    
    EnterCodes --> ValidateStdCode{Validate<br/>Standard Code<br/>in zstdcode?}
    ValidateStdCode -->|No| ShowStdCodeError[Show Error<br/>Invalid Standard Code]
    ValidateStdCode -->|Yes| ValidateOrigin{Validate<br/>Origin Code<br/>in zorigin?}
    
    ShowStdCodeError --> EndCancel
    ValidateOrigin -->|No| ShowOriginError[Show Error<br/>Invalid Origin]
    ValidateOrigin -->|Yes| CreateRecord[APPEND BLANK to mitem<br/>REPLACE all item fields]
    
    ShowOriginError --> EndCancel
    CreateRecord --> SetAuditFields[REPLACE cre_date = DATE<br/>REPLACE cre_user = sysUserId<br/>REPLACE user_id = sysUserId]
    SetAuditFields --> EndSuccess
    
    UpdateItem[Update Existing Item] --> SelectItem[User Selects Item<br/>from mitem lookup]
    SelectItem --> LoadItem[LOAD mitem record<br/>Display in form]
    LoadItem --> ModifyFields[User Modifies Fields<br/>Description, Price, etc.]
    ModifyFields --> ValidateChanges{Validate<br/>Changes<br/>std_code, origin?}
    
    ValidateChanges -->|Invalid| ShowValidationError[Show Validation Error]
    ValidateChanges -->|Valid| SaveChanges[Save Changes<br/>REPLACE fields<br/>REPLACE mod_date = DATE<br/>REPLACE mod_user = sysUserId]
    
    ShowValidationError --> EndCancel
    SaveChanges --> EndSuccess
    
    SetupBOM[Setup Item BOM] --> SelectParentItem[Select Parent Item<br/>item_no]
    SelectParentItem --> CheckBOMExists{Check mprodbom<br/>BOM exists<br/>for this item?}
    
    CheckBOMExists -->|Yes| LoadBOM[Load Existing BOM<br/>Display sub-items]
    CheckBOMExists -->|No| CreateNewBOM[Create New BOM Structure]
    
    LoadBOM --> AddSubItem[User Adds Sub-item<br/>Select from mitem]
    CreateNewBOM --> AddSubItem
    
    AddSubItem --> ValidateSubItem{Sub-item<br/>exists<br/>in mitem?}
    ValidateSubItem -->|No| ShowSubItemError[Show Error<br/>Sub-item Not Found]
    ValidateSubItem -->|Yes| EnterBOMQty[User Enters BOM Quantity<br/>qty per parent item]
    
    ShowSubItemError --> AddSubItem
    EnterBOMQty --> SaveBOMRecord[APPEND or UPDATE<br/>mprodbom record<br/>REPLACE item_no, sub_item, qty]
    
    SaveBOMRecord --> MoreSubItems{More<br/>Sub-items?}
    MoreSubItems -->|Yes| AddSubItem
    MoreSubItems -->|No| EndSuccess
    
    EndSuccess([Operation Successful]) --> End
    EndCancel([Operation Cancelled or Error]) --> End
    End([Process Complete])
```

**Code Reference:** Form `iitem` - Item entry form, Form `iprodbom` - BOM setup

### Item Import

**Form:** `uimport_item` (Import Item)

**Source:** Excel file or legacy `item.dbf`

**Process:**
1. Load source file
2. Map fields to `mitem` structure
3. Validate data
4. Import items

**Code Reference:** `xitem.prg` (legacy import from `item.dbf`)

### Item Fields

**Key Fields:**
- `item_no` - Item number (Primary Key)
- `desp` - Description (memo)
- `price` - Standard price
- `cost` - Cost
- `pack_pc_1-4` - Pack pieces (4 levels)
- `pack_desp_1-4` - Pack descriptions
- `wt` - Weight
- `cube` - Cube measurement
- `origin` - Country of origin
- `htc_no` - HTC/Harmonized Tariff Code
- `std_code` - Standard code
- `upc_no` - UPC barcode

### Item Validation

**Rules:**
- `item_no` must be unique
- `std_code` validated against `zstdcode`
- HTC code extracted from origin fields
- UPC constructed from multiple fields

### Item BOM Setup

**Form:** `iprodbom` (Product BOM)

**Process:**
1. Select parent item
2. Add sub-items
3. Set quantities per parent
4. Save to `mprodbom`

**Usage:**
- Define product structures
- Used in OE/OC/Contract processing
- Automatic quantity calculation

### Item Manufacturer

**Form:** `iitemmftr@` (Input Item Manufacturer)

**Process:**
1. Select item
2. Add manufacturer
3. Link in `mitemmftr` table

### Item Vendor Relationships

**Table:** `mitemven`

**Purpose:** Define which vendors can supply which items

**Process:**
1. Select item
2. Add vendor
3. Set vendor-specific details
4. Save to `mitemven`

**Usage:**
- Contract generation (vendor grouping)
- OE validation
- Vendor capability tracking

## Customer Setup

### Customer Entry Form

**Form:** `icustom` (Input Customer)

### Customer Master Data Management Detailed Flow

```mermaid
flowchart TD
    Start([Customer Master Data Management]) --> UserAction{User<br/>Action?}
    
    UserAction -->|Create| CreateCustomer
    UserAction -->|Update| UpdateCustomer
    UserAction -->|Ship Mark| SetupShipMark
    
    CreateCustomer[Create New Customer] --> EnterCustNo[User Enters Customer Number<br/>cust_no]
    EnterCustNo --> ValidateUnique[SELECT mcustom<br/>SEEK cust_no<br/>Check if exists]
    
    ValidateUnique --> Duplicate{Customer<br/>Already<br/>Exists?}
    Duplicate -->|Yes| ShowDuplicateError[Show Error<br/>Customer Number Already Exists]
    Duplicate -->|No| EnterCustomerDetails[User Enters Customer Details<br/>English Name ename<br/>Short Name sname<br/>Address addr1-4]
    
    ShowDuplicateError --> EndCancel
    EnterCustomerDetails --> EnterContact[Enter Contact Information<br/>Contact Name cont_name<br/>Telephones tel, tel2<br/>Fax Numbers fax, fax2]
    
    EnterContact --> EnterTerms[Enter Payment Terms<br/>term<br/>Select from zpayterm<br/>or enter custom terms]
    
    EnterTerms --> EnterShippingParams[Enter Shipping Parameters<br/>show_sub_item_detail flag<br/>wt_unit weight unit<br/>Shipping preferences]
    
    EnterShippingParams --> SetupShipMarkStep[Setup Ship Mark<br/>Enter shipmark memo<br/>or use template from mshipmark]
    
    SetupShipMarkStep --> CreateRecord[APPEND BLANK to mcustom<br/>REPLACE all customer fields]
    CreateRecord --> SetAuditFields[REPLACE cre_date = DATE<br/>REPLACE cre_user = sysUserId<br/>REPLACE user_id = sysUserId]
    SetAuditFields --> EndSuccess
    
    UpdateCustomer[Update Existing Customer] --> SelectCustomer[User Selects Customer<br/>from mcustom lookup]
    SelectCustomer --> LoadCustomer[LOAD mcustom record<br/>Display in form]
    LoadCustomer --> ModifyFields[User Modifies Fields<br/>Address, Contact, Terms, etc.]
    ModifyFields --> SaveChanges[Save Changes<br/>REPLACE fields<br/>REPLACE mod_date = DATE<br/>REPLACE mod_user = sysUserId]
    SaveChanges --> EndSuccess
    
    SetupShipMark[Setup Ship Mark] --> SelectCustForMark[Select Customer<br/>for Ship Mark setup]
    SelectCustForMark --> LoadShipMark[Load Current Ship Mark<br/>from mcustom.shipmark memo]
    
    LoadShipMark --> UserOption{Ship Mark<br/>Option?}
    UserOption -->|Enter Manual| EnterManualMark[User Enters Ship Mark<br/>Text in memo field<br/>Multi-line format]
    UserOption -->|Use Template| SelectTemplate[Select Template<br/>from mshipmark<br/>Browse available templates]
    
    SelectTemplate --> ApplyTemplate[Apply Template<br/>Copy template to<br/>mcustom.shipmark]
    
    EnterManualMark --> SaveShipMark[REPLACE mcustom.shipmark<br/>= entered mark<br/>or applied template]
    ApplyTemplate --> SaveShipMark
    SaveShipMark --> EndSuccess
    
    EndSuccess([Operation Successful]) --> End
    EndCancel([Operation Cancelled or Error]) --> End
    End([Process Complete])
```

**Code Reference:** Form `icustom` - Customer entry form

### Customer Import

**Source:** Legacy `cus.dbf` table

**Filter:** `C_cname = "CUSTOMER" or "TRADING"`

**Process:**
1. Load from legacy system
2. Map fields to `mcustom`
3. Construct ship mark from memo fields
4. Import customers

**Code Reference:** `xcustom.prg` (lines 1-54)

### Customer Fields

**Key Fields:**
- `cust_no` - Customer number (Primary Key)
- `ename` - English name
- `sname` - Short name
- `addr1-4` - Address lines
- `cont_name` - Contact name
- `tel`, `tel2` - Telephones
- `fax`, `fax2` - Fax numbers
- `term` - Payment terms
- `shipmark` - Shipping mark (memo)
- `show_sub_item_detail` - Display flag

### Customer Invoice Parameters

**Form:** `icustinv` (Customer Invoice Parameter)

**Purpose:** Customer-specific invoice settings

### Customer Shipment Parameters

**Form:** `ishippara` (Customer Shipment Parameter)

**Purpose:** Customer-specific shipping settings

### Customer SKN

**Form:** `iskn` (SKN No.)

**Purpose:** Map customer SKN numbers to item numbers

**Table:** `mskn`

**Usage:**
- Customer-specific item numbering
- OE import mapping

## Vendor Setup

### Vendor Entry Form

**Form:** `ivendor` (Input Vendor)

### Vendor Master Data Management Detailed Flow

```mermaid
flowchart TD
    Start([Vendor Master Data Management]) --> UserAction{User<br/>Action?}
    
    UserAction -->|Create| CreateVendor
    UserAction -->|Update| UpdateVendor
    UserAction -->|Item Link| LinkVendorItem
    
    CreateVendor[Create New Vendor] --> EnterVendorNo[User Enters Vendor Number<br/>vendor_no]
    EnterVendorNo --> ValidateUnique[SELECT mvendor<br/>SEEK vendor_no<br/>Check if exists]
    
    ValidateUnique --> Duplicate{Vendor<br/>Already<br/>Exists?}
    Duplicate -->|Yes| ShowDuplicateError[Show Error<br/>Vendor Number Already Exists]
    Duplicate -->|No| EnterVendorDetails[User Enters Vendor Details<br/>English Name ename<br/>Short Name sname<br/>Address addr1-4]
    
    ShowDuplicateError --> EndCancel
    EnterVendorDetails --> EnterContact[Enter Contact Information<br/>Contact Name cont_name<br/>Telephones tel, tel2<br/>Fax Numbers fax, fax2]
    
    EnterContact --> SelectVendorType[Select Vendor Type<br/>type = 1 for Vendor<br/>type = 2 for Maker]
    
    SelectVendorType --> EnterPaymentTerms[Enter Payment Terms<br/>Payment preferences<br/>Default payment terms<br/>if applicable]
    
    EnterPaymentTerms --> CreateRecord[APPEND BLANK to mvendor<br/>REPLACE all vendor fields]
    CreateRecord --> SetAuditFields[REPLACE cre_date = DATE<br/>REPLACE cre_user = sysUserId<br/>REPLACE user_id = sysUserId]
    SetAuditFields --> EndSuccess
    
    UpdateVendor[Update Existing Vendor] --> SelectVendor[User Selects Vendor<br/>from mvendor lookup]
    SelectVendor --> LoadVendor[LOAD mvendor record<br/>Display in form]
    LoadVendor --> ModifyFields[User Modifies Fields<br/>Address, Contact, Type, etc.]
    ModifyFields --> SaveChanges[Save Changes<br/>REPLACE fields<br/>REPLACE mod_date = DATE<br/>REPLACE mod_user = sysUserId]
    SaveChanges --> EndSuccess
    
    LinkVendorItem[Link Vendor to Item] --> SelectItem[Select Item<br/>from mitem<br/>item_no]
    SelectItem --> SelectVendorForLink[Select Vendor<br/>from mvendor<br/>vendor_no]
    
    SelectVendorForLink --> CheckLinkExists{Check mitemven<br/>Link exists<br/>item_no + vendor_no?}
    CheckLinkExists -->|Yes| ShowLinkExists[Show Message<br/>Link Already Exists<br/>or Update Existing]
    CheckLinkExists -->|No| CreateLink[APPEND BLANK to mitemven<br/>REPLACE item_no, vendor_no]
    
    ShowLinkExists --> UpdateLink[UPDATE mitemven<br/>Modify link details<br/>if needed]
    CreateLink --> SetLinkDetails[Set Link Details<br/>Default vendor flag<br/>Vendor-specific item info<br/>if applicable]
    
    UpdateLink --> EndSuccess
    SetLinkDetails --> EndSuccess
    
    EndSuccess([Operation Successful]) --> End
    EndCancel([Operation Cancelled or Error]) --> End
    End([Process Complete])
```

**Code Reference:** Form `ivendor` - Vendor entry form, Item-Vendor linking logic

### Vendor Import

**Source:** Legacy `cus.dbf` table

**Filter:** `C_CNAME="VENDOR" or "MAKER"`

**Process:**
1. Load from legacy system
2. Map fields to `mvendor`
3. Set type (1=Vendor, 2=Maker)
4. Import vendors

**Code Reference:** `xvendor.prg` (lines 1-49)

### Vendor Fields

**Key Fields:**
- `vendor_no` - Vendor number (Primary Key)
- `ename` - English name
- `sname` - Short name
- `addr1-4` - Address lines
- `cont_name` - Contact name
- `tel`, `tel2` - Telephones
- `fax`, `fax2` - Fax numbers
- `type` - Type (1=Vendor, 2=Maker)

### Manufacturer Entry

**Form:** `imftr` (Input Manufacturer)

**Table:** `zmftr`

**Purpose:** Separate manufacturer information from vendors

## Supporting Data Management

### Standard Code

**Form:** `izstdcode` (Standard Code)

**Table:** `zstdcode`

**Purpose:** Item classification codes

### Country of Origin

**Form:** `izorigin` (Country of Origin)

**Table:** `zorigin`

**Purpose:** Origin codes for items

### FOB Port

**Form:** `ifobport` (FOB Port)

**Table:** `zfobport`

**Purpose:** FOB port definitions

### Payment Terms

**Form:** `ipayterm` (Payment Terms)

**Table:** `zpayterm`

**Purpose:** Payment term codes

### FOB Terms

**Form:** `ifobterm` (FOB Terms)

**Table:** `zfobterm`

**Purpose:** FOB term definitions

### Purchase Unit

**Form:** `ipurunit` (Purchase Unit)

**Table:** `zpurunit`

**Purpose:** Purchase unit codes

### Ship Mark

**Form:** `ishipmark` (Ship Mark)

**Table:** `mshipmark`

**Purpose:** Shipping mark templates

## Data Conversion Processes

### Vendor Code Conversion

**Form:** `zvencon` (Vendor Code Conversion)

**Table:** `zvencon`

**Process:**
1. Map old vendor codes to new codes
2. Update all references
3. Maintain conversion history

### Item Number Change

**Form:** `zchange_item` (Change Item No.)

**Process:**
1. Select old item number
2. Enter new item number
3. Update all transaction references
4. Maintain change history

### Customer Number Change

**Form:** `ichangecustno` (Change Customer No.)

**Process:**
1. Select customer
2. Change customer number
3. Update all transaction references
4. Validate no duplicates

## Data Validation

### Item Validation

**Rules:**
- Item number must be unique
- Standard code must exist
- HTC code format validation
- UPC code format validation

### Customer Validation

**Rules:**
- Customer number must be unique
- Address fields required
- Contact information validation

### Vendor Validation

**Rules:**
- Vendor number must be unique
- Type must be 1 (Vendor) or 2 (Maker)
- Address fields required

## Data Maintenance

### Reindexing

**Utility:** `zdoc.prg`

**Process:**
1. Reindex all master data tables
2. Rebuild indexes for fast lookups
3. Verify data integrity

### Data Recovery

**Form:** `systemtools.prg`

**Purpose:** Recover corrupted data
- Rebuild indexes
- Fix data inconsistencies
- Restore from backups

### Delete Data

**Form:** `zdel_data` (Delete Data)

**Purpose:** Delete obsolete data
- Archive old records
- Clean up temporary data
- Maintain data hygiene

## Summary

Master data management is the foundation of the trading system. It handles items, customers, vendors, and all supporting reference data. The system supports both manual entry and import from legacy systems, with validation and conversion tools to maintain data integrity.



