import { Request, Response, NextFunction } from 'express';
import { logger } from '../../../infrastructure/logging';

/**
 * Request logger middleware with metrics tracking.
 *
 * Logs every incoming request with:
 * - HTTP method
 * - URL path
 * - Response status code
 * - Request duration (ms) as numeric value for metrics aggregation
 * - Content length
 * - Correlation ID (via logger)
 *
 * Also categorizes requests for metrics:
 * - Tracks slow requests (>500ms) as warnings
 * - Logs numeric duration_ms for easy parsing by log aggregators
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  // Log when response finishes
  res.on('finish', () => {
    const durationMs = Date.now() - start;
    const logData = {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${durationMs}ms`,
      duration_ms: durationMs,  // Numeric field for log aggregation/metrics
      contentLength: res.get('content-length'),
      userAgent: req.get('user-agent'),
    };

    if (res.statusCode >= 500) {
      logger.error('Request completed with server error', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('Request completed with client error', logData);
    } else if (durationMs > 500) {
      logger.warn('Slow request detected', logData);
    } else {
      logger.info('Request completed', logData);
    }
  });

  next();
}
