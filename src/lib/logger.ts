import pino from 'pino';

const isDevelopment = process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  serializers: {
    err: pino.stdSerializers.err,
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      headers: {
        host: req.headers.host,
        userAgent: req.headers['user-agent'],
      },
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
  timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
});

export const createLogger = (component: string) => {
  return logger.child({ component });
};

export const logRequest = (req: Request, res: Response, duration: number) => {
  logger.info({
    method: req.method,
    url: req.url,
    status: res.status,
    duration: `${duration}ms`,
  });
};

export const logError = (error: Error, context?: Record<string, unknown>) => {
  logger.error({
    err: error,
    ...context,
  });
};

export const logInfo = (message: string, data?: Record<string, unknown>) => {
  logger.info({ message, ...data });
};

export const logWarn = (message: string, data?: Record<string, unknown>) => {
  logger.warn({ message, ...data });
};

export const logDebug = (message: string, data?: Record<string, unknown>) => {
  logger.debug({ message, ...data });
};
