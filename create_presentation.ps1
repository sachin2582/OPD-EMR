# OPD-EMR PowerPoint Presentation Generator
# This script creates a professional PowerPoint presentation for the OPD-EMR system.

Write-Host "Creating OPD-EMR PowerPoint Presentation..." -ForegroundColor Green
Write-Host ""

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python from https://python.org" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Install python-pptx if not already installed
Write-Host "Installing required Python library..." -ForegroundColor Yellow
try {
    pip install python-pptx
    Write-Host "✅ python-pptx library installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Error installing python-pptx library" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Run the presentation generator
Write-Host ""
Write-Host "Generating PowerPoint presentation..." -ForegroundColor Yellow
try {
    python create_powerpoint_presentation.py
    
    if (Test-Path "OPD-EMR_Presentation.pptx") {
        Write-Host ""
        Write-Host "✅ SUCCESS: PowerPoint presentation created!" -ForegroundColor Green
        Write-Host "File: OPD-EMR_Presentation.pptx" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Opening presentation..." -ForegroundColor Yellow
        Start-Process "OPD-EMR_Presentation.pptx"
    } else {
        Write-Host ""
        Write-Host "❌ ERROR: Failed to create presentation" -ForegroundColor Red
        Write-Host "Please check the error messages above" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error running presentation generator: $_" -ForegroundColor Red
}

Write-Host ""
Read-Host "Press Enter to exit"
