# Phase 1 Master Data - Test Cases

## Test Environment Setup

**Prerequisites:**
1. Docker Desktop running
2. PostgreSQL container running: `docker compose up -d`
3. Backend running: `cd backend && npm run start:dev`
4. Frontend running: `cd frontend && npm run dev`
5. Admin password updated: Run `backend/scripts/update-admin-password.sql`

**Test Credentials:**
- Username: `admin`
- Password: `password123`
- Company: `HT`

---

## Test Suite 1: Authentication

### TC-AUTH-001: Login via Frontend
**Steps:**
1. Navigate to http://localhost:5173/login
2. Enter username: `admin`
3. Enter password: `password123`
4. Select company: `HT`
5. Click "Sign in"

**Expected:**
- User is redirected to dashboard (`/`)
- No error messages displayed
- User info displayed in header

### TC-AUTH-002: Login via API
**Steps:**
```powershell
$body = @{
    username = "admin"
    password = "password123"
    company = "HT"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -ContentType "application/json" -Body $body
```

**Expected:**
- Returns `access_token` and `user` object
- Status code: 200
- Token is valid JWT

### TC-AUTH-003: Invalid Credentials
**Steps:**
1. Try login with wrong password
2. Try login with non-existent username

**Expected:**
- Error message: "Invalid credentials"
- User stays on login page
- No token generated

---

## Test Suite 2: Item Master - CRUD Operations

### TC-ITEM-001: Navigate to Item Master
**Steps:**
1. Login successfully
2. Click "Item Master" card on dashboard

**Expected:**
- Navigate to `/items`
- Item List and Item Entry Form visible
- No errors in console

### TC-ITEM-002: Create New Item - Valid Data
**Steps:**
1. Fill Item Entry Form:
   - Item No: `TEST001`
   - Description: `Test Item 1`
   - Std Code: `STD001` (from zstdcode)
   - Origin: `CN` (from zorigin)
   - Unit: `PCS`
   - Price: `100.00`
2. Click "Save" or press Enter

**Expected:**
- Item created successfully
- Success message displayed
- Item appears in Item List
- Form clears for next entry

### TC-ITEM-003: Create Item - Duplicate Item No
**Steps:**
1. Create item with `TEST001`
2. Try to create another item with same `TEST001`

**Expected:**
- Validation error: "Item number already exists"
- Item not created
- Error message displayed inline

### TC-ITEM-004: Create Item - Invalid Std Code
**Steps:**
1. Enter invalid std_code (not in zstdcode table)
2. Try to save

**Expected:**
- Validation error: "Standard code not found"
- Item not created
- Error message displayed

### TC-ITEM-005: Create Item - Invalid Origin
**Steps:**
1. Enter invalid origin (not in zorigin table)
2. Try to save

**Expected:**
- Validation error: "Origin not found"
- Item not created
- Error message displayed

### TC-ITEM-006: Item Lookup - Type to Search
**Steps:**
1. In Item Entry Form, focus on Item No field
2. Start typing: `TEST`
3. Use arrow keys to navigate results
4. Press Enter to select

**Expected:**
- Dropdown shows matching items
- Can navigate with keyboard
- Item details populate on selection

### TC-ITEM-007: Update Item
**Steps:**
1. Click on item in Item List
2. Modify description
3. Save

**Expected:**
- Item updated successfully
- Changes reflected in list
- Success message displayed

### TC-ITEM-008: Delete Item
**Steps:**
1. Select item from list
2. Click "Delete" button
3. Confirm deletion

**Expected:**
- Item deleted successfully
- Item removed from list
- Success message displayed

### TC-ITEM-009: Keyboard Navigation
**Steps:**
1. Tab through all form fields
2. Press Enter in text fields
3. Use arrow keys in dropdowns

**Expected:**
- Tab moves to next field
- Enter auto-advances to next field
- Arrow keys navigate dropdown options
- All fields accessible via keyboard

### TC-ITEM-010: Search Items
**Steps:**
1. In Item List, use search box
2. Type: `TEST`
3. View filtered results

**Expected:**
- Results filter as you type
- Matching items displayed
- Search is case-insensitive

---

## Test Suite 3: Customer Master - CRUD Operations

### TC-CUSTOMER-001: Navigate to Customer Master
**Steps:**
1. From dashboard, click "Customer Master"

**Expected:**
- Navigate to `/customers`
- Customer List and Entry Form visible

### TC-CUSTOMER-002: Create New Customer - Valid Data
**Steps:**
1. Fill Customer Entry Form:
   - Customer No: `CUST001`
   - English Name: `Test Customer 1`
   - Chinese Name: `测试客户1`
   - Address: `123 Test Street`
2. Save

**Expected:**
- Customer created successfully
- Appears in Customer List

### TC-CUSTOMER-003: Create Customer - Duplicate Customer No
**Steps:**
1. Create customer with `CUST001`
2. Try to create another with same number

**Expected:**
- Validation error: "Customer number already exists"
- Customer not created

### TC-CUSTOMER-004: Customer Search
**Steps:**
1. Use search box in Customer List
2. Type customer name or number

**Expected:**
- Results filter dynamically
- Matching customers displayed

### TC-CUSTOMER-005: Update Customer
**Steps:**
1. Select customer from list
2. Modify details
3. Save

**Expected:**
- Customer updated successfully
- Changes reflected in list

### TC-CUSTOMER-006: Delete Customer
**Steps:**
1. Select customer
2. Delete

**Expected:**
- Customer deleted successfully
- Removed from list

---

## Test Suite 4: Vendor Master - CRUD Operations

### TC-VENDOR-001: Navigate to Vendor Master
**Steps:**
1. From dashboard, click "Vendor Master"

**Expected:**
- Navigate to `/vendors`
- Vendor List and Entry Form visible

### TC-VENDOR-002: Create New Vendor - Valid Data
**Steps:**
1. Fill Vendor Entry Form:
   - Vendor No: `VEND001`
   - English Name: `Test Vendor 1`
   - Chinese Name: `测试供应商1`
   - Type: `FACTORY`
2. Save

**Expected:**
- Vendor created successfully
- Appears in Vendor List

### TC-VENDOR-003: Create Vendor - Duplicate Vendor No
**Steps:**
1. Create vendor with `VEND001`
2. Try to create another with same number

**Expected:**
- Validation error: "Vendor number already exists"
- Vendor not created

### TC-VENDOR-004: Vendor Search
**Steps:**
1. Use search box
2. Type vendor name or number

**Expected:**
- Results filter dynamically
- Matching vendors displayed

### TC-VENDOR-005: Update Vendor
**Steps:**
1. Select vendor
2. Modify details
3. Save

**Expected:**
- Vendor updated successfully
- Changes reflected

### TC-VENDOR-006: Delete Vendor
**Steps:**
1. Select vendor
2. Delete

**Expected:**
- Vendor deleted successfully
- Removed from list

---

## Test Suite 5: UX/UI Features

### TC-UX-001: Keyboard-First Navigation
**Steps:**
1. Navigate entire form using only keyboard
2. No mouse clicks

**Expected:**
- All fields accessible via Tab
- Enter submits or advances
- Escape cancels/closes

### TC-UX-002: Auto-Advance on Enter
**Steps:**
1. Fill text field
2. Press Enter

**Expected:**
- Cursor moves to next field
- Form doesn't submit prematurely

### TC-UX-003: Type-to-Search Lookups
**Steps:**
1. Focus on lookup field (e.g., std_code)
2. Start typing
3. See dropdown results

**Expected:**
- Results appear as you type
- Can select with keyboard
- Debounced (not too many requests)

### TC-UX-004: Inline Validation
**Steps:**
1. Enter invalid data
2. Move to next field or submit

**Expected:**
- Error message appears inline
- Field highlighted in red
- Error clears when fixed

### TC-UX-005: Loading States
**Steps:**
1. Perform slow operation (create/update)
2. Observe UI

**Expected:**
- Loading spinner/indicator shown
- Button disabled during operation
- User feedback provided

### TC-UX-006: Error Handling
**Steps:**
1. Trigger various errors:
   - Network error
   - Validation error
   - Server error

**Expected:**
- User-friendly error messages
- No technical jargon
- Clear action items

### TC-UX-007: Responsive Design
**Steps:**
1. Resize browser window
2. Test on different screen sizes

**Expected:**
- Layout adapts to screen size
- Forms remain usable
- No horizontal scrolling

---

## Test Suite 6: API Endpoints

### TC-API-001: Item API - GET /api/items
**Steps:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/items" -Headers @{Authorization="Bearer $token"}
```

**Expected:**
- Returns list of items
- Status: 200

### TC-API-002: Item API - POST /api/items
**Steps:**
```powershell
$body = @{
    itemNo = "API001"
    description = "API Test Item"
    stdCode = "STD001"
    origin = "CN"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/items" -Method POST -ContentType "application/json" -Body $body -Headers @{Authorization="Bearer $token"}
```

**Expected:**
- Item created
- Returns created item
- Status: 201

### TC-API-003: Item API - GET /api/items/search?q=test
**Steps:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/items/search?q=test" -Headers @{Authorization="Bearer $token"}
```

**Expected:**
- Returns filtered items
- Status: 200

### TC-API-004: Customer API - All CRUD operations
**Similar to Item API tests**

### TC-API-005: Vendor API - All CRUD operations
**Similar to Item API tests**

---

## Test Results Template

| Test Case ID | Status | Notes |
|-------------|--------|-------|
| TC-AUTH-001 | ⏳ Pending | |
| TC-AUTH-002 | ⏳ Pending | |
| TC-ITEM-001 | ⏳ Pending | |
| ... | ... | ... |

**Status Legend:**
- ✅ Pass
- ❌ Fail
- ⏳ Pending
- ⚠️ Blocked

---

## Notes

- All tests should be performed in order
- Document any deviations from expected behavior
- Screenshot errors for reference
- Test data should be cleaned up after testing (or use test database)




