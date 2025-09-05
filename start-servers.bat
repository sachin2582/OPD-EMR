@echo off
echo Starting OPD-EMR Servers...
echo.

echo Starting Backend Server on port 3001...
start "Backend Server" cmd /k "cd /d D:\OPD-EMR\backend && node server.js"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server on port 3000...
start "Frontend Server" cmd /k "cd /d D:\OPD-EMR && npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause >nul
