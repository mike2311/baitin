# Indexes and Keys

## Index Overview

The system uses **CDX (Compound Index)** files for fast lookups and sorting. Each DBF table can have one CDX file containing multiple index tags.

## Index Management

### Reindexing Process

**Utility:** `zdoc.prg`

**Process:**
1. Opens each table in EXCLUSIVE mode
2. Executes `REINDEX` command
3. Rebuilds all indexes in CDX file

**Tables Reindexed:**
- `loe` - Legacy OE
- `moehd` - OE Header
- `moectrl` - OE Control
- `moe` - OE Detail
- `mordhd` - OC Header
- `morddt` - OC Detail
- `mconthd` - Contract Header
- `mcontdt` - Contract Detail
- `mso` - Shipping Order
- `minvhd` - Invoice Header
- `minvdt` - Invoice Detail

**Code Reference:** `zdoc.prg` (lines 1-43)

## Primary Keys (Manual)

### Transaction Tables

**Order Enquiry:**
- `moehd.oe_no` - Primary key
- `moe.oe_no` + `moe.item_no` - Composite key (inferred)

**Order Confirmation:**
- `mordhd.conf_no` - Primary key
- `morddt.conf_no` + `morddt.item_no` - Composite key (inferred)

**Contract:**
- `mconthd.cont_no` - Primary key
- `mcontdt.cont_no` + `mcontdt.item_no` - Composite key (inferred)

**Shipping Order:**
- `mso.so_no` - Primary key (inferred)

**Invoice:**
- `minvhd.inv_no` - Primary key
- `minvdt.inv_no` + `minvdt.item_no` - Composite key (inferred)

### Master Data Tables

**Items:**
- `mitem.item_no` - Primary key

**Customers:**
- `mcustom.cust_no` - Primary key

**Vendors:**
- `mvendor.vendor_no` - Primary key

## Index Structures (Inferred from Code)

### Order Enquiry Indexes

**moehd:**
- `oe_no` - Primary index (used in `uoexls_2013.prg` line 197)

**moectrl:**
- `OE_NO` - Primary index (used in `uoexls_2013.prg` line 149)

**moe:**
- `oe_no` - Primary index
- `item_no` - Secondary index (for item lookups)
- `cust_no` - Secondary index (for customer lookups)
- `vendor_no` - Secondary index (for vendor lookups)

**Code Reference:**
```foxpro
select mitem
set order to item_no

select moectrl
set order to OE_NO
seek w_oe_no

select moehd
set order to oe_no
seek w_oe_no
```

### Order Confirmation Indexes

**mordhd:**
- `conf_no` - Primary index

**morddt:**
- `conf_no` - Primary index (used in `uordcont.prg` line 16)
- `item_no` - Secondary index
- `oe_no` - Secondary index (for OE linking)

**Code Reference:**
```foxpro
select morddt
locate for alltrim(morddt.conf_no)==alltrim(voe1.oc_no) and alltrim(morddt.item_no)==alltrim(voe1.item_no)
```

### Contract Indexes

**mconthd:**
- `cont_no` - Primary index

**mcontdt:**
- `cont_no` - Primary index (used in `uwcontract.prg` line 22)
- `conf_no` - Secondary index
- `item_no` - Secondary index

**Code Reference:**
```foxpro
FROM  baitin!mconthd INNER JOIN baitin!mcontdt 
   ON  mconthd.cont_no = mcontdt.cont_no
```

### Master Data Indexes

**mitem:**
- `item_no` - Primary index (used in `uoexls_2013.prg` line 28, `xitem.prg`)

**mcustom:**
- `cust_no` - Primary index (used in `uoexls_2013.prg` line 186, `xcustom.prg`)

**mvendor:**
- `vendor_no` - Primary index (used in `xvendor.prg`)

**mprodbom:**
- `iprodbom` - Composite index on `item_no` + `sub_item` (used in `uoexls_2013.prg` line 86)

**Code Reference:**
```foxpro
select mitem
set order to item_no

select mprodbom
set order to iprodbom
```

### Supporting Table Indexes

**mqtybrk:**
- `oe_no` + `item_no` - Composite index

**mskn:**
- `skn_no` - Primary index

**zstdcode:**
- `std_code` - Primary index (used in `xitem.prg` line 60)

**Code Reference:**
```foxpro
SELECT  zstdcode
locate for alltrim(zstdcode.STD_desp) == alltrim(ITEM.STDNAME)
```

## Search Patterns

### Lookup Operations

**Customer Lookup:**
```foxpro
select mcustom
locate for alltrim(mcustom.cust_no)== alltrim(w_cust_no)
```

**Item Lookup:**
```foxpro
select mitem
set order to item_no
seek item_no
```

**OE Control Lookup:**
```foxpro
select moectrl
set order to OE_NO
seek w_oe_no
```

### Join Operations

**Contract Join:**
```foxpro
SELECT mconthd.cont_no, mconthd.conf_no, ...
FROM  baitin!mconthd INNER JOIN baitin!mcontdt 
   ON  mconthd.cont_no = mcontdt.cont_no
```

**BOM Lookup:**
```foxpro
select mprodbom
locate for alltrim(mprodbom.item_no)==alltrim(w_head_item) and;
            alltrim(mprodbom.sub_item)==alltrim(morddt.item_no)
```

## Performance-Critical Indexes

### High-Volume Lookups

1. **OE Import:**
   - `moectrl.OE_NO` - Validates OE Control
   - `mitem.item_no` - Validates items
   - `mcustom.cust_no` - Validates customers

2. **Post OE to OC:**
   - `moe.oe_no` - Retrieves OE details
   - `mitem.item_no` - Item lookups

3. **Contract Generation:**
   - `morddt.conf_no` - Retrieves OC details
   - `mvendor.vendor_no` - Vendor grouping

4. **Invoice Creation:**
   - `mso.so_no` - Retrieves SO details
   - `minvhd.inv_no` - Invoice header

### Date Range Queries

**Inferred indexes for date filtering:**
- `moehd.oe_date`
- `mordhd.date`
- `mconthd.date`
- `minvhd.date`

**Usage Pattern:**
```foxpro
SELECT ... WHERE date BETWEEN date_from AND date_to
```

## Index Maintenance

### When to Reindex

1. **After Bulk Data Import:**
   - Excel imports
   - Data conversion
   - Mass updates

2. **After Data Conversion:**
   - Vendor code changes
   - Item number changes
   - Customer number changes

3. **Periodic Maintenance:**
   - Weekly/monthly reindexing
   - After system errors
   - When performance degrades

### Reindexing Process

**Exclusive Access Required:**
- Tables must be opened EXCLUSIVE
- Other users cannot access during reindex
- Process shown in `zdoc.prg`

**Code Pattern:**
```foxpro
USE moe EXCLUSIVE
REINDEX
```

## Index Corruption

### Symptoms
- Slow queries
- Incorrect results
- "Index not found" errors
- Data inconsistencies

### Resolution
- Run `zdoc.prg` reindex utility
- Rebuild all indexes
- Verify data integrity

## Foreign Key Indexes (Manual)

### Transaction to Master Data

**OE to Customer:**
- `moehd.cust_no` → `mcustom.cust_no`
- Index on `moehd.cust_no` for fast lookup

**OE to Item:**
- `moe.item_no` → `mitem.item_no`
- Index on `moe.item_no` for fast lookup

**Contract to Vendor:**
- `mconthd.vendor_no` → `mvendor.vendor_no`
- Index on `mconthd.vendor_no` for fast lookup

### Transaction Linking

**OE to OC:**
- `morddt.oe_no` → `moe.oe_no`
- Index on `morddt.oe_no` for linking

**OC to Contract:**
- `mcontdt.conf_no` → `mordhd.conf_no`
- Index on `mcontdt.conf_no` for linking

**SO to Invoice:**
- `minvdt.so_no` → `mso.so_no`
- Index on `minvdt.so_no` for linking

## Summary

### Index Strategy

1. **Primary Keys:** Indexed on all tables
2. **Foreign Keys:** Indexed for fast lookups
3. **Search Fields:** Indexed on frequently searched fields
4. **Date Fields:** Indexed for range queries
5. **Composite Keys:** Indexed for header/detail relationships

### Maintenance Requirements

- Regular reindexing after bulk operations
- Exclusive access during reindex
- Monitor for index corruption
- Verify index performance

### Migration Considerations

- CDX indexes need recreation in SQL
- SQL indexes will improve performance
- Foreign key indexes become actual constraints
- Composite indexes map to SQL composite indexes



