# Task 01-02: Item Lookup with Type-to-Search

## Task Information

- **Phase**: 1 - Master Data Module
- **Sprint**: Week 5
- **Priority**: High
- **Estimated Effort**: 1 day
- **Dependencies**: Task 01-01 (Item Entry Form), Phase 0 UX kernel
- **Assignee**: Frontend Developer

## Objective

Implement item lookup component with type-to-search functionality, displaying item code and description, integrated with item entry form.

## Requirements

### 1. Lookup Features
- Type-to-search (debounced, < 200ms response)
- Display item_no and short_name/description
- Keyboard navigation (arrows, Enter, Escape)
- Recent items support (optional)

### 2. API Endpoint
- `GET /api/items/search?q={query}` - Search items
- Returns: `{ code: string, name: string, description?: string }[]`

### 3. Integration
- Used in Item Entry Form (F2 on item_no field)
- Used in OE Entry (item selection in grid)
- Reusable across application

## Acceptance Criteria
- [ ] Lookup component created and reusable
- [ ] Type-to-search works (< 200ms response)
- [ ] Displays item_no and description
- [ ] Keyboard navigation works
- [ ] Integrates with Item Entry Form
- [ ] Performance acceptable

## References
- **UX Strategy**: `../../../../docs/modernization-strategy/06-ux-ui-strategy/ux-ui-strategy.md`
- **Phase 0**: Task 04-02 (Lookup Component)

