// utils/logger.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
});

export const logger = {
  error: (message: string, error?: unknown) => {
    Sentry.captureException(error || new Error(message));
    // Optionally, log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(message, error);
    }
  },
  warn: (message: string, error?: unknown) => {
    // Optionally capture warnings
    console.warn(message, error);
  },
  info: (message: string, data?: unknown) => {
    console.info(message, data);
  },
};