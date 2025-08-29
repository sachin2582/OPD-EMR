@echo off
echo Starting OPD-EMR Backend Server...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if dependencies are installed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo Error: Failed to install dependencies
        pause
        exit /b 1
    )
)

echo Starting server in development mode...
echo Server will be available at: http://localhost:5000
echo API Base URL: http://localhost:5000/api
echo Health Check: http://localhost:5000/health
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev
