#!/usr/bin/env node
/**
 * Pre-push check script
 * Runs full CI checks (lint, type-check, build) before push
 * This is called by Husky pre-push hook
 */

const { execSync } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

function runCommand(command, cwd, description) {
  try {
    console.log(`  ${description}...`);
    execSync(command, {
      stdio: 'inherit',
      cwd: cwd || rootDir,
      env: { ...process.env, FORCE_COLOR: '1' },
    });
    console.log(`  ✅ ${description} passed\n`);
    return true;
  } catch (error) {
    console.error(`  ❌ ${description} failed\n`);
    return false;
  }
}

console.log('🔍 Running pre-push CI checks...\n');
console.log('📋 Job 1/3: Linting...\n');

// Frontend lint
if (!runCommand('npm ci --silent', path.join(rootDir, 'frontend'), 'Frontend npm ci')) {
  process.exit(1);
}
if (!runCommand('npm run lint', path.join(rootDir, 'frontend'), 'Frontend lint')) {
  process.exit(1);
}

// Backend lint
if (!runCommand('npm ci --silent', path.join(rootDir, 'backend'), 'Backend npm ci')) {
  process.exit(1);
}
if (!runCommand('npm run lint', path.join(rootDir, 'backend'), 'Backend lint')) {
  process.exit(1);
}

console.log('📋 Job 2/3: Type-checking...\n');

// Frontend type-check
if (!runCommand('npm run type-check', path.join(rootDir, 'frontend'), 'Frontend type-check')) {
  process.exit(1);
}

// Backend build (type-check)
if (!runCommand('npm run build', path.join(rootDir, 'backend'), 'Backend build (type-check)')) {
  process.exit(1);
}

console.log('📋 Job 3/3: Building...\n');

// Frontend build
if (!runCommand('npm run build', path.join(rootDir, 'frontend'), 'Frontend build')) {
  process.exit(1);
}

// Backend build (already done above, but ensure it's clean)
if (!runCommand('npm run build', path.join(rootDir, 'backend'), 'Backend build')) {
  process.exit(1);
}

console.log('✅ All pre-push checks passed! Safe to push.\n');
process.exit(0);

