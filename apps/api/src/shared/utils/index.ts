/**
 * Shared utility functions.
 */

/**
 * Format a standardized success response.
 */
export function successResponse<T>(data: T) {
  return {
    success: true as const,
    data,
  };
}

/**
 * Format a standardized error response.
 */
export function errorResponse(code: string, message: string, details?: unknown) {
  return {
    success: false as const,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  };
}
