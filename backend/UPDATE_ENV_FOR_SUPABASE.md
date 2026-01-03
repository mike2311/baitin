# Update .env File for Supabase Connection

## Current Issue
Your backend is trying to connect to `localhost` but the data is in Supabase. The `.env` file needs to be updated.

## Steps to Fix

### 1. Get Your Supabase Database Password
- Go to: https://supabase.com/dashboard/project/gfsnbwvhqwxvesmmajjh/database/settings
- If you don't know the password, click "Reset database password"
- Copy the password

### 2. Update `backend/.env` file

Add or update these lines in `backend/.env`:

```env
DATABASE_HOST=db.gfsnbwvhqwxvesmmajjh.supabase.co
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=YOUR_SUPABASE_PASSWORD_HERE
DATABASE_NAME=postgres
PORT=3001
```

**Important:** Replace `YOUR_SUPABASE_PASSWORD_HERE` with your actual Supabase password!

### 3. Restart Backend Server
- Stop the backend server (Ctrl+C in the PowerShell window)
- Start it again: `npm run start:dev`

### 4. Try Logging In
- Username: `admin`
- Password: `password123`
- Company: `HT`

## Verification

After updating `.env` and restarting, you should see:
- Backend connects successfully (no database errors)
- Login works with admin/password123

