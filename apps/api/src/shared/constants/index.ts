/**
 * Application-wide constants.
 */

/** API version prefix */
export const API_PREFIX = '/api/v1';

/** User roles */
export const USER_ROLES = {
  WORKER: 'worker',
  EMPLOYER: 'employer',
  ADMIN: 'admin',
} as const;

/** User statuses */
export const USER_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BANNED: 'banned',
} as const;

/** Default pagination */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;
