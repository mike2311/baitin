# BAITIN Backend Startup Script
# Starts the backend server with proper environment configuration

$env:PORT = '3001'
$env:NODE_ENV = 'development'
$env:DATABASE_HOST = 'db.tvntlxdninziiievjgzx.supabase.co'
$env:DATABASE_PORT = '5432'
$env:DATABASE_USER = 'postgres'
$env:DATABASE_PASSWORD = 'Jujruddo1'
$env:DATABASE_NAME = 'postgres'
$env:FRONTEND_URL = 'http://localhost:5173'

Write-Host "Starting BAITIN Backend Server..." -ForegroundColor Green
Write-Host "Port: $env:PORT" -ForegroundColor Cyan
Write-Host "Database: $env:DATABASE_HOST" -ForegroundColor Cyan
Write-Host ""

npm run start:dev
