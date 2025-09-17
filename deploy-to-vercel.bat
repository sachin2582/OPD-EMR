@echo off
echo 🚀 OPD-EMR Vercel Deployment Script
echo =====================================
echo.

echo 📋 Step 1: Checking Git status...
git status
echo.

echo 📦 Step 2: Building application...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed! Please fix errors and try again.
    pause
    exit /b 1
)
echo ✅ Build completed successfully!
echo.

echo 🔄 Step 3: Committing changes...
git add .
git commit -m "Deploy to production - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
if %errorlevel% neq 0 (
    echo ❌ Git commit failed!
    pause
    exit /b 1
)
echo ✅ Changes committed!
echo.

echo 🚀 Step 4: Pushing to GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo ❌ Git push failed!
    pause
    exit /b 1
)
echo ✅ Code pushed to GitHub!
echo.

echo 🎉 Deployment preparation complete!
echo.
echo 📋 Next steps:
echo 1. Go to https://vercel.com
echo 2. Import your repository: sachin2582/OPD-EMR
echo 3. Set environment variables:
echo    - REACT_APP_API_BASE_URL = https://your-app-name.vercel.app
echo    - CORS_ORIGIN = https://your-app-name.vercel.app
echo    - NODE_ENV = production
echo    - JWT_SECRET = your-secret-key
echo 4. Click Deploy
echo.
echo 🌐 Your app will be available at: https://your-app-name.vercel.app
echo.
pause