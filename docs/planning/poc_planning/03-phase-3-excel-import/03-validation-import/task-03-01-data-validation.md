# Task 03-01: Data Validation

## Task Information

- **Phase**: 3 - Excel Import
- **Sprint**: Week 10
- **Priority**: Critical
- **Estimated Effort**: 2 days
- **Dependencies**: Task 02-01, Task 02-02

## Objective

Implement comprehensive data validation for imported Excel data following original business rules.

## Original Logic Reference

- **Order Enquiry Process**: `../../../../docs/02-business-processes/order-enquiry-process.md` (lines 44-108)
- **Original Code**: `source/uoexls_2013.prg` (validation sections)

## Requirements

### Validation Rules (MUST PRESERVE)

#### OE Control Validation
- OE must have control record in `order_enquiry_control` (except INSP)
- Exception: INSP company adds "IN-" prefix automatically
- Error: "No OE Control Record" if missing

#### Customer Validation
- Customer code must exist in `customer` table
- Customer must match OE Control customer (if OE Control exists)
- Error: "Customer Not Found" or "Customer Mismatch"

#### Item Validation
- Item number must exist in `item` table
- Item must not be suspended
- Error: "Item Not Found" or "Item Suspended"

#### Data Type Validation
- OE Date: Valid date format
- Quantity: Numeric, > 0
- Price: Numeric, >= 0
- Required fields present

### Validation Process
1. Validate OE Control (per OE)
2. Validate Customer (per OE)
3. Validate Items (per row)
4. Validate data types and formats
5. Collect all errors
6. Display errors with row numbers

## Acceptance Criteria
- [ ] All validation rules implemented
- [ ] Errors collected and displayed
- [ ] Row numbers in error messages
- [ ] Validation prevents import if critical errors
- [ ] Warnings shown for non-critical issues

