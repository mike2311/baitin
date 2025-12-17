# Task 02-02: OE Detail Grid

## Task Information

- **Phase**: 2 - Order Enquiry Module
- **Sprint**: Week 7-8
- **Priority**: Critical
- **Estimated Effort**: 3 days
- **Dependencies**: Task 02-01, Phase 0 (Data Grid)

## Objective

Implement OE Detail grid with Excel-like keyboard navigation, inline editing, item lookup, and auto-calculate totals.

## Original Logic Reference

- **Business Process**: `../../../../docs/02-business-processes/order-enquiry-process.md` (lines 276-349)
- **UX Strategy**: `../../../../docs/modernization-strategy/06-ux-ui-strategy/ux-ui-strategy.md` (lines 226-287)

## Requirements

### Grid Columns
- Item No - Lookup field
- Description - Auto-filled from item
- Quantity - Number, required, > 0
- Price - Number, required, >= 0
- Total - Auto-calculated (qty * price), read-only
- Unit - Optional
- CTN - Optional

### Features
- Excel-like keyboard navigation
- Inline editing
- Item lookup in grid (F2 on Item No column)
- Auto-fill description when item selected
- Auto-calculate total
- Add new row
- Delete row
- Copy/paste from Excel

### Validation
- Item must exist
- Quantity > 0
- Price >= 0
- Item must not be suspended

### UX Requirements
- Arrow keys navigate cells
- Tab/Enter moves to next cell
- F2 opens item lookup
- Auto-advance after item selection
- Auto-calculate on quantity/price change

## Acceptance Criteria
- [ ] Grid displays correctly
- [ ] Keyboard navigation works
- [ ] Inline editing works
- [ ] Item lookup in grid works
- [ ] Auto-calculate totals works
- [ ] Validation works
- [ ] Add/delete rows work
- [ ] Copy/paste works

