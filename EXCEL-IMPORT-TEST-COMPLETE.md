# Excel Import Testing - Complete Setup

## ✅ Setup Complete

1. **Database Tables Created**: Enabled `synchronize: true` - tables will be auto-created on backend startup
2. **Admin User Created**: Default login credentials are ready
3. **Servers Started**: Both backend and frontend are running

## 🔐 Login Credentials

- **Username:** `admin`
- **Password:** `admin123`
- **Company:** `HT` (or any company code)

## 📋 Testing Steps

### Step 1: Login
1. Navigate to: `http://localhost:5173/login`
2. Enter credentials:
   - Username: `admin`
   - Password: `admin123`
   - Company: `HT`
3. Click "Sign in"

### Step 2: Navigate to Excel Import
1. After login, go to: `http://localhost:5173/order-enquiry/import`
   - OR click "Import Excel" button from Order Enquiry List page

### Step 3: Test File Upload
1. **Select Company Code**: Choose `HT` (or another valid company)
2. **Upload File**: 
   - Use the test file: `test-import-sample.csv` (in project root)
   - Drag & drop the file onto the upload area
   - OR click "Browse Files" and select the file

### Step 4: Field Mapping
1. Review auto-detected field mappings (CSV headers should auto-map)
2. Adjust any mappings if needed using the dropdowns
3. Click "Continue to Preview"

### Step 5: Data Preview
1. Review the parsed data in the table
2. Check for any validation warnings/errors (shown as badges)
3. Click "Import Data" to proceed

### Step 6: Import Execution
1. Watch the progress indicator
2. Review import results:
   - Number of OEs imported
   - Any errors or warnings
3. Click "View Imported OEs" to see results

### Step 7: Verify Data
1. Navigate to Order Enquiry List: `http://localhost:5173/order-enquiry/list`
2. Verify the imported Order Enquiries appear in the list
3. Click on an OE to view details and verify data

## 📁 Test File

**File:** `test-import-sample.csv`

**Contents:**
```
OE Number,Item Number,Quantity,Unit Price,Delivery Date,Customer Code,Company Code
OE-TEST-001,ITEM001,100,10.50,2026-02-15,CUST001,HT
OE-TEST-001,ITEM002,50,25.00,2026-02-15,CUST001,HT
OE-TEST-002,ITEM001,200,10.50,2026-02-20,CUST001,HT
```

## 🎯 Expected Results

- ✅ File upload accepts CSV files
- ✅ Field mapping auto-detects CSV headers
- ✅ Data preview shows 3 rows of parsed data
- ✅ Import creates 2 Order Enquiries (OE-TEST-001 and OE-TEST-002)
- ✅ Success message shows "Successfully imported 2 Order Enquiry(ies)"
- ✅ Imported OEs appear in Order Enquiry List

## 🔧 Troubleshooting

### If login fails:
- Check backend is running: `http://localhost:3001/api/docs`
- Verify database connection in `.env` file
- Check backend terminal for errors

### If import fails:
- Verify backend API is accessible
- Check browser console for errors
- Verify test data (Customer, Item) exists in database
- Check backend terminal for import errors

### If servers aren't running:
- Backend: `cd backend && npm run start:dev`
- Frontend: `cd frontend && npm run dev`

## 📊 PoC Completion Status

After successful testing:
- ✅ Excel Import Frontend: Complete
- ✅ Excel Import Backend: Complete (from previous work)
- ✅ Database Setup: Complete
- ✅ User Authentication: Complete
- ⏳ Demo Preparation: Ready for testing

## Next Steps After Testing

1. Document any issues found
2. Fix any bugs discovered
3. Prepare demo data
4. Finalize demo script
5. Assess overall PoC completion
