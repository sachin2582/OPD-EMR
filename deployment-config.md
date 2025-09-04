# Vercel Deployment Configuration

## Environment Variables to Set in Vercel Dashboard

### Frontend Environment Variables
```
REACT_APP_API_BASE_URL=https://your-app-name.vercel.app
REACT_APP_NAME=OPD-EMR
REACT_APP_VERSION=1.0.0
NODE_ENV=production
```

### Backend Environment Variables
```
DATABASE_URL=file:./opd-emr.db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
BCRYPT_ROUNDS=12
CORS_ORIGIN=https://your-app-name.vercel.app
```

## How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable above
5. Make sure to set them for Production environment
