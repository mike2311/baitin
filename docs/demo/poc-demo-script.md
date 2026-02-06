# PoC Demo Script

**Duration:** ~30 minutes  
**Audience:** Stakeholders, Business Users, Technical Team  
**Date:** [To be scheduled]

---

## Pre-Demo Checklist

- [ ] Demo environment is running and accessible
- [ ] Demo data is loaded and verified
- [ ] All features are tested and working
- [ ] Backup demo data is ready
- [ ] Sample Excel file is ready for import
- [ ] Presentation materials are prepared
- [ ] Screen sharing is set up
- [ ] Questions document is ready

---

## Demo Flow

### 1. Introduction (2 minutes)

**Talking Points:**
- Welcome and thank stakeholders for their time
- Recap PoC objectives:
  - Validate architecture and technology stack
  - Demonstrate Windows-like fast input in web application
  - Show key capabilities (Master Data, Order Enquiry, Excel Import)
  - Get stakeholder feedback and buy-in
- What we'll demonstrate today:
  - Master Data Management (Item, Customer, Vendor)
  - Order Enquiry Entry (manual and Excel import)
  - Order Enquiry Enquiry/List
  - Excel Import functionality
- Technology stack overview:
  - Frontend: React + TypeScript
  - Backend: NestJS + TypeScript
  - Database: PostgreSQL
  - Modern web technologies with keyboard-first UX

**Key Message:** "We've built a modern web application that maintains the fast, keyboard-driven workflow users are familiar with from the legacy system."

---

### 2. Master Data Entry (5 minutes)

#### 2.1 Item Master Entry

**Actions:**
1. Navigate to Item Master page
2. Click "Create New Item"
3. Demonstrate keyboard navigation:
   - Tab between fields
   - Enter to move to next field
   - Show auto-advance behavior
4. Enter sample item:
   - Item Number: `DEMO001`
   - Description: `Demo Item 1`
   - Standard Code: Select from dropdown
   - Origin: Select from dropdown
   - Price: `10.00`
   - Cost: `8.00`
5. Show validation (if applicable)
6. Save item
7. Show item in list
8. Edit existing item to show update functionality

**Talking Points:**
- "Notice the keyboard-first navigation - no mouse required for data entry"
- "Auto-advance on Enter speeds up data entry"
- "Lookup fields support type-to-search for fast selection"
- "Validation happens inline without blocking the user"

**Expected Outcome:** Item created successfully, visible in list

---

#### 2.2 Customer Master Entrydd

**Actions:**
1. Navigate to Customer Master page
2. Click "Create New Customer"
3. Enter sample customer:
   - Customer Code: `DEMOCUST001`
   - English Name: `Demo Customer 1`
   - Short Name: `DC1`
   - Address fields
4. Show fast data entry with keyboard navigation
5. Save customer

**Talking Points:**
- "Same keyboard-first pattern across all master data forms"
- "Consistent UX makes training easier"

**Expected Outcome:** Customer created successfully

---

### 3. Order Enquiry Entry (10 minutes)

#### 3.1 OE Control Creation

**Actions:**
1. Navigate to Order Enquiry Control page
2. Click "Create New OE Control"
3. Enter OE Control:
   - OE Number: `OE-DEMO-001`
   - Customer: Select `DEMOCUST001` (use lookup)
   - OE Date: Today's date
4. Save OE Control
5. Show OE Control in list

**Talking Points:**
- "OE Control must exist before creating Order Enquiry (except INSP company)"
- "This matches the original business logic"

**Expected Outcome:** OE Control created successfully

---

#### 3.2 Manual OE Entry

**Actions:**
1. Navigate to Order Enquiry Entry page
2. Enter OE Header:
   - OE Number: `OE-DEMO-001` (from Control)
   - Customer: Auto-filled from Control
   - OE Date: Today's date
3. Add items to detail grid:
   - Click in Item Number column
   - Press F2 to open item lookup
   - Type to search: `DEMO`
   - Select `DEMO001`
   - Auto-fill: Description, Price
   - Enter Quantity: `100`
   - Auto-calculate: Amount = Qty × Price
   - Press Enter to move to next row
4. Add second item:
   - Item: `DEMO002` (if exists) or create new
   - Quantity: `50`
   - Price: `15.00`
5. Show auto-save indicator ("Saving...", "Saved")
6. Demonstrate Excel-like grid navigation:
   - Arrow keys to move between cells
   - Tab to move to next field
   - Enter to move to next row
7. Show validation (if applicable)
8. Save OE

**Talking Points:**
- "Excel-like grid navigation for fast data entry"
- "Auto-save prevents data loss"
- "Item lookup with type-to-search is instant"
- "Auto-calculation reduces errors"
- "Keyboard-first workflow matches legacy system speed"

**Expected Outcome:** OE created with multiple items, auto-saved

---

#### 3.3 OE Enquiry List

**Actions:**
1. Navigate to Order Enquiry List page
2. Show search functionality:
   - Search by OE Number: `OE-DEMO`
   - Filter by Customer: `DEMOCUST001`
   - Filter by Date range
3. Click on OE row to view/edit
4. Show fast navigation

**Talking Points:**
- "Fast search and filter capabilities"
- "Click to view/edit maintains workflow"

**Expected Outcome:** OE visible in list, searchable

---

### 4. Excel Import (5 minutes) - **NEW FEATURE**

#### 4.1 Import Preparation

**Actions:**
1. Navigate to Order Enquiry Import page (or click "Import Excel" from OE List)
2. Show import page layout
3. Explain the import workflow:
   - Step 1: Upload file
   - Step 2: Field mapping
   - Step 3: Preview & Import

**Talking Points:**
- "Excel import is a critical business function"
- "We support multiple Excel formats"
- "Field mapping ensures data accuracy"

---

#### 4.2 File Upload

**Actions:**
1. Select Company Code: `HT` (or appropriate)
2. Upload Excel file:
   - **Option A:** Drag and drop sample Excel file
   - **Option B:** Click "Browse Files" and select file
3. Show file validation:
   - File type check (.xlsx, .xls, .csv)
   - File size check (max 10MB)
4. Show selected file info (filename, size)

**Talking Points:**
- "Drag and drop or browse - user's choice"
- "File validation prevents errors early"
- "Clear error messages guide the user"

**Expected Outcome:** File selected, validated, ready for mapping

---

#### 4.3 Field Mapping

**Actions:**
1. Show field mapping interface
2. Demonstrate auto-detect:
   - Click "Auto-Detect" button
   - Show how columns are automatically mapped to system fields
3. Show manual override:
   - Select a field (e.g., "Item Number")
   - Change mapping to different Excel column
   - Show dropdown with available columns
4. Explain required vs optional fields
5. Show system fields that need mapping

**Talking Points:**
- "Auto-detect saves time by matching column headers"
- "Manual override gives flexibility"
- "Required fields are clearly marked"
- "For Excel files, backend handles format detection automatically"

**Expected Outcome:** Fields mapped (auto or manual)

---

#### 4.4 Import Execution

**Actions:**
1. Click "Import" button
2. Show progress indicator:
   - Upload progress
   - Import progress
3. Wait for import to complete
4. Show success message:
   - Number of OEs imported
   - Number of lines created
   - List of created OE numbers

**Talking Points:**
- "Progress indicator keeps user informed"
- "Import happens server-side for performance"
- "Success message shows what was created"

**Expected Outcome:** Import successful, OEs created

---

#### 4.5 Error Handling (if applicable)

**Actions:**
1. If errors occur, show error report:
   - List of errors with row numbers
   - Error types (Critical/Warning)
   - Error messages
2. Demonstrate error filtering:
   - Filter by Critical errors
   - Filter by Warnings
3. Show how to fix errors:
   - "No OE Control record" - Create OE Control first
   - "Invalid item(s)" - Ensure items exist in Item Master
   - "Missing customer" - Create Customer first

**Talking Points:**
- "Clear error messages help users fix issues"
- "Row numbers make it easy to find problems"
- "Critical vs Warning helps prioritize fixes"

**Expected Outcome:** Errors displayed clearly, user can fix and retry

---

#### 4.6 Verify Imported Data

**Actions:**
1. Navigate to Order Enquiry List
2. Search for imported OE numbers
3. Click to view imported OE
4. Show imported items in detail grid
5. Verify data accuracy

**Talking Points:**
- "Imported data is immediately available"
- "Data integrity is maintained"
- "Same view/edit interface for manual and imported OEs"

**Expected Outcome:** Imported OEs visible and editable

---

### 5. Enquiry (3 minutes)

**Actions:**
1. Navigate to Order Enquiry List
2. Demonstrate search:
   - Search by OE Number
   - Filter by Customer
   - Filter by Date range
3. Show results in grid
4. Click row to view details
5. Show fast navigation

**Talking Points:**
- "Fast search and filter"
- "Excel-like grid for viewing results"
- "Click to view maintains workflow"

**Expected Outcome:** Search works, results displayed

---

### 6. Q&A and Summary (5 minutes)

#### 6.1 Key Achievements Recap

**Talking Points:**
- ✅ **Architecture Validated:** Modern stack works well, scalable, maintainable
- ✅ **UX Validated:** Keyboard-first navigation works, fast input experience
- ✅ **Core Features Working:** Master Data, Order Enquiry, Excel Import
- ✅ **Business Logic Preserved:** All validation rules and business logic from original system
- ✅ **Performance:** Fast response times, smooth user experience

#### 6.2 Next Steps (MVP)

**Talking Points:**
- Based on PoC success, proceed to MVP
- MVP will include:
  - Complete Order Enquiry module (with all features)
  - Order Confirmation module
  - Contract module
  - Additional Excel import formats
  - BOM processing
  - Quantity breakdown
- Timeline: [To be determined]
- Team expansion: [To be determined]

#### 6.3 Questions and Feedback

**Actions:**
- Open floor for questions
- Collect feedback on:
  - UX experience
  - Feature priorities
  - Concerns or risks
  - Suggestions for improvement

**Talking Points:**
- "Your feedback is critical for MVP planning"
- "We want to ensure the modernization meets your needs"
- "Any concerns or suggestions are welcome"

---

## Backup Plan

### If Demo Environment Fails

1. **Have screenshots/video ready:** Pre-recorded demo video as backup
2. **Use local environment:** Switch to local development environment if cloud fails
3. **Focus on key features:** Prioritize Master Data and OE Entry if time is limited
4. **Postpone Excel Import:** Can demonstrate Excel Import separately if needed

### If Feature Doesn't Work

1. **Acknowledge issue:** Be transparent about the issue
2. **Show working features:** Focus on what works
3. **Explain fix timeline:** When the issue will be resolved
4. **Offer follow-up demo:** Schedule another demo once fixed

---

## Demo Data

### Master Data
- **Items:** 20-30 sample items (DEMO001, DEMO002, etc.)
- **Customers:** 5-10 sample customers (DEMOCUST001, etc.)
- **Vendors:** 5-10 sample vendors

### OE Control
- **OE-DEMO-001:** For manual entry demo
- **OE-DEMO-002:** For Excel import demo
- **OE-DEMO-003:** Backup

### Excel Import File
- **File:** `sample-oe-import.xlsx` or `sample-oe-import.csv`
- **Format:** CSV_2013 or XLS_2013
- **Content:**
  - OE Number: `OE-DEMO-002`
  - Multiple items with quantities
  - Valid data (items and customer exist)

---

## Key Messages to Emphasize

1. **Keyboard-First UX:** "No mouse required for data entry - matches legacy system speed"
2. **Business Logic Preserved:** "All validation rules and business logic from original system are maintained"
3. **Modern Technology:** "Built with modern, maintainable technologies"
4. **Fast Performance:** "Response times under 500ms, page loads under 2 seconds"
5. **Excel Import:** "Critical business function working as expected"
6. **Clear Path Forward:** "PoC validates approach, ready for MVP"

---

## Success Criteria

- ✅ All demo features work as expected
- ✅ Stakeholders understand the value proposition
- ✅ Feedback collected on UX and features
- ✅ Clear path to MVP identified
- ✅ Stakeholder buy-in achieved

---

## Post-Demo Actions

1. **Document Feedback:** Record all questions, concerns, and suggestions
2. **Follow-up:** Send thank you email with demo summary
3. **Address Concerns:** Respond to any concerns raised
4. **Plan MVP:** Use feedback to refine MVP plan
5. **Schedule Next Review:** Plan next milestone review

---

**Last Updated:** January 24, 2026  
**Version:** 1.0
