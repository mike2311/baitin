# Phase 2: Order Enquiry Module

## Overview

Phase 2 implements the Order Enquiry (OE) module, which is the entry point of the trading workflow. This includes OE Control, OE Manual Entry with detail grid, and OE Enquiry List.

## Duration

**Weeks 8-9** (2 weeks)

## Objectives

1. Implement OE Control management
2. Implement OE Manual Entry with header and detail grid
3. Implement OE Enquiry List with search/filter
4. Demonstrate Excel-like grid navigation
5. Implement auto-save functionality
6. Preserve all original business logic and validation

## Scope

### In Scope
- OE Control: Create, search, view, validation
- OE Manual Entry: Header form, detail grid, item lookup, auto-save
- OE Enquiry List: Search, filter, view details
- Basic validation (OE Control requirement, customer matching)

### Out of Scope
- Quantity breakdown (deferred to MVP)
- BOM processing (deferred to MVP)
- Post OE to OC (deferred to MVP)
- Advanced Excel formats (only single format in PoC)
- Printing (deferred)

## Deliverables

### Week 7: OE Control and OE Entry
- OE Control create/search
- OE Entry header form
- OE Entry detail grid
- Item lookup in grid
- Auto-save

### Week 8: OE Enquiry List and Integration
- OE Enquiry List
- Search and filtering
- View OE details
- Integration and testing

## Success Criteria

- [ ] OE Control functional
- [ ] OE Entry functional with grid
- [ ] Keyboard navigation works in grid
- [ ] Auto-save works
- [ ] All validation rules implemented
- [ ] OE Enquiry List functional

## Dependencies

- Phase 0 complete (database schema created)
- Phase 1 complete (master data available)
- Phase 1.5 complete (legacy data migrated and validated in PostgreSQL)

## Tasks

### 01: OE Control
- [Task 01-01](01-oe-control/task-01-01-oe-control-entry-form.md): OE Control Entry Form
- [Task 01-02](01-oe-control/task-01-02-oe-control-search.md): OE Control Search

### 02: OE Manual Entry
- [Task 02-01](02-oe-manual-entry/task-02-01-oe-header-form.md): OE Header Form
- [Task 02-02](02-oe-manual-entry/task-02-02-oe-detail-grid.md): OE Detail Grid
- [Task 02-03](02-oe-manual-entry/task-02-03-oe-auto-save.md): Auto-Save Functionality

### 03: OE Enquiry List
- [Task 03-01](03-oe-enquiry-list/task-03-01-oe-list-view.md): OE List View
- [Task 03-02](03-oe-enquiry-list/task-03-02-oe-search-filter.md): Search and Filter

## Document References

- **Order Enquiry Process**: `../../docs/02-business-processes/order-enquiry-process.md`
- **Workflow Overview**: `../../docs/02-business-processes/workflow-overview.md`
- **Validation Catalog**: `../../docs/04-forms-and-screens/validation-catalog.md`
- **UX Strategy**: `../../docs/modernization-strategy/06-ux-ui-strategy/ux-ui-strategy.md`

