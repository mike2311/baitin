/**
 * Debug script to investigate why order_enquiry_detail loads 0 rows
 * Using 5 Why approach:
 * 1. Why 0 rows? -> transformedRecords is empty
 * 2. Why empty? -> Either CSV parsing fails OR all records filtered during transformation
 * 3. Why filtered? -> Required fields missing or invalid
 * 4. Why missing? -> Field name mismatch between CSV headers and field mappings
 * 5. Why mismatch? -> Case sensitivity or exact name mismatch
 */

import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load configs
const tableMappings = JSON.parse(fs.readFileSync(path.join(__dirname, 'config/table-mappings.json'), 'utf-8'));
const fieldMappings = JSON.parse(fs.readFileSync(path.join(__dirname, 'config/field-mappings.json'), 'utf-8'));

// Find moe table mapping
const moeTableMapping = tableMappings.tables.find(t => t.legacyTable === 'moe');
const moeFieldMappings = fieldMappings.moe || {};

console.log('=== 5 WHY ANALYSIS ===\n');

console.log('1. WHY: Is CSV file readable and has data?');
const csvPath = path.join(__dirname, 'test-output/extracted/moe.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n').filter(l => l.trim());
console.log(`   CSV file lines: ${lines.length}`);
console.log(`   CSV file size: ${(csvContent.length / 1024 / 1024).toFixed(2)} MB\n`);

console.log('2. WHY: Are CSV headers matching field mapping keys?');
const csvHeaders = lines[0].split(',').map(h => h.trim());
console.log(`   CSV headers (first 10): ${csvHeaders.slice(0, 10).join(', ')}`);
console.log(`   Total CSV columns: ${csvHeaders.length}`);
console.log(`   Field mapping keys: ${Object.keys(moeFieldMappings).join(', ')}\n`);

// Check for required fields
const requiredFields = Object.entries(moeFieldMappings)
  .filter(([key, mapping]) => mapping.required)
  .map(([key]) => key);
console.log(`   Required fields in mapping: ${requiredFields.join(', ')}\n`);

console.log('3. WHY: Are required field names present in CSV headers?');
const missingInCsv = requiredFields.filter(field => !csvHeaders.includes(field));
if (missingInCsv.length > 0) {
  console.log(`   ❌ MISSING IN CSV: ${missingInCsv.join(', ')}`);
} else {
  console.log(`   ✅ All required fields found in CSV headers`);
}

// Case-insensitive check
const missingCaseInsensitive = requiredFields.filter(field => 
  !csvHeaders.some(h => h.toLowerCase() === field.toLowerCase())
);
if (missingCaseInsensitive.length > 0) {
  console.log(`   ⚠️  Case mismatch: ${missingCaseInsensitive.join(', ')}`);
  console.log(`      CSV has: ${csvHeaders.filter(h => missingCaseInsensitive.some(f => f.toLowerCase() === h.toLowerCase())).join(', ')}`);
}

console.log('\n4. WHY: Can CSV be parsed correctly?');
let parsedRecords = [];
try {
  parsedRecords = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_quotes: true,
    relax_column_count: true,
    cast: false
  });
  console.log(`   ✅ Parsed ${parsedRecords.length} records`);
} catch (error) {
  console.log(`   ❌ Parse error: ${error.message}`);
}

if (parsedRecords.length > 0) {
  console.log('\n5. WHY: Are required fields present in parsed records?');
  const firstRecord = parsedRecords[0];
  console.log(`   First record keys: ${Object.keys(firstRecord).slice(0, 10).join(', ')}`);
  
  for (const field of requiredFields) {
    const value = firstRecord[field];
    const hasValue = value !== null && value !== undefined && value !== '';
    console.log(`   ${field}: ${hasValue ? '✅' : '❌'} value="${value}" (type: ${typeof value})`);
  }
  
  console.log('\n6. Sample first record (required fields only):');
  const sample = {};
  for (const field of requiredFields) {
    sample[field] = firstRecord[field];
  }
  console.log(JSON.stringify(sample, null, 2));
}

console.log('\n=== DIAGNOSIS ===');
if (missingInCsv.length > 0) {
  console.log(`❌ ROOT CAUSE: Required fields missing from CSV: ${missingInCsv.join(', ')}`);
} else if (parsedRecords.length === 0) {
  console.log(`❌ ROOT CAUSE: CSV parsing returned 0 records`);
} else {
  const firstRecord = parsedRecords[0];
  const missingValues = requiredFields.filter(field => {
    const value = firstRecord[field];
    return value === null || value === undefined || value === '';
  });
  if (missingValues.length > 0) {
    console.log(`❌ ROOT CAUSE: Required fields have null/empty values: ${missingValues.join(', ')}`);
  } else {
    console.log(`✅ CSV looks good - issue might be in transformation logic`);
  }
}
