# Pre-push check script (PowerShell)
# Alternative to Husky for Windows users
# Run manually: .\scripts\pre-push-check.ps1
# Or set as Git hook: .git/hooks/pre-push

$ErrorActionPreference = "Stop"
$exitCode = 0
$rootDir = $PSScriptRoot | Split-Path -Parent

function Run-Command {
    param(
        [string]$Command,
        [string]$WorkingDir,
        [string]$Description
    )
    
    try {
        Write-Host "  $Description..." -ForegroundColor Gray
        Push-Location $WorkingDir
        Invoke-Expression $Command | Out-Host
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  ❌ $Description failed`n" -ForegroundColor Red
            Pop-Location
            return $false
        }
        Write-Host "  ✅ $Description passed`n" -ForegroundColor Green
        Pop-Location
        return $true
    } catch {
        Write-Host "  ❌ $Description failed: $_`n" -ForegroundColor Red
        Pop-Location
        return $false
    }
}

Write-Host "🔍 Running pre-push CI checks...`n" -ForegroundColor Cyan
Write-Host "📋 Job 1/3: Linting...`n" -ForegroundColor Yellow

# Frontend lint
if (-not (Run-Command "npm ci --silent" "$rootDir\frontend" "Frontend npm ci")) { exit 1 }
if (-not (Run-Command "npm run lint" "$rootDir\frontend" "Frontend lint")) { exit 1 }

# Backend lint
if (-not (Run-Command "npm ci --silent" "$rootDir\backend" "Backend npm ci")) { exit 1 }
if (-not (Run-Command "npm run lint" "$rootDir\backend" "Backend lint")) { exit 1 }

Write-Host "📋 Job 2/3: Type-checking...`n" -ForegroundColor Yellow

# Frontend type-check
if (-not (Run-Command "npm run type-check" "$rootDir\frontend" "Frontend type-check")) { exit 1 }

# Backend build (type-check)
if (-not (Run-Command "npm run build" "$rootDir\backend" "Backend build (type-check)")) { exit 1 }

Write-Host "📋 Job 3/3: Building...`n" -ForegroundColor Yellow

# Frontend build
if (-not (Run-Command "npm run build" "$rootDir\frontend" "Frontend build")) { exit 1 }

# Backend build (already done, but ensure clean)
if (-not (Run-Command "npm run build" "$rootDir\backend" "Backend build")) { exit 1 }

Write-Host "✅ All pre-push checks passed! Safe to push.`n" -ForegroundColor Green
exit 0



