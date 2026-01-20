# Set Test Environment Variables for Phase 2 Tests
# Run this script before running tests

Write-Host "🔧 Setting test database environment variables..." -ForegroundColor Cyan
Write-Host ""

# Test database configuration (Docker container)
# Note: Docker maps container port 5432 to host port 5433
$env:TEST_DATABASE_HOST = "localhost"
$env:TEST_DATABASE_PORT = "5433"  # Docker port mapping (container uses 5432, host uses 5433)
$env:TEST_DATABASE_USER = "postgres"
$env:TEST_DATABASE_PASSWORD = "postgres"
$env:TEST_DATABASE_NAME = "baitin_test"

# Also set as fallback DATABASE_* variables
$env:DATABASE_HOST = $env:TEST_DATABASE_HOST
$env:DATABASE_PORT = $env:TEST_DATABASE_PORT
$env:DATABASE_USER = $env:TEST_DATABASE_USER
$env:DATABASE_PASSWORD = $env:TEST_DATABASE_PASSWORD
$env:DATABASE_NAME = $env:TEST_DATABASE_NAME

Write-Host "✅ Environment variables set:" -ForegroundColor Green
Write-Host "  TEST_DATABASE_HOST = $env:TEST_DATABASE_HOST"
Write-Host "  TEST_DATABASE_PORT = $env:TEST_DATABASE_PORT"
Write-Host "  TEST_DATABASE_USER = $env:TEST_DATABASE_USER"
Write-Host "  TEST_DATABASE_PASSWORD = $env:TEST_DATABASE_PASSWORD"
Write-Host "  TEST_DATABASE_NAME = $env:TEST_DATABASE_NAME"
Write-Host ""
Write-Host "🚀 You can now run tests:" -ForegroundColor Cyan
Write-Host "   cd backend"
Write-Host "   npm test"
Write-Host ""
Write-Host "Note: These variables are set for this PowerShell session only." -ForegroundColor Yellow
Write-Host "To make them permanent, add them to your system environment variables." -ForegroundColor Yellow
Write-Host ""
