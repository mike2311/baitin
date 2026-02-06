# Demo Data Setup Instructions

**Purpose:** Prepare realistic, clean demo data for PoC stakeholder demonstration.

---

## Overview

Demo data should be:
- **Realistic:** Based on actual business data patterns
- **Complete:** All required fields populated
- **Valid:** All relationships valid (items exist, customers exist)
- **Clean:** No errors or missing data
- **Resettable:** Can be quickly reset for multiple demos

---

## Demo Data Requirements

### Master Data

#### Items (20-30 items)

**Required Fields:**
- Item Number (unique)
- Description
- Standard Code (from zstdcode)
- Origin (from zorigin)
- Price
- Cost

**Sample Items:**
```
DEMO001, Demo Item 1, STD001, ORG001, 10.00, 8.00
DEMO002, Demo Item 2, STD002, ORG002, 15.00, 12.00
DEMO003, Demo Item 3, STD001, ORG001, 20.00, 16.00
...
```

**Notes:**
- Use realistic item numbers (can follow company patterns)
- Include various standard codes and origins
- Prices and costs should be realistic

---

#### Customers (5-10 customers)

**Required Fields:**
- Customer Code (unique)
- English Name
- Short Name
- Address (optional but recommended)

**Sample Customers:**
```
DEMOCUST001, Demo Customer 1, DC1, 123 Demo St, Demo City
DEMOCUST002, Demo Customer 2, DC2, 456 Test Ave, Test City
...
```

**Notes:**
- Use realistic customer codes
- Include complete address information for demo

---

#### Vendors (5-10 vendors)

**Required Fields:**
- Vendor Number (unique)
- Vendor Name
- Type (Vendor, Maker, etc.)

**Sample Vendors:**
```
DEMOVEND001, Demo Vendor 1, Vendor
DEMOVEND002, Demo Vendor 2, Maker
...
```

---

### Reference Data

#### Standard Codes (zstdcode)
- Ensure at least 3-5 standard codes exist
- Use existing reference data or create demo codes

#### Origins (zorigin)
- Ensure at least 2-3 origins exist
- Use existing reference data or create demo origins

---

### OE Control Records (3-5 records)

**Required Fields:**
- OE Number (unique)
- Customer Code (must exist)
- OE Date

**Sample OE Controls:**
```
OE-DEMO-001, DEMOCUST001, 2026-01-24
OE-DEMO-002, DEMOCUST001, 2026-01-24
OE-DEMO-003, DEMOCUST002, 2026-01-24
...
```

**Notes:**
- Create OE Controls for both manual entry and Excel import demos
- Use different customers to show variety

---

### Order Enquiry Data (2-3 OEs)

#### Manual Entry OE
- **OE Number:** `OE-DEMO-001`
- **Customer:** `DEMOCUST001`
- **Items:** 2-3 items with quantities
- **Status:** Draft or Processing

#### Excel Import OE (Optional - can be created during demo)
- **OE Number:** `OE-DEMO-002`
- **Customer:** `DEMOCUST001`
- **Items:** Multiple items from Excel file

---

### Excel Import File

**File:** `docs/demo/sample-oe-import.csv` or `docs/demo/sample-oe-import.xlsx`

**Format:** CSV_2013 or XLS_2013

**Content:**
```csv
OE Number,Item Number,Quantity,Price,Carton,PO Number
OE-DEMO-002,DEMO001,100,10.00,10,PO001
OE-DEMO-002,DEMO002,50,15.00,5,PO001
OE-DEMO-002,DEMO003,200,20.00,20,PO002
```

**Requirements:**
- OE Number must have corresponding OE Control
- Item Numbers must exist in Item Master
- Customer should match OE Control customer
- Valid data (no errors)

---

## Setup Methods

### Method 1: Using Test Data Seeder (Recommended)

**File:** `backend/src/test-utils/test-data-seeder.ts`

**Steps:**
1. Extend `TestDataSeeder` to include demo-specific data
2. Create `seedDemoData()` method
3. Run seeder before demo

**Example:**
```typescript
async seedDemoData(): Promise<void> {
  // Seed demo items
  await this.seedItems([
    { itemNo: 'DEMO001', ename: 'Demo Item 1', ... },
    // ...
  ]);

  // Seed demo customers
  await this.seedCustomers([
    { custNo: 'DEMOCUST001', ename: 'Demo Customer 1', ... },
    // ...
  ]);

  // Seed demo OE Controls
  await this.seedOeControls([
    { oeNo: 'OE-DEMO-001', custNo: 'DEMOCUST001', ... },
    // ...
  ]);
}
```

---

### Method 2: Manual Data Entry

**Steps:**
1. Use the application UI to create demo data
2. Create Items, Customers, Vendors
3. Create OE Controls
4. Create sample OEs (optional)

**Pros:**
- Shows the UI during setup
- Validates the creation process

**Cons:**
- Time-consuming
- Not repeatable easily

---

### Method 3: SQL Scripts

**Steps:**
1. Create SQL INSERT statements
2. Run scripts against demo database
3. Verify data

**Example:**
```sql
INSERT INTO item (item_no, ename, std_code, origin, price, cost, cre_date, cre_user, user_id)
VALUES ('DEMO001', 'Demo Item 1', 'STD001', 'ORG001', 10.00, 8.00, CURRENT_DATE, 'demo-user', 'demo-user');

-- Repeat for all demo data
```

---

## Reset Script

Create a script to quickly reset demo data:

**File:** `backend/src/database/seeds/reset-demo-data.ts`

**Functionality:**
1. Delete all demo OEs (OE-DEMO-*)
2. Delete all demo OE Controls (OE-DEMO-*)
3. Delete all demo items (DEMO*)
4. Delete all demo customers (DEMOCUST*)
5. Delete all demo vendors (DEMOVEND*)
6. Re-seed demo data

**Usage:**
```bash
npm run seed:demo:reset
```

---

## Verification Checklist

Before demo, verify:

- [ ] All demo items exist and are valid
- [ ] All demo customers exist and are valid
- [ ] All demo vendors exist and are valid
- [ ] OE Controls exist for demo OEs
- [ ] Reference data (standard codes, origins) exists
- [ ] Sample Excel file is ready and valid
- [ ] All relationships are valid (items in OEs exist, customers match)
- [ ] No errors in demo data
- [ ] Reset script works correctly

---

## Demo Data File Structure

```
docs/demo/
├── demo-data-setup.md          # This file
├── sample-oe-import.csv        # Sample CSV file for import
├── sample-oe-import.xlsx       # Sample Excel file for import
└── demo-data.sql              # Optional: SQL script for data setup
```

---

## Sample Data Examples

### Sample Item Data

```typescript
{
  itemNo: 'DEMO001',
  ename: 'Demo Item 1',
  sname: 'DI1',
  stdCode: 'STD001',
  origin: 'ORG001',
  price: 10.00,
  cost: 8.00,
  unit: 'PCS',
  packing: '10/CTN',
  // ... other fields
}
```

### Sample Customer Data

```typescript
{
  custNo: 'DEMOCUST001',
  ename: 'Demo Customer 1',
  sname: 'DC1',
  addr1: '123 Demo Street',
  addr2: 'Demo City',
  addr3: 'Demo State',
  addr4: '12345',
  // ... other fields
}
```

### Sample OE Control Data

```typescript
{
  oeNo: 'OE-DEMO-001',
  custNo: 'DEMOCUST001',
  oeDate: new Date('2026-01-24'),
  compCode: 'HT',
  status: 0,
  // ... other fields
}
```

---

## Notes

1. **Use Existing Patterns:** Follow existing data patterns from test data seeder
2. **Keep It Simple:** Don't over-complicate demo data
3. **Make It Realistic:** Use realistic values and relationships
4. **Document Relationships:** Document which items belong to which customers
5. **Test Import File:** Verify Excel file imports correctly before demo
6. **Backup Data:** Keep backup of demo data for quick restoration

---

## Quick Setup Commands

```bash
# Reset and seed demo data
cd backend
npm run seed:demo:reset

# Or manually using test data seeder
npm run seed:demo

# Verify data
# Check database or use application UI
```

---

**Last Updated:** January 24, 2026  
**Version:** 1.0
