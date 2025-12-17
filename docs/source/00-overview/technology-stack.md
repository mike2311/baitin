# Technology Stack

## Core Technology

### Visual FoxPro
- **Version:** Visual FoxPro 9.0
- **Engine Behavior:** SET ENGINEBEHAVIOR 70/90
- **Status:** Discontinued by Microsoft (last version released in 2007)
- **Platform:** Windows only

### Database Technology

#### DBF Files (Database Files)
- **Format:** FoxPro DBF format
- **Total Tables:** 186 DBF files
- **Structure:** Fixed-width record format
- **Limitations:**
  - No built-in referential integrity
  - No ACID transactions
  - Manual foreign key management
  - File-level locking only

#### CDX Files (Compound Index)
- **Purpose:** Index files for fast lookups
- **Format:** Compound index structure
- **Usage:** Multiple indexes per table
- **Maintenance:** Manual reindexing required (via `zdoc.prg`)

#### FPT Files (Memo/Text Fields)
- **Purpose:** Store large text fields (memos, remarks, descriptions)
- **Format:** FoxPro memo file format
- **Associated:** One FPT file per DBF with memo fields
- **Examples:** 
  - `mitem.FPT` - Item descriptions
  - `mcustom.FPT` - Customer notes
  - `mcontdt.FPT` - Contract details

## Operating System Requirements

- **Platform:** Microsoft Windows
- **Architecture:** 32-bit or 64-bit (with compatibility)
- **File System:** NTFS recommended
- **Network:** Network file shares supported for multi-user access

## External Dependencies

### Microsoft Excel
- **Purpose:** Import/export functionality
- **Integration Methods:**
  - ODBC connection
  - OLE Automation
  - Direct file reading
- **Formats Supported:**
  - Excel 97-2003 (.xls)
  - Excel 2007+ (.xlsx)
  - CSV files
  - Custom formats per customer

### PDF Generation
- **Purpose:** Report and document generation
- **Method:** FoxPro report engine (FRX) → PDF
- **Tools:** Third-party PDF drivers or built-in print-to-PDF

### MySQL (Optional)
- **Evidence:** `openMySqlConnect.prg`, `getMySqlConnect.prg`
- **Purpose:** Possible external data connectivity
- **Status:** Limited usage in current codebase

## File-Based Architecture Details

### Directory Structure

```
C:\batwork\              # Shared working directory
├── *.dbf                # Database files
├── *.cdx                # Index files
├── *.fpt                # Memo files
└── *.frx                # Report files

C:\<userid>work\         # Per-user working directory
└── [user-specific temp files]
```

### File Access Patterns

#### Exclusive Access
- Used for: Batch operations, reindexing, data conversion
- Example: `USE moe EXCLUSIVE`
- Impact: Locks entire table during operation

#### Shared Access
- Default: `SET EXCLUSIVE OFF`
- Used for: Normal operations, multi-user access
- Locking: Record-level or file-level

### Database File Organization

#### Transaction Tables
- **Pattern:** Header/Detail pairs
  - `moehd` / `moe` (Order Enquiry)
  - `mordhd` / `morddt` (Order Confirmation)
  - `mconthd` / `mcontdt` (Contract)
  - `minvhd` / `minvdt` (Invoice)
- **Relationship:** Manual linking via key fields

#### Master Data Tables
- **Pattern:** Single table per entity
  - `mitem` (Items)
  - `mcustom` (Customers)
  - `mvendor` (Vendors)
- **Lookup Tables:** Supporting reference data

### Index Management

#### Index Types
1. **Primary Index:** Unique key (e.g., `oe_no`, `item_no`)
2. **Foreign Key Index:** For lookups (e.g., `cust_no`, `vendor_no`)
3. **Search Index:** For filtering (e.g., date ranges, status)

#### Index Maintenance
- **Manual Process:** Reindex utility (`zdoc.prg`)
- **Frequency:** After bulk data changes
- **Method:** `REINDEX` command on each table
- **Exclusive Access Required:** Yes

### Memo Field Handling

#### Storage
- **Location:** Separate FPT files
- **Size:** Variable length
- **Content:** Text, descriptions, remarks, notes

#### Access Patterns
- **Read:** Direct field access
- **Write:** REPLACE command
- **Search:** Limited (requires full table scan)

## Configuration Management

### System Configuration
- **File:** `main.prg` (startup script)
- **Settings:**
  - Date format: `SET DATE MDY`
  - Century: `SET CENTURY ON`
  - Hour format: `SET HOUR TO 24`
  - Path: `SET PATH TO c:\batwork, &syswork`

### Company Configuration
- **Method:** Password-based company selection
- **Variables:**
  - `w_password` - Company code (HT, BAT, INSP, HFW)
  - `w_co_name` - Company name
  - `w_oe_prefix` - OE number prefix
- **Location:** Hardcoded in `a.prg` or login form

### User Configuration
- **User ID:** `sysUserId` (from login)
- **Working Directory:** `C:\<userid>work`
- **User Rights:** `User_right` (SUPERVISOR/REGULAR_USER)

## Development Environment

### Source Code Organization
- **Forms:** `.scx` / `.sct` files (binary + text)
- **Programs:** `.prg` files (text)
- **Menus:** `.mnx` / `.mpr` files
- **Reports:** `.frx` / `.frt` files
- **Project:** `.pjx` / `.pjt` files

### Build Process
- **Compiler:** Visual FoxPro compiler
- **Output:** `.exe` file (standalone executable)
- **Dependencies:** Runtime libraries included

## Limitations & Constraints

### Technical Limitations

1. **No SQL Backend**
   - No complex queries
   - No stored procedures
   - No views
   - Manual relationship management

2. **File Locking**
   - Record-level or file-level only
   - No row-level locking
   - Potential for conflicts in multi-user scenarios

3. **No Transactions**
   - No rollback capability
   - Manual data consistency checks required
   - Risk of partial updates

4. **Limited Scalability**
   - File-based storage limits
   - Network file share performance
   - No connection pooling

5. **Platform Dependency**
   - Windows only
   - Visual FoxPro runtime required
   - Legacy technology

### Maintenance Challenges

1. **Index Corruption**
   - Requires periodic reindexing
   - Manual maintenance process

2. **Data Integrity**
   - No foreign key constraints
   - Manual validation in code
   - Risk of orphaned records

3. **Backup/Recovery**
   - File-based backup required
   - No point-in-time recovery
   - Manual backup procedures

## Integration Points

### Excel Integration
- **Import:** Multiple formats (standard, Walmart, CSV, 2013 format)
- **Export:** Reports, invoices, packing lists
- **Method:** ODBC or OLE Automation

### File System Integration
- **Working Directories:** Per-user temp files
- **Import Files:** Excel files from network shares
- **Export Files:** Generated reports, Excel files

### Print Integration
- **Reports:** FRX report engine
- **Output:** Printer or PDF
- **Formats:** Custom layouts per document type



