@echo off
echo 🔧 Updating all lab test prices to 200...
echo.

REM Check if database exists
if not exist "backend\opd-emr.db" (
    echo ❌ Database file not found: backend\opd-emr.db
    pause
    exit /b 1
)

echo 📁 Database path: backend\opd-emr.db
echo.

REM Create a temporary SQL script
echo -- Update all lab test prices to 200 > temp_update.sql
echo UPDATE lab_tests SET price = 200, updatedAt = CURRENT_TIMESTAMP; >> temp_update.sql
echo -- Verify the update >> temp_update.sql
echo SELECT COUNT(*) as total, COUNT(CASE WHEN price = 200 THEN 1 END) as updated_count FROM lab_tests; >> temp_update.sql

echo 📝 SQL script created: temp_update.sql
echo.

REM Try to use sqlite3 command line tool
echo 🔄 Attempting to update prices...
sqlite3 backend\opd-emr.db < temp_update.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Price update completed successfully!
    echo 🎉 All lab test prices have been set to 200
) else (
    echo.
    echo ❌ Error updating prices. Database might be locked.
    echo.
    echo 💡 Solutions:
    echo 1. Stop the backend server temporarily
    echo 2. Use a database management tool (like DB Browser for SQLite)
    echo 3. Run the SQL commands manually in your database tool
    echo.
    echo 📋 SQL Commands to run:
    echo UPDATE lab_tests SET price = 200, updatedAt = CURRENT_TIMESTAMP;
    echo SELECT COUNT(*) as total, COUNT(CASE WHEN price = 200 THEN 1 END) as updated_count FROM lab_tests;
)

echo.
echo 🧹 Cleaning up temporary files...
del temp_update.sql

echo.
echo Press any key to continue...
pause >nul
