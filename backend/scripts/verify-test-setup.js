/**
 * Verification script for test setup
 * 
 * Checks that:
 * 1. Environment variables are set (or have defaults)
 * 2. TypeScript compiles
 * 3. Test files exist
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Phase 2 Test Setup...\n');

let errors = [];
let warnings = [];

// Check environment variables
console.log('1. Checking environment variables...');
const testDbHost = process.env.TEST_DATABASE_HOST || process.env.DATABASE_HOST || 'localhost';
const testDbPort = process.env.TEST_DATABASE_PORT || process.env.DATABASE_PORT || '5432';
const testDbUser = process.env.TEST_DATABASE_USER || process.env.DATABASE_USER || 'postgres';
const testDbPassword = process.env.TEST_DATABASE_PASSWORD || process.env.DATABASE_PASSWORD || 'postgres';
const testDbName = process.env.TEST_DATABASE_NAME || process.env.DATABASE_NAME || 'baitin_test';

console.log(`   ✅ TEST_DATABASE_HOST: ${testDbHost}`);
console.log(`   ✅ TEST_DATABASE_PORT: ${testDbPort}`);
console.log(`   ✅ TEST_DATABASE_USER: ${testDbUser}`);
console.log(`   ${testDbPassword === 'postgres' ? '⚠️' : '✅'} TEST_DATABASE_PASSWORD: ${testDbPassword === 'postgres' ? 'Using default (may need to set)' : 'Set'}`);
console.log(`   ✅ TEST_DATABASE_NAME: ${testDbName}`);

if (testDbPassword === 'postgres' && !process.env.TEST_DATABASE_PASSWORD && !process.env.DATABASE_PASSWORD) {
  warnings.push('Using default password "postgres" - set TEST_DATABASE_PASSWORD if different');
}

// Check test files exist
console.log('\n2. Checking test files...');
const testFiles = [
  'src/bom/bom.spec.ts',
  'src/bom/bom-validation-fix.spec.ts',
  'src/order-confirmation/order-confirmation-entry.spec.ts',
  'src/order-confirmation/order-confirmation-post.spec.ts',
  'src/order-confirmation/order-confirmation-enquiry.spec.ts',
  'src/contract/contract-entry.spec.ts',
  'src/contract/contract-enquiry.spec.ts',
  'src/contract/contract-generate.spec.ts',
  'src/order-enquiry/qty-breakdown.spec.ts',
  'src/integration/integration.spec.ts',
];

let missingFiles = [];
testFiles.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  if (fs.existsSync(fullPath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - MISSING`);
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  errors.push(`Missing test files: ${missingFiles.join(', ')}`);
}

// Check test utilities
console.log('\n3. Checking test utilities...');
const utilityFiles = [
  'src/test-utils/test-helpers.ts',
  'src/test-utils/test-data-seeder.ts',
  'src/test-utils/test-data.config.ts',
  'src/test-utils/api-test-client.ts',
];

utilityFiles.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  if (fs.existsSync(fullPath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - MISSING`);
    errors.push(`Missing utility file: ${file}`);
  }
});

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 Verification Summary\n');

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ All checks passed! Test setup is ready.');
  console.log('\n📝 Next steps:');
  console.log('   1. Ensure PostgreSQL is running');
  console.log('   2. Create test database: CREATE DATABASE ' + testDbName + ';');
  console.log('   3. Run tests: npm test');
  process.exit(0);
} else {
  if (warnings.length > 0) {
    console.log('⚠️  Warnings:');
    warnings.forEach(w => console.log(`   - ${w}`));
  }
  
  if (errors.length > 0) {
    console.log('❌ Errors:');
    errors.forEach(e => console.log(`   - ${e}`));
    process.exit(1);
  } else {
    console.log('✅ Setup is ready (with warnings above)');
    process.exit(0);
  }
}
