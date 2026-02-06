# Database Setup Instructions

## Issue
The database tables don't exist yet, causing the error: `relation "users" does not exist`

## Solution

I've made two changes:

1. **Enabled `synchronize: true`** in `app.module.ts` - This will automatically create all database tables when the backend starts
2. **Created a user seeding script** - To create the default admin user

## Steps to Fix

1. **Restart the backend server** (it will automatically create all tables):
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Wait for the server to start** (tables will be created automatically)

3. **Create the admin user**:
   ```bash
   cd backend
   npm run seed-user
   ```

4. **Login credentials**:
   - **Username:** `admin`
   - **Password:** `admin123`
   - **Company:** `HT` (or any company code)

## What This Does

- `synchronize: true` tells TypeORM to automatically create/update database tables based on your entity definitions
- The seed script creates a default admin user with SUPERVISOR role
- After this, you should be able to login and test the Excel import

## Note

For production, you should:
- Disable `synchronize` and use proper migrations
- Change the default password
- Use environment-specific user seeding

But for PoC testing, this is the quickest way to get up and running!
