# Deploy BAITIN Frontend + Backend on Vercel

This guide gets the full app (React frontend + NestJS API) running on Vercel using **two Vercel projects** from the same repo. Both run on Vercel; the frontend calls the backend via the backend’s public URL.

> **Prerequisite:** Read [supabase-pooling.md](./supabase-pooling.md) first. Supabase **Session Pooler** is required for Vercel (Direct connection is not IPv4 compatible). Use the pooler host, port, and user in your backend env vars.

## Overview

- **Project 1 (Frontend):** Root Directory = **`frontend`**. Uses `frontend/vercel.json` to build and serve the React/Vite app.
- **Project 2 (Backend):** Root Directory = **`backend`**. Uses a minimal `backend/vercel.json` (install only) so the correct install runs; Vercel auto-detects NestJS and deploys it as a serverless function.

**Important:** Each project must have its **Root Directory** set in the Vercel project settings. If the backend build fails with `cd: frontend: No such file or directory`, do both: set Root Directory to **`backend`** and, in **Settings → General → Build & Development Settings**, remove any **Install Command** override (leave it empty so the repo’s `backend/vercel.json` is used).

After both are deployed, set `VITE_API_URL` on the frontend so it uses the backend’s URL.

---

## Step 1: Deploy the backend (second project)

1. In the [Vercel Dashboard](https://vercel.com/dashboard), click **Add New…** → **Project**.
2. Import the **same Git repository** you use for the frontend (e.g. `mike2311/baitin`).
3. **Root Directory:** Click **Edit**, set to **`backend`**, and confirm.  
   This makes Vercel build and run the NestJS app (it will find `backend/src/main.ts`).
4. **Framework Preset:** Leave as auto or “Other”. Do **not** override with a frontend framework.
5. **Build and Output:** Leave defaults. Do **not** set Output Directory—NestJS is deployed as a serverless function, not static files. (If you see “No Output Directory named dist”, the project is being treated as static; ensure Root Directory is `backend` and there is no `backend/vercel.json` that sets `outputDirectory` or only `buildCommand`.)
6. **Environment variables:** Add these in the project’s **Settings → Environment Variables** (for Production and Preview if you use them):

   | Name               | Value                          | Notes                    |
   |--------------------|--------------------------------|--------------------------|
   | `DATABASE_HOST`    | Session Pooler host only       | e.g. `aws-1-ap-southeast-1.pooler.supabase.com` — **not** `db.xxx.supabase.co` (see [supabase-pooling.md](./supabase-pooling.md)) |
   | `DATABASE_PORT`    | `5432` or `6543`               | From Supabase pooler settings |
   | `DATABASE_USER`    | `postgres.<project-ref>` or `postgres` | Pooler username format |
   | `DATABASE_PASSWORD`| Your Supabase DB password      | From Supabase dashboard  |
   | `DATABASE_NAME`    | `postgres`                     |                          |
   | `CORS_ORIGINS`     | Comma-separated allowed origins | e.g. `https://baitinfrontend.vercel.app,https://preview-xxx.vercel.app` |
   | `FRONTEND_URL`     | (Fallback) Single frontend URL | e.g. `https://baitinfrontend.vercel.app` — use `CORS_ORIGINS` for multiple |
   | `JWT_SECRET`       | A long random secret string    | Recommended in production |
   | `JWT_EXPIRES_IN`   | Token expiry (e.g. `24h`, `1d`) | Optional; app default is `1d` |

   Get these values from Supabase **Session Pooler** (not Direct connection). See [supabase-pooling.md](./supabase-pooling.md). Ensure the Supabase project is **not paused**.

7. Deploy the project. Wait for the deployment to finish and note the **backend URL**, e.g. `https://baitin-api-xxxxx.vercel.app`.  
   All API routes live under `/api`, e.g. `https://baitin-api-xxxxx.vercel.app/api/auth/login`.

---

## Step 2: Deploy the frontend (if not already)

1. Create a **frontend** Vercel project from the same repo.
2. Set **Root Directory** to **`frontend`**. This makes Vercel use `frontend/vercel.json` (build, output, SPA rewrites).
3. Deploy. Note your frontend URL (e.g. `https://baitinfrontend.vercel.app`).

The frontend `vercel.json` includes SPA rewrites so client-side routes (e.g. `/customers`, `/items`) load correctly when visited directly or refreshed. Without rewrites, paths like `/customers` would return 404.

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
| Frontend | **`frontend`** | `frontend/vercel.json` | Serves the React app + SPA rewrites. |
| Backend  | **`backend`**  | `backend/vercel.json` (install only) | Serves NestJS API (serverless).   |

- Frontend env: `VITE_API_URL` = `https://<backend-vercel-url>/api`.
- Backend env: `DATABASE_*` (use **Session Pooler**, see [supabase-pooling.md](./supabase-pooling.md)), `CORS_ORIGINS` (or `FRONTEND_URL`), optionally `JWT_SECRET`.
- Database: Supabase (Session Pooler); keep it active (unpaused) so the API can connect.

### Configuration Files Reference

| File | Purpose |
|------|---------|
| `frontend/vercel.json` | `buildCommand`, `outputDirectory`, `installCommand`, `rewrites` (SPA fallback to `/index.html`) |
| `backend/vercel.json` | `installCommand` only; NestJS deployed as serverless |

Once both projects are deployed and env vars are set, the full app runs on Vercel and login works against the backend.

---

## Troubleshooting

- **Backend build fails: `cd: frontend: No such file or directory`**  
  The backend is running an install command that includes `cd frontend`. Fix both: (1) Set **Root Directory** to **`backend`**. (2) In Vercel Dashboard → Backend project → **Settings** → **General** → **Build & Development Settings**, clear any **Override** for **Install Command** (or set it to `npm install`). The repo’s `backend/vercel.json` sets `installCommand` to `npm install` so the backend project uses the right install once Root Directory is correct.

- **Backend build fails: No Output Directory named "dist" found**  
  Vercel is treating the backend as a static site. `backend/vercel.json` must only set `installCommand`, not `buildCommand` or `outputDirectory`, so NestJS stays serverless. If you see this after editing `backend/vercel.json`, restore it to just `{ "installCommand": "npm install" }`.

- **Frontend build fails: No entrypoint found**  
  Set the frontend project’s **Root Directory** to **`frontend`** so Vercel uses `frontend/vercel.json`.

- **Backend returns 500 / FUNCTION_INVOCATION_FAILED on `/api/auth/login`**  
  The serverless function is failing. Check: (1) **Backend** project → **Settings** → **Environment Variables**: set all of `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`, `FRONTEND_URL`, and `JWT_SECRET` (values from your local `backend/.env`). Optionally set `JWT_EXPIRES_IN` (e.g. `24h`); you do **not** need `PORT` or `JWT_EXPIRATION`. (2) In Supabase Dashboard, ensure the project is **not paused**. (3) **Redeploy** the backend after changing env vars.

- **CORS / login works from same origin but fails from frontend**  
  Backend CORS uses `CORS_ORIGINS` (or `FRONTEND_URL` as fallback). In the backend Vercel project, set `CORS_ORIGINS` to a comma-separated list of allowed origins, e.g. `https://baitinfrontend.vercel.app,https://preview-xxx.vercel.app` (no trailing slashes). For a single origin, you can use `FRONTEND_URL` instead. Redeploy the backend after changing it.

- **`getaddrinfo ENOTFOUND` for database host**  
  You are using Supabase Direct connection (`db.xxx.supabase.co`) or a full connection URI in `DATABASE_HOST`. Vercel is IPv4-only; use the **Session Pooler** instead. See [supabase-pooling.md](./supabase-pooling.md). Set `DATABASE_HOST` to **only** the pooler host (e.g. `aws-1-ap-southeast-1.pooler.supabase.com`), not the full URI.

- **Frontend 404 on routes like `/customers` when visited directly or refreshed**  
  Ensure `frontend/vercel.json` includes `rewrites: [{ "source": "/(.*)", "destination": "/index.html" }]` so all non-file paths serve the SPA.
