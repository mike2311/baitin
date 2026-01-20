# Setup Test Database Script
# Creates the test database for Phase 2 tests

param(
    [string]$DbName = "baitin_test",
    [string]$DbUser = "postgres",
    [string]$DbPassword = "postgres",
    [string]$DbHost = "localhost",
    [int]$DbPort = 5432,
    [string]$PostgresBinPath = ""
)

Write-Host "🔧 Setting up test database..." -ForegroundColor Cyan
Write-Host ""

# Try to find PostgreSQL installation
if ([string]::IsNullOrEmpty($PostgresBinPath)) {
    $possiblePaths = @(
        "C:\Program Files\PostgreSQL\16\bin",
        "C:\Program Files\PostgreSQL\15\bin",
        "C:\Program Files\PostgreSQL\14\bin",
        "C:\Program Files\PostgreSQL\13\bin",
        "C:\Program Files (x86)\PostgreSQL\16\bin",
        "C:\Program Files (x86)\PostgreSQL\15\bin"
    )
    
    foreach ($path in $possiblePaths) {
        if (Test-Path $path) {
            $PostgresBinPath = $path
            Write-Host "✅ Found PostgreSQL at: $PostgresBinPath" -ForegroundColor Green
            break
        }
    }
}

if ([string]::IsNullOrEmpty($PostgresBinPath)) {
    Write-Host "❌ PostgreSQL not found in common locations." -ForegroundColor Red
    Write-Host ""
    Write-Host "Please either:" -ForegroundColor Yellow
    Write-Host "  1. Add PostgreSQL bin directory to PATH, OR" -ForegroundColor Yellow
    Write-Host "  2. Run this script with -PostgresBinPath parameter:" -ForegroundColor Yellow
    Write-Host "     .\setup-test-database.ps1 -PostgresBinPath 'C:\Program Files\PostgreSQL\16\bin'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Or use Supabase instead (see docs/runbooks/testing/test-database-setup.md)" -ForegroundColor Yellow
    exit 1
}

$psqlPath = Join-Path $PostgresBinPath "psql.exe"

if (-not (Test-Path $psqlPath)) {
    Write-Host "❌ psql.exe not found at: $psqlPath" -ForegroundColor Red
    exit 1
}

Write-Host "📊 Database Configuration:" -ForegroundColor Cyan
Write-Host "  Host: $DbHost"
Write-Host "  Port: $DbPort"
Write-Host "  User: $DbUser"
Write-Host "  Database: $DbName"
Write-Host ""

# Set password environment variable
$env:PGPASSWORD = $DbPassword

# Check if PostgreSQL is running
Write-Host "🔍 Checking PostgreSQL connection..." -ForegroundColor Cyan
$checkResult = & $psqlPath -U $DbUser -h $DbHost -p $DbPort -d postgres -c "SELECT version();" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Cannot connect to PostgreSQL!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error details:" -ForegroundColor Yellow
    Write-Host $checkResult
    Write-Host ""
    Write-Host "Please ensure:" -ForegroundColor Yellow
    Write-Host "  1. PostgreSQL service is running" -ForegroundColor Yellow
    Write-Host "  2. Credentials are correct (user: $DbUser, password: $DbPassword)" -ForegroundColor Yellow
    Write-Host "  3. PostgreSQL is listening on $DbHost`:$DbPort" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ PostgreSQL connection successful!" -ForegroundColor Green
Write-Host ""

# Check if database already exists
Write-Host "🔍 Checking if database '$DbName' exists..." -ForegroundColor Cyan
$dbExists = & $psqlPath -U $DbUser -h $DbHost -p $DbPort -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DbName'" 2>&1

if ($dbExists -eq "1") {
    Write-Host "⚠️  Database '$DbName' already exists." -ForegroundColor Yellow
    $response = Read-Host "Do you want to drop and recreate it? (y/N)"
    if ($response -eq "y" -or $response -eq "Y") {
        Write-Host "🗑️  Dropping existing database..." -ForegroundColor Cyan
        & $psqlPath -U $DbUser -h $DbHost -p $DbPort -d postgres -c "DROP DATABASE IF EXISTS $DbName;" 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Failed to drop database" -ForegroundColor Red
            exit 1
        }
        Write-Host "✅ Database dropped" -ForegroundColor Green
    } else {
        Write-Host "✅ Using existing database '$DbName'" -ForegroundColor Green
        Write-Host ""
        Write-Host "📝 Environment variables to set:" -ForegroundColor Cyan
        Write-Host "  `$env:TEST_DATABASE_HOST = '$DbHost'"
        Write-Host "  `$env:TEST_DATABASE_PORT = '$DbPort'"
        Write-Host "  `$env:TEST_DATABASE_USER = '$DbUser'"
        Write-Host "  `$env:TEST_DATABASE_PASSWORD = '$DbPassword'"
        Write-Host "  `$env:TEST_DATABASE_NAME = '$DbName'"
        exit 0
    }
}

# Create database
Write-Host "📦 Creating database '$DbName'..." -ForegroundColor Cyan
$createResult = & $psqlPath -U $DbUser -h $DbHost -p $DbPort -d postgres -c "CREATE DATABASE $DbName;" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create database!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error details:" -ForegroundColor Yellow
    Write-Host $createResult
    exit 1
}

Write-Host "✅ Database '$DbName' created successfully!" -ForegroundColor Green
Write-Host ""

# Verify database
Write-Host "🔍 Verifying database..." -ForegroundColor Cyan
$verifyResult = & $psqlPath -U $DbUser -h $DbHost -p $DbPort -d $DbName -c "SELECT current_database();" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database verification successful!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Database created but verification failed" -ForegroundColor Yellow
    Write-Host $verifyResult
}

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "✅ Test Database Setup Complete!" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Set these environment variables:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  `$env:TEST_DATABASE_HOST = '$DbHost'" -ForegroundColor White
Write-Host "  `$env:TEST_DATABASE_PORT = '$DbPort'" -ForegroundColor White
Write-Host "  `$env:TEST_DATABASE_USER = '$DbUser'" -ForegroundColor White
Write-Host "  `$env:TEST_DATABASE_PASSWORD = '$DbPassword'" -ForegroundColor White
Write-Host "  `$env:TEST_DATABASE_NAME = '$DbName'" -ForegroundColor White
Write-Host ""
Write-Host "🚀 You can now run tests:" -ForegroundColor Cyan
Write-Host "   cd backend"
Write-Host "   npm test"
Write-Host ""
