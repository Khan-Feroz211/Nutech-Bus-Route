export const config = {
  app: {
    name: 'NUTECH BusTrack',
    version: '0.1.0',
    description: 'Real-time bus tracking SaaS platform for NUTECH University',
  },
  
  auth: {
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    passwordRequireNumber: true,
    tokenExpiry: 60 * 60 * 1000,
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000,
  },
  
  busPass: {
    defaultFee: 5000,
    currency: 'PKR',
    defaultValidityMonths: 4,
  },
  
  rateLimit: {
    general: {
      windowMs: 60 * 1000,
      maxRequests: 100,
    },
    auth: {
      windowMs: 15 * 60 * 1000,
      maxRequests: 5,
    },
    api: {
      windowMs: 60 * 1000,
      maxRequests: 200,
    },
  },
  
  pagination: {
    defaultPage: 1,
    defaultLimit: 20,
    maxLimit: 100,
  },
  
  gps: {
    updateIntervalMs: 5000,
    simulationSpeed: 1,
    maxSpeedKmh: 80,
  },
  
  notifications: {
    maxTitleLength: 200,
    maxMessageLength: 1000,
    retentionDays: 30,
  },
  
  routes: {
    maxStopsPerRoute: 20,
    maxWaypointsPerRoute: 25,
  },
  
  reports: {
    maxDescriptionLength: 1000,
    minDescriptionLength: 10,
  },
  
  api: {
    version: 'v1',
    prefix: '/api',
  },
  
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3001',
    ],
  },
  
  logging: {
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    prettyPrint: process.env.NODE_ENV !== 'production',
  },
  
  healthCheck: {
    timeout: 5000,
    interval: 30000,
  },
} as const;

export type Config = typeof config;
