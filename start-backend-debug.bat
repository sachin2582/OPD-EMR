@echo off
echo 🔧 Starting Backend Server with Debug Output...
echo.

cd backend
echo Current directory: %CD%
echo.

echo Starting server...
node server.js

echo.
echo Server stopped. Press any key to continue...
pause
