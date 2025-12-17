# Task 01-01: Development Environment Setup

## Task Information

- **Phase**: 0 - Foundation
- **Sprint**: Week 1
- **Priority**: Critical
- **Estimated Effort**: 2 days
- **Dependencies**: None
- **Assignee**: DevOps/Backend Developer

## Objective

Set up the complete development environment for the PoC, including Node.js, PostgreSQL, development tools, IDE configuration, and local development setup.

## Requirements

### 1. Runtime Environment

#### Node.js Setup
- Install Node.js 18+ LTS version
- Install npm or yarn package manager
- Verify installation: `node --version`, `npm --version`

#### PostgreSQL Setup
- Install PostgreSQL 14+ (or use Docker)
- Create development database: `baitin_poc_dev`
- Configure database user with appropriate permissions
- Verify connection: `psql -U username -d baitin_poc_dev`

#### Docker (Optional but Recommended)
- Docker Desktop installed
- Docker Compose for local services
- PostgreSQL container for development

### 2. Development Tools

#### Code Editor
- VS Code recommended
- Required extensions:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - GitLens
  - Docker (if using Docker)
  - PostgreSQL (database management)

#### Git
- Git installed and configured
- Git credentials set up
- SSH keys configured (if using SSH)

#### API Testing
- Postman or Insomnia installed
- REST Client extension for VS Code (alternative)

#### Database Management
- pgAdmin or DBeaver installed
- Or use VS Code PostgreSQL extension

### 3. Project Structure Setup

```
baitin-poc/
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── src/
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   └── src/
├── docs/
├── docker-compose.yml
├── .gitignore
└── README.md
```

### 4. Configuration Files

#### .gitignore
- Node modules
- Build artifacts
- Environment files (.env)
- IDE files
- Database files

#### Environment Variables
- `.env.example` template created
- `.env.development` for local development
- Environment variables documented

### 5. Package Management

#### Frontend Dependencies
- React 18+
- TypeScript
- Vite (build tool)
- React Router
- React Query
- React Hook Form
- shadcn/ui
- React Data Grid (Adazzle)

#### Backend Dependencies
- NestJS
- TypeScript
- TypeORM or Prisma
- PostgreSQL driver
- JWT authentication
- Class-validator
- Class-transformer

## Implementation Steps

1. **Install Runtime Environments**
   - Install Node.js 18+ LTS
   - Install PostgreSQL 14+ or set up Docker
   - Verify installations

2. **Set Up Project Structure**
   - Create project root directory
   - Initialize frontend project (Vite + React + TypeScript)
   - Initialize backend project (NestJS)
   - Set up folder structure

3. **Configure Development Tools**
   - Install VS Code and extensions
   - Configure ESLint and Prettier
   - Set up Git repository
   - Configure .gitignore

4. **Set Up Database**
   - Create development database
   - Configure database user
   - Test connection

5. **Install Dependencies**
   - Install frontend dependencies
   - Install backend dependencies
   - Verify all packages install correctly

6. **Create Configuration Files**
   - Create .env.example
   - Create .env.development
   - Configure build scripts
   - Set up start scripts

7. **Verify Setup**
   - Frontend dev server starts successfully
   - Backend dev server starts successfully
   - Database connection works
   - All tools accessible

## Acceptance Criteria

- [ ] Node.js 18+ installed and working
- [ ] PostgreSQL 14+ installed or Docker setup working
- [ ] Project structure created
- [ ] Frontend project initializes and runs (`npm run dev`)
- [ ] Backend project initializes and runs (`npm run start:dev`)
- [ ] Database connection successful
- [ ] VS Code configured with required extensions
- [ ] Git repository initialized
- [ ] .gitignore configured correctly
- [ ] Environment variables template created
- [ ] All dependencies install without errors
- [ ] Development servers start successfully

## Testing Checklist

- [ ] Frontend dev server starts on port 5173 (Vite default)
- [ ] Backend dev server starts on port 3000
- [ ] Database connection test passes
- [ ] Hot reload works in frontend
- [ ] Hot reload works in backend
- [ ] TypeScript compilation succeeds
- [ ] ESLint runs without errors (empty project)

## Configuration Examples

### Frontend package.json Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  }
}
```

### Backend package.json Scripts
```json
{
  "scripts": {
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "build": "nest build",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix"
  }
}
```

### .env.example Template
```
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=baitin_poc_dev
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=1d

# Server
PORT=3000
NODE_ENV=development
```

## Notes

- Use Docker for PostgreSQL to ensure consistency across team
- Document any additional setup steps for team onboarding
- Ensure all developers can replicate the setup
- Consider creating setup scripts for automation

## Dependencies

- None (foundational task)

## Next Tasks

- [Task 01-02](task-01-02-database-setup.md): Database Setup and Configuration
- [Task 01-03](task-01-03-git-and-cicd.md): Git Repository and CI/CD Setup

## References

- **PoC Strategy**: `../../../../docs/modernization-strategy/15-poc-strategy/poc-strategy.md`
- **Target Architecture**: `../../../../docs/modernization-strategy/03-target-state-architecture/`

