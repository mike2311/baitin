# BAITIN Complete Startup Script
# Starts both backend and frontend servers

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BAITIN Development Environment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Backend Configuration
$backendEnv = @{
    PORT = '3001'
    NODE_ENV = 'development'
    DATABASE_HOST = 'db.tvntlxdninziiievjgzx.supabase.co'
    DATABASE_PORT = '5432'
    DATABASE_USER = 'postgres'
    DATABASE_PASSWORD = 'Jujruddo1'
    DATABASE_NAME = 'postgres'
    FRONTEND_URL = 'http://localhost:5173'
}

Write-Host "Starting Backend Server..." -ForegroundColor Green
Write-Host "  Port: $($backendEnv.PORT)" -ForegroundColor Yellow
Write-Host "  Database: $($backendEnv.DATABASE_HOST)" -ForegroundColor Yellow
Write-Host "  API: http://localhost:$($backendEnv.PORT)/api" -ForegroundColor Yellow
Write-Host "  Swagger: http://localhost:$($backendEnv.PORT)/api/docs" -ForegroundColor Yellow
Write-Host ""

# Start backend in new window
$backendScript = @"
cd '$PSScriptRoot\backend'
`$env:PORT='$($backendEnv.PORT)'
`$env:NODE_ENV='$($backendEnv.NODE_ENV)'
`$env:DATABASE_HOST='$($backendEnv.DATABASE_HOST)'
`$env:DATABASE_PORT='$($backendEnv.DATABASE_PORT)'
`$env:DATABASE_USER='$($backendEnv.DATABASE_USER)'
`$env:DATABASE_PASSWORD='$($backendEnv.DATABASE_PASSWORD)'
`$env:DATABASE_NAME='$($backendEnv.DATABASE_NAME)'
`$env:FRONTEND_URL='$($backendEnv.FRONTEND_URL)'
npm run start:dev
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript -WindowStyle Normal

Write-Host "Waiting for backend to start..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "Starting Frontend Server..." -ForegroundColor Green
Write-Host "  Port: 5173" -ForegroundColor Yellow
Write-Host "  URL: http://localhost:5173" -ForegroundColor Yellow
Write-Host "  API Proxy: /api -> http://localhost:$($backendEnv.PORT)" -ForegroundColor Yellow
Write-Host ""

# Start frontend in new window
$frontendScript = @"
cd '$PSScriptRoot\frontend'
npm run dev
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendScript -WindowStyle Normal

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Both servers are starting..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend:  http://localhost:$($backendEnv.PORT)/api/docs" -ForegroundColor White
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit this script (servers will continue running)..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")









