# Pre-commit check script (PowerShell)
# Alternative to Husky for Windows users
# Run manually: .\scripts\pre-commit-check.ps1

$ErrorActionPreference = "Stop"
$exitCode = 0

Write-Host "🔍 Running pre-commit checks (lint-staged)..." -ForegroundColor Cyan
Write-Host ""

try {
    npx lint-staged
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`n❌ Pre-commit checks failed. Fix errors before committing.`n" -ForegroundColor Red
        exit 1
    }
    Write-Host "`n✅ Pre-commit checks passed!`n" -ForegroundColor Green
    exit 0
} catch {
    Write-Host "`n❌ Pre-commit checks failed: $_`n" -ForegroundColor Red
    exit 1
}





