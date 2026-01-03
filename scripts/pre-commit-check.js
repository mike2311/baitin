#!/usr/bin/env node
/**
 * Pre-commit check script
 * Runs fast lint checks on staged files only (via lint-staged)
 * This is called by Husky pre-commit hook
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🔍 Running pre-commit checks (lint-staged)...\n');

try {
  // Run lint-staged which will lint only staged files
  execSync('npx lint-staged', {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..'),
  });
  console.log('\n✅ Pre-commit checks passed!\n');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Pre-commit checks failed. Fix errors before committing.\n');
  process.exit(1);
}

