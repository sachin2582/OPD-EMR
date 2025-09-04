@echo off
echo ========================================
echo    OPD-EMR Project Startup Script
echo ========================================
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm start"

echo.
echo Waiting for backend to initialize...
timeout /t 5 /nobreak > nul

echo.
echo Starting Frontend Application...
start "Frontend App" cmd /k "npm start"

echo.
echo ========================================
echo    Both servers are starting...
echo ========================================
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Login Credentials:
echo Email:    admin@hospital.com
echo Password: admin123
echo.
echo Press any key to exit this window...
pause > nul

