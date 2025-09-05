@echo off
echo 🚀 Starting OPD-EMR with Environment Variables...
echo.

REM Set environment variables if not already set
if not defined REACT_APP_API_BASE_URL (
    set REACT_APP_API_BASE_URL=http://localhost:3001
    echo ✅ Set REACT_APP_API_BASE_URL=http://localhost:3001
)

if not defined PORT (
    set PORT=3001
    echo ✅ Set PORT=3001
)

if not defined NODE_ENV (
    set NODE_ENV=development
    echo ✅ Set NODE_ENV=development
)

echo.
echo 📋 Current Environment:
echo REACT_APP_API_BASE_URL=%REACT_APP_API_BASE_URL%
echo PORT=%PORT%
echo NODE_ENV=%NODE_ENV%
echo.

REM Start backend server
echo 🔧 Starting Backend Server...
start "OPD-EMR Backend" cmd /k "cd backend && set PORT=%PORT% && node server.js"
echo ✅ Backend server starting on port %PORT%...

REM Wait for backend to start
echo ⏳ Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

REM Start frontend server
echo 🔧 Starting Frontend Server...
start "OPD-EMR Frontend" cmd /k "set REACT_APP_API_BASE_URL=%REACT_APP_API_BASE_URL% && npm start"
echo ✅ Frontend server starting...

echo.
echo 🎉 System startup initiated with environment variables!
echo.
echo 📋 What's running:
echo    • Backend API: %REACT_APP_API_BASE_URL%
echo    • Frontend App: http://localhost:3000
echo    • Lab Tests API: %REACT_APP_API_BASE_URL%/api/lab-tests/tests?all=true
echo.
echo 💡 To change the backend port, set PORT environment variable
echo 💡 To change the API URL, set REACT_APP_API_BASE_URL environment variable
echo.
pause
