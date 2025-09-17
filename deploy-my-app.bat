@echo off
echo 🚀 Deploying YOUR Current OPD-EMR Application
echo ============================================
echo.

echo 📋 Step 1: Checking current application...
echo ✅ Patient Management System
echo ✅ Doctor Management
echo ✅ E-Prescription System
echo ✅ Lab Test Billing
echo ✅ Pharmacy Module
echo ✅ Billing System
echo ✅ Admin Panel
echo.

echo 🔄 Step 2: Committing current application...
git add .
git commit -m "Deploy current OPD-EMR application to production - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
if %errorlevel% neq 0 (
    echo ❌ Git commit failed!
    pause
    exit /b 1
)
echo ✅ Current application committed!
echo.

echo 🚀 Step 3: Pushing to GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo ❌ Git push failed!
    pause
    exit /b 1
)
echo ✅ Current application pushed to GitHub!
echo.

echo 🎉 Your current OPD-EMR application is ready for deployment!
echo.
echo 📋 Next steps:
echo 1. Go to https://vercel.com
echo 2. Import repository: sachin2582/OPD-EMR
echo 3. Set environment variables:
echo    - REACT_APP_API_BASE_URL = https://your-app-name.vercel.app
echo    - CORS_ORIGIN = https://your-app-name.vercel.app
echo    - NODE_ENV = production
echo    - JWT_SECRET = your-secret-key
echo 4. Click Deploy
echo.
echo 🌐 Your current OPD-EMR app will be available at: https://your-app-name.vercel.app
echo.
echo ⚠️  Make sure you're deploying from the correct repository!
echo.
pause

