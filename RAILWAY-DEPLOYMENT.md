# 🚂 Railway Deployment Guide for OPD-EMR Backend

## 🎯 **Goal**
Deploy your Node.js backend to Railway so Vercel can connect to it and eliminate network errors.

## 📋 **Prerequisites**
- GitHub account with OPD-EMR repository
- Railway account (free)

## 🚀 **Step-by-Step Deployment**

### **Step 1: Create Railway Account**
1. Go to [railway.app](https://railway.app)
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Railway to access your GitHub

### **Step 2: Create New Project**
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Find and select your `OPD-EMR` repository
4. Click "Deploy Now"

### **Step 3: Configure Backend Directory**
1. In Railway dashboard, go to "Settings" tab
2. Set "Root Directory" to: `backend`
3. This tells Railway to deploy only the backend folder

### **Step 4: Set Environment Variables**
Go to "Variables" tab and add these:

```bash
# Required Variables
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-here

# CORS - Replace with your actual Vercel domain
CORS_ORIGIN=https://your-vercel-app.vercel.app

# Optional - Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
MAX_FILE_SIZE=10485760
```

### **Step 5: Deploy**
1. Railway will automatically detect it's a Node.js app
2. It will run `npm install` and `npm start`
3. Wait for deployment to complete (usually 2-5 minutes)

### **Step 6: Get Your API URL**
1. Go to "Deployments" tab
2. Click on your latest deployment
3. Copy the generated URL (e.g., `https://your-app.railway.app`)

## 🔧 **Update Vercel Environment Variable**

1. **Go to Vercel Dashboard**
2. **Select your OPD-EMR project**
3. **Go to Settings → Environment Variables**
4. **Add new variable:**
   - Name: `REACT_APP_API_URL`
   - Value: `https://your-app.railway.app` (your Railway URL)
5. **Redeploy** your Vercel app

## ✅ **Verify Deployment**

### **Test Backend Health**
Visit: `https://your-app.railway.app/health`

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 123.45,
  "environment": "production",
  "corsOrigins": ["https://your-vercel-app.vercel.app"]
}
```

### **Test API Endpoint**
Visit: `https://your-app.railway.app/api/patients`

## 🚨 **Troubleshooting**

### **Deployment Fails**
1. Check Railway logs in "Deployments" tab
2. Ensure `backend/package.json` exists
3. Verify `backend/server.js` is the main file

### **CORS Errors**
1. Update `CORS_ORIGIN` in Railway variables
2. Make sure it matches your exact Vercel domain
3. Redeploy after changing variables

### **Database Issues**
1. SQLite database is included in deployment
2. Railway provides persistent storage
3. Check logs for database initialization errors

### **Port Issues**
1. Railway automatically sets `PORT` environment variable
2. Your code uses `process.env.PORT || 5000`
3. This should work automatically

## 📱 **After Successful Deployment**

1. **Your backend will be accessible** at: `https://your-app.railway.app`
2. **Vercel will connect** to this URL instead of localhost
3. **Network errors will disappear**
4. **Full functionality** will work on Vercel

## 🔄 **Updating Backend**

1. **Push changes** to GitHub
2. **Railway auto-deploys** from your repository
3. **No manual deployment** needed

## 💰 **Costs**

- **Railway**: Free tier available
- **Vercel**: Free tier available
- **Total cost**: $0 for basic usage

## 🆘 **Need Help?**

1. **Check Railway logs** for error details
2. **Verify environment variables** are set correctly
3. **Test backend URL** in browser
4. **Check CORS settings** match your Vercel domain

---

**🎉 Once deployed, your OPD-EMR system will work perfectly on Vercel!**
