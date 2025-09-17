@echo off
echo 🔧 Force Update Production Deployment
echo =====================================
echo.

echo 🚨 This will force update your production deployment
echo with your current OPD-EMR application.
echo.

echo 📋 Current Application Features:
echo ✅ Patient Management System
echo ✅ Doctor Management
echo ✅ E-Prescription System
echo ✅ Lab Test Billing
echo ✅ Pharmacy Module
echo ✅ Billing System
echo ✅ Admin Panel
echo.

echo 🔄 Step 1: Adding all files...
git add .
echo ✅ Files added!
echo.

echo 🔄 Step 2: Committing current application...
git commit -m "Force update - Deploy current OPD-EMR application to production"
if %errorlevel% neq 0 (
    echo ❌ Git commit failed!
    pause
    exit /b 1
)
echo ✅ Current application committed!
echo.

echo 🚀 Step 3: Force pushing to GitHub...
git push origin main --force
if %errorlevel% neq 0 (
    echo ❌ Git push failed!
    pause
    exit /b 1
)
echo ✅ Current application force pushed to GitHub!
echo.

echo 🎉 Force update complete!
echo.
echo 📋 Next steps:
echo 1. Go to your Vercel dashboard
echo 2. Find your project
echo 3. Click "Redeploy" or "Deploy"
echo 4. Wait for deployment to complete
echo 5. Clear browser cache (Ctrl+Shift+Delete)
echo 6. Visit your deployment URL
echo.
echo 🌐 Your current OPD-EMR app should now be live!
echo.
echo ⚠️  If you still see the wrong application:
echo - Clear browser cache completely
echo - Try incognito/private mode
echo - Try different browser
echo - Check you're visiting the correct URL
echo.
pause
