# Quick Start Guide

## Prerequisites

1. Node.js installed (v18+)
2. PostgreSQL database running
3. Legacy DBF files (when ready to extract)

## Installation

```bash
cd backend/migration-cli
npm install
npm run build
```

## Configuration

Set environment variables:

```powershell
# Windows PowerShell
$env:ENV="POC"
$env:DB_HOST="localhost"
$env:DB_PORT="5432"
$env:DB_NAME="baitin_poc"
$env:DB_USER="postgres"
$env:DB_PASSWORD="your_password"
```

```bash
# Linux/Mac
export ENV=POC
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=baitin_poc
export DB_USER=postgres
export DB_PASSWORD=your_password
```

## Verify Installation

```bash
# Check version
npm run dev -- --version

# See all commands
npm run dev -- --help

# See help for specific command
npm run dev -- extract --help
npm run dev -- load --help
npm run dev -- validate --help
npm run dev -- reset --help
```

## Usage (When DBF Library Integrated)

### 1. Extract Data

```bash
npm run dev -- extract \
  --source ./path/to/dbf/files \
  --output ./extracted-data
```

This will:
- Read DBF files from source directory
- Convert to CSV format
- Generate manifest file
- Output to specified directory

### 2. Load Data

```bash
npm run dev -- load \
  --input ./extracted-data \
  --mode baseline
```

This will:
- Read CSV files from input directory
- Load into PostgreSQL in dependency order
- Use baseline mode (truncate + reload)

### 3. Validate Data

```bash
npm run dev -- validate \
  --manifest ./extracted-data/manifest.json \
  --output ./reports
```

This will:
- Compare extracted vs loaded row counts
- Validate uniqueness constraints
- Generate reconciliation report (Markdown + JSON)

### 4. Reset Database (if needed)

```bash
npm run dev -- reset \
  --input ./extracted-data \
  --confirm
```

This will:
- Truncate all tables
- Reload from extracted CSV files
- Use baseline mode

## Current Limitations

⚠️ **Extract command currently requires DBF library integration** - see `DBF_LIBRARY_INTEGRATION.md`

## Troubleshooting

### "Environment validation failed"
**Solution**: Set `ENV=POC` environment variable

### "Database connection failed"
**Solution**: Verify PostgreSQL is running and credentials are correct

### "DBF reading not yet implemented"
**Solution**: This is expected until DBF library is integrated (see DBF_LIBRARY_INTEGRATION.md)

### "Manifest file not found"
**Solution**: Run extract command first to generate manifest

## Logs

Logs are written to:
- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only

## Next Steps

1. Research and integrate DBF library (see `DBF_LIBRARY_INTEGRATION.md`)
2. Test with sample DBF files
3. Run full workflow
4. Validate results

