/**
 * Logger utility for handling application logging
 * In development: logs to console
 * In production: suppresses logs or sends to error tracking service
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
  debug: (message: string, data?: any) => {
    if (isDevelopment) {
      console.debug(message, data);
    }
  },

  info: (message: string, data?: any) => {
    if (isDevelopment) {
      console.info(message, data);
    }
  },

  warn: (message: string, data?: any) => {
    if (isDevelopment) {
      console.warn(message, data);
    }
    // Optionally send to error tracking service in production
  },

  error: (message: string, error?: any) => {
    if (isDevelopment) {
      console.error(message, error);
    }
    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
    // logErrorToService(message, error);
  },
};
