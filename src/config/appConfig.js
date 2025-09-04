const appConfig = {
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 
    (process.env.NODE_ENV === 'production' 
      ? 'https://your-app-name.vercel.app' 
      : 'http://localhost:3001'),
  appName: process.env.REACT_APP_NAME || 'OPD-EMR',
  appVersion: process.env.REACT_APP_VERSION || '1.0.0',
  environment: process.env.NODE_ENV || 'development',
};

export default appConfig;
