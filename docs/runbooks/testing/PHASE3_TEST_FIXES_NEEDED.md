# Phase 3 Test Fixes Needed

**Date:** January 20, 2026  
**Status:** TypeScript Compilation Errors in Test Files  
**Impact:** Phase 3 unit tests won't run until mocks are fixed

---

## Summary

Phase 3 unit test files have TypeScript compilation errors because mock data doesn't match the actual entity structures. These are straightforward fixes but require going through each test file.

**Estimated Fix Time:** 2-3 hours

---

## Affected Files & Errors

### 1. shipping-order.service.spec.ts ✅ PARTIALLY FIXED
**Lines:** 262-277, 287-304  
**Issues:**
- Mock missing required fields: `itemNo`, `qty`, `creDate`
- Mock has non-existent fields: `status`, `price`
**Status:** Fixed 1 of 2 instances

**Remaining Fix:**
```typescript
// Line 262-277: Add required fields to mock
const mockSo = {
  soNo: 'SO001',
  itemNo: 'ITEM001',  // Add this
  qty: 100,           // Add this
  creDate: new Date(), // Add this
  modDate: new Date(),
};
```

### 2. delivery-note.service.spec.ts ⚠️ NEEDS FIXES
**Errors:**
- Line 116: `price` doesn't exist on `CreateDeliveryNoteDto`
- Line 131: `delAddr` should be `delAddr1`
- Lines 159, 218, 252: `date` should be string, not Date object
- Lines 292, 308, 313: `findAndCount` not in mock
- Line 364: `breakdowns` doesn't exist on `DeliveryNoteDetail`
- Lines 383, 398: `loadingStatus` not in `UpdateDeliveryNoteDto`
- Line 424: `affected` doesn't exist on void return

**Fixes:**
```typescript
// Fix 1: Remove price from createDto
const createDto = {
  dnNo: 'DN001',
  itemNo: 'ITEM001',
  qty: 100,
  // price: 10.5,  // Remove this - not in DTO
};

// Fix 2: Use delAddr1 instead of delAddr
delAddr1: createDto.delAddr1,  // Not delAddr

// Fix 3: Convert dates to strings
date: '2025-01-15',  // Not new Date('2025-01-15')

// Fix 4: Add findAndCount to mock
mockDeliveryNoteHeaderRepository = {
  ...existing mocks...,
  findAndCount: jest.fn(),
};

// Fix 5: Don't test non-existent properties
// Remove: expect(result.details[0].breakdowns)

// Fix 6: Fix updateDto to match DTO structure
const updateDto = {
  qty: 150,  // Use valid DTO fields only
};

// Fix 7: Change delete return type expectation
expect(mockRepository.delete).toHaveBeenCalled();
// Not: expect(result.affected).toBe(1);
```

### 3. invoice.service.spec.ts ⚠️ NEEDS REVIEW
**Likely Issues:**
- Mock data structure mismatches
- Method name mismatches
- DTO field mismatches

**Action:** Review compilation errors when running test

### 4. enquiry.service.spec.ts ✅ FIXED
**Issues Fixed:**
- ✅ Changed `getSalesAnalysis` to `salesAnalysis`
- ✅ Changed `getInvoiceEnquiry` to `invoiceEnquiry`

### 5. loading.service.spec.ts ⚠️ NEEDS REVIEW
**Likely Issues:**
- Mock data structure mismatches

### 6. reporting.service.spec.ts ⚠️ NEEDS REVIEW
**Likely Issues:**
- Mock data structure mismatches

---

## Systematic Fix Approach

### Step 1: Identify Entity Structure (5 min per file)

For each test file:
1. Open the entity file (e.g., `shipping-order.entity.ts`)
2. Note required fields (those without `?` and without default values)
3. Note field types (string, number, Date, etc.)

### Step 2: Fix Test Mocks (10-15 min per file)

For each test file:
1. Find all mock objects (search for `const mock`)
2. Ensure mocks include all required fields
3. Ensure field types match entity
4. Remove any non-existent fields

**Example:**
```typescript
// BEFORE (wrong)
const mockShippingOrder = {
  soNo: 'SO001',
  status: 'Pending',  // Doesn't exist
};

// AFTER (correct)
const mockShippingOrder = {
  soNo: 'SO001',
  itemNo: 'ITEM001',  // Required
  qty: 100,           // Required
  creDate: new Date(), // Required
  modDate: new Date(),
};
```

### Step 3: Fix Mock Repository Methods (5 min per file)

Ensure repository mocks have all methods used in tests:
```typescript
const mockRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  findAndCount: jest.fn(),  // Add if used
  update: jest.fn(),
  delete: jest.fn(),
};
```

### Step 4: Fix DTO Usage (10 min per file)

1. Open the DTO file
2. Check which fields are defined
3. Remove any undefined fields from test DTOs

### Step 5: Run & Verify (2 min per file)

```bash
npm test -- <test-file-name> --maxWorkers=1
```

Fix any remaining errors and repeat.

---

## Quick Fix Script

For common patterns, you can use find-replace:

### Pattern 1: Date to String
```typescript
// Find:
date: new Date('YYYY-MM-DD')

// Replace:
date: 'YYYY-MM-DD'
```

### Pattern 2: Add as any for Quick Fix
```typescript
// If stuck, use type assertion:
.mockResolvedValue(mockData as any);
```

---

## Estimated Time Per File

| File | Estimated Time | Priority |
|------|----------------|----------|
| shipping-order.service.spec.ts | 15 min | High (partially done) |
| delivery-note.service.spec.ts | 30 min | High (many errors) |
| invoice.service.spec.ts | 20 min | High |
| enquiry.service.spec.ts | 0 min | ✅ Done |
| loading.service.spec.ts | 15 min | Medium |
| reporting.service.spec.ts | 15 min | Medium |
| **Total** | **~2 hours** | |

---

## Alternative: Skip Unit Tests, Focus on Integration

If time is limited, you can:

1. **Skip** fixing unit test mocks
2. **Focus** on integration tests (which test real entities)
3. **Get** integration tests passing
4. **Come back** to unit tests later

Integration tests provide more value and test real functionality.

---

## After Fixes Are Done

Once all TypeScript errors are resolved:

```bash
# Run all Phase 3 service tests
npm test -- --testPathPattern="service\.spec" --maxWorkers=1 --testTimeout=60000

# Expected: 50-60 tests passing
```

---

## Current Status

- ✅ **Phase 2 tests:** 115/115 passing
- ✅ **enquiry.service.spec.ts:** TypeScript errors fixed
- ⚠️ **shipping-order.service.spec.ts:** 1 of 2 issues fixed
- ❌ **delivery-note.service.spec.ts:** 7 errors to fix
- ❌ **invoice.service.spec.ts:** Unknown errors
- ❌ **loading.service.spec.ts:** Unknown errors
- ❌ **reporting.service.spec.ts:** Unknown errors

---

## Recommendation

**Option A:** Fix all unit tests systematically (2-3 hours)
- Most thorough
- Best long-term value
- Complete test coverage

**Option B:** Focus on integration tests (1-2 hours)
- Faster to working state
- Tests real functionality
- Can add unit tests later

**Option C:** Generate test coverage now, fix later
- Shows current state
- Documents what's working
- Plan fixes based on coverage gaps

**My Recommendation:** Option B (Focus on integration tests)
- Get to 90%+ pass rate quickly
- Integration tests catch more real bugs
- Unit tests can be fixed incrementally

---

**Next Step:** Choose an option and proceed accordingly! 🚀
