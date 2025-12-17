# Task 01-01: Item Entry Form

## Task Information

- **Phase**: 1 - Master Data Module
- **Sprint**: Week 5
- **Priority**: High
- **Estimated Effort**: 3 days
- **Dependencies**: Phase 0 complete (database schema, UX kernel, API foundation)
- **Assignee**: Frontend + Backend Developers

## Objective

Implement the Item Master entry form with full CRUD functionality, keyboard-first navigation, and all original validation rules preserved.

## Original Logic Reference

### FoxPro Form/Program
- **Form**: `iitem` (Input Item Detail)
- **Code Reference**: `source/iitem.scx`
- **Legacy Import**: `source/xitem.prg` (lines 20-71)

### Documentation References
- **Business Process**: `../../../../docs/02-business-processes/master-data-management.md` (lines 9-163)
- **Data Architecture**: `../../../../docs/01-data-architecture/table-details/master-data-tables.md` (lines 5-49)
- **Validation Rules**: `../../../../docs/04-forms-and-screens/validation-catalog.md` (lines 42-56)
- **UX Strategy**: `../../../../docs/modernization-strategy/06-ux-ui-strategy/ux-ui-strategy.md` (lines 289-321)

## Requirements

### Functional Requirements

#### 1. Item Entry Form Layout

**Header Section:**
- Item Number (`item_no`) - Primary key, required
- Short Name (`short_name`)
- Description (`desp`) - Memo field, TEXT area

**Basic Information:**
- Origin (`origin`) - Lookup, validated against `zorigin` table
- Standard Code (`std_code`) - Lookup, validated against `zstdcode` table
- HTC Code (`htc_no`) - Harmonized Tariff Code
- UPC Code (`upc_no`)

**Pricing:**
- Price (`price`) - Decimal, must be >= 0
- Price Currency (`price_cur`)
- Cost (`cost`) - Decimal, must be >= 0

**Packing Information:**
- Pack PC 1-4 (`pack_pc_1` through `pack_pc_4`) - Integer
- Pack Description 1-4 (`pack_desp_1` through `pack_desp_4`) - Text

**Dimensions:**
- Weight (`wt`) - Decimal
- Net Weight (`net`) - Decimal
- Cube (`cube`) - Decimal
- Dimensions (`dim`) - Text

**Additional Fields:**
- Item Type (`item_type`)
- Group Code (`grp_code`)
- Material (`material`)
- Duty (`duty`)

#### 2. Validation Rules (MUST PRESERVE)

**Original Logic Reference**: `docs/04-forms-and-screens/validation-catalog.md` lines 42-56

- **Item Number (`item_no`):**
  - Must be unique in `item` table
  - Error: "Item Number Already Exists"
  - Validation on field exit (onBlur)

- **Price:**
  - Must be >= 0
  - Error: "Price Must Be Positive"

- **Cost:**
  - Must be >= 0
  - Error: "Cost Must Be Positive"

- **Standard Code (`std_code`):**
  - Must exist in `zstdcode` table (if provided)
  - Error: "Invalid Standard Code"
  - Validate on field exit

- **Origin:**
  - Must exist in `zorigin` table (if provided)
  - Error: "Invalid Origin"
  - Validate on field exit

#### 3. UX Requirements

**Reference**: `docs/modernization-strategy/06-ux-ui-strategy/ux-ui-strategy.md` lines 289-321

- **Keyboard Navigation:**
  - Tab key moves to next field
  - Enter key moves to next field (if valid)
  - Shift+Tab moves to previous field
  - F2 opens item lookup (when on item_no field)

- **Auto-Advance:**
  - Auto-advance to next field on Enter (if validation passes)
  - Don't block typing on validation error

- **Lookup Integration:**
  - F2 on item_no field opens item lookup
  - F2 on origin field opens origin lookup
  - F2 on std_code field opens standard code lookup
  - Type-to-search in lookups
  - Arrow keys navigate suggestions
  - Enter selects and populates form

- **Inline Validation:**
  - Show validation errors inline (below field)
  - Don't block user input
  - Clear errors when field becomes valid

#### 4. Business Logic (MUST PRESERVE)

**Original Logic Reference**: `docs/02-business-processes/master-data-management.md` lines 13-83

**Create Item Flow:**
1. User enters item number
2. System checks if item exists:
   - If exists: Show error "Item Number Already Exists"
   - If not exists: Continue
3. User enters item details
4. Validate `std_code` against `zstdcode` table (if provided)
5. Validate `origin` against `zorigin` table (if provided)
6. Create record in `item` table
7. Set audit fields:
   - `cre_date` = current date
   - `cre_user` = current user
   - `user_id` = current user

**Update Item Flow:**
1. User selects existing item (via lookup or search)
2. Load item data into form
3. User modifies fields
4. Validate changes (std_code, origin)
5. Save changes to `item` table
6. Set audit fields:
   - `mod_date` = current date
   - `mod_user` = current user

### Technical Requirements

#### Frontend
- **Component**: React functional component with TypeScript
- **Form Management**: React Hook Form
- **UI Library**: shadcn/ui components
- **Validation**: React Hook Form validation + custom validators
- **State**: React Query for server state, local state for form

#### Backend
- **API Endpoints:**
  - `GET /api/items/:itemNo` - Get item by number
  - `POST /api/items` - Create new item
  - `PUT /api/items/:itemNo` - Update existing item
  - `DELETE /api/items/:itemNo` - Delete item (optional, if needed)

- **Validation:**
  - Server-side validation for all rules
  - Database constraints for uniqueness
  - Return clear error messages matching original system

#### Database
- **Table**: `item` (PostgreSQL)
- **Schema**: Already created in Phase 0
- **Indexes**: Already created

## Implementation Steps

1. **Backend API**
   - Create Item entity/model (if not done)
   - Create Item service
   - Implement validation logic
   - Create API endpoints (controller)
   - Write unit tests for validation

2. **Frontend Form**
   - Create ItemEntryForm component
   - Implement form fields using TextInput and Lookup components
   - Add React Hook Form setup
   - Implement validation rules
   - Add keyboard navigation
   - Integrate with API using React Query

3. **Lookup Integration**
   - Integrate origin lookup (Task 01-02)
   - Integrate std_code lookup (Task 01-02)
   - Test lookup functionality

4. **Testing**
   - Unit tests for validation
   - Integration tests for API
   - E2E tests for form workflow
   - Test all validation scenarios

## Acceptance Criteria

- [ ] Item entry form displays all required fields
- [ ] Form supports create and update modes
- [ ] All validation rules implemented and working
- [ ] Keyboard navigation works (Tab, Enter, Shift+Tab, F2)
- [ ] Auto-advance works on Enter
- [ ] Inline validation shows errors correctly
- [ ] F2 opens lookups for origin and std_code
- [ ] Form integrates with backend API
- [ ] Audit fields (cre_date, cre_user, mod_date, mod_user) set correctly
- [ ] Standard code validation against `zstdcode` works
- [ ] Origin validation against `zorigin` works
- [ ] Error messages match original system behavior
- [ ] Form handles loading and error states
- [ ] Code includes documentation references

## Testing Checklist

- [ ] Create new item with valid data - succeeds
- [ ] Create item with duplicate item_no - shows error
- [ ] Create item with invalid std_code - shows error
- [ ] Create item with invalid origin - shows error
- [ ] Create item with negative price - shows error
- [ ] Create item with negative cost - shows error
- [ ] Update existing item - succeeds
- [ ] Update item with invalid std_code - shows error
- [ ] Keyboard navigation works throughout form
- [ ] Auto-advance works on valid fields
- [ ] Validation errors don't block typing
- [ ] F2 lookup works for origin and std_code

## Dependencies

- Task 01-02: Item Lookup (for F2 lookup functionality)
- Phase 0: Database schema setup
- Phase 0: UX kernel components

## Notes

- Memo field (`desp`) requires TEXT area component
- Original FoxPro uses memo files (.FPT), we'll use TEXT column
- Consider character encoding for description field
- Performance: Item lookup should be fast (< 200ms for validation checks)

## Code Comments Template

When implementing, include comments like:

```typescript
/**
 * Validates item number uniqueness
 * 
 * Original Logic Reference:
 * - FoxPro Form: iitem.scx (Txtbox1.Valid)
 * - Documentation: docs/04-forms-and-screens/validation-catalog.md
 * - Business Rule: item_no must be unique in mitem table
 * 
 * Validation Rules:
 * - Check if item_no already exists in database
 * - Return error "Item Number Already Exists" if duplicate
 */
async function validateItemNumberUniqueness(itemNo: string): Promise<boolean> {
  // Implementation
}
```

## References

- **Original Form**: `source/iitem.scx`
- **Business Process**: `../../../../docs/02-business-processes/master-data-management.md`
- **Data Model**: `../../../../docs/01-data-architecture/table-details/master-data-tables.md`
- **Validation**: `../../../../docs/04-forms-and-screens/validation-catalog.md`
- **UX Requirements**: `../../../../docs/modernization-strategy/06-ux-ui-strategy/ux-ui-strategy.md`

