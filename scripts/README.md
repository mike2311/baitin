# Pre-Commit and Pre-Push Scripts

This directory contains scripts that enforce CI checks before commits and pushes.

## Automatic Execution (Git Hooks)

These scripts are **automatically executed** by Git hooks via Husky:

- **Pre-commit**: Runs `pre-commit-check.js` automatically on `git commit`
- **Pre-push**: Runs `pre-push-check.js` automatically on `git push`

You don't need to run these manually unless testing or troubleshooting.

## Manual Execution

If you want to run checks manually (e.g., before committing):

### PowerShell (Windows)
```powershell
# Pre-commit check (fast, staged files only)
.\scripts\pre-commit-check.ps1

# Pre-push check (full CI validation)
.\scripts\pre-push-check.ps1
```

### Node.js (Cross-platform)
```bash
# Pre-commit check (fast, staged files only)
node scripts/pre-commit-check.js

# Pre-push check (full CI validation)
node scripts/pre-push-check.js
```

## What Each Script Does

### Pre-Commit Check (`pre-commit-check.js` / `pre-commit-check.ps1`)

**Fast validation on staged files only** (via lint-staged):
- Lints staged TypeScript/TSX files
- Auto-fixes lint issues where possible
- Type-checks staged files
- Builds backend if staged files changed

**Takes ~5-10 seconds** (only processes changed files)

### Pre-Push Check (`pre-push-check.js` / `pre-push-check.ps1`)

**Full CI validation** (mirrors GitHub Actions exactly):

1. **Lint Job**:
   - `npm ci` in frontend and backend
   - `npm run lint` in frontend (must pass with 0 warnings)
   - `npm run lint` in backend (auto-fixes issues)

2. **Type-Check Job**:
   - `npm run type-check` in frontend (`tsc --noEmit`)
   - `npm run build` in backend (TypeScript compilation)

3. **Build Job**:
   - `npm run build` in frontend (`tsc && vite build`)
   - `npm run build` in backend (`nest build`)

**Takes ~30-60 seconds** (full validation)

## Troubleshooting

### Hooks Not Running

1. Verify Husky is installed:
   ```bash
   npm list husky
   ```

2. Reinstall hooks:
   ```bash
   npm run prepare
   # or
   npx husky install
   ```

3. Check hook files exist:
   ```bash
   ls .husky/pre-commit .husky/pre-push
   ```

### Pre-Push Taking Too Long

The pre-push hook runs full CI checks. If it's too slow, you can:
- Run manually before final push: `node scripts/pre-push-check.js`
- Skip hook (emergency only): `git push --no-verify` ⚠️ **Not recommended**

### Scripts Failing

If scripts fail with permission errors (Windows):
```powershell
# Make scripts executable (PowerShell)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

If lint-staged isn't found:
```bash
npm install  # Ensures lint-staged is available
```

## Configuration

### Lint-Staged Config

Located in root `package.json`:
```json
"lint-staged": {
  "frontend/**/*.{ts,tsx}": [
    "cd frontend && npm run lint -- --fix",
    "cd frontend && npm run type-check"
  ],
  "backend/**/*.ts": [
    "cd backend && npm run lint -- --fix",
    "cd backend && npm run build"
  ]
}
```

### Hook Scripts

- `.husky/pre-commit` → calls `node scripts/pre-commit-check.js`
- `.husky/pre-push` → calls `node scripts/pre-push-check.js`

## Integration with CI/CD

The pre-push hook **exactly mirrors** `.github/workflows/ci.yml`:
- Same Node version (18)
- Same commands
- Same dependency installation (`npm ci`)
- Same validation steps

**If pre-push passes locally, GitHub Actions CI should pass.**



