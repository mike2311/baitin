# Task 01-03: Git Repository and CI/CD Setup

## Task Information

- **Phase**: 0 - Foundation
- **Sprint**: Week 1-2
- **Priority**: High
- **Estimated Effort**: 1 day
- **Dependencies**: Task 01-01 (Development Environment)
- **Assignee**: DevOps/Lead Developer

## Objective

Set up Git repository with proper branching strategy, commit conventions, and basic CI/CD pipeline for automated testing and building.

## Requirements

### 1. Git Repository Setup

#### Repository Initialization
- Initialize Git repository (if new)
- Or clone existing repository
- Configure remote repository (GitHub/GitLab/etc.)

#### Branching Strategy
- Main/Master branch (production-ready code)
- Develop branch (integration branch)
- Feature branches (feature/phase-0-task-01-xx)
- Hotfix branches (if needed)

### 2. Git Configuration

#### .gitignore
- Node modules (`node_modules/`)
- Build artifacts (`dist/`, `build/`)
- Environment files (`.env`, `.env.local`)
- IDE files (`.vscode/`, `.idea/`)
- OS files (`.DS_Store`, `Thumbs.db`)
- Database files (`.db`, `.sqlite`)
- Log files (`*.log`)

#### Commit Convention
- Use conventional commits (optional but recommended)
- Format: `type(scope): description`
- Types: feat, fix, docs, style, refactor, test, chore

### 3. CI/CD Pipeline

#### Basic Pipeline Steps
1. **Lint Check**: Run ESLint/TSLint
2. **Type Check**: Run TypeScript compiler check
3. **Unit Tests**: Run unit tests (when available)
4. **Build**: Build frontend and backend
5. **Integration Tests**: Run integration tests (when available)

#### Pipeline Triggers
- On pull request
- On push to develop/main branches
- Manual trigger option

#### Pipeline Tools (Choose One)
- GitHub Actions
- GitLab CI/CD
- Jenkins
- CircleCI
- Azure DevOps

### 4. Code Quality Tools

#### Pre-commit Hooks (Optional)
- Husky for Git hooks
- Lint-staged for staged files
- Pre-commit validation

#### Code Formatting
- Prettier configuration
- Auto-format on save (VS Code)
- Format check in CI/CD

## Implementation Steps

1. **Initialize Git Repository**
   - Create repository on Git hosting service
   - Clone or initialize locally
   - Configure remote

2. **Set Up .gitignore**
   - Create comprehensive .gitignore
   - Test with sample files
   - Document ignored patterns

3. **Configure Branching**
   - Create main/develop branches
   - Set up branch protection rules (if using)
   - Document branching strategy

4. **Set Up CI/CD Pipeline**
   - Choose CI/CD tool
   - Create pipeline configuration file
   - Configure pipeline steps
   - Test pipeline execution

5. **Set Up Pre-commit Hooks (Optional)**
   - Install Husky
   - Configure pre-commit hooks
   - Set up lint-staged

6. **Documentation**
   - Document branching strategy
   - Document commit conventions
   - Document CI/CD process
   - Document setup instructions

## Acceptance Criteria

- [ ] Git repository initialized and accessible
- [ ] .gitignore configured correctly
- [ ] Branching strategy documented and set up
- [ ] CI/CD pipeline configured and working
- [ ] Pipeline runs on pull requests
- [ ] Pipeline runs on push to main branches
- [ ] Lint check in pipeline working
- [ ] Build step in pipeline working
- [ ] Commit conventions documented
- [ ] Team can clone and set up repository

## .gitignore Template

```
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
build/
*.tsbuildinfo

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Testing
coverage/
.nyc_output/

# Logs
logs/
*.log

# Database
*.db
*.sqlite
*.sqlite3

# Temporary files
tmp/
temp/
```

## CI/CD Pipeline Example (GitHub Actions)

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint

  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run type-check

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
```

## Commit Convention Example

```
feat(frontend): add item entry form component
fix(backend): resolve database connection timeout
docs(readme): update setup instructions
refactor(api): improve error handling
test(item): add unit tests for item validation
chore(deps): update dependencies
```

## Testing Checklist

- [ ] Repository can be cloned by team members
- [ ] .gitignore prevents committing sensitive files
- [ ] CI/CD pipeline runs successfully
- [ ] Pipeline fails on lint errors
- [ ] Pipeline fails on build errors
- [ ] Branch protection works (if configured)

## Notes

- Start with simple CI/CD pipeline, add more checks as needed
- Consider adding automated dependency updates (Dependabot)
- Set up branch protection for main branch
- Document all conventions for team

## Dependencies

- Task 01-01: Development Environment Setup

## Next Tasks

- Continue with Phase 0 core components tasks

## References

- **PoC Strategy**: `../../../../docs/modernization-strategy/15-poc-strategy/poc-strategy.md`

