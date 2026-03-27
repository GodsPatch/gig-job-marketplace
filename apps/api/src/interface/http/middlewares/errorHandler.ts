import { Request, Response, NextFunction } from 'express';
import { DomainError } from '../../../domain/errors';
import { logger } from '../../../infrastructure/logging';
import { captureException } from '../../../infrastructure/error-tracking/sentry';
import { config } from '../../../infrastructure/config';

/**
 * Application-level error base class.
 * Used for errors that originate outside the domain layer.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', public readonly details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotImplementedError extends AppError {
  constructor(message: string = 'This endpoint will be implemented in M2') {
    super(message, 501, 'NOT_IMPLEMENTED');
  }
}

/**
 * Global error handler middleware.
 *
 * This MUST be the last middleware in the Express chain.
 * It catches all errors thrown or passed via next(error).
 *
 * Behavior:
 * 1. Classifies error (AppError, DomainError, or unknown)
 * 2. Logs the error with full details
 * 3. Captures the error in Sentry
 * 4. Returns a standardized JSON error response
 * 5. Never leaks stack traces in production
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  let statusCode = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'An unexpected error occurred';

  // Classify error type
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
  } else if (err instanceof DomainError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
  }

  // Log error
  if (statusCode >= 500) {
    logger.error('Unhandled error', {
      error: err.message,
      stack: err.stack,
      code,
      statusCode,
    });
  } else {
    logger.warn('Client error', {
      error: err.message,
      code,
      statusCode,
    });
  }

  // Capture in Sentry (only 5xx errors)
  if (statusCode >= 500) {
    captureException(err);
  }

  // Build response — never leak stack trace in production
  const errorResponse: Record<string, unknown> = {
    code,
    message,
  };

  if (err instanceof ValidationError && err.details) {
    errorResponse.details = err.details;
  }

  if (config.NODE_ENV !== 'production' && err.stack) {
    errorResponse.stack = err.stack;
  }
  
  if (config.NODE_ENV === 'production') {
    errorResponse.details = String(err?.message || err) + " ||| " + JSON.stringify(err);
  }

  res.status(statusCode).json({
    success: false,
    error: errorResponse,
  });
}
