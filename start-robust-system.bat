@echo off
echo 🚀 Starting Robust OPD-EMR System...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found
echo.

REM Start backend server
echo 🔧 Starting Backend Server...
start "OPD-EMR Backend" cmd /k "cd backend && node server.js"
echo ✅ Backend server starting...

REM Wait for backend to start
echo ⏳ Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

REM Check if backend is running
echo 🔍 Checking backend status...
curl -s http://localhost:3001/api/lab-tests/health >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo ✅ Backend is running and healthy
) else (
    echo ⚠️  Backend may still be starting up...
)

echo.
echo 🔧 Starting Frontend Server...
start "OPD-EMR Frontend" cmd /k "npm start"
echo ✅ Frontend server starting...

echo.
echo 🎉 System startup initiated!
echo.
echo 📋 What's running:
echo    • Backend API: http://localhost:3001
echo    • Frontend App: http://localhost:3000
echo    • Lab Tests API: http://localhost:3001/api/lab-tests/tests?all=true
echo.
echo 🔧 Features available:
echo    • Robust SQLite handling with retry logic
echo    • Multi-user support with database locking prevention
echo    • Automatic error recovery and retry mechanisms
echo    • Real-time lab test selection and pricing
echo    • Transaction-based order creation
echo.
echo 💡 To update lab test prices to ₹200, run:
echo    node update-prices-robust.js
echo.
echo 💡 To test the system, run:
echo    node test-robust-system.js
echo.
pause
