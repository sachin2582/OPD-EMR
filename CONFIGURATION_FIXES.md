# Configuration Fixes - No More Hardcoded Ports

## ✅ **Problem Solved**
Removed all hardcoded ports and URLs from the codebase and implemented a centralized configuration system.

## 📁 **New Configuration Files**

### 1. **Root Configuration** (`config.json`)
```json
{
  "development": {
    "frontend": { "port": 3000, "host": "localhost" },
    "backend": { "port": 3001, "host": "localhost" },
    "api": { "baseUrl": "http://localhost:3001", "timeout": 30000 }
  },
  "production": {
    "frontend": { "port": 3000, "host": "0.0.0.0" },
    "backend": { "port": 3001, "host": "0.0.0.0" },
    "api": { "baseUrl": "https://your-app-name.vercel.app", "timeout": 30000 }
  }
}
```

### 2. **Backend Configuration** (`backend/config.json`)
```json
{
  "development": {
    "server": { "port": 3001, "host": "localhost" },
    "database": { "path": "./opd-emr.db", "timeout": 30000 },
    "cors": { "origins": ["http://localhost:3000", "http://localhost:3001", ...] },
    "rateLimit": { "windowMs": 900000, "max": 1000 }
  }
}
```

## 🔧 **Updated Files**

### **Frontend Files**
- ✅ `src/config/appConfig.js` - Now imports from config.json
- ✅ `src/components/ChakraLoginPage.js` - Uses appConfig.apiBaseUrl
- ✅ `src/components/EPrescription.js` - Uses appConfig.apiBaseUrl
- ✅ `src/components/BillsView.js` - Uses appConfig.apiBaseUrl

### **Backend Files**
- ✅ `backend/server.js` - Uses backend/config.json for all settings
- ✅ `backend/routes/auth.js` - Fixed bcrypt import and password comparison

### **Package.json**
- ✅ Added new scripts:
  - `npm run start:backend` - Start only backend
  - `npm run start:all` - Start both frontend and backend
  - `npm run dev` - Alias for start:all

## 🚀 **New Startup Scripts**

### **1. Start Backend Only** (`start-backend.js`)
```bash
npm run start:backend
```

### **2. Start Both Servers** (`start-servers.js`)
```bash
npm run start:all
# or
npm run dev
```

## 🎯 **Benefits**

1. **No More Hardcoded Ports** - All ports are configurable
2. **Environment-Specific Config** - Different settings for dev/prod
3. **Centralized Management** - All configuration in one place
4. **Easy Deployment** - Just change the config file
5. **Consistent URLs** - All components use the same API base URL

## 🔐 **Login Credentials**
- **Username**: `dr.suneet.verma` or `sachin_gupta25@rediffmail.com`
- **Password**: `12345`

## 🌐 **Server Status**
- **Frontend**: `http://localhost:3000` ✅
- **Backend**: `http://localhost:3001` ✅
- **API Base URL**: `http://localhost:3001` ✅

## 📝 **Usage**

### **Development**
```bash
# Start both servers
npm run dev

# Or start individually
npm start          # Frontend only
npm run start:backend  # Backend only
```

### **Production**
Change the `production` section in `config.json` and `backend/config.json` to your production URLs.

## ✅ **All Hardcoded Ports Fixed**
- ❌ `http://localhost:3001` → ✅ `appConfig.apiBaseUrl`
- ❌ `http://localhost:3000` → ✅ `envConfig.frontend.port`
- ❌ Hardcoded CORS origins → ✅ `envConfig.cors.origins`
- ❌ Hardcoded rate limits → ✅ `envConfig.rateLimit.*`

The system is now fully configurable and ready for deployment!
