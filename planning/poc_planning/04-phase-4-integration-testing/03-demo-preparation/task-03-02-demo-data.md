# Task 03-02: Demo Data Preparation

## Task Information

- **Phase**: 4 - Integration and Testing
- **Sprint**: Week 12
- **Priority**: High
- **Estimated Effort**: 1 day
- **Dependencies**: All modules complete

## Objective

Prepare realistic, clean demo data for stakeholder demonstration.

## Demo Data Requirements

### Master Data
- **Items**: 20-30 sample items
  - Various item types
  - Different origins
  - Different standard codes
  - Complete data (price, cost, packing info)

- **Customers**: 5-10 sample customers
  - Complete address information
  - Contact details

- **Vendors**: 5-10 sample vendors
  - Different types (Vendor, Maker)
  - Complete information

### Reference Data
- Standard codes (zstdcode)
- Origins (zorigin)
- Companies (mcomp)

### OE Control
- 3-5 OE Control records
  - Different customers
  - Different dates

### OE Data
- 2-3 Order Enquiries
  - One manually entered
  - One imported from Excel
  - Multiple items per OE
  - Complete data

### Excel Import File
- Sample Excel file for import demo
  - Standard format
  - Valid data
  - Multiple items
  - Ready for import

## Data Quality
- Realistic data (not dummy/test data)
- Complete data (no missing required fields)
- Valid relationships (items exist, customers exist)
- Clean data (no errors)

## Acceptance Criteria
- [ ] Demo data prepared
- [ ] Data is realistic
- [ ] All relationships valid
- [ ] Excel file ready
- [ ] Data can be reset quickly

## Notes
- Prepare reset script to reload demo data
- Keep backup of demo data
- Document data structure
- Ensure data demonstrates all features

