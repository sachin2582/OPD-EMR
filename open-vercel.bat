@echo off
echo 🚀 Opening Vercel for OPD-EMR Deployment
echo ========================================
echo.

echo 🌐 Opening Vercel website...
start https://vercel.com

echo.
echo 📋 Quick Deployment Steps:
echo ==========================
echo 1. Sign up with GitHub account
echo 2. Click "New Project"
echo 3. Import repository: sachin2582/OPD-EMR
echo 4. Make project PUBLIC (Project Settings → Visibility → Public)
echo 5. Set environment variables (see deploy-to-vercel-simple.bat)
echo 6. Click "Deploy"
echo.

echo 🔑 Environment Variables to Set:
echo ================================
echo REACT_APP_API_BASE_URL = https://your-app-name.vercel.app
echo CORS_ORIGIN = https://your-app-name.vercel.app
echo JWT_SECRET = your-super-secret-jwt-key
echo NODE_ENV = production
echo.

echo ⚠️  Remember: Make your project PUBLIC for worldwide access!
echo.

pause

