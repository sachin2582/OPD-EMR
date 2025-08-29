@echo off
echo ================================================================
echo                OPD-EMR Backend Server
echo ================================================================
echo.
echo Starting persistent backend server...
echo This window MUST remain open for the server to work!
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo Health:   http://localhost:5000/health
echo.
echo ================================================================
echo.

node persistent-server.js

echo.
echo ================================================================
echo Server has stopped! Press any key to restart...
echo ================================================================
pause
