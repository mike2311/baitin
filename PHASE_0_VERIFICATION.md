# Phase 0 Verification Checklist

## Quick Verification (15-20 minutes)

Before proceeding to Phase 1, please verify the following:

### 1. Environment Setup ✅
- [ ] Docker Compose starts PostgreSQL successfully
- [ ] Frontend dependencies install (`cd frontend && npm install`)
- [ ] Backend dependencies install (`cd backend && npm install`)

### 2. Backend Verification (5 min)
- [ ] Start backend: `cd backend && npm run start:dev`
- [ ] Backend starts without errors on port 3000
- [ ] Health check works: http://localhost:3000/api/health
- [ ] Swagger docs accessible: http://localhost:3000/api/docs
- [ ] Database connection successful (check logs)

### 3. Frontend Verification (5 min)
- [ ] Start frontend: `cd frontend && npm run dev`
- [ ] Frontend starts without errors on port 5173
- [ ] Login page displays: http://localhost:5173/login
- [ ] No console errors

### 4. Authentication Flow (5 min)
- [ ] Can access login page
- [ ] Login with: `admin` / `password123` / `HT`
- [ ] Login succeeds and redirects to dashboard
- [ ] Dashboard displays user info
- [ ] Logout works
- [ ] Protected routes redirect to login when not authenticated

### 5. Database Schema (2 min)
- [ ] Database tables created (check via pgAdmin or psql)
- [ ] Tables exist: users, item, customer, vendor, order_enquiry_control, order_enquiry_header, order_enquiry_detail

### 6. Code Quality (2 min)
- [ ] No TypeScript errors: `cd frontend && npm run type-check`
- [ ] No TypeScript errors: `cd backend && npm run build`
- [ ] Linting passes: `cd frontend && npm run lint`
- [ ] Linting passes: `cd backend && npm run lint`

## Optional: Component Testing

If you want to verify UX components work:

### TextInput Component
- [ ] Create a test page with TextInput
- [ ] Tab navigation works
- [ ] Enter key advances to next field
- [ ] Validation errors display

### Lookup Component
- [ ] Create a test page with Lookup
- [ ] Type-to-search triggers
- [ ] Arrow keys navigate results
- [ ] Enter selects item

### DataGrid Component
- [ ] Create a test page with DataGrid
- [ ] Grid renders with sample data
- [ ] Arrow keys navigate cells

## Recommendation

**You can proceed to Phase 1** after completing the Quick Verification checklist above.

**Why:**
- Phase 0 is foundation - core functionality is verified by manual testing
- Comprehensive unit/integration tests will be more valuable when testing Phase 1 features (Item Master, Customer Master, etc.)
- The foundation components will be tested naturally as you build Phase 1 features
- You can add tests incrementally during Phase 1 development

**What to add during Phase 1:**
- Unit tests for business logic (validation, calculations)
- Integration tests for API endpoints (Item, Customer, Vendor CRUD)
- Component tests for master data forms
- E2E tests for critical workflows

## If Issues Found

If any verification step fails:
1. Check error messages in console/logs
2. Verify environment variables are set correctly
3. Ensure PostgreSQL is running
4. Check that ports 3000 and 5173 are available
5. Review SETUP.md for troubleshooting

## Next Steps After Verification

Once verified, you're ready for:
- **Phase 1: Master Data Module** (Weeks 5-6)
  - Item Master (Entry form, Lookup, List)
  - Customer Master (Entry form, Lookup, List)
  - Vendor Master (Entry form, Lookup, List)


