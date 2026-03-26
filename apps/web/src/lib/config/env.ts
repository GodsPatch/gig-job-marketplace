/**
 * Environment configuration for the frontend.
 * Type-safe access to NEXT_PUBLIC_ environment variables.
 */
export const env = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
} as const;
