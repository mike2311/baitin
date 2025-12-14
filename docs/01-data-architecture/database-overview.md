# Database Overview

## Database Technology

### File Format
- **Type:** FoxPro DBF (Database File) format
- **Version:** Visual FoxPro 9.0 compatible
- **Structure:** Fixed-width record format with variable-length memo fields

### Total Tables
- **Count:** 186 DBF files identified in the source directory
- **Categories:**
  - Transaction tables (header/detail pairs)
  - Master data tables
  - Supporting/reference tables
  - Temporary/work tables
  - Legacy/backup tables

## File Types

### DBF Files (Database Tables)
- **Purpose:** Store structured data records
- **Format:** Binary fixed-width records
- **Naming Convention:** 
  - `m` prefix for master/transaction tables (e.g., `mitem`, `moe`, `mordhd`)
  - `z` prefix for reference/lookup tables (e.g., `zstdcode`, `zorigin`)
  - `w` prefix for work/temporary tables (e.g., `woexls`, `wcontract`)

### CDX Files (Compound Index)
- **Purpose:** Provide fast lookups and sorting
- **Format:** Compound index structure
- **Association:** One CDX file per DBF (can contain multiple indexes)
- **Examples:**
  - `mitem.CDX` - Indexes for item table
  - `moe.CDX` - Indexes for OE table
  - `mcustom.CDX` - Indexes for customer table

### FPT Files (Memo/Text Fields)
- **Purpose:** Store large text fields (memos, descriptions, remarks)
- **Format:** FoxPro memo file format
- **Association:** One FPT file per DBF that contains memo fields
- **Size:** Variable length (can be very large)
- **Examples:**
  - `mitem.FPT` - Item descriptions (24MB)
  - `mcustom.FPT` - Customer notes (394KB)
  - `mcontdt.FPT` - Contract details (75MB)
  - `minvdt.FPT` - Invoice details (178MB)

## File Sizes

Based on file listing analysis:

### Large Transaction Tables
- `mso.dbf` - 279MB (Shipping Orders)
- `minvdt.dbf` - 123MB (Invoice Details)
- `morddt.dbf` - 39MB (Order Confirmation Details)
- `mcontdt.dbf` - 47MB (Contract Details)
- `moe.dbf` - 102MB (Order Enquiry)

### Large Memo Files
- `minvdt.FPT` - 178MB (Invoice detail memos)
- `mcontdt.FPT` - 75MB (Contract detail memos)
- `mso.FPT` - 131MB (Shipping order memos)
- `morddt.FPT` - 77MB (Order confirmation memos)

### Master Data Tables
- `mitem.dbf` - 11MB (Items)
- `mcustom.dbf` - 576KB (Customers)
- `mvendor.dbf` - 228KB (Vendors)

## Database Structure

### No Centralized Database
- **Architecture:** File-based, no database server
- **Location:** Files stored in `C:\batwork` directory
- **Access:** Direct file access via FoxPro runtime

### Table Relationships
- **Type:** Manual (no foreign key constraints)
- **Enforcement:** Application-level validation
- **Pattern:** Header/Detail pairs for transactions

### Index Management
- **Type:** CDX compound indexes
- **Maintenance:** Manual reindexing required
- **Process:** `zdoc.prg` utility performs reindexing
- **Frequency:** After bulk data changes

## Data Organization

### Transaction Tables (Header/Detail Pattern)

**Order Enquiry:**
- `moehd` - OE Header
- `moe` - OE Detail
- `moectrl` - OE Control

**Order Confirmation:**
- `mordhd` - OC Header
- `morddt` - OC Detail

**Contract:**
- `mconthd` - Contract Header
- `mcontdt` - Contract Detail

**Shipping:**
- `mso` - Shipping Order

**Delivery Note:**
- `mdnhd` - DN Header
- `mdndt` - DN Detail
- `mdnbrk` - DN Breakdown

**Invoice:**
- `minvhd` - Invoice Header
- `minvdt` - Invoice Detail

**Loading:**
- `mlahd` - Loading Advice Header
- `mladt` - Loading Advice Detail
- `mload` - Loading Master

### Master Data Tables

**Items:**
- `mitem` - Item Master
- `mitemmftr` - Item Manufacturer
- `mitemven` - Item Vendor relationships
- `mprodbom` - Product BOM
- `moebom` - OE BOM

**Customers:**
- `mcustom` - Customer Master

**Vendors:**
- `mvendor` - Vendor Master
- `zmftr` - Manufacturer

### Supporting Tables

**Reference Data:**
- `zstdcode` - Standard codes
- `zorigin` - Country of origin
- `zfobport` - FOB ports
- `zpayterm` - Payment terms
- `zfobterm` - FOB terms
- `zcurcode` - Currency codes
- `zpurunit` - Purchase units

**Business Data:**
- `mqtybrk` - Quantity breakdown
- `mskn` - SKN number mapping
- `mspecprice` - Special pricing
- `mshipmark` - Shipping marks
- `mactivity` - Activity log

**System:**
- `zpara` - System parameters
- `user` - User accounts
- `rights` - User rights

## Data Access Patterns

### Exclusive Access
- **Usage:** Batch operations, reindexing, data conversion
- **Example:** `USE moe EXCLUSIVE`
- **Impact:** Locks entire table

### Shared Access
- **Default:** `SET EXCLUSIVE OFF`
- **Usage:** Normal operations, multi-user access
- **Locking:** Record-level or file-level

## Data Integrity

### No Built-in Constraints
- **Foreign Keys:** Not enforced at database level
- **Referential Integrity:** Manual validation in code
- **Transactions:** Not supported (no rollback)

### Manual Validation
- **Application Level:** Code validates relationships
- **Data Quality:** Dependent on application logic
- **Risk:** Potential for orphaned records

## Backup and Recovery

### File-Based Backup
- **Method:** Copy DBF, CDX, FPT files
- **Frequency:** Manual process
- **Recovery:** Restore files from backup
- **Limitation:** No point-in-time recovery

### Data Consistency
- **Index Corruption:** Requires reindexing
- **Memo Corruption:** Requires FPT file recovery
- **Maintenance:** Periodic reindexing via `zdoc.prg`

## Performance Considerations

### Index Usage
- **Critical Indexes:** On key fields (oe_no, item_no, cust_no)
- **Search Indexes:** On date ranges, status fields
- **Maintenance:** Regular reindexing required

### File Size Impact
- **Large Tables:** Some tables exceed 100MB
- **Memo Files:** Some FPT files exceed 100MB
- **Network Impact:** Large files on network shares can be slow

### Multi-User Considerations
- **File Locking:** Record or file level
- **Contention:** Potential conflicts on shared files
- **Performance:** Degrades with multiple concurrent users

## Migration Considerations

### Challenges
1. **No SQL Backend:** Direct migration to SQL required
2. **Memo Fields:** FPT files need conversion to TEXT/JSONB
3. **Indexes:** CDX indexes need recreation in SQL
4. **Relationships:** Manual relationships need foreign keys
5. **Data Types:** FoxPro types need SQL type mapping

### Opportunities
1. **Normalization:** Can improve data structure
2. **Constraints:** Can add referential integrity
3. **Transactions:** Can add ACID compliance
4. **Scalability:** Can improve with proper RDBMS



