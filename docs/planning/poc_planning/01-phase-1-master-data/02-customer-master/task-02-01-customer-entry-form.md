# Task 02-01: Customer Entry Form

## Task Information

- **Phase**: 1 - Master Data Module
- **Sprint**: Week 6
- **Priority**: High
- **Estimated Effort**: 2 days
- **Dependencies**: Phase 0 complete, Item Master tasks as reference
- **Assignee**: Frontend + Backend Developers

## Objective

Implement Customer Master entry form with CRUD operations, preserving all original validation rules.

## Original Logic Reference

### Documentation References
- **Business Process**: `../../../../docs/02-business-processes/master-data-management.md` (lines 164-290)
- **Data Architecture**: `../../../../docs/01-data-architecture/table-details/master-data-tables.md`
- **Validation Rules**: `../../../../docs/04-forms-and-screens/validation-catalog.md` (lines 57-67)

## Requirements

### Fields
- Customer Number (`cust_no`) - Primary key, unique
- English Name (`ename`)
- Short Name (`sname`)
- Chinese Name (`cname`) - Optional
- Address (`addr1-4`)
- Contact Name (`cont_name`)
- Telephones (`tel`, `tel2`)
- Fax (`fax`, `fax2`)
- Email (`email`)
- Show Sub Item Detail (`show_sub_item_detail`) - Boolean

### Validation Rules
- `cust_no` must be unique
- Customer name required
- Error messages match original system

### UX Requirements
- Keyboard-first navigation
- Auto-advance on Enter
- F2 for customer lookup
- Inline validation

## Acceptance Criteria
- [ ] Form displays all fields
- [ ] Validation rules implemented
- [ ] Keyboard navigation works
- [ ] CRUD operations work
- [ ] Audit fields set correctly

