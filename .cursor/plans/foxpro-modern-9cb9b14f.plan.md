---
name: FoxPro Trading Management System - Documentation Analysis Plan
overview: ""
todos:
  - id: af108632-987f-4737-9d47-6472ac2d052e
    content: Complete inventory of all 186 DBF tables with field definitions
    status: pending
  - id: 4c90d176-c462-46d4-8222-7a76ebe39cb2
    content: Design normalized PostgreSQL schema with relationships
    status: pending
  - id: fe410c3b-bbd1-4ceb-8790-efef4eb1ca02
    content: Build ETL pipeline for DBF to PostgreSQL migration
    status: pending
  - id: a8299386-c66c-4923-80ba-5be6a42ca9ef
    content: Execute initial data migration and validation
    status: pending
  - id: fbaa91d0-c9c0-4644-a492-c9a0d160099e
    content: Setup .NET 8 API project with EF Core and authentication
    status: pending
  - id: d7ee8a51-4a3e-4277-a542-5c9dcbde997a
    content: Implement Order Enquiry API endpoints
    status: pending
  - id: 221fafd3-f2ed-4b4e-9f52-89879f4436b9
    content: Implement Contract and OC API endpoints
    status: pending
  - id: ac74cc43-777b-489b-a59f-eebb160b2d04
    content: Implement Invoice and Shipping API endpoints
    status: pending
  - id: a344ccf0-31f4-4e1f-94e9-cc106fdcb9d8
    content: Setup Next.js project with design system
    status: pending
  - id: bbdcd760-202e-4b1f-be1e-9d97b8928360
    content: Build Item/Customer/Vendor management UI
    status: pending
  - id: deb8dc55-7977-4ef3-81af-8738722b1adf
    content: Build Order Enquiry module UI with Excel import
    status: pending
  - id: 5188ef82-9f6b-4b2d-a74d-dcdb6debf729
    content: Build Contract and OC workflow UI
    status: pending
  - id: d0af3f6e-3d43-41d2-985a-e4eeef38ef1f
    content: Build Invoice and Packing List UI
    status: pending
  - id: 8c288a9a-63c1-4952-8be9-b3dc46dbf5e1
    content: Build report generation engine (PDF/Excel)
    status: pending
  - id: 9ca20851-3b64-4a65-916b-49176a4d8197
    content: Implement Excel import/export for all formats
    status: pending
  - id: b5738a63-d5c8-47ef-867d-ef1559f93b00
    content: Conduct User Acceptance Testing with side-by-side comparison
    status: pending
  - id: e9757390-da3f-4bb0-b82f-e25cd823190d
    content: Create user documentation and conduct training sessions
    status: pending
  - id: 4e88713d-dee9-4575-ab9f-16e41fe857da
    content: Execute final cutover and production deployment
    status: pending
---

# FoxPro Trading Management System - Documentation Analysis Plan

## Objective

Create detailed markdown documentation analyzing the **current FoxPro system** to fully understand its architecture, logic, and structure before planning any modernization.

## Documentation Structure

The documentation will be organized in the following folder structure:

```
docs/
├── 00-overview/
│   ├── system-summary.md
│   ├── technology-stack.md
│   └── user-roles.md
├── 01-data-architecture/
│   ├── database-overview.md
│   ├── table-inventory.md
│   ├── entity-relationships.md
│   ├── table-details/
│   │   ├── transaction-tables.md
│   │   ├── master-data-tables.md
│   │   └── supporting-tables.md
│   └── indexes-and-keys.md
├── 02-business-processes/
│   ├── workflow-overview.md
│   ├── order-enquiry-process.md
│   ├── order-confirmation-process.md
│   ├── contract-process.md
│   ├── shipping-process.md
│   ├── invoice-process.md
│   └── master-data-management.md
├── 03-application-modules/
│   ├── module-inventory.md
│   ├── master-data-module.md
│   ├── order-enquiry-module.md
│   ├── order-confirmation-module.md
│   ├── contract-module.md
│   ├── shipping-module.md
│   ├── invoice-module.md
│   ├── reports-module.md
│   └── utilities-module.md
├── 04-forms-and-screens/
│   ├── form-inventory.md
│   ├── authentication-screens.md
│   ├── master-data-screens.md
│   ├── transaction-entry-screens.md
│   └── enquiry-screens.md
├── 05-business-logic/
│   ├── program-inventory.md
│   ├── validation-rules.md
│   ├── calculation-logic.md
│   ├── excel-import-logic.md
│   ├── bom-processing.md
│   └── posting-workflows.md
├── 06-reporting/
│   ├── report-inventory.md
│   ├── report-categories.md
│   └── report-specifications.md
├── 07-integration/
│   ├── excel-integration.md
│   ├── external-systems.md
│   └── file-handling.md
├── 08-security/
│   ├── authentication.md
│   ├── authorization.md
│   └── audit-trail.md
└── 09-technical-details/
    ├── file-structure.md
    ├── configuration.md
    ├── concurrency-handling.md
    └── known-issues.md
```

## Documentation Sections

### Section 1: System Overview (00-overview/)

**Files to create:**

1. **system-summary.md**

   - Application name, version, purpose
   - High-level capabilities
   - User count and deployment model
   - Business domain (international trading)
   - Key features summary
   - System architecture diagram

2. **technology-stack.md**

   - Visual FoxPro version
   - Database technology (DBF/CDX/FPT)
   - Operating system requirements
   - External dependencies (Excel, PDF)
   - File-based architecture details

3. **user-roles.md**

   - SUPERVISOR role capabilities
   - REGULAR_USER role capabilities
   - User management approach
   - Multi-company support (HT, BAT, INSP, HFW)

### Section 2: Data Architecture (01-data-architecture/)

**Files to create:**

1. **database-overview.md**

   - Total number of tables (186)
   - Database file format (DBF)
   - Index files (CDX)
   - Memo fields (FPT)
   - File sizes and data volumes

2. **table-inventory.md**

   - Complete list of all 186 DBF tables
   - Categorization (transaction, master, supporting)
   - Table relationships overview
   - Naming conventions

3. **entity-relationships.md**

   - ERD diagrams for major entities
   - Foreign key relationships (manual)
   - Parent-child relationships
   - Lookup table connections

4. **table-details/transaction-tables.md**

   - Detailed schemas for:
     - moe, moehd, moectrl (Order Enquiry)
     - mordhd, morddt (Order Confirmation)
     - mconthd, mcontdt (Contract)
     - mso (Shipping Order)
     - mdnhd, mdndt, mdnbrk (Delivery Note)
     - minvhd, minvdt (Invoice)
     - mlahd, mladt, mload (Loading)
   - Field definitions (name, type, length, description)
   - Business rules per table

5. **table-details/master-data-tables.md**

   - mitem (Items)
   - mcustom (Customers)
   - mvendor (Vendors)
   - zmftr (Manufacturers)
   - mitemven (Item-Vendor relationships)
   - mprodbom (Product BOM)
   - Field definitions and business rules

6. **table-details/supporting-tables.md**

   - mqtybrk (Quantity Breakdown)
   - mskn (SKN mapping)
   - mspecprice (Special pricing)
   - zstdcode, zorigin, zfobport, zpayterm
   - mshipmark, mactivity, zpara
   - user, rights

7. **indexes-and-keys.md**

   - CDX index structures
   - Primary keys (manual)
   - Search indexes
   - Performance-critical indexes

### Section 3: Business Processes (02-business-processes/)

**Files to create:**

1. **workflow-overview.md**

   - End-to-end trading workflow
   - Process flow diagrams
   - Document lifecycle
   - Status transitions

2. **order-enquiry-process.md**

   - OE creation methods (Excel import, manual entry)
   - OE validation rules
   - Customer matching logic
   - Item validation
   - Qty breakdown processing
   - BOM handling
   - OE Control record requirements

3. **order-confirmation-process.md**

   - Post OE to OC workflow
   - Data transformation rules
   - Confirmation numbering
   - Status updates

4. **contract-process.md**

   - Contract generation from OC
   - Vendor grouping logic
   - Contract amendment process
   - BOM propagation to sub-items
   - Payment terms handling

5. **shipping-process.md**

   - SO creation rules
   - Format-based SO generation
   - Ship mark handling
   - FOB terms

6. **invoice-process.md**

   - Invoice creation from SO/DN
   - Packing list generation
   - Multi-page invoice logic
   - Carton breakdown
   - Export formats (Excel, PDF)

7. **master-data-management.md**

   - Item creation and maintenance
   - Customer setup
   - Vendor setup
   - Data conversion processes

### Section 4: Application Modules (03-application-modules/)

**Files to create:**

1. **module-inventory.md**

   - Complete list of functional modules
   - Module dependencies
   - Menu structure mapping

2. **master-data-module.md**

   - Forms: iitem, icustom, ivendor, imftr, etc.
   - Key programs
   - Tables accessed
   - Business rules

3. **order-enquiry-module.md**

   - Forms: ioe1@, ioectrl, iqtybrk2, uoexls, uoexls_2013
   - Programs: uoexls_2013.prg (detailed analysis)
   - Excel import formats supported
   - Validation logic
   - Qty breakdown entry
   - BOM processing

4. **order-confirmation-module.md**

   - Forms: iordhd, iorddt1, iorddt2, upostoe
   - Post workflow logic
   - Programs: uordcont.prg analysis

5. **contract-module.md**

   - Forms: isetcont@@_2018, iconthd_2018, icontdt_2018
   - Contract generation logic
   - Programs: uwcontract.prg analysis

6. **shipping-module.md**

   - Forms: isetso, isetsodt
   - SO format handling
   - Programs: pso.prg analysis

7. **invoice-module.md**

   - Forms: iinvhd@, iinvdt2@, pinv@, ppacklist_new
   - Invoice generation logic
   - Programs: pinv.prg analysis
   - Packing list logic

8. **reports-module.md**

   - Report forms (40+ enquiry forms)
   - Report categories
   - Data aggregation logic

9. **utilities-module.md**

   - Reindex utilities (zdoc.prg)
   - Data conversion tools
   - Backup/recovery tools

### Section 5: Forms and Screens (04-forms-and-screens/)

**Files to create:**

1. **form-inventory.md**

   - Complete list of 195 forms (.scx files)
   - Form categorization
   - Form-to-module mapping

2. **authentication-screens.md**

   - ilogon.scx analysis
   - Login flow
   - User validation
   - Company selection

3. **master-data-screens.md**

   - Item entry screens
   - Customer entry screens
   - Vendor entry screens
   - Grid components
   - Validation feedback

4. **transaction-entry-screens.md**

   - OE entry screens
   - OC entry screens
   - Contract entry screens
   - SO entry screens
   - Invoice entry screens
   - Common UI patterns

5. **enquiry-screens.md**

   - Search/filter screens
   - List views
   - Detail views
   - Report preview screens

### Section 6: Business Logic (05-business-logic/)

**Files to create:**

1. **program-inventory.md**

   - Complete list of 176 PRG files
   - Program categorization
   - Call hierarchy

2. **validation-rules.md**

   - Customer validation
   - Item validation
   - OE Control validation
   - Quantity validations
   - Price validations
   - Date validations

3. **calculation-logic.md**

   - Price calculations
   - Quantity calculations
   - Currency conversions
   - Carton calculations
   - Cube/weight calculations

4. **excel-import-logic.md**

   - Detailed analysis of uoexls_2013.prg (1,747 lines)
   - Field mapping logic
   - Dynamic column detection
   - Multi-format support
   - Error handling

5. **bom-processing.md**

   - Product BOM structure
   - OE BOM handling
   - Sub-item propagation
   - Quantity distribution logic

6. **posting-workflows.md**

   - OE to OC posting
   - OC to Contract generation
   - Status update logic
   - Transaction copying rules

### Section 7: Reporting (06-reporting/)

**Files to create:**

1. **report-inventory.md**

   - Complete list of 116 FRX reports
   - Report categorization
   - Report parameters

2. **report-categories.md**

   - Transaction reports
   - Summary reports
   - Analysis reports
   - Operational reports
   - Export reports

3. **report-specifications.md**

   - Key report details:
     - pconfirm (Order Confirmation)
     - pcontract@_2018 (Contract)
     - pinv@ (Invoice)
     - ppacklist (Packing List)
   - Data sources
   - Layout specifications
   - Printing requirements

### Section 8: Integration (07-integration/)

**Files to create:**

1. **excel-integration.md**

   - Import workflows (OE, qty breakdown)
   - Export workflows (invoices, reports)
   - Excel formats supported
   - Template handling

2. **external-systems.md**

   - MySQL connectivity (openMySqlConnect.prg)
   - File exchange mechanisms
   - External data sources

3. **file-handling.md**

   - Working directory structure (C:\batwork, C:\<userid>work)
   - Temporary file management
   - Import file processing
   - Export file generation

### Section 9: Security (08-security/)

**Files to create:**

1. **authentication.md**

   - Login process
   - Password handling
   - Session management
   - User identification (sysUserId)

2. **authorization.md**

   - SUPERVISOR vs REGULAR_USER
   - Menu differences (BATMENUS vs BATMENU)
   - Feature restrictions
   - Data access control

3. **audit-trail.md**

   - Activity logging (mactivity table)
   - User tracking fields (user_id, cre_user)
   - Change tracking
   - Created/updated timestamps

### Section 10: Technical Details (09-technical-details/)

**Files to create:**

1. **file-structure.md**

   - Source code organization
   - DBF file locations
   - CDX index files
   - FPT memo files
   - Report files (FRX)
   - Form files (SCX/SCT)

2. **configuration.md**

   - main.prg startup configuration
   - PATH settings
   - Company configuration (w_password, w_co_name)
   - System parameters (zpara table)
   - Date/time settings

3. **concurrency-handling.md**

   - SET EXCLUSIVE OFF
   - File locking mechanisms
   - Multi-user considerations
   - Conflict resolution
   - Reindex requirements

4. **known-issues.md**

   - Errors from baitin.ERR
   - Missing forms/reports
   - Undefined dependencies
   - Potential data integrity issues

## Analysis Approach

For each section, I will:

1. **Read relevant source files** from [`source/`](source/) directory
2. **Analyze code patterns** in PRG files
3. **Map table relationships** from DBF usage
4. **Trace workflows** through form calls and program execution
5. **Document business rules** extracted from validation logic
6. **Create diagrams** using Mermaid for visual representation
7. **Cross-reference** related components

## Deliverables

1. **Complete folder structure** with organized markdown files
2. **Detailed technical documentation** of current system
3. **Architecture diagrams** showing system structure
4. **Process flow diagrams** for business workflows
5. **Data dictionary** with all table/field definitions
6. **Code analysis** of critical business logic
7. **Reference documentation** for future modernization planning

This documentation will serve as the **single source of truth** for understanding the existing FoxPro system before any modernization work begins.