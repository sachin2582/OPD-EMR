# 🚀 Quick Deploy OPD-EMR to Production

## ⚡ **One-Click Deployment (5 minutes)**

### **Step 1: Run Deployment Script**
```bash
# Windows (Command Prompt)
deploy-to-vercel.bat

# Windows (PowerShell)
.\deploy-to-vercel.ps1

# Manual (any OS)
git add .
git commit -m "Deploy to production"
git push origin main
```

### **Step 2: Deploy to Vercel**
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Import repository: `sachin2582/OPD-EMR`
4. Set environment variables:
   ```
   REACT_APP_API_BASE_URL = https://your-app-name.vercel.app
   CORS_ORIGIN = https://your-app-name.vercel.app
   NODE_ENV = production
   JWT_SECRET = your-secret-key-here
   ```
5. Click **Deploy**

### **Step 3: Test Your App**
- Visit: `https://your-app-name.vercel.app`
- Test login with demo credentials
- Verify all features work

## 🎉 **Done!**

Your OPD-EMR system is now live and accessible worldwide without needing to start any development servers!

---

## 📋 **What You Get**

✅ **Live Website**: Accessible from anywhere  
✅ **HTTPS Security**: Automatic SSL certificate  
✅ **Global CDN**: Fast loading worldwide  
✅ **Auto-Deploy**: Updates automatically on code changes  
✅ **No Server Management**: Fully managed hosting  

---

## 🔧 **Alternative: Local Production**

If you prefer to run locally without development servers:

```bash
# Build and start production server
npm run start:production
```

This will:
- Build the React app
- Start the backend server
- Serve the frontend from build files
- Run on http://localhost:3000

---

## 📞 **Need Help?**

- `DEPLOYMENT_CHECKLIST.md` - Detailed step-by-step guide
- `DEPLOY_TO_PRODUCTION.md` - Complete deployment options
- `test-deployment.js` - Test your deployment
