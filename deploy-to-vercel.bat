@echo off
echo 🚀 Preparing OPD-EMR for Vercel Deployment...
echo.

REM Check if git is available
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Git is not installed or not in PATH
    echo Please install Git from https://git-scm.com
    pause
    exit /b 1
)

REM Check if we're in a git repository
git status >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Not in a git repository
    echo Please initialize git repository first
    pause
    exit /b 1
)

echo ✅ Git repository found
echo.

REM Add all files
echo 📁 Adding files to git...
git add .

REM Commit changes
echo 💾 Committing changes...
git commit -m "Prepare for Vercel deployment - Updated configuration for production"

REM Push to remote
echo 🚀 Pushing to remote repository...
git push origin main

if errorlevel 1 (
    echo ❌ Error: Failed to push to remote repository
    echo Please check your git configuration and remote URL
    pause
    exit /b 1
)

echo.
echo ✅ SUCCESS: Code pushed to repository!
echo.
echo 📋 Next Steps:
echo 1. Go to https://vercel.com
echo 2. Import your GitHub repository
echo 3. Configure environment variables (see VERCEL_DEPLOYMENT_GUIDE.md)
echo 4. Deploy your application
echo.
echo 📖 For detailed instructions, see: VERCEL_DEPLOYMENT_GUIDE.md
echo.

pause
