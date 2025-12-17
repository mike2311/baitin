# Task 02-01: OE Header Form

## Task Information

- **Phase**: 2 - Order Enquiry Module
- **Sprint**: Week 7
- **Priority**: Critical
- **Estimated Effort**: 1 day
- **Dependencies**: Task 01-01 (OE Control)

## Objective

Implement OE Header form for Order Enquiry header information.

## Requirements

### Fields
- OE Number (`oe_no`) - Lookup or enter, must have OE Control
- OE Date (`oe_date`)
- Customer (`cust_no`) - Lookup, required
- PO Number (`po_no`) - Optional
- Status - Default: Draft

### Validation
- OE Control must exist (except INSP)
- Customer must match OE Control customer (if OE Control exists)
- Customer must exist

### UX
- Keyboard navigation
- Customer lookup (F2)
- Auto-advance fields

## Acceptance Criteria
- [ ] Form displays correctly
- [ ] OE Control validation works
- [ ] Customer lookup works
- [ ] Validation rules enforced

