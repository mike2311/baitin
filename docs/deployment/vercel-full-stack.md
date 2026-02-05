# Deploy BAITIN Frontend + Backend on Vercel

This guide gets the full app (React frontend + NestJS API) running on Vercel using **two Vercel projects** from the same repo. Both run on Vercel; the frontend calls the backend via the backend’s public URL.

## Overview

- **Project 1 (Frontend):** Root Directory = **`frontend`**. Uses `frontend/vercel.json` to build and serve the React/Vite app.
- **Project 2 (Backend):** Root Directory = **`backend`**. Uses `backend/vercel.json` to build and run the NestJS API as a serverless function.

**Important:** Each project must have its **Root Directory** set in the Vercel project settings. If the backend build fails with `cd: frontend: No such file or directory`, the backend project is still using the wrong config—set Root Directory to **`backend`** and redeploy.

After both are deployed, set `VITE_API_URL` on the frontend so it uses the backend’s URL.

---

## Step 1: Deploy the backend (second project)

1. In the [Vercel Dashboard](https://vercel.com/dashboard), click **Add New…** → **Project**.
2. Import the **same Git repository** you use for the frontend (e.g. `mike2311/baitin`).
3. **Root Directory:** Click **Edit**, set to **`backend`**, and confirm.  
   This makes Vercel build and run the NestJS app (it will find `backend/src/main.ts`).
4. **Framework Preset:** Leave as auto or “Other”. Do **not** override with a frontend framework.
5. **Build and Output:**  
   - Build Command: `npm run build` (default when root is `backend`)  
   - Output Directory: leave empty (NestJS is deployed as a serverless function, not static files).
6. **Environment variables:** Add these in the project’s **Settings → Environment Variables** (for Production and Preview if you use them):

   | Name               | Value                          | Notes                    |
   |--------------------|--------------------------------|--------------------------|
   | `DATABASE_HOST`    | `db.xxxxx.supabase.co`         | Your Supabase host       |
   | `DATABASE_PORT`    | `5432`                         |                          |
   | `DATABASE_USER`    | `postgres`                     |                          |
   | `DATABASE_PASSWORD`| Your Supabase DB password      | From Supabase dashboard  |
   | `DATABASE_NAME`    | `postgres`                     |                          |
   | `FRONTEND_URL`     | Your frontend Vercel URL       | e.g. `https://baitin.vercel.app` |
   | `JWT_SECRET`       | A long random secret string    | Optional; app has a default |

   Replace `db.xxxxx.supabase.co` and the password with your real Supabase project values. Ensure the Supabase project is **not paused**.

7. Deploy the project. Wait for the deployment to finish and note the **backend URL**, e.g. `https://baitin-api-xxxxx.vercel.app`.  
   All API routes live under `/api`, e.g. `https://baitin-api-xxxxx.vercel.app/api/auth/login`.

---

## Step 2: Deploy the frontend (if not already)

1. Create a **frontend** Vercel project from the same repo.
2. Set **Root Directory** to **`frontend`**. This makes Vercel use `frontend/vercel.json` (build/output/install for the React app only).
3. Deploy. Note your frontend URL (e.g. `https://baitin.vercel.app`).

## Step 3: Point the frontend at the backend

1. Open the **frontend** Vercel project.
2. Go to **Settings → Environment Variables**.
3. Add:

   | Name            | Value                                      |
   |-----------------|--------------------------------------------|
   | `VITE_API_URL`  | `https://<backend-url>/api`                 |

   Replace `<backend-url>` with the backend project URL from Step 1 **without** a trailing slash, e.g. `https://baitin-api-xxxxx.vercel.app`.  
   Example: `VITE_API_URL` = `https://baitin-api-xxxxx.vercel.app/api`.

4. **Redeploy** the frontend (e.g. trigger a new deployment from the Deployments tab or push a commit).  
   The login page will then call the backend at `VITE_API_URL` (e.g. `/api/auth/login` on that host).

---

## Step 4: Seed the admin user (one-time)

The backend uses a database (Supabase). The default admin user must exist in that database.

- **Option A – Run the seed script locally** (with env pointing at the same Supabase DB):

  ```bash
  cd backend
  npm install
  # Set DATABASE_* env vars to your Supabase project, then:
  npx ts-node src/scripts/seed-user.ts
  ```

- **Option B – Run SQL in Supabase:**  
  In Supabase Dashboard → SQL Editor, create a user row that matches what the app expects (table and columns as in `backend/src/users/entities/user.entity.ts`), with a bcrypt-hashed password for `admin123`.  
  The seed script is the easiest: it creates username `admin`, password `admin123`, role SUPERVISOR, company HT.

After seeding, log in on the frontend with **admin** / **admin123** and company **HT**.

---

## Summary

| Project   | Root Directory | Config file           | Purpose                          |
|----------|----------------|------------------------|-----------------------------------|
| Frontend | **`frontend`** | `frontend/vercel.json` | Serves the React app.             |
| Backend  | **`backend`**  | `backend/vercel.json` | Serves NestJS API (serverless).   |

- Frontend env: `VITE_API_URL` = `https://<backend-vercel-url>/api`.
- Backend env: `DATABASE_*`, `FRONTEND_URL`, optionally `JWT_SECRET`.
- Database: Supabase (or any Postgres); keep it active (unpaused) so the API can connect.

Once both projects are deployed and env vars are set, the full app runs on Vercel and login works against the backend.

---

## Troubleshooting

- **Backend build fails: `cd: frontend: No such file or directory`**  
  The backend project is using the wrong config. In the backend project’s Vercel settings, set **Root Directory** to **`backend`** (and save). Then redeploy. The repo no longer has a root `vercel.json`; each app uses its own (`frontend/vercel.json` and `backend/vercel.json`).

- **Frontend build fails: No entrypoint found**  
  Set the frontend project’s **Root Directory** to **`frontend`** so Vercel uses `frontend/vercel.json`.
