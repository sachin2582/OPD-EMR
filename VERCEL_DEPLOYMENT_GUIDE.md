# 🚀 Vercel Deployment Guide for OPD-EMR

## 📋 **Overview**
This guide will help you deploy your OPD-EMR system to Vercel, making it accessible from anywhere on the internet.

## 🔧 **Files Modified for Deployment**

### 1. **vercel.json** (Created)
- Configures Vercel to build both frontend and backend
- Sets up API routes to point to backend
- Configures environment variables

### 2. **src/config/appConfig.js** (Updated)
- Now handles production URLs automatically
- Falls back to localhost for development
- Uses environment variables for production

### 3. **package.json** (Updated)
- Added `vercel-build` script for Vercel deployment

### 4. **backend/server.js** (Already Configured)
- CORS configuration uses environment variables
- Ready for production deployment

## 🚀 **Step-by-Step Deployment Process**

### **Step 1: Prepare Your Repository**
```bash
# Make sure all changes are committed
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### **Step 2: Create Vercel Account**
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub account
3. Import your OPD-EMR repository

### **Step 3: Configure Project Settings**
1. **Framework Preset**: Create React App
2. **Root Directory**: Leave as default (root)
3. **Build Command**: `npm run build`
4. **Output Directory**: `build`
5. **Install Command**: `npm install`

### **Step 4: Set Environment Variables**
In Vercel Dashboard → Settings → Environment Variables, add:

#### **Frontend Variables:**
```
REACT_APP_API_BASE_URL = https://your-app-name.vercel.app
REACT_APP_NAME = OPD-EMR
REACT_APP_VERSION = 1.0.0
NODE_ENV = production
```

#### **Backend Variables:**
```
CORS_ORIGIN = https://your-app-name.vercel.app
JWT_SECRET = your-super-secret-jwt-key-change-this-in-production
BCRYPT_ROUNDS = 12
DATABASE_URL = file:./opd-emr.db
```

### **Step 5: Deploy**
1. Click "Deploy" button
2. Wait for build to complete
3. Your app will be available at `https://your-app-name.vercel.app`

## 🔧 **Important Configuration Notes**

### **Database Considerations**
- **SQLite files** are not persistent on Vercel serverless functions
- **Consider using** a cloud database like:
  - **Vercel Postgres** (recommended)
  - **PlanetScale** (MySQL)
  - **MongoDB Atlas**
  - **Supabase**

### **File Storage**
- **Uploaded files** (if any) won't persist
- **Consider using** cloud storage:
  - **Vercel Blob**
  - **AWS S3**
  - **Cloudinary**

### **Environment Variables**
- **Never commit** `.env` files to repository
- **Set all variables** in Vercel dashboard
- **Use different values** for production vs development

## 🛠️ **Alternative: Database Migration**

### **Option 1: Vercel Postgres (Recommended)**
```bash
# Install Vercel Postgres
npm install @vercel/postgres

# Update database connection
# Replace SQLite with PostgreSQL
```

### **Option 2: Keep SQLite (Limited)**
- **Data will reset** on each deployment
- **Good for demos** and testing
- **Not suitable** for production with persistent data

## 📱 **Testing Your Deployment**

### **1. Check Frontend**
- Visit your Vercel URL
- Verify login page loads
- Test navigation

### **2. Check Backend API**
- Visit `https://your-app-name.vercel.app/api/health`
- Should return health status
- Test API endpoints

### **3. Test Full Workflow**
- Login with demo credentials
- Create a patient
- Schedule an appointment
- Generate a prescription

## 🔍 **Troubleshooting**

### **Common Issues:**

#### **1. CORS Errors**
```javascript
// Check CORS_ORIGIN environment variable
// Should match your Vercel domain exactly
```

#### **2. API Not Found**
```javascript
// Verify vercel.json configuration
// Check that API routes are properly configured
```

#### **3. Database Errors**
```javascript
// SQLite files don't persist on Vercel
// Consider migrating to cloud database
```

#### **4. Build Failures**
```javascript
// Check package.json scripts
// Verify all dependencies are installed
// Check for TypeScript errors
```

## 🎯 **Production Checklist**

### **Before Deployment:**
- [ ] All environment variables set
- [ ] Database migration planned (if needed)
- [ ] CORS origins configured
- [ ] Build process tested locally
- [ ] All features working in development

### **After Deployment:**
- [ ] Frontend loads correctly
- [ ] API endpoints respond
- [ ] Authentication works
- [ ] All major features functional
- [ ] Performance acceptable

## 🔒 **Security Considerations**

### **Production Security:**
- [ ] Change default JWT secret
- [ ] Use strong passwords
- [ ] Enable HTTPS (automatic on Vercel)
- [ ] Configure proper CORS origins
- [ ] Review rate limiting settings

### **Environment Variables:**
- [ ] Never expose secrets in code
- [ ] Use different secrets for production
- [ ] Regularly rotate secrets
- [ ] Monitor for security issues

## 📊 **Performance Optimization**

### **Frontend:**
- [ ] Enable gzip compression
- [ ] Optimize images
- [ ] Use CDN for static assets
- [ ] Implement lazy loading

### **Backend:**
- [ ] Optimize database queries
- [ ] Implement caching
- [ ] Use connection pooling
- [ ] Monitor response times

## 🚀 **Advanced Configuration**

### **Custom Domain:**
1. Go to Vercel Dashboard
2. Project Settings → Domains
3. Add your custom domain
4. Configure DNS settings

### **Multiple Environments:**
- **Preview**: Automatic for pull requests
- **Development**: Branch-specific deployments
- **Production**: Main branch deployments

## 📞 **Support & Resources**

### **Vercel Documentation:**
- [Vercel Docs](https://vercel.com/docs)
- [React Deployment](https://vercel.com/docs/frameworks/react)
- [Environment Variables](https://vercel.com/docs/environment-variables)

### **Database Options:**
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [PlanetScale](https://planetscale.com)
- [MongoDB Atlas](https://www.mongodb.com/atlas)

---

## 🎉 **Deployment Complete!**

Once deployed, your OPD-EMR system will be:
- ✅ **Accessible worldwide** via your Vercel URL
- ✅ **Automatically deployed** on code changes
- ✅ **HTTPS enabled** for security
- ✅ **CDN optimized** for performance
- ✅ **Scalable** for growing user base

**Your professional EMR system is now live on the internet!** 🏥✨
