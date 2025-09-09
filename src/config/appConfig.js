// Import configuration
import config from './config.json';

const environment = process.env.NODE_ENV || 'development';
const envConfig = config[environment];

const appConfig = {
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || envConfig.api.baseUrl,
  appName: process.env.REACT_APP_NAME || 'OPD-EMR',
  appVersion: process.env.REACT_APP_VERSION || '1.0.0',
  environment: environment,
  frontend: {
    port: envConfig.frontend.port,
    host: envConfig.frontend.host
  },
  backend: {
    port: envConfig.backend.port,
    host: envConfig.backend.host
  },
  api: {
    timeout: envConfig.api.timeout
  }
};

export default appConfig;
