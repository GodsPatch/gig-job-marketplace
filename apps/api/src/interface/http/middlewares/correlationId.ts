import { Request, Response, NextFunction } from 'express';
import { runWithCorrelationId, getCorrelationId } from '../../../infrastructure/logging';

/**
 * Correlation ID middleware.
 *
 * For every incoming request:
 * 1. Reads X-Correlation-ID from request header (if present)
 * 2. Generates a new UUID if not present
 * 3. Stores it in AsyncLocalStorage for the entire request lifecycle
 * 4. Sets X-Correlation-ID on the response header
 *
 * This enables request tracing across the entire application
 * without explicitly passing the correlation ID through every function.
 */
export function correlationIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incomingId = req.headers['x-correlation-id'] as string | undefined;

  runWithCorrelationId(incomingId, () => {
    const correlationId = getCorrelationId();

    if (correlationId) {
      res.setHeader('X-Correlation-ID', correlationId);
    }

    next();
  });
}

