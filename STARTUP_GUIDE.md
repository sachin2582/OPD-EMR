# OPD-EMR Project Startup Guide

## 🚀 Quick Start (Tomorrow)

### Prerequisites
- Node.js (v16 or higher)
- npm (comes with Node.js)
- Git (for version control)

### Step 1: Start Backend Server
```bash
# Navigate to backend directory
cd backend

# Install dependencies (if not already installed)
npm install

# Start the backend server
npm start
```

**Expected Output:**
```
🔄 [SERVER] Initializing database...
📁 [SERVER] Database path: opd-emr.db
🔗 [SERVER] Database type: SQLite
✅ [SERVER] Database initialized successfully
🚀 [SERVER] Starting Express server...
🌐 [SERVER] Port: 3001
🌍 [SERVER] Environment: development
🎉 [SERVER] ===========================================
🎉 [SERVER] OPD-EMR Backend Server Started Successfully!
🎉 [SERVER] ===========================================
🚀 [SERVER] Server running on: http://localhost:3001
🔗 [SERVER] Health check: http://localhost:3001/health
📡 [SERVER] CORS Origins: http://localhost:3000, http://localhost:3001, http://127.0.0.1:3000
🗄️ [SERVER] Database: opd-emr.db (SQLite)
⏰ [SERVER] Started at: [timestamp]
🎉 [SERVER] ===========================================
✅ [SERVER] Ready to accept requests!
```

### Step 2: Start Frontend Application
```bash
# Open a new terminal/command prompt
# Navigate to project root directory
cd D:\OPD-EMR

# Install dependencies (if not already installed)
npm install

# Start the React development server
npm start
```

**Expected Output:**
```
Compiled successfully!

You can now view opd-emr-patient-management in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000

Note that the development build is not optimized.
To create a production build, use npm run build.
```

### Step 3: Access the Application
1. **Frontend**: Open http://localhost:3000 in your browser
2. **Backend API**: http://localhost:3001/health (health check)
3. **Login Credentials**:
   - Email: `admin@hospital.com`
   - Password: `admin123`

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. Backend Server Won't Start
**Error**: `Error: listen EADDRINUSE: address already in use :::3001`
**Solution**: 
```bash
# Kill any process using port 3001
netstat -ano | findstr :3001
taskkill /PID <PID_NUMBER> /F
```

#### 2. Frontend Won't Start
**Error**: `Error: listen EADDRINUSE: address already in use :::3000`
**Solution**:
```bash
# Kill any process using port 3000
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

#### 3. Database Connection Issues
**Error**: `SQLITE_CANTOPEN: unable to open database file`
**Solution**: Ensure the `backend` directory has write permissions and the `opd-emr.db` file exists.

#### 4. CORS Issues
**Error**: `Access to fetch at 'http://localhost:3001' from origin 'http://localhost:3000' has been blocked by CORS policy`
**Solution**: The backend is already configured with CORS. Ensure both servers are running on the correct ports.

#### 5. React Component Errors
**Error**: `Element type is invalid`
**Solution**: This was already fixed. If it occurs again, check that all component imports are correct.

## 📋 Verification Checklist

Before considering the project "ready to start":

- [ ] Backend server starts without errors
- [ ] Frontend application starts without errors
- [ ] Database connection is established
- [ ] Health check endpoint responds (http://localhost:3001/health)
- [ ] Login page loads correctly
- [ ] Login with admin credentials works
- [ ] Dashboard redirects after successful login
- [ ] All major routes are accessible

## 🎯 Quick Health Check Commands

```bash
# Check if backend is running
curl http://localhost:3001/health

# Check if frontend is accessible
curl http://localhost:3000

# Check database file exists
dir backend\opd-emr.db
```

## 📁 Project Structure
```
OPD-EMR/
├── backend/                 # Backend server (Node.js/Express)
│   ├── server.js           # Main server file
│   ├── database/           # Database configuration
│   ├── routes/             # API routes
│   └── opd-emr.db         # SQLite database
├── src/                    # Frontend React application
│   ├── components/         # React components
│   ├── config/            # Configuration files
│   └── App.js             # Main App component
├── package.json           # Frontend dependencies
└── README.md              # Project documentation
```

## 🔄 Daily Startup Routine

1. **Open two terminal windows**
2. **Terminal 1**: Start backend (`cd backend && npm start`)
3. **Terminal 2**: Start frontend (`npm start`)
4. **Verify**: Check http://localhost:3001/health and http://localhost:3000
5. **Login**: Use admin credentials to access the system

## 🆘 Emergency Contacts

If you encounter any issues not covered in this guide:
1. Check the console logs for specific error messages
2. Verify all dependencies are installed (`npm install` in both directories)
3. Ensure ports 3000 and 3001 are not blocked by firewall
4. Check that Node.js version is compatible (v16+)

---

**Last Updated**: [Current Date]
**Project Status**: ✅ Ready for Production Use
**GitHub Repository**: https://github.com/sachin2582/OPD-EMR.git

