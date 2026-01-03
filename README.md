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

## Phase 1.5: Legacy Data Migration

Phase 1.5 provides a production-bound, config-driven migration CLI tool to extract legacy FoxPro DBF/FPT data and load it into the PoC PostgreSQL database.

### Migration CLI Tool

The migration CLI is located in `backend/migration-cli/` and provides commands for extracting, loading, validating, and resetting legacy data.

#### Setup

1. Install dependencies:
```bash
cd backend/migration-cli
npm install
```

2. Build the CLI:
```bash
npm run build
```

#### Environment Configuration

Set the following environment variables:
```bash
ENV=POC  # Required: Must be set to 'POC' for safety guardrails
DB_HOST=localhost
DB_PORT=5432
DB_NAME=baitin_poc
DB_USER=postgres
DB_PASSWORD=your_password
```

#### Usage

##### Extract Legacy Data

Extract data from legacy DBF/FPT files to CSV format:

```bash
# From migration-cli directory
npm run extract -- --source /path/to/legacy/dbf/files --output ./extracted

# Or using backend scripts
cd ../../
npm run migration:extract -- --source /path/to/legacy/dbf/files --output ./migration-cli/extracted
```

##### Load Data to PostgreSQL

Load extracted CSV files into PostgreSQL:

```bash
# Baseline mode (truncate + reload)
npm run load -- --input ./extracted --mode baseline

# Or using backend scripts
npm run migration:load -- --input ./migration-cli/extracted --mode baseline
```

##### Validate Migration

Validate and reconcile migrated data:

```bash
npm run validate -- --manifest ./extracted/extraction-manifest.json

# Or using backend scripts
npm run migration:validate -- --manifest ./migration-cli/extracted/extraction-manifest.json
```

##### Reset Database

Reset database to baseline dataset:

```bash
# Requires confirmation
npm run reset

# Skip confirmation prompt
npm run reset -- --confirm

# Dry run (show what would be changed)
npm run reset -- --dry-run

# Or using backend scripts
npm run migration:reset -- --confirm
```

#### Configuration Files

- **Table Mappings**: `backend/migration-cli/config/table-mappings.json`
  - Defines legacy → PostgreSQL table mappings, load order, and strategies

- **Field Mappings**: `backend/migration-cli/config/field-mappings.json`
  - Defines field name mappings, type conversions, and transformation rules

- **Baseline Config**: `backend/migration-cli/config/baseline-config.json`
  - Defines baseline dataset contents and filter rules

#### Workflow

1. **Extract**: Extract legacy DBF/FPT files to CSV format
2. **Load**: Load CSV files into PostgreSQL in dependency order
3. **Validate**: Verify row counts, integrity constraints, and data quality
4. **Reset** (as needed): Restore baseline dataset for testing/demos

#### Safety Guardrails

- Environment check: Requires `ENV=POC` to prevent accidental execution
- Confirmation prompts: Reset operations require explicit confirmation
- Transaction support: Load operations use transactions for rollback safety
- Logging: Comprehensive logging to `backend/migration-cli/logs/`

For more details, see:
- [Phase 1.5 Documentation](docs/planning/poc_planning/01.5-phase-1-data-migration/)
- [Migration Scope](docs/planning/poc_planning/01.5-phase-1-data-migration/SCOPE.md)

## Documentation

- [PoC Strategy](docs/modernization-strategy/15-poc-strategy/poc-strategy.md)
- [Phased Delivery Plan](docs/modernization-strategy/11-phased-delivery-plan/phased-delivery-plan.md)
- [Phase 0 Tasks](docs/planning/poc_planning/00-phase-0-foundation/)
- [Phase 1.5 Migration](docs/planning/poc_planning/01.5-phase-1-data-migration/)

## License

Proprietary


