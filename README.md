# BAITIN Trading Management System - PoC

This is the Proof of Concept (PoC) implementation for the BAITIN Trading Management System modernization.

## Phase 0: Foundation

This phase establishes the development infrastructure, core components, database schema, authentication framework, and UX kernel components.

## Prerequisites

- Node.js 18+ LTS
- PostgreSQL 14+ (or Docker)
- npm or yarn

## Quick Start

### Using Docker (Recommended)

1. Start PostgreSQL:
```bash
docker-compose up -d
```

2. Install dependencies:
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

3. Set up environment variables:
```bash
# Copy example files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

4. Run database migrations:
```bash
cd backend
npm run migration:run
```

5. Start development servers:
```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Without Docker

1. Install PostgreSQL 14+ locally
2. Create database: `baitin_poc_dev`
3. Create user: `baitin_dev` with password
4. Follow steps 2-5 above

## Project Structure

```
baitin-poc/
├── frontend/          # React + TypeScript + Vite
├── backend/           # NestJS API
├── docs/              # Documentation
└── docker-compose.yml # Docker setup
```

## Environment Variables

See `.env.example` files in frontend and backend directories.

## Development

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Documentation: http://localhost:3000/api/docs

## Documentation

- [PoC Strategy](docs/modernization-strategy/15-poc-strategy/poc-strategy.md)
- [Phased Delivery Plan](docs/modernization-strategy/11-phased-delivery-plan/phased-delivery-plan.md)
- [Phase 0 Tasks](docs/planning/poc_planning/00-phase-0-foundation/)

## License

Proprietary


