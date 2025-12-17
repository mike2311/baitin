# Task 02-02: Auto-Detect Field Mapping

## Task Information

- **Phase**: 3 - Excel Import
- **Sprint**: Week 9
- **Priority**: High
- **Estimated Effort**: 2 days
- **Dependencies**: Task 02-01

## Objective

Implement automatic field mapping detection based on Excel column headers and content patterns.

## Original Logic Reference

- **Original Code**: `source/uoexls_2013.prg` (lines 147-189) - Dynamic field detection
- **Business Process**: `../../../../docs/02-business-processes/order-enquiry-process.md` (Excel Import section)

## Requirements

### Detection Patterns
- Search for keywords: "ITEM", "ITEM NO", "QTY", "QUANTITY", "PRICE", "CUST", "CUSTOMER", "OE NO", "OENO"
- Case-insensitive matching
- Partial matching (e.g., "ITEM" matches "ITEM NO")
- Priority matching (exact match > partial match)

### Detection Logic
1. Read Excel header row
2. Search each column for keywords
3. Map to system fields
4. Allow manual override
5. Save mapping for reuse

### Fields to Detect
- OE Number
- Customer Number
- OE Date
- Item Number
- Quantity (TOTAL QTY, TOTAL PIECE, etc.)
- Price
- SKU/SKN (if present)

## Acceptance Criteria
- [ ] Auto-detection works correctly
- [ ] Common patterns detected
- [ ] Manual override available
- [ ] Mapping saved correctly

## Notes

- Original FoxPro code uses complex field detection (1,747 lines)
- For PoC, implement basic detection patterns
- Can enhance in MVP phase

