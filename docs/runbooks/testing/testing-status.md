# Testing Status and Next Steps

## ✅ Completed Setup

1. **Docker PostgreSQL**: Container configured and running (when Docker Desktop is active)
2. **Backend Server**: Running on http://localhost:3000
3. **Frontend Server**: Running on http://localhost:5173
4. **Database Tables**: All tables created successfully
5. **Test User**: Created (username: `admin`)

## ⚠️ Current Issues

### 1. Docker Desktop Connection
- **Status**: Docker Desktop appears to have stopped
- **Solution**: Start Docker Desktop and run:
  ```bash
  docker compose up -d
  ```

### 2. Authentication Password Hash
- **Status**: Password hash in database may be incorrect
- **Solution**: Run the SQL script to update password:
  ```bash
  docker exec -i baitin_poc_postgres psql -U baitin_dev -d baitin_poc_dev < backend/scripts/update-admin-password.sql
  ```
- **Alternative**: Use the Node.js script:
  ```bash
  cd backend
  node update-password.js
  ```

### 3. Frontend Server
- **Status**: May need restart
- **Solution**: 
  ```bash
  cd frontend
  npm run dev
  ```

## 📋 Testing Checklist

### Phase 1: Authentication Testing
- [ ] Start Docker Desktop
- [ ] Update admin password hash
- [ ] Test login via API (curl/Postman)
- [ ] Test login via frontend form
- [ ] Verify JWT token generation
- [ ] Test protected routes

### Phase 2: Item Master Testing
- [ ] Navigate to `/items` page
- [ ] Test Item Entry Form:
  - [ ] Create new item
  - [ ] Validate required fields
  - [ ] Test std_code lookup (zstdcode validation)
  - [ ] Test origin lookup (zorigin validation)
  - [ ] Test item_no uniqueness validation
  - [ ] Test keyboard navigation (Tab, Enter)
  - [ ] Test auto-advance on Enter
- [ ] Test Item List:
  - [ ] View items list
  - [ ] Test search/filter
  - [ ] Test type-to-search lookup
- [ ] Test Item Update:
  - [ ] Edit existing item
  - [ ] Validate updates
- [ ] Test Item Delete:
  - [ ] Delete item
  - [ ] Verify deletion

### Phase 3: Customer Master Testing
- [ ] Navigate to `/customers` page
- [ ] Test Customer Entry Form:
  - [ ] Create new customer
  - [ ] Validate required fields
  - [ ] Test cust_no uniqueness
  - [ ] Test keyboard navigation
- [ ] Test Customer List and Search
- [ ] Test Customer Update and Delete

### Phase 4: Vendor Master Testing
- [ ] Navigate to `/vendors` page
- [ ] Test Vendor Entry Form:
  - [ ] Create new vendor
  - [ ] Validate required fields
  - [ ] Test vendor_no uniqueness
  - [ ] Test keyboard navigation
- [ ] Test Vendor List and Search
- [ ] Test Vendor Update and Delete

### Phase 5: UX/UI Testing
- [ ] Keyboard-first navigation works
- [ ] Auto-advance on Enter key
- [ ] Type-to-search in lookup fields
- [ ] Inline validation messages
- [ ] Error handling and display
- [ ] Loading states
- [ ] Responsive design

## 🔧 Quick Fix Commands

### Restart Everything
```bash
# 1. Start Docker
docker compose up -d

# 2. Wait for PostgreSQL to be ready
Start-Sleep -Seconds 5

# 3. Update password
docker exec -i baitin_poc_postgres psql -U baitin_dev -d baitin_poc_dev < backend/scripts/update-admin-password.sql

# 4. Start backend (in separate terminal)
cd backend
npm run start:dev

# 5. Start frontend (in separate terminal)
cd frontend
npm run dev
```

### Test Login API
```powershell
$body = @{
    username = "admin"
    password = "password123"
    company = "HT"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method POST -ContentType "application/json" -Body $body
```

## 📝 Notes

- **Password**: `password123` (for admin user)
- **Backend URL**: http://localhost:3000
- **Frontend URL**: http://localhost:5173
- **Database**: PostgreSQL on port 5432
- **Debug Logging**: Added to `auth.service.ts` for troubleshooting

## 🐛 Known Issues

1. **Password Hash**: The initial password hash may have escaping issues. Use the update script.
2. **Docker Connection**: Docker Desktop must be running for database access.
3. **Frontend HMR**: May need manual refresh if HMR fails.

## 📚 Reference Files

- Password update script: `backend/scripts/update-admin-password.sql`
- Node.js password updater: `backend/update-password.js`
- Test user creation: `backend/create-test-user.sql`




