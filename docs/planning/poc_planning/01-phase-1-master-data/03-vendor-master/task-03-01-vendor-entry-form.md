# Task 03-01: Vendor Entry Form

## Task Information

- **Phase**: 1 - Master Data Module
- **Sprint**: Week 6
- **Priority**: High
- **Estimated Effort**: 2 days
- **Dependencies**: Phase 0 complete

## Objective

Implement Vendor Master entry form with CRUD operations.

## Original Logic Reference
- **Business Process**: `../../../../docs/02-business-processes/master-data-management.md` (lines 291-363)
- **Validation Rules**: `../../../../docs/04-forms-and-screens/validation-catalog.md` (lines 68-74)

## Requirements

### Fields
- Vendor Number (`vendor_no`) - Primary key, unique
- English Name (`ename`)
- Short Name (`sname`)
- Address (`addr1-4`)
- Contact Name (`cont_name`)
- Telephones (`tel`, `tel2`)
- Fax (`fax`, `fax2`)
- Type (`type`) - 1=Vendor, 2=Maker

### Validation
- `vendor_no` must be unique
- Type must be 1 or 2

## Acceptance Criteria
- [ ] Form displays all fields
- [ ] Validation works
- [ ] CRUD operations work

