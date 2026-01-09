/**
 * Environment configuration file
 * Centralizes all environment variables with type safety
 */

interface Config {
  // Server
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  
  // Database
  database: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
  };

  // JWT
  jwt: {
    secret: string;
    expiresIn: string;
  };

  // APIs
  apis: {
    googleClientId: string;
    apiUrl: string;
    frontendUrl: string;
  };

  // Security
  security: {
    allowedOrigins: string[];
    enableRateLimit: boolean;
    enableCsrf: boolean;
  };

  // Feature flags
  features: {
    googleAuth: boolean;
    emailVerification: boolean;
    twoFactor: boolean;
  };
}

/**
 * Parse environment variables and validate them
 */
function getConfig(): Config {
  const nodeEnv = process.env.NODE_ENV || 'development';

  return {
    port: parseInt(process.env.PORT || '5000', 10),
    nodeEnv: nodeEnv as 'development' | 'production' | 'test',

    database: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      name: process.env.DB_NAME || 'cofound_local',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    },

    jwt: {
      secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },

    apis: {
      googleClientId: process.env.VITE_GOOGLE_CLIENT_ID || '',
      apiUrl: process.env.VITE_API_URL || 'http://localhost:5000/api',
      frontendUrl: process.env.VITE_FRONTEND_URL || 'http://localhost:3000',
    },

    security: {
      allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
      enableRateLimit: process.env.ENABLE_RATE_LIMIT !== 'false',
      enableCsrf: process.env.ENABLE_CSRF !== 'false',
    },

    features: {
      googleAuth: process.env.ENABLE_GOOGLE_AUTH !== 'false',
      emailVerification: process.env.ENABLE_EMAIL_VERIFICATION === 'true',
      twoFactor: process.env.ENABLE_2FA === 'true',
    },
  };
}

/**
 * Validate that required environment variables are set
 */
function validateConfig(config: Config): void {
  const requiredEnvVars = [
    'JWT_SECRET',
    'DB_HOST',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
  ];

  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0 && config.nodeEnv === 'production') {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please set these variables in your .env file before running the application.'
    );
  }

  if (config.nodeEnv === 'production') {
    if (config.jwt.secret === 'dev-secret-change-in-production') {
      throw new Error(
        'JWT_SECRET must be changed in production. ' +
        'Set JWT_SECRET environment variable to a secure random string.'
      );
    }

    if (config.apis.googleClientId === '') {
      console.warn('⚠️  VITE_GOOGLE_CLIENT_ID not set. Google auth will be disabled.');
    }
  }
}

// Export singleton instance
const config = getConfig();
validateConfig(config);

export default config;

/**
 * Helper functions for accessing config values
 */
export const getJwtSecret = (): string => config.jwt.secret;
export const getJwtExpiresIn = (): string => config.jwt.expiresIn;
export const getDbConnection = () => config.database;
export const getGoogleClientId = (): string => config.apis.googleClientId;
export const getApiUrl = (): string => config.apis.apiUrl;
export const getFrontendUrl = (): string => config.apis.frontendUrl;
export const getAllowedOrigins = (): string[] => config.security.allowedOrigins;
export const isProduction = (): boolean => config.nodeEnv === 'production';
export const isDevelopment = (): boolean => config.nodeEnv === 'development';
export const isRateLimitEnabled = (): boolean => config.security.enableRateLimit;
export const isCsrfEnabled = (): boolean => config.security.enableCsrf;
