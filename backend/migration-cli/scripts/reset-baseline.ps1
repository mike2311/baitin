# Reset Baseline Script (PowerShell)
# Wrapper script for resetting PoC database to baseline dataset

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$CliDir = Split-Path -Parent $ScriptDir

# Check environment
if ($env:ENV -ne "POC" -and $env:NODE_ENV -ne "POC") {
    Write-Host "ERROR: ENV must be set to 'POC'" -ForegroundColor Red
    Write-Host "Current ENV: $($env:ENV)" -ForegroundColor Yellow
    exit 1
}

Write-Host "Resetting database to baseline..." -ForegroundColor Blue
Set-Location $CliDir

npm run reset -- --confirm

Write-Host "Reset completed successfully" -ForegroundColor Green


