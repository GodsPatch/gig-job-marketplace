/**
 * Shared TypeScript type definitions for the frontend.
 *
 * TODO M2: Add auth types:
 * - User
 * - AuthState
 * - LoginCredentials
 * - RegisterData
 */

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
