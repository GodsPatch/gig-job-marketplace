import { logger } from '../logging';

/**
 * Sentry error tracking integration.
 *
 * Gracefully skips initialization if SENTRY_DSN is not provided.
 * This ensures the application doesn't crash in environments without Sentry.
 *
 * NOTE: In M1, Sentry SDK is NOT installed as a dependency.
 * This module provides the interface and gracefully handles the absence.
 * To enable Sentry, install @sentry/node and uncomment the initialization.
 */

const sentryInitialized = false;

/**
 * Initialize Sentry error tracking.
 * Gracefully skips if DSN is not provided.
 */
export function initSentry(dsn: string | undefined): void {
  if (!dsn) {
    logger.warn('Sentry DSN not provided — error tracking disabled');
    return;
  }

  try {
    // TODO M2: Install @sentry/node and uncomment:
    // const Sentry = require('@sentry/node');
    // Sentry.init({ dsn, environment: config.NODE_ENV });
    // sentryInitialized = true;
    logger.info('Sentry error tracking initialized');
    logger.warn('Sentry SDK not installed — install @sentry/node to enable');
  } catch (error) {
    logger.warn('Failed to initialize Sentry', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Capture an exception in Sentry.
 * No-op if Sentry is not initialized.
 */
export function captureException(error: Error): void {
  if (!sentryInitialized) {
    // Sentry not available — error is already logged by error handler
    return;
  }

  try {
    // TODO M2: Sentry.captureException(error);
    logger.debug('Exception captured by Sentry', { error: error.message });
  } catch (sentryError) {
    logger.warn('Failed to capture exception in Sentry', {
      error: sentryError instanceof Error ? sentryError.message : 'Unknown error',
    });
  }
}

/**
 * Check if Sentry is initialized.
 */
export function isSentryInitialized(): boolean {
  return sentryInitialized;
}
