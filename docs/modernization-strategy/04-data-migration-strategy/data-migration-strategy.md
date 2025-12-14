# Data Migration Strategy

## Overview

This document outlines the comprehensive strategy for migrating data from the legacy Visual FoxPro DBF file-based database to the modern PostgreSQL relational database. The migration involves 186 tables, complex relationships, and large data volumes (some tables > 100MB).

## Migration Objectives

### Primary Objectives
1. **Zero Data Loss:** 100% data migration with no data loss
2. **Data Integrity:** Maintain referential integrity and business rules
3. **Minimal Downtime:** Minimize business disruption during migration
4. **Verification:** Comprehensive validation and reconciliation
5. **Rollback Capability:** Ability to rollback if issues occur

### Secondary Objectives
1. **Performance:** Optimized migration process
2. **Documentation:** Complete migration documentation
3. **Audit Trail:** Track all migration activities
4. **Data Quality:** Identify and fix data quality issues

## Migration Approach

### Phased Migration Strategy

#### Option A: Big-Bang Migration (Recommended for PoC/MVP)
- **Approach:** Migrate all data in single cutover
- **Timeline:** 1-2 days downtime
- **Pros:** Simpler, faster, single validation point
- **Cons:** Higher risk, requires extensive testing
- **Use Case:** PoC, MVP, or when business can accept downtime

#### Option B: Phased Module Migration
- **Approach:** Migrate by module (Master Data → OE → OC → etc.)
- **Timeline:** 2-4 weeks with parallel run
- **Pros:** Lower risk, incremental validation
- **Cons:** More complex, longer timeline, dual maintenance
- **Use Case:** Production migration with minimal risk tolerance

**Recommendation:** Start with Big-Bang for PoC/MVP, consider Phased for production cutover.

## Data Mapping Strategy

### Table Mapping

#### Transaction Tables (Header/Detail Pattern)

##### Order Enquiry
| Legacy Table | New Table | Key Mapping |
|-------------|-----------|-------------|
| `moehd` | `order_enquiry_header` | `oe_no` → `oe_no` (unique) |
| `moe` | `order_enquiry_detail` | `oe_no` + `item_no` → `header_id` + `item_no` |
| `moectrl` | `order_enquiry_control` | `oe_no` → `oe_no` (unique) |
| `mqtybrk` | `order_enquiry_quantity_breakdown` | `oe_no` + `item_no` → foreign keys |
| `moebom` | `order_enquiry_bom` | `oe_no` + `item_no` → foreign keys |

##### Order Confirmation
| Legacy Table | New Table | Key Mapping |
|-------------|-----------|-------------|
| `mordhd` | `order_confirmation_header` | `conf_no` → `conf_no` (unique) |
| `morddt` | `order_confirmation_detail` | `conf_no` + `item_no` → `header_id` + `item_no` |

##### Contract
| Legacy Table | New Table | Key Mapping |
|-------------|-----------|-------------|
| `mconthd` | `contract_header` | `cont_no` → `cont_no` (unique) |
| `mcontdt` | `contract_detail` | `cont_no` + `item_no` → `header_id` + `item_no` |

##### Shipping Order
| Legacy Table | New Table | Key Mapping |
|-------------|-----------|-------------|
| `mso` | `shipping_order` | `so_no` → `so_no` (unique) |

##### Delivery Note
| Legacy Table | New Table | Key Mapping |
|-------------|-----------|-------------|
| `mdnhd` | `delivery_note_header` | `dn_no` → `dn_no` (unique) |
| `mdndt` | `delivery_note_detail` | `dn_no` + `item_no` → `header_id` + `item_no` |
| `mdnbrk` | `delivery_note_breakdown` | `dn_no` + `item_no` → foreign keys |

##### Invoice
| Legacy Table | New Table | Key Mapping |
|-------------|-----------|-------------|
| `minvhd` | `invoice_header` | `inv_no` → `inv_no` (unique) |
| `minvdt` | `invoice_detail` | `inv_no` + `item_no` → `header_id` + `item_no` |

#### Master Data Tables

##### Items
| Legacy Table | New Table | Key Mapping |
|-------------|-----------|-------------|
| `mitem` | `item` | `item_no` → `item_no` (unique) |
| `mitemmftr` | `item_manufacturer` | `item_no` + `mftr_no` → foreign keys |
| `mitemven` | `item_vendor` | `item_no` + `vendor_no` → foreign keys |
| `mprodbom` | `product_bom` | `item_no` + `sub_item` → foreign keys |

##### Customers
| Legacy Table | New Table | Key Mapping |
|-------------|-----------|-------------|
| `mcustom` | `customer` | `cust_no` → `cust_no` (unique) |

##### Vendors
| Legacy Table | New Table | Key Mapping |
|-------------|-----------|-------------|
| `mvendor` | `vendor` | `vendor_no` → `vendor_no` (unique) |
| `zmftr` | `manufacturer` | `mftr_no` → `mftr_no` (unique) |

#### Reference/Lookup Tables

| Legacy Table | New Table | Key Mapping |
|-------------|-----------|-------------|
| `zstdcode` | `standard_code` | `std_code` → `std_code` (unique) |
| `zorigin` | `country_of_origin` | `origin_code` → `origin_code` (unique) |
| `zfobport` | `fob_port` | `port_code` → `port_code` (unique) |
| `zpayterm` | `payment_term` | `payterm_code` → `payterm_code` (unique) |
| `zfobterm` | `fob_term` | `fobterm_code` → `fobterm_code` (unique) |
| `zcurcode` | `currency_code` | `cur_code` → `cur_code` (unique) |

### Field Mapping

#### Data Type Conversions

| FoxPro Type | PostgreSQL Type | Notes |
|-------------|----------------|-------|
| Character (C) | VARCHAR(n) or TEXT | Based on field length |
| Numeric (N) | DECIMAL(p,s) or INTEGER | Based on precision |
| Date (D) | DATE | Direct mapping |
| DateTime (T) | TIMESTAMP | Direct mapping |
| Logical (L) | BOOLEAN | .T. → true, .F. → false |
| Memo (M) | TEXT or JSONB | FPT file content |

#### Special Field Handling

##### Memo Fields (FPT Files)
- **Strategy:** Extract memo content from FPT files
- **Storage:** TEXT type in PostgreSQL
- **Large Memos:** Use TEXT (unlimited) or JSONB for structured data
- **Examples:**
  - `mitem.desp` (24MB) → `item.description` (TEXT)
  - `mcustom` notes → `customer.notes` (TEXT)
  - `mcontdt` details (75MB) → `contract_detail.remarks` (TEXT)

##### Date Fields
- **Format:** Convert from FoxPro date format to PostgreSQL DATE
- **Validation:** Check for valid dates, handle invalid dates
- **Null Handling:** Empty dates → NULL

##### Numeric Fields
- **Precision:** Preserve decimal precision
- **Validation:** Check for valid numbers, handle invalid values
- **Null Handling:** Empty numerics → NULL or 0 (based on business rules)

##### Character Fields
- **Encoding:** Handle character encoding (UTF-8)
- **Trimming:** Trim whitespace
- **Null Handling:** Empty strings → NULL or '' (based on business rules)

### Relationship Mapping

#### Foreign Key Relationships

##### Order Enquiry Relationships
```sql
-- Header to Detail
order_enquiry_detail.header_id → order_enquiry_header.id

-- Detail to Master Data
order_enquiry_detail.item_no → item.item_no
order_enquiry_header.cust_no → customer.cust_no

-- Control to Header
order_enquiry_control.oe_no → order_enquiry_header.oe_no

-- Breakdown to Detail
order_enquiry_quantity_breakdown.oe_no → order_enquiry_header.oe_no
order_enquiry_quantity_breakdown.item_no → order_enquiry_detail.item_no
```

##### Order Confirmation Relationships
```sql
-- Header to Detail
order_confirmation_detail.header_id → order_confirmation_header.id

-- Detail to OE
order_confirmation_detail.oe_no → order_enquiry_header.oe_no

-- Detail to Master Data
order_confirmation_detail.item_no → item.item_no
order_confirmation_header.cust_no → customer.cust_no
```

##### Contract Relationships
```sql
-- Header to Detail
contract_detail.header_id → contract_header.id

-- Contract to OC
contract_header.conf_no → order_confirmation_header.conf_no

-- Detail to Master Data
contract_detail.item_no → item.item_no
contract_detail.vendor_no → vendor.vendor_no
```

## Migration Process

### Phase 1: Preparation

#### 1.1 Data Assessment
- **Inventory:** Complete inventory of all 186 tables
- **Data Volume:** Calculate data volumes per table
- **Data Quality:** Identify data quality issues
- **Dependencies:** Map table dependencies

#### 1.2 Schema Design
- **Database Schema:** Design PostgreSQL schema
- **Indexes:** Plan indexes for performance
- **Constraints:** Define foreign keys, check constraints
- **Migrations:** Create database migration scripts

#### 1.3 Migration Tools Development
- **ETL Pipeline:** Develop extraction, transformation, load pipeline
- **Validation Tools:** Data validation and reconciliation tools
- **Monitoring:** Migration progress monitoring

### Phase 2: Extraction

#### 2.1 DBF File Reading
- **Tool:** Use DBF library (e.g., `dbf` npm package, `dbfread` Python, or custom .NET library)
- **Process:** Read all DBF files from `C:\batwork`
- **Output:** Raw data in structured format (CSV, JSON, or direct database insert)

#### 2.2 FPT File Reading
- **Tool:** Use FPT library or custom parser
- **Process:** Read memo content from FPT files
- **Mapping:** Map memo content to corresponding DBF records
- **Output:** Memo content linked to records

#### 2.3 Data Extraction Script
```python
# Example extraction script structure
for table_name in table_list:
    # Read DBF file
    dbf_data = read_dbf(f"C:\\batwork\\{table_name}.dbf")
    
    # Read FPT file if exists
    if exists(f"C:\\batwork\\{table_name}.fpt"):
        memo_data = read_fpt(f"C:\\batwork\\{table_name}.fpt")
        merge_memos(dbf_data, memo_data)
    
    # Export to staging format
    export_to_staging(dbf_data, table_name)
```

### Phase 3: Transformation

#### 3.1 Data Cleaning
- **Trim Whitespace:** Remove leading/trailing spaces
- **Normalize Encoding:** Convert to UTF-8
- **Fix Invalid Data:** Handle invalid dates, numbers, etc.
- **Deduplicate:** Identify and handle duplicates

#### 3.2 Data Transformation
- **Type Conversion:** Convert FoxPro types to PostgreSQL types
- **Date Formatting:** Convert date formats
- **Null Handling:** Handle empty values appropriately
- **Relationship Mapping:** Map manual relationships to foreign keys

#### 3.3 Business Rule Application
- **Validation:** Apply business rules
- **Calculations:** Calculate derived fields
- **Defaults:** Apply default values where appropriate

### Phase 4: Loading

#### 4.1 Staging Area
- **Purpose:** Load data to staging tables first
- **Benefits:** Validation before production, ability to retry
- **Structure:** Mirror production schema

#### 4.2 Load Sequence
1. **Reference Data:** Load lookup tables first
2. **Master Data:** Load items, customers, vendors
3. **Transaction Headers:** Load OE, OC, Contract headers
4. **Transaction Details:** Load detail records
5. **Supporting Data:** Load breakdowns, BOMs, etc.

#### 4.3 Load Process
```sql
-- Example load process
BEGIN TRANSACTION;

-- Load reference data
INSERT INTO standard_code SELECT * FROM staging.standard_code;

-- Load master data
INSERT INTO item SELECT * FROM staging.item;
INSERT INTO customer SELECT * FROM staging.customer;
INSERT INTO vendor SELECT * FROM staging.vendor;

-- Load transaction headers
INSERT INTO order_enquiry_header SELECT * FROM staging.order_enquiry_header;

-- Load transaction details
INSERT INTO order_enquiry_detail SELECT * FROM staging.order_enquiry_detail;

COMMIT;
```

### Phase 5: Validation and Reconciliation

#### 5.1 Record Count Validation
```sql
-- Compare record counts
SELECT 
    'moehd' as legacy_table,
    COUNT(*) as legacy_count
FROM legacy.moehd
UNION ALL
SELECT 
    'order_enquiry_header' as new_table,
    COUNT(*) as new_count
FROM order_enquiry_header;
```

#### 5.2 Data Integrity Validation
- **Foreign Keys:** Verify all foreign keys are valid
- **Required Fields:** Check required fields are populated
- **Business Rules:** Validate business rules are satisfied

#### 5.3 Data Accuracy Validation
- **Sample Comparison:** Compare sample records
- **Total Validation:** Compare totals (quantities, amounts)
- **Key Field Validation:** Verify key fields match

#### 5.4 Reconciliation Report
- **Summary:** Overall migration statistics
- **Issues:** List of data quality issues
- **Recommendations:** Recommendations for fixing issues

## Migration Tools

### ETL Pipeline

#### Option A: Custom .NET Application
- **Language:** C# (.NET)
- **DBF Library:** Custom library or third-party
- **Database:** Entity Framework Core for PostgreSQL
- **Benefits:** Type safety, performance, integration with backend

#### Option B: Python Script
- **Language:** Python
- **DBF Library:** `dbfread` or `dbf` package
- **Database:** `psycopg2` or SQLAlchemy
- **Benefits:** Rapid development, good libraries

#### Option C: Commercial ETL Tool
- **Tools:** Talend, Informatica, SSIS
- **Benefits:** GUI-based, built-in connectors
- **Cons:** Cost, learning curve

**Recommendation:** Custom .NET application for control and integration.

### Migration Script Structure

```
migration/
├── extract/
│   ├── dbf-reader.cs        # DBF file reader
│   ├── fpt-reader.cs        # FPT file reader
│   └── extractor.cs         # Main extraction logic
├── transform/
│   ├── data-cleaner.cs      # Data cleaning
│   ├── type-converter.cs    # Type conversion
│   └── transformer.cs       # Main transformation logic
├── load/
│   ├── staging-loader.cs    # Load to staging
│   ├── production-loader.cs # Load to production
│   └── loader.cs            # Main load logic
├── validate/
│   ├── record-counter.cs    # Record count validation
│   ├── integrity-checker.cs # Integrity validation
│   └── reconciler.cs       # Reconciliation
└── main/
    └── migration-orchestrator.cs # Main migration orchestrator
```

## Data Quality Strategy

### Data Quality Issues

#### Known Issues
1. **Orphaned Records:** Detail records without headers
2. **Invalid References:** Invalid customer/item/vendor codes
3. **Missing Required Fields:** Empty required fields
4. **Invalid Data:** Invalid dates, negative quantities
5. **Duplicates:** Duplicate OE/OC/Invoice numbers

### Data Quality Rules

#### Validation Rules
- **Required Fields:** All required fields must be populated
- **Data Types:** Values must match expected data types
- **Ranges:** Numeric values within valid ranges
- **Formats:** Dates, codes in correct format
- **Relationships:** All foreign keys must be valid

#### Data Quality Checks
```sql
-- Example data quality checks
-- Check for orphaned detail records
SELECT COUNT(*) 
FROM order_enquiry_detail d
LEFT JOIN order_enquiry_header h ON d.header_id = h.id
WHERE h.id IS NULL;

-- Check for invalid item references
SELECT COUNT(*)
FROM order_enquiry_detail d
LEFT JOIN item i ON d.item_no = i.item_no
WHERE i.item_no IS NULL;

-- Check for missing required fields
SELECT COUNT(*)
FROM order_enquiry_header
WHERE oe_no IS NULL OR cust_no IS NULL;
```

### Data Quality Fixes

#### Pre-Migration Fixes
- **Identify Issues:** Run data quality checks
- **Fix Issues:** Fix issues in source system (if possible)
- **Document:** Document all fixes

#### Migration-Time Fixes
- **Default Values:** Apply defaults for missing required fields
- **Data Cleaning:** Clean invalid data during transformation
- **Flag Issues:** Flag data quality issues for review

## Cutover Strategy

### Pre-Cutover

#### Final Validation
- **Data Validation:** Complete data validation
- **Reconciliation:** Final reconciliation report
- **User Acceptance:** User acceptance testing
- **Backup:** Complete backup of legacy system

#### Preparation
- **Communication:** Notify all users
- **Training:** Complete user training
- **Support:** Prepare support team
- **Rollback Plan:** Prepare rollback procedures

### Cutover Execution

#### Option A: Big-Bang Cutover
1. **Stop Legacy System:** Stop all users from accessing legacy system
2. **Final Data Extract:** Extract final data snapshot
3. **Data Migration:** Execute migration
4. **Validation:** Validate migrated data
5. **Go Live:** Enable new system
6. **Monitor:** Monitor for issues

#### Option B: Phased Cutover
1. **Module 1:** Migrate and enable first module
2. **Validation:** Validate first module
3. **Module 2:** Migrate and enable next module
4. **Repeat:** Continue for all modules
5. **Final Cutover:** Complete cutover

### Post-Cutover

#### Monitoring
- **Data Validation:** Continuous data validation
- **Performance:** Monitor system performance
- **User Feedback:** Collect user feedback
- **Issue Tracking:** Track and resolve issues

#### Support
- **Help Desk:** Enhanced support during transition
- **Documentation:** User guides and FAQs
- **Training:** Additional training as needed

## Rollback Strategy

### Rollback Triggers
- **Critical Data Loss:** Significant data loss detected
- **System Failure:** System failure preventing operations
- **User Rejection:** Users cannot use new system
- **Business Impact:** Significant negative business impact

### Rollback Procedure
1. **Stop New System:** Immediately stop new system
2. **Restore Legacy:** Restore legacy system access
3. **Data Recovery:** Recover any data changes made in new system
4. **Communication:** Notify all stakeholders
5. **Root Cause:** Analyze root cause of rollback
6. **Remediation:** Fix issues before retry

### Rollback Testing
- **Test Rollback:** Test rollback procedure
- **Documentation:** Document rollback steps
- **Training:** Train team on rollback procedure

## Migration Timeline

### Phase 1: Preparation (Weeks 1-4)
- Data assessment
- Schema design
- Migration tools development
- Test migration on sample data

### Phase 2: Development Migration (Weeks 5-8)
- Full migration in development environment
- Validation and reconciliation
- Fix issues and refine process

### Phase 3: Test Migration (Weeks 9-12)
- Migration in test environment
- User acceptance testing
- Performance testing
- Final validation

### Phase 4: Production Cutover (Week 13)
- Production migration execution
- Validation
- Go live
- Monitoring and support

**Total Timeline:** ~13 weeks from start to production cutover

## Success Criteria

### Migration Success Metrics
- ✅ 100% of records migrated
- ✅ Zero data loss
- ✅ All foreign keys valid
- ✅ All business rules satisfied
- ✅ Reconciliation report shows 100% match
- ✅ User acceptance testing passed
- ✅ Performance meets targets

## Summary

The data migration strategy provides a comprehensive approach to migrating 186 tables from Visual FoxPro DBF files to PostgreSQL. The strategy emphasizes data integrity, validation, and minimal business disruption. The phased approach allows for thorough testing and validation before production cutover.

## Next Steps

1. **Develop Migration Tools:** Build ETL pipeline
2. **Test on Sample Data:** Validate approach with sample data
3. **Design Database Schema:** Finalize PostgreSQL schema
4. **Plan Cutover:** Detailed cutover planning
5. **Execute Migration:** Begin migration process

## Document References

- **Target Architecture:** `../03-target-state-architecture/`
- **Application Modernization:** `../05-application-modernization/`
- **Phased Delivery Plan:** `../11-phased-delivery-plan/`
