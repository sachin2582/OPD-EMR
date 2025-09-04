@echo off
echo 🚀 Starting Test Server for Doctors API...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed or not in PATH
    echo 💡 Please install Python or use an alternative method
    echo.
    echo Alternative methods:
    echo 1. Use Node.js: npx http-server -p 8000
    echo 2. Use PHP: php -S localhost:8000
    echo 3. Use your React development server: npm start
    echo.
    pause
    exit /b 1
)

echo ✅ Python found, starting server...
echo.

REM Start the Python HTTP server
python start-test-server.py

pause
