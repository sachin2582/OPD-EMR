# OPD-EMR Vercel Deployment Script (PowerShell)
Write-Host "🚀 OPD-EMR Vercel Deployment Script" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# Step 1: Check Git status
Write-Host "📋 Step 1: Checking Git status..." -ForegroundColor Yellow
git status
Write-Host ""

# Step 2: Build application
Write-Host "📦 Step 2: Building application..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Please fix errors and try again." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "✅ Build completed successfully!" -ForegroundColor Green
Write-Host ""

# Step 3: Commit changes
Write-Host "🔄 Step 3: Committing changes..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
git add .
git commit -m "Deploy to production - $timestamp"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Git commit failed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "✅ Changes committed!" -ForegroundColor Green
Write-Host ""

# Step 4: Push to GitHub
Write-Host "🚀 Step 4: Pushing to GitHub..." -ForegroundColor Yellow
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Git push failed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "✅ Code pushed to GitHub!" -ForegroundColor Green
Write-Host ""

# Success message
Write-Host "🎉 Deployment preparation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Go to https://vercel.com" -ForegroundColor White
Write-Host "2. Import your repository: sachin2582/OPD-EMR" -ForegroundColor White
Write-Host "3. Set environment variables:" -ForegroundColor White
Write-Host "   - REACT_APP_API_BASE_URL = https://your-app-name.vercel.app" -ForegroundColor Gray
Write-Host "   - CORS_ORIGIN = https://your-app-name.vercel.app" -ForegroundColor Gray
Write-Host "   - NODE_ENV = production" -ForegroundColor Gray
Write-Host "   - JWT_SECRET = your-secret-key" -ForegroundColor Gray
Write-Host "4. Click Deploy" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Your app will be available at: https://your-app-name.vercel.app" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to exit"