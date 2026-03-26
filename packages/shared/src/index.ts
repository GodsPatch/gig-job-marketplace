/**
 * @gig/shared — Shared types and constants between frontend and backend.
 *
 * This package is imported by both apps/api and apps/web.
 * Only put truly shared items here.
 */

// --- User Types ---
export type UserRole = 'worker' | 'employer' | 'admin';
export type UserStatus = 'active' | 'inactive' | 'banned';

// --- API Response Types ---
export interface SuccessResponse<T> {
  success: true;
  data: T;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

// --- Constants ---
export const USER_ROLES = {
  WORKER: 'worker' as const,
  EMPLOYER: 'employer' as const,
  ADMIN: 'admin' as const,
};

export const USER_STATUSES = {
  ACTIVE: 'active' as const,
  INACTIVE: 'inactive' as const,
  BANNED: 'banned' as const,
};
