# OPD-EMR Setup Verification Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    OPD-EMR Setup Verification" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js v16 or higher." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
Write-Host "Checking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found. Please install npm." -ForegroundColor Red
    exit 1
}

# Check if backend directory exists
Write-Host "Checking project structure..." -ForegroundColor Yellow
if (Test-Path "backend") {
    Write-Host "✅ Backend directory found" -ForegroundColor Green
} else {
    Write-Host "❌ Backend directory not found" -ForegroundColor Red
    exit 1
}

# Check if database file exists
if (Test-Path "backend\opd-emr.db") {
    Write-Host "✅ Database file found" -ForegroundColor Green
} else {
    Write-Host "⚠️  Database file not found (will be created on first run)" -ForegroundColor Yellow
}

# Check if package.json files exist
if (Test-Path "package.json") {
    Write-Host "✅ Frontend package.json found" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend package.json not found" -ForegroundColor Red
    exit 1
}

if (Test-Path "backend\package.json") {
    Write-Host "✅ Backend package.json found" -ForegroundColor Green
} else {
    Write-Host "❌ Backend package.json not found" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    Testing Server Connectivity" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Test backend health endpoint
Write-Host "Testing backend server..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend server is running" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Backend server responded with status: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Backend server is not running (this is normal if not started yet)" -ForegroundColor Yellow
}

# Test frontend
Write-Host "Testing frontend server..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend server is running" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Frontend server responded with status: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Frontend server is not running (this is normal if not started yet)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    Setup Verification Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start the project:" -ForegroundColor White
Write-Host "1. Run: .\start-project.ps1" -ForegroundColor Blue
Write-Host "2. Or manually:" -ForegroundColor Blue
Write-Host "   - Terminal 1: cd backend && npm start" -ForegroundColor Gray
Write-Host "   - Terminal 2: npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "Login credentials:" -ForegroundColor White
Write-Host "Email: admin@hospital.com" -ForegroundColor Gray
Write-Host "Password: admin123" -ForegroundColor Gray

