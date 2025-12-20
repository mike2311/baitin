# BAITIN PoC - Setup Guide

## Prerequisites

- Node.js 18+ LTS
- PostgreSQL 14+ (or Docker)
- npm or yarn

## Quick Start

### 1. Clone Repository

```bash
git clone <repository-url>
cd baitin
```

### 2. Start Database (Docker)

```bash
docker-compose up -d
```

Or install PostgreSQL locally and create database:
```sql
CREATE DATABASE baitin_poc_dev;
CREATE USER baitin_dev WITH PASSWORD 'baitin_dev_password';
GRANT ALL PRIVILEGES ON DATABASE baitin_poc_dev TO baitin_dev;
```

### 3. Install Dependencies

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 4. Configure Environment

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your database credentials

# Frontend
cd ../frontend
cp .env.example .env
# Edit .env if needed
```

### 5. Run Database Migrations

The database schema will be created automatically on first run (synchronize: true in development).

To seed initial data, you can create a simple script or use the seed function in `backend/src/database/seeds/seed.ts`.

### 6. Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 7. Access Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Documentation: http://localhost:3000/api/docs

## Default Credentials

- Username: `admin`
- Password: `password123`
- Company: `HT`

## Development

### Frontend

- Development server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Type check: `npm run type-check`

### Backend

- Development server: `npm run start:dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Test: `npm run test`

## Project Structure

```
baitin/
├── frontend/          # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   └── store/       # State management
│   └── package.json
├── backend/           # NestJS API
│   ├── src/
│   │   ├── auth/        # Authentication module
│   │   ├── users/       # User management
│   │   ├── items/       # Item master
│   │   ├── customers/   # Customer master
│   │   ├── vendors/     # Vendor master
│   │   └── order-enquiry/ # Order Enquiry module
│   └── package.json
└── docs/              # Documentation
```

## Troubleshooting

### Database Connection Issues

1. Verify PostgreSQL is running
2. Check database credentials in `.env`
3. Ensure database exists: `psql -U baitin_dev -d baitin_poc_dev`

### Port Already in Use

- Frontend (5173): Change in `frontend/vite.config.ts`
- Backend (3000): Change in `backend/.env`

### Module Not Found

Run `npm install` in both frontend and backend directories.

## Next Steps

After setup, you can:
1. Explore the API documentation at http://localhost:3000/api/docs
2. Test authentication with default credentials
3. Start developing Phase 1 features

## References

- [PoC Strategy](docs/modernization-strategy/15-poc-strategy/poc-strategy.md)
- [Phase 0 Tasks](docs/planning/poc_planning/00-phase-0-foundation/)


