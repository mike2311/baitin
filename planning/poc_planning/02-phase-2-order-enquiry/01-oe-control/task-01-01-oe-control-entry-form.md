# Task 01-01: OE Control Entry Form

## Task Information

- **Phase**: 2 - Order Enquiry Module
- **Sprint**: Week 7
- **Priority**: Critical
- **Estimated Effort**: 1 day
- **Dependencies**: Phase 1 complete (Customer Master)

## Objective

Implement OE Control entry form for creating and managing OE Control records required before OE import/creation.

## Original Logic Reference

- **Business Process**: `../../../../docs/02-business-processes/order-enquiry-process.md` (lines 351-410)
- **Validation**: OE Control must exist before OE import (except INSP company)

## Requirements

### Fields
- OE Number (`oe_no`) - Primary key, unique
- Customer Number (`cust_no`) - Lookup, required
- OE Date (`oe_date`) - Required
- PO Number (`po_no`) - Optional
- Status - Optional
- Remarks - Optional

### Validation
- `oe_no` must be unique
- Customer must exist
- Required for OE import (except INSP)

### Business Rules
- INSP company: Automatically adds "IN-" prefix, bypasses OE Control check
- Other companies: Must have OE Control record before OE creation

## Acceptance Criteria
- [ ] Form displays all fields
- [ ] Validation works
- [ ] Customer lookup integrated
- [ ] CRUD operations work

## References
- **Order Enquiry Process**: `../../../../docs/02-business-processes/order-enquiry-process.md`

