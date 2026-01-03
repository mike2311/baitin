# DBF Library Integration Guide

## Current Status

The `DbfReaderService` has a placeholder implementation that throws errors until a DBF library is integrated. The service structure is complete with proper interfaces.

## Requirements

We need to read Visual FoxPro DBF files with:
- Character encoding conversion (Windows-1252 to UTF-8)
- Streaming/batched reading for large files
- Support for all FoxPro data types (C, N, D, L, M, F, I, T)
- Memo field support (FPT files)

## Research Options

### Option 1: `shapefile` Package
- **Package**: `shapefile` (includes DBF support)
- **Pros**: Well-maintained, handles encoding
- **Cons**: Designed for shapefiles, may have overhead
- **Install**: `npm install shapefile`

### Option 2: `node-dbf` Package
- **Package**: Search npm for `node-dbf` variants
- **Pros**: Direct DBF support
- **Cons**: May not support Visual FoxPro format
- **Status**: Need to verify Visual FoxPro compatibility

### Option 3: Custom Binary Reader
- **Approach**: Implement DBF file format parser directly
- **Pros**: Full control, optimized for our needs
- **Cons**: More development time, needs testing
- **Reference**: DBF file format specification

### Option 4: Use Existing Python/Other Tool
- **Approach**: Shell out to external tool, parse output
- **Pros**: Can use mature tools
- **Cons**: Additional dependency, cross-platform issues

## Recommended Approach

1. **Try `shapefile` first** - It's well-maintained and handles DBF as part of shapefile format
2. **If that doesn't work, try npm search for "dbf" packages** and test Visual FoxPro compatibility
3. **Fallback to custom implementation** if no library works

## Implementation Steps

Once a library is chosen:

1. Install the package:
   ```bash
   npm install <package-name>
   npm install --save-dev @types/<package-name>  # if types available
   ```

2. Update `dbf-reader.service.ts`:
   - Import the library
   - Implement `readHeader()` method
   - Implement `readRecords()` async generator
   - Test with sample DBF files

3. Update `package.json` dependencies

4. Test with real DBF files from the legacy system

5. Handle encoding conversion using `iconv-lite` (already included)

6. Integrate FPT memo file reading if needed

## Testing

After integration:
1. Test with small DBF file (< 1MB)
2. Test with medium DBF file (1-10MB)
3. Test with large DBF file (10-100MB)
4. Test encoding conversion
5. Test all data types (string, number, date, boolean, memo)
6. Test streaming performance

