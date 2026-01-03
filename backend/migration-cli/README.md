# BAITIN Migration CLI Tool

Production-bound, config-driven migration CLI for extracting legacy FoxPro DBF/FPT data and loading into PostgreSQL.

## Status

**Phase 1.5 Implementation Complete** ✅

All core components are implemented and the CLI is functional. The following areas need completion:

### Known Issues / TODOs

1. **DBF Library Integration** (Priority: HIGH)
   - Currently throws error - requires DBF file reading library
   - Research and integrate appropriate npm package for Visual FoxPro DBF files
   - Options to investigate:
     - `shapefile` (supports DBF)
     - Custom implementation using binary file reading
     - Other FoxPro-specific libraries

2. **Unit Tests** (Priority: HIGH)
   - Need comprehensive unit tests for all services
   - Test files location: `backend/migration-cli/src/**/*.spec.ts`
   - Use Jest or Vitest for testing

3. **Integration Tests** (Priority: MEDIUM)
   - End-to-end test with sample DBF files
   - Test full extract → load → validate workflow

4. **Performance Testing** (Priority: MEDIUM)
   - Test with large files (>10MB)
   - Optimize CSV parsing and bulk loading
   - Add progress bars for long operations

5. **Error Handling** (Priority: MEDIUM)
   - Improve error messages
   - Add retry logic for transient failures
   - Better handling of encoding issues

## Installation

```bash
cd backend/migration-cli
npm install
```

## Usage

### Quick Start

```bash
# Extract data from DBF files
npm run extract

# Load extracted data into database
npm run load

# Validate migration
npm run validate
```

### Available Scripts

#### Core Migration Scripts
- `npm run extract` - Extract DBF/FPT files to CSV
- `npm run load` - Load CSV data into PostgreSQL
- `npm run validate` - Validate row counts
- `npm run validate:comprehensive` - Comprehensive validation (uniqueness, FKs, business rules)
- `npm run reset` - Reset database (WARNING: Destructive)

#### Data Quality Scripts
- `npm run data-quality:report` - Generate data quality report
- `npm run master-data:review` - Interactive master data review

#### Foreign Key Constraint Scripts
- `npm run fk:apply-soft` - Apply temporary soft FK constraints
- `npm run fk:validate-strict` - Validate readiness for strict FKs
- `npm run fk:apply-strict` - Apply strict FK constraints

#### Migration Execution
- `npm run migration:run <file>` - Execute SQL migration file

### Detailed Documentation

For detailed usage instructions, see:
- **Script Usage Guide**: [`docs/SCRIPT_USAGE.md`](docs/SCRIPT_USAGE.md) - Complete script reference with examples
- **Data Quality Workflow**: [`docs/data-quality-workflow.md`](docs/data-quality-workflow.md) - Data quality management workflow
- **Data Quality Report**: [`docs/data-quality-report.md`](docs/data-quality-report.md) - Data quality analysis

## Development

```bash
# Build
npm run build

# Run in development mode
npm run dev -- <command>

# Run tests (when implemented)
npm test
```

## Architecture

- **Commands**: CLI command handlers (`src/commands/`)
- **Extractor**: DBF/FPT reading and CSV export (`src/extractor/`)
- **Loader**: PostgreSQL loading with transformations (`src/loader/`)
- **Validator**: Validation and reconciliation (`src/validator/`)
- **Config**: Configuration management (`src/config/`)
- **Utils**: Logging, environment validation (`src/utils/`)


