# OPD-EMR Vercel Deployment Script
# This script prepares your code for Vercel deployment

Write-Host "🚀 Preparing OPD-EMR for Vercel Deployment..." -ForegroundColor Green
Write-Host ""

# Check if git is available
try {
    $gitVersion = git --version 2>&1
    Write-Host "✅ Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Git is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Git from https://git-scm.com" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if we're in a git repository
try {
    git status | Out-Null
    Write-Host "✅ Git repository found" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Not in a git repository" -ForegroundColor Red
    Write-Host "Please initialize git repository first" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Add all files
Write-Host "📁 Adding files to git..." -ForegroundColor Yellow
try {
    git add .
    Write-Host "✅ Files added to staging" -ForegroundColor Green
} catch {
    Write-Host "❌ Error adding files to git" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Commit changes
Write-Host "💾 Committing changes..." -ForegroundColor Yellow
try {
    git commit -m "Prepare for Vercel deployment - Updated configuration for production"
    Write-Host "✅ Changes committed" -ForegroundColor Green
} catch {
    Write-Host "❌ Error committing changes" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Push to remote
Write-Host "🚀 Pushing to remote repository..." -ForegroundColor Yellow
try {
    git push origin main
    Write-Host "✅ Code pushed to repository" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Failed to push to remote repository" -ForegroundColor Red
    Write-Host "Please check your git configuration and remote URL" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "✅ SUCCESS: Code pushed to repository!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Go to https://vercel.com" -ForegroundColor White
Write-Host "2. Import your GitHub repository" -ForegroundColor White
Write-Host "3. Configure environment variables (see VERCEL_DEPLOYMENT_GUIDE.md)" -ForegroundColor White
Write-Host "4. Deploy your application" -ForegroundColor White
Write-Host ""
Write-Host "📖 For detailed instructions, see: VERCEL_DEPLOYMENT_GUIDE.md" -ForegroundColor Yellow
Write-Host ""

Read-Host "Press Enter to exit"
