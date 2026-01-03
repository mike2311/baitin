# Migration CLI Testing Guide

## Quick Start Testing

### 1. Verify CLI Installation

```bash
cd backend/migration-cli
npm install
npm run build
npm run dev -- --version  # Should output: 1.0.0
```

### 2. Test All Commands Help

```bash
# Main help
npm run dev -- --help

# Individual command help
npm run dev -- extract --help
npm run dev -- load --help
npm run dev -- validate --help
npm run dev -- reset --help
```

All should display help text without errors.

### 3. Test Configuration Loading

The configuration system should load table mappings automatically. This is tested when commands run, but you can verify by attempting an extract command with invalid parameters (it will fail gracefully with error messages showing config was loaded).

### 4. Test Environment Validation

```bash
# Without ENV set (should fail)
npm run dev -- extract --source ./test --output ./test

# With ENV set (should proceed, but may fail on actual extraction)
$env:ENV="POC"
npm run dev -- extract --source ./test --output ./test
```

## Unit Testing

### Run Tests

```bash
npm test
```

**Current Status**: Tests are created but need configuration fixes for ES modules.

### Test Files Structure

- `src/utils/logger.util.spec.ts` - Logger utility tests
- `src/utils/environment.util.spec.ts` - Environment validation tests
- `src/config/migration.config.spec.ts` - Configuration loading tests
- `src/loader/transformer.service.spec.ts` - Data transformation tests

## Integration Testing

### Prerequisites

1. PostgreSQL database running (POC environment)
2. Sample DBF files (or create test data)
3. Environment variables set:
   ```bash
   $env:ENV="POC"
   $env:DB_HOST="localhost"
   $env:DB_PORT="5432"
   $env:DB_NAME="baitin_poc"
   $env:DB_USER="postgres"
   $env:DB_PASSWORD="your_password"
   ```

### Test Extract Command

```bash
# Create test directory with sample DBF files
mkdir test-data
# Copy your DBF files to test-data/

# Run extract
npm run dev -- extract \
  --source ./test-data \
  --output ./extracted
```

**Expected**: 
- Should extract data to CSV files
- Currently throws error about DBF library (expected until library is integrated)

### Test Load Command

```bash
# First, ensure you have extracted CSV files
# Then run load
npm run dev -- load \
  --input ./extracted \
  --manifest ./extracted/manifest.json
```

**Expected**: Data loads into PostgreSQL database

### Test Validate Command

```bash
npm run dev -- validate \
  --manifest ./extracted/manifest.json \
  --output ./reports
```

**Expected**: 
- Generates reconciliation report
- Shows row count matches/mismatches
- Validates integrity constraints

### Test Reset Command

```bash
# WARNING: This will truncate tables!
npm run dev -- reset \
  --input ./extracted \
  --confirm
```

**Expected**: 
- Prompts for confirmation (unless --confirm flag)
- Truncates tables
- Reloads data from extracted CSVs

## Manual Testing Checklist

- [ ] CLI help commands work
- [ ] Version command works
- [ ] Extract command validates environment
- [ ] Extract command validates required options
- [ ] Load command validates database connection
- [ ] Validate command generates reports
- [ ] Reset command requires confirmation
- [ ] Error messages are clear and helpful
- [ ] Logs are written to log files

## Performance Testing

### Small Dataset (< 1MB)
```bash
# Time the extract command
Measure-Command { npm run dev -- extract --source ./small-data --output ./small-extracted }
# Target: < 10 seconds
```

### Medium Dataset (1-10MB)
```bash
Measure-Command { npm run dev -- extract --source ./medium-data --output ./medium-extracted }
# Target: < 60 seconds
```

### Large Dataset (10-100MB)
```bash
Measure-Command { npm run dev -- extract --source ./large-data --output ./large-extracted }
# Target: < 10 minutes
```

## Debugging Tips

1. **Check Logs**: Logs are written to `logs/combined.log` and `logs/error.log`
2. **Enable Debug Logging**: Set `LOG_LEVEL=debug` environment variable
3. **Dry Run**: Use `--dry-run` flag where available to see what would happen
4. **Verbose Output**: Commands output status messages to console

## Common Issues

### Issue: "DBF reading not yet implemented"
**Status**: Expected until DBF library is integrated
**Solution**: Research and integrate appropriate npm package

### Issue: "Environment validation failed"
**Solution**: Set `ENV=POC` environment variable

### Issue: "Database connection failed"
**Solution**: Verify PostgreSQL is running and credentials are correct

### Issue: "Manifest file not found"
**Solution**: Run extract command first to generate manifest

