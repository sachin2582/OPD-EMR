@echo off
echo Creating OPD-EMR PowerPoint Presentation...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python from https://python.org
    pause
    exit /b 1
)

REM Install python-pptx if not already installed
echo Installing required Python library...
pip install python-pptx

REM Run the presentation generator
echo.
echo Generating PowerPoint presentation...
python create_powerpoint_presentation.py

if exist "OPD-EMR_Presentation.pptx" (
    echo.
    echo ✅ SUCCESS: PowerPoint presentation created!
    echo File: OPD-EMR_Presentation.pptx
    echo.
    echo Opening presentation...
    start "" "OPD-EMR_Presentation.pptx"
) else (
    echo.
    echo ❌ ERROR: Failed to create presentation
    echo Please check the error messages above
)

echo.
pause
