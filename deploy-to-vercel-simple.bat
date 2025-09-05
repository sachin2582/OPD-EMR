@echo off
echo 🚀 OPD-EMR Vercel Deployment Assistant
echo =====================================
echo.

echo 📋 This script will guide you through deploying your OPD-EMR system to Vercel
echo ✅ Your local code will remain completely unchanged
echo.

echo 🔍 Checking your repository status...
git status >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Not in a git repository
    echo Please run this script from your OPD-EMR project directory
    pause
    exit /b 1
)

echo ✅ Git repository found
echo.

echo 📊 Current repository status:
git status --porcelain
echo.

echo 🎯 Your repository is ready for Vercel deployment!
echo.

echo 📋 DEPLOYMENT STEPS:
echo ===================
echo.
echo 1. 🌐 Go to https://vercel.com
echo 2. 👤 Sign up with your GitHub account
echo 3. ➕ Click "New Project"
echo 4. 📁 Import repository: sachin2582/OPD-EMR
echo 5. ⚙️  Configure environment variables (see below)
echo 6. 🌍 Make project PUBLIC (important!)
echo 7. 🚀 Click "Deploy"
echo.

echo 🔑 ENVIRONMENT VARIABLES TO SET IN VERCEL:
echo ==========================================
echo.
echo Frontend Variables:
echo - REACT_APP_API_BASE_URL = https://your-app-name.vercel.app
echo - REACT_APP_NAME = OPD-EMR
echo - REACT_APP_VERSION = 1.0.0
echo - NODE_ENV = production
echo.
echo Backend Variables:
echo - CORS_ORIGIN = https://your-app-name.vercel.app
echo - JWT_SECRET = your-super-secret-jwt-key-change-this
echo - BCRYPT_ROUNDS = 12
echo - DATABASE_URL = file:./opd-emr.db
echo.

echo 🌍 MAKING PROJECT PUBLIC:
echo =========================
echo After importing your repository:
echo 1. Go to Project Settings
echo 2. Scroll down to "Visibility"
echo 3. Change from "Private" to "Public"
echo 4. This allows anyone to access your EMR system
echo.

echo ⚠️  IMPORTANT NOTES:
echo ===================
echo - Your local code will NOT be affected
echo - Local development continues normally
echo - SQLite data resets on each deployment
echo - Good for demos and testing
echo - PUBLIC project allows worldwide access
echo.

echo 🧪 TESTING YOUR DEPLOYMENT:
echo ===========================
echo After deployment, test these URLs:
echo - Frontend: https://your-app-name.vercel.app
echo - API Health: https://your-app-name.vercel.app/api/health
echo - Doctors API: https://your-app-name.vercel.app/api/doctors
echo.

echo 📖 For detailed instructions, see:
echo - VERCEL_DEPLOYMENT_CHECKLIST.md
echo - VERCEL_DEPLOYMENT_GUIDE.md
echo.

echo 🎉 Ready to deploy! Follow the steps above.
echo.

pause
