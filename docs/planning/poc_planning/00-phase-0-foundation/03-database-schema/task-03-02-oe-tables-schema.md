# Task 03-02: Order Enquiry Tables Schema

## Task Information

- **Phase**: 0 - Foundation
- **Sprint**: Week 3
- **Priority**: Critical
- **Estimated Effort**: 2 days
- **Dependencies**: Task 03-01 (Master Data Tables)
- **Assignee**: Backend Developer / Database Developer

## Objective

Create database schema for Order Enquiry (OE) tables based on original DBF structure, preserving all fields, relationships, and business rules.

## Requirements

### 1. OE Control Table (order_enquiry_control)

#### Original Reference
- **Legacy Table**: `moectrl` (DBF)
- **Documentation**: `docs/02-business-processes/order-enquiry-process.md` lines 544-576
- **Purpose**: Validation checkpoint before OE creation

#### Schema Definition
```sql
CREATE TABLE order_enquiry_control (
  id SERIAL PRIMARY KEY,
  oe_no VARCHAR(50) UNIQUE NOT NULL,
  cust_no VARCHAR(50) NOT NULL,
  oe_date DATE NOT NULL,
  status VARCHAR(20),
  po_no VARCHAR(100),
  remark TEXT,
  cre_date DATE,
  cre_user VARCHAR(50),
  mod_date DATE,
  mod_user VARCHAR(50),
  user_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_oe_control_customer FOREIGN KEY (cust_no) 
    REFERENCES customer(cust_no)
);

CREATE INDEX idx_oe_control_oe_no ON order_enquiry_control(oe_no);
CREATE INDEX idx_oe_control_cust_no ON order_enquiry_control(cust_no);
```

#### Business Rules
- `oe_no` must be unique
- `cust_no` must exist in `customer` table
- Required before OE import (except INSP company)

### 2. OE Header Table (order_enquiry_header)

#### Original Reference
- **Legacy Table**: `moehd` (DBF)
- **Purpose**: OE header information

#### Schema Definition
```sql
CREATE TABLE order_enquiry_header (
  id SERIAL PRIMARY KEY,
  oe_no VARCHAR(50) UNIQUE NOT NULL,
  cust_no VARCHAR(50) NOT NULL,
  oe_date DATE NOT NULL,
  po_no VARCHAR(100),
  status INTEGER DEFAULT 0, -- 0=Draft, 1=Posted
  comp_code VARCHAR(10), -- HT, BAT, INSP, HFW
  total_amount DECIMAL(18, 2),
  remark TEXT,
  cre_date DATE,
  cre_user VARCHAR(50),
  mod_date DATE,
  mod_user VARCHAR(50),
  user_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_oe_header_customer FOREIGN KEY (cust_no) 
    REFERENCES customer(cust_no)
);

CREATE INDEX idx_oe_header_oe_no ON order_enquiry_header(oe_no);
CREATE INDEX idx_oe_header_cust_no ON order_enquiry_header(cust_no);
CREATE INDEX idx_oe_header_status ON order_enquiry_header(status);
CREATE INDEX idx_oe_header_date ON order_enquiry_header(oe_date);
```

### 3. OE Detail Table (order_enquiry_detail)

#### Original Reference
- **Legacy Table**: `moe` (DBF)
- **Purpose**: OE line items

#### Schema Definition
```sql
CREATE TABLE order_enquiry_detail (
  id SERIAL PRIMARY KEY,
  oe_no VARCHAR(50) NOT NULL,
  line_no INTEGER NOT NULL,
  item_no VARCHAR(50) NOT NULL,
  cust_no VARCHAR(50),
  qty DECIMAL(18, 4) NOT NULL,
  price DECIMAL(18, 4),
  amount DECIMAL(18, 2), -- qty * price
  unit VARCHAR(20),
  ctn INTEGER,
  head BOOLEAN DEFAULT FALSE, -- True for BOM head items
  vendor_no VARCHAR(50),
  maker VARCHAR(100),
  skn_no VARCHAR(100),
  item_desc TEXT,
  pack_pc_1 INTEGER,
  pack_desp_1 VARCHAR(50),
  pack_pc_2 INTEGER,
  pack_desp_2 VARCHAR(50),
  pack_pc_3 INTEGER,
  pack_desp_3 VARCHAR(50),
  pack_pc_4 INTEGER,
  pack_desp_4 VARCHAR(50),
  del_from DATE,
  del_to DATE,
  cost DECIMAL(18, 4),
  retail1 DECIMAL(18, 4),
  retail2 DECIMAL(18, 4),
  remark TEXT,
  comp_code VARCHAR(10),
  cre_date DATE,
  cre_user VARCHAR(50),
  mod_date DATE,
  mod_user VARCHAR(50),
  user_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_oe_detail_header FOREIGN KEY (oe_no) 
    REFERENCES order_enquiry_header(oe_no) ON DELETE CASCADE,
  CONSTRAINT fk_oe_detail_item FOREIGN KEY (item_no) 
    REFERENCES item(item_no),
  CONSTRAINT fk_oe_detail_vendor FOREIGN KEY (vendor_no) 
    REFERENCES vendor(vendor_no),
  CONSTRAINT uk_oe_detail_line UNIQUE (oe_no, line_no)
);

CREATE INDEX idx_oe_detail_oe_no ON order_enquiry_detail(oe_no);
CREATE INDEX idx_oe_detail_item_no ON order_enquiry_detail(item_no);
CREATE INDEX idx_oe_detail_vendor_no ON order_enquiry_detail(vendor_no);
CREATE INDEX idx_oe_detail_head ON order_enquiry_detail(head);
```

#### Business Rules
- `oe_no` must exist in `order_enquiry_header`
- `item_no` must exist in `item` table
- `line_no` unique per `oe_no`
- `qty` must be > 0
- `price` must be >= 0

## Implementation Steps

1. **Design Schema**
   - Review original DBF structure
   - Map relationships (header-detail)
   - Plan foreign keys
   - Plan indexes

2. **Create Migration**
   - Create migration file
   - Define all tables
   - Add foreign key constraints
   - Add indexes

3. **Run Migration**
   - Execute migration
   - Verify tables created
   - Verify constraints

4. **Create Entity/Models**
   - Create TypeORM entities or Prisma models
   - Define relationships (OneToMany, ManyToOne)
   - Add validation

5. **Test Relationships**
   - Test header-detail relationship
   - Test foreign key constraints
   - Test cascade deletes (if applicable)

6. **Documentation**
   - Document schema
   - Document relationships
   - Document business rules

## Acceptance Criteria

- [ ] All OE tables created
- [ ] Foreign key constraints working
- [ ] Indexes created
- [ ] Unique constraints working
- [ ] Entities/models created with relationships
- [ ] Can create OE header with details
- [ ] Cascade deletes work (if configured)
- [ ] Schema documented

## Relationship Diagram

```
order_enquiry_control
  └─> customer (cust_no)

order_enquiry_header
  └─> customer (cust_no)
  └─> order_enquiry_detail (oe_no) [OneToMany]

order_enquiry_detail
  └─> order_enquiry_header (oe_no) [ManyToOne]
  └─> item (item_no) [ManyToOne]
  └─> vendor (vendor_no) [ManyToOne, optional]
```

## Testing Checklist

- [ ] Tables created successfully
- [ ] Foreign keys enforced
- [ ] Can create OE header
- [ ] Can create OE details
- [ ] Cannot create detail without header
- [ ] Cannot reference non-existent item
- [ ] Cascade delete works (if configured)
- [ ] Can query with joins

## Notes

- OE Control is separate from OE Header (different purposes)
- OE Detail linked to Header via `oe_no`
- BOM items use `head` flag to identify parent items
- Consider adding trigger to calculate `amount = qty * price`
- Status field: 0=Draft, 1=Posted (from original system)

## Dependencies

- Task 03-01: Master Data Tables Schema

## Next Tasks

- Task 03-03: Reference Tables Schema

## References

- **Order Enquiry Process**: `../../../../docs/02-business-processes/order-enquiry-process.md`
- **Workflow Overview**: `../../../../docs/02-business-processes/workflow-overview.md`
- **Data Architecture**: `../../../../docs/01-data-architecture/table-details/`

