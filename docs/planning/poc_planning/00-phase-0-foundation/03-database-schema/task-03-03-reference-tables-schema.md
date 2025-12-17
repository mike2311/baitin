# Task 03-03: Reference Tables Schema

## Task Information

- **Phase**: 0 - Foundation
- **Sprint**: Week 3
- **Priority**: Medium
- **Estimated Effort**: 1 day
- **Dependencies**: Task 03-01 (Master Data Tables)
- **Assignee**: Backend Developer

## Objective

Create database schema for reference/lookup tables needed for validation and data integrity in the PoC.

## Requirements

### 1. Standard Code Table (zstdcode)

#### Purpose
- Validates `item.std_code` field
- Reference data for standard codes

#### Schema Definition
```sql
CREATE TABLE zstdcode (
  id SERIAL PRIMARY KEY,
  std_code VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(200),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_zstdcode_std_code ON zstdcode(std_code);
CREATE INDEX idx_zstdcode_active ON zstdcode(active);
```

### 2. Origin Table (zorigin)

#### Purpose
- Validates `item.origin` field
- Reference data for country/region origins

#### Schema Definition
```sql
CREATE TABLE zorigin (
  id SERIAL PRIMARY KEY,
  origin VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(200),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_zorigin_origin ON zorigin(origin);
CREATE INDEX idx_zorigin_active ON zorigin(active);
```

### 3. Company Table (mcomp) - Optional

#### Purpose
- Company codes (HT, BAT, INSP, HFW)
- Company-specific configurations

#### Schema Definition
```sql
CREATE TABLE mcomp (
  id SERIAL PRIMARY KEY,
  comp_code VARCHAR(10) UNIQUE NOT NULL,
  comp_name VARCHAR(100) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  oe_prefix VARCHAR(10), -- e.g., "HT-OC/" for HT
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mcomp_comp_code ON mcomp(comp_code);
```

### 4. User Table (muser) - For Authentication

#### Purpose
- User accounts for authentication
- User roles and permissions

#### Schema Definition
```sql
CREATE TABLE muser (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL, -- Hashed password
  user_right VARCHAR(20) NOT NULL, -- SUPERVISOR, REGULAR_USER
  company_code VARCHAR(10), -- HT, BAT, INSP, HFW
  active BOOLEAN DEFAULT TRUE,
  cre_date DATE,
  cre_user VARCHAR(50),
  mod_date DATE,
  mod_user VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_company FOREIGN KEY (company_code) 
    REFERENCES mcomp(comp_code)
);

CREATE INDEX idx_muser_username ON muser(username);
CREATE INDEX idx_muser_user_right ON muser(user_right);
CREATE INDEX idx_muser_company_code ON muser(company_code);
```

## Implementation Steps

1. **Design Reference Tables**
   - Review validation requirements
   - Identify all reference data needed
   - Plan relationships

2. **Create Migration**
   - Create migration file
   - Define all reference tables
   - Add indexes

3. **Run Migration**
   - Execute migration
   - Verify tables created

4. **Seed Reference Data**
   - Seed standard codes
   - Seed origin codes
   - Seed company codes
   - Seed test users

5. **Create Entity/Models**
   - Create entities for reference tables
   - Add relationships

6. **Documentation**
   - Document reference tables
   - Document seed data

## Seed Data

### Standard Codes (zstdcode)
```sql
INSERT INTO zstdcode (std_code, description) VALUES
('STD001', 'Standard Code 1'),
('STD002', 'Standard Code 2');
-- Add more as needed
```

### Origins (zorigin)
```sql
INSERT INTO zorigin (origin, description) VALUES
('CN', 'China'),
('US', 'United States'),
('HK', 'Hong Kong');
-- Add more as needed
```

### Companies (mcomp)
```sql
INSERT INTO mcomp (comp_code, comp_name, oe_prefix) VALUES
('HT', 'Holiday Times', 'HT-OC/'),
('BAT', 'Baitin Trading', 'BTL-'),
('INSP', 'InSpirt Designs', 'IN-OC/'),
('HFW', 'Holiday Funworld', 'HFW-OC/');
```

### Users (muser)
```sql
-- Password should be hashed with bcrypt
INSERT INTO muser (username, password, user_right, company_code) VALUES
('admin', '$2b$10$hashed_password_here', 'SUPERVISOR', 'HT'),
('user1', '$2b$10$hashed_password_here', 'REGULAR_USER', 'HT');
```

## Acceptance Criteria

- [ ] All reference tables created
- [ ] Indexes created
- [ ] Seed data loaded
- [ ] Can query reference tables
- [ ] Foreign key relationships working
- [ ] Entities/models created
- [ ] Documentation complete

## Testing Checklist

- [ ] Tables created successfully
- [ ] Can insert reference data
- [ ] Can query reference data
- [ ] Foreign keys enforced
- [ ] Indexes working
- [ ] Seed data loaded correctly

## Notes

- Reference tables are typically read-only for users
- Seed data should match production data as closely as possible
- Add `active` flag for soft-delete capability
- Consider adding versioning for reference data

## Dependencies

- Task 03-01: Master Data Tables Schema
- Task 02-01: Authentication Setup (for user table)

## Next Tasks

- Task 04-01: Text Input Component

## References

- **Master Data Tables**: `../../../../docs/01-data-architecture/table-details/master-data-tables.md`
- **Validation Catalog**: `../../../../docs/04-forms-and-screens/validation-catalog.md`

