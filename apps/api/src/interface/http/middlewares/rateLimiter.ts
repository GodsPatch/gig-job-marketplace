import rateLimit from 'express-rate-limit';

/**
 * Rate limiters for different route groups.
 * Protects against brute-force attacks and abuse.
 *
 * See Milestone 7 spec for rate limit table.
 */

// ─── Auth Endpoints ─────────────────────────────────────────

/**
 * Login rate limiter: 10 requests per 15 minutes per IP.
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many login attempts. Please try again in 15 minutes.',
    },
  },
});

/**
 * Register rate limiter: 10 requests per 15 minutes per IP.
 */
export const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many registration attempts. Please try again in 15 minutes.',
    },
  },
});

/**
 * Refresh token rate limiter: 20 requests per 15 minutes per IP.
 */
export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many refresh attempts. Please try again later.',
    },
  },
});

// ─── Resource Creation ──────────────────────────────────────

/**
 * Job creation rate limiter: 20 requests per hour per IP.
 */
export const jobCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many job creation requests. Please try again later.',
    },
  },
});

/**
 * Review creation rate limiter: 10 requests per hour per IP.
 */
export const reviewCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many review submissions. Please try again later.',
    },
  },
});

// ─── Public/Search Endpoints ────────────────────────────────

/**
 * Public listing/search rate limiter: 60 requests per minute per IP.
 */
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many search requests. Please slow down.',
    },
  },
});

/**
 * Gamification endpoint rate limiter: 30 requests per minute per IP.
 */
export const gamificationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.',
    },
  },
});

/**
 * General API rate limiter: 100 requests per minute per IP.
 * Applied to all other endpoints not covered by specific limiters.
 */
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.',
    },
  },
});
