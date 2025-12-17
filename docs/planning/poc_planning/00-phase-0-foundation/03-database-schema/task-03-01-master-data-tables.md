# Task 03-01: Master Data Tables Schema

## Task Information

- **Phase**: 0 - Foundation
- **Sprint**: Week 3
- **Priority**: Critical
- **Estimated Effort**: 2 days
- **Dependencies**: Task 01-02 (Database Setup)
- **Assignee**: Backend Developer / Database Developer

## Objective

Create database schema for master data tables (item, customer, vendor) based on original DBF structure, preserving all fields, relationships, and business rules.

## Requirements

### 1. Item Master Table (item)

#### Original Reference
- **Legacy Table**: `mitem` (DBF)
- **Documentation**: `docs/01-data-architecture/table-details/master-data-tables.md` lines 5-49
- **File Size**: 11MB DBF + 24MB FPT (memo)

#### Schema Definition
```sql
CREATE TABLE item (
  id SERIAL PRIMARY KEY,
  item_no VARCHAR(50) UNIQUE NOT NULL,
  item_type VARCHAR(20),
  date DATE,
  short_name VARCHAR(100),
  desp TEXT, -- Memo field converted to TEXT
  origin VARCHAR(50),
  grp_code VARCHAR(20),
  material VARCHAR(100),
  upc_no VARCHAR(50),
  htc_no VARCHAR(50),
  std_code VARCHAR(50),
  price DECIMAL(18, 4),
  price_cur VARCHAR(3),
  pack_pc_1 INTEGER,
  pack_desp_1 VARCHAR(50),
  pack_pc_2 INTEGER,
  pack_desp_2 VARCHAR(50),
  pack_pc_3 INTEGER,
  pack_desp_3 VARCHAR(50),
  pack_pc_4 INTEGER,
  pack_desp_4 VARCHAR(50),
  wt DECIMAL(10, 2),
  net DECIMAL(10, 2),
  cube DECIMAL(10, 2),
  dim VARCHAR(50),
  duty DECIMAL(10, 4),
  suspend_flag BOOLEAN DEFAULT FALSE,
  cre_date DATE,
  cre_user VARCHAR(50),
  mod_date DATE,
  mod_user VARCHAR(50),
  user_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_item_item_no ON item(item_no);
CREATE INDEX idx_item_std_code ON item(std_code);
CREATE INDEX idx_item_origin ON item(origin);
CREATE INDEX idx_item_grp_code ON item(grp_code);
```

#### Business Rules
- `item_no` must be unique
- `std_code` validated against `zstdcode` table
- `origin` validated against `zorigin` table

### 2. Customer Master Table (customer)

#### Original Reference
- **Legacy Table**: `mcustom` (DBF)
- **File Size**: 576KB DBF + 394KB FPT

#### Schema Definition
```sql
CREATE TABLE customer (
  id SERIAL PRIMARY KEY,
  cust_no VARCHAR(50) UNIQUE NOT NULL,
  ename VARCHAR(200),
  sname VARCHAR(100),
  cname VARCHAR(200),
  addr1 VARCHAR(200),
  addr2 VARCHAR(200),
  addr3 VARCHAR(200),
  addr4 VARCHAR(200),
  cont_name VARCHAR(100),
  tel VARCHAR(50),
  tel2 VARCHAR(50),
  fax VARCHAR(50),
  fax2 VARCHAR(50),
  email VARCHAR(100),
  show_sub_item_detail BOOLEAN DEFAULT FALSE,
  cre_date DATE,
  cre_user VARCHAR(50),
  mod_date DATE,
  mod_user VARCHAR(50),
  user_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customer_cust_no ON customer(cust_no);
CREATE INDEX idx_customer_ename ON customer(ename);
```

### 3. Vendor Master Table (vendor)

#### Original Reference
- **Legacy Table**: `mvendor` (DBF)
- **File Size**: 228KB

#### Schema Definition
```sql
CREATE TABLE vendor (
  id SERIAL PRIMARY KEY,
  vendor_no VARCHAR(50) UNIQUE NOT NULL,
  ename VARCHAR(200),
  sname VARCHAR(100),
  addr1 VARCHAR(200),
  addr2 VARCHAR(200),
  addr3 VARCHAR(200),
  addr4 VARCHAR(200),
  cont_name VARCHAR(100),
  tel VARCHAR(50),
  tel2 VARCHAR(50),
  fax VARCHAR(50),
  fax2 VARCHAR(50),
  type INTEGER, -- 1=Vendor, 2=Maker
  cre_date DATE,
  cre_user VARCHAR(50),
  mod_date DATE,
  mod_user VARCHAR(50),
  user_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vendor_vendor_no ON vendor(vendor_no);
CREATE INDEX idx_vendor_type ON vendor(type);
```

### 4. Reference Tables

#### Standard Code Table (zstdcode)
```sql
CREATE TABLE zstdcode (
  id SERIAL PRIMARY KEY,
  std_code VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_zstdcode_std_code ON zstdcode(std_code);
```

#### Origin Table (zorigin)
```sql
CREATE TABLE zorigin (
  id SERIAL PRIMARY KEY,
  origin VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_zorigin_origin ON zorigin(origin);
```

## Implementation Steps

1. **Design Schema**
   - Review original DBF structure
   - Map DBF types to PostgreSQL types
   - Handle memo fields (FPT) → TEXT
   - Plan indexes

2. **Create Migration**
   - Create migration file
   - Define all tables
   - Add indexes
   - Add constraints

3. **Run Migration**
   - Execute migration
   - Verify tables created
   - Verify indexes created

4. **Create Entity/Models**
   - Create TypeORM entities or Prisma models
   - Define relationships
   - Add validation decorators

5. **Seed Reference Data**
   - Seed zstdcode table
   - Seed zorigin table
   - Test data access

6. **Documentation**
   - Document schema
   - Document field mappings
   - Document business rules

## Acceptance Criteria

- [ ] All master data tables created
- [ ] All indexes created
- [ ] Unique constraints working
- [ ] Foreign key constraints (if any) working
- [ ] Entities/models created
- [ ] Reference data seeded
- [ ] Can query tables successfully
- [ ] Field mappings documented

## Field Type Mappings

| DBF Type | PostgreSQL Type | Notes |
|----------|----------------|-------|
| C (Character) | VARCHAR(n) | Variable length string |
| N (Numeric) | DECIMAL or INTEGER | Based on decimal places |
| D (Date) | DATE | Date only |
| L (Logical) | BOOLEAN | True/False |
| M (Memo) | TEXT | Stored in FPT file, use TEXT |

## Testing Checklist

- [ ] Tables created successfully
- [ ] Indexes created successfully
- [ ] Unique constraints enforced
- [ ] Can insert test data
- [ ] Can query data
- [ ] Can update data
- [ ] Can delete data (if allowed)
- [ ] Entity/models map correctly

## Notes

- Preserve all original fields
- Maintain field names where possible
- Add audit fields (created_at, updated_at)
- Consider adding id as primary key (vs using item_no directly)
- Memo fields stored as TEXT in PostgreSQL
- Date fields: Use DATE type (not TIMESTAMP) where appropriate

## Dependencies

- Task 01-02: Database Setup

## Next Tasks

- Task 03-02: Order Enquiry Tables Schema

## References

- **Master Data Tables**: `../../../../docs/01-data-architecture/table-details/master-data-tables.md`
- **Master Data Management**: `../../../../docs/02-business-processes/master-data-management.md`

