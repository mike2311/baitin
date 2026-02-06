# Excel Import Testing Guide

**Purpose:** End-to-end testing guide for Excel Import functionality

**Last Updated:** January 24, 2026

---

## Prerequisites

1. **Backend Running:**
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Frontend Running:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Database Running:**
   - Docker Desktop running
   - PostgreSQL test database accessible

4. **Test Data:**
   - At least one Customer exists
   - At least one Item exists
   - At least one OE Control exists (for non-INSP companies)

---

## Test Scenarios

### Test 1: File Upload - Drag and Drop

**Steps:**
1. Navigate to `/order-enquiry/import`
2. Select Company Code: `HT`
3. Drag an Excel file (.xlsx, .xls, or .csv) onto the upload area
4. Verify file is accepted and displayed

**Expected Results:**
- ✅ File is accepted
- ✅ File name and size are displayed
- ✅ No error messages

**Test Files:**
- Valid: `.xlsx`, `.xls`, `.csv` files
- Invalid: `.txt`, `.pdf`, `.doc` (should be rejected)

---

### Test 2: File Upload - Browse

**Steps:**
1. Navigate to `/order-enquiry/import`
2. Click "Browse Files" button
3. Select an Excel file from file picker
4. Verify file is selected

**Expected Results:**
- ✅ File picker opens
- ✅ File is selected
- ✅ File name and size are displayed

---

### Test 3: File Validation - Type

**Steps:**
1. Try to upload a `.txt` file
2. Try to upload a `.pdf` file
3. Try to upload a `.doc` file

**Expected Results:**
- ✅ Error message: "Invalid file type. Please upload a file with one of these extensions: .xlsx, .xls, .csv"
- ✅ File is rejected

---

### Test 4: File Validation - Size

**Steps:**
1. Try to upload a file larger than 10MB

**Expected Results:**
- ✅ Error message: "File size exceeds maximum allowed size of 10MB"
- ✅ File is rejected

---

### Test 5: Field Mapping - CSV Auto-Detect

**Steps:**
1. Upload a CSV file with headers:
   ```
   OE Number,Item Number,Quantity,Price
   OE-DEMO-001,ITEM001,100,10.00
   ```
2. Verify field mapping interface appears
3. Click "Auto-Detect" button
4. Verify fields are automatically mapped

**Expected Results:**
- ✅ CSV headers are parsed
- ✅ Auto-detect maps columns to system fields
- ✅ Required fields (OE Number, Item Number, Quantity) are mapped

---

### Test 6: Field Mapping - Manual Override

**Steps:**
1. Upload a CSV file
2. Auto-detect mapping
3. Manually change one field mapping (e.g., change "Item Number" to different column)
4. Verify mapping is saved

**Expected Results:**
- ✅ Manual mapping works
- ✅ Mapping is saved in component state
- ✅ Can change mapping multiple times

---

### Test 7: Field Mapping - Excel Files

**Steps:**
1. Upload an Excel file (.xlsx or .xls)
2. Verify format selection message appears
3. Verify system fields are displayed

**Expected Results:**
- ✅ Message explains backend handles format detection
- ✅ System fields are shown
- ✅ Can proceed to import

---

### Test 8: Import Execution - Success

**Prerequisites:**
- OE Control exists: `OE-DEMO-001` with customer `CUST001`
- Item exists: `ITEM001`
- Customer exists: `CUST001`

**Steps:**
1. Upload CSV file with valid data:
   ```
   OE Number,Item Number,Quantity,Price
   OE-DEMO-001,ITEM001,100,10.00
   ```
2. Map fields (auto-detect or manual)
3. Click "Import" button
4. Wait for import to complete

**Expected Results:**
- ✅ Progress indicator shows
- ✅ Import completes successfully
- ✅ Success message: "Successfully imported X Order Enquiry(ies)"
- ✅ Shows imported OE numbers and line counts
- ✅ Can navigate to OE List to verify

---

### Test 9: Import Execution - Error Handling

#### 9.1 Missing OE Control

**Steps:**
1. Upload CSV with OE number that doesn't have OE Control
2. Click "Import"

**Expected Results:**
- ✅ Error: "No OE Control record for OE {oeNo}"
- ✅ Error displayed in error report
- ✅ Error type: Critical
- ✅ Can retry after fixing

#### 9.2 Invalid Item

**Steps:**
1. Upload CSV with item number that doesn't exist
2. Click "Import"

**Expected Results:**
- ✅ Error: "Invalid item(s): {item1}, {item2}"
- ✅ Error displayed in error report
- ✅ Error type: Critical

#### 9.3 Missing Customer

**Steps:**
1. Upload CSV with OE that has no customer (edge case)
2. Click "Import"

**Expected Results:**
- ✅ Error: "Missing customer for OE {oeNo}. Create OE Control first (except INSP)."
- ✅ Error displayed in error report

---

### Test 10: Error Reporting

**Steps:**
1. Trigger an import error (e.g., missing OE Control)
2. Verify error report displays
3. Test error filtering:
   - Filter by "All"
   - Filter by "Critical"
   - Filter by "Warnings"
4. Test error sorting:
   - Sort by row number
   - Sort by type

**Expected Results:**
- ✅ Errors are displayed clearly
- ✅ Error types are distinguished
- ✅ Summary count is shown
- ✅ Filtering works
- ✅ Sorting works

---

### Test 11: Imported Data Verification

**Steps:**
1. Successfully import an OE
2. Navigate to `/order-enquiry/list`
3. Search for imported OE number
4. Click to view/edit imported OE
5. Verify:
   - OE header is correct
   - OE details are correct
   - Items match imported data
   - Quantities match imported data

**Expected Results:**
- ✅ Imported OE appears in list
- ✅ All data is correct
- ✅ Can edit imported OE
- ✅ Data integrity maintained

---

### Test 12: INSP Company Exception

**Prerequisites:**
- INSP company doesn't require OE Control

**Steps:**
1. Select Company Code: `INSP`
2. Upload CSV with OE number (without "IN-" prefix)
3. Import

**Expected Results:**
- ✅ OE Control validation is skipped
- ✅ "IN-" prefix is automatically added
- ✅ Import succeeds

---

### Test 13: Multiple OEs in One File

**Steps:**
1. Upload CSV with multiple OE numbers:
   ```
   OE Number,Item Number,Quantity,Price
   OE-DEMO-001,ITEM001,100,10.00
   OE-DEMO-002,ITEM001,50,10.00
   ```
2. Import

**Expected Results:**
- ✅ Multiple OEs are created
- ✅ Success message shows count of imported OEs
- ✅ All OEs are listed in results

---

### Test 14: BOM Processing

**Prerequisites:**
- Item with BOM exists

**Steps:**
1. Upload CSV with item that has BOM
2. Import

**Expected Results:**
- ✅ Head item is created
- ✅ Sub-items are automatically created
- ✅ Quantities are calculated correctly

---

### Test 15: Quantity Breakdown

**Steps:**
1. Upload CSV with port/PO/delivery date fields
2. Import

**Expected Results:**
- ✅ Quantity breakdown records are created
- ✅ Port, PO, delivery dates are saved

---

## Integration Testing

### Test 16: End-to-End Workflow

**Complete Flow:**
1. Create Item: `ITEM001`
2. Create Customer: `CUST001`
3. Create OE Control: `OE-DEMO-001` for `CUST001`
4. Navigate to Import page
5. Upload CSV with:
   ```
   OE Number,Item Number,Quantity,Price
   OE-DEMO-001,ITEM001,100,10.00
   ```
6. Map fields and import
7. Navigate to OE List
8. Verify imported OE appears
9. Click to view/edit
10. Verify all data is correct

**Expected Results:**
- ✅ Complete workflow works end-to-end
- ✅ No data loss
- ✅ All validations work
- ✅ Data integrity maintained

---

## Performance Testing

### Test 17: Large File Import

**Steps:**
1. Create CSV file with 100+ rows
2. Upload and import

**Expected Results:**
- ✅ File uploads successfully
- ✅ Import completes (may take longer)
- ✅ Progress indicator shows progress
- ✅ All rows are imported correctly

---

### Test 18: Response Times

**Steps:**
1. Measure API response time for import
2. Measure page load time for import page

**Expected Results:**
- ✅ API response: < 500ms (for small files)
- ✅ Page load: < 2 seconds

---

## Browser Compatibility

### Test 19: Browser Testing

**Test in:**
- Chrome/Edge (Chromium)
- Firefox
- Safari (if available)

**Expected Results:**
- ✅ File upload works in all browsers
- ✅ Drag-and-drop works in all browsers
- ✅ All features work consistently

---

## Error Scenarios

### Test 20: Network Error

**Steps:**
1. Disconnect network
2. Try to import

**Expected Results:**
- ✅ Error message displayed
- ✅ User can retry

---

### Test 21: Server Error

**Steps:**
1. Stop backend server
2. Try to import

**Expected Results:**
- ✅ Error message displayed
- ✅ User can retry

---

## Test Checklist

- [ ] File upload (drag-drop) works
- [ ] File upload (browse) works
- [ ] File type validation works
- [ ] File size validation works
- [ ] Field mapping (auto-detect) works
- [ ] Field mapping (manual) works
- [ ] Import execution (success) works
- [ ] Import execution (errors) works
- [ ] Error reporting displays correctly
- [ ] Imported data is correct
- [ ] INSP company exception works
- [ ] Multiple OEs import works
- [ ] BOM processing works
- [ ] Quantity breakdown works
- [ ] End-to-end workflow works
- [ ] Performance is acceptable
- [ ] Browser compatibility verified

---

## Known Issues

None currently identified.

---

## Test Data Files

### Sample CSV File

Create `test-oe-import.csv`:
```csv
OE Number,Item Number,Quantity,Price,Carton,PO Number
OE-DEMO-001,ITEM001,100,10.00,10,PO001
OE-DEMO-001,ITEM002,50,15.00,5,PO001
```

### Sample Excel File

Create `test-oe-import.xlsx` with similar structure.

---

## Troubleshooting

### Issue: File upload doesn't work

**Check:**
- Browser console for errors
- Network tab for API calls
- Backend server is running

### Issue: Import fails with "No OE Control record"

**Solution:**
- Create OE Control first
- Or use INSP company (doesn't require OE Control)

### Issue: Import fails with "Invalid item(s)"

**Solution:**
- Ensure all items exist in Item Master
- Check item numbers match exactly

---

**Last Updated:** January 24, 2026
