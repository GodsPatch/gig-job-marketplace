import { env } from '../config/env';
import { getAccessToken, setAccessToken } from '../auth/AuthProvider';

/**
 * API Error — typed error from API responses.
 */
export class ApiError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(code: string, message: string, statusCode: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * API response types.
 */
interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// --- Refresh queue mechanism ---
// Ensures only one refresh request runs at a time.
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function doRefreshToken(): Promise<string | null> {
  try {
    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (data.success && data.data?.accessToken) {
      setAccessToken(data.data.accessToken);
      return data.data.accessToken;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * HTTP Client — wraps fetch with auth interceptor and refresh retry logic.
 *
 * Features:
 * - Automatic Bearer token from AuthContext
 * - credentials: 'include' for httpOnly cookies
 * - 401 interceptor: auto-refresh + retry
 * - Queue mechanism: only 1 refresh request at a time
 */
class HttpClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
    retry = true,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    // Add Bearer token if available
    const token = getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Always send cookies
    });

    // Handle 401 — try refresh and retry
    if (response.status === 401 && retry) {
      const newToken = await this.tryRefresh();
      if (newToken) {
        // Retry original request with new token
        headers['Authorization'] = `Bearer ${newToken}`;
        return this.request<T>(path, { ...options, headers }, false);
      }
      // Refresh failed — the AuthProvider will handle logout
    }

    const data: ApiResponse<T> = await response.json();

    if (!data.success) {
      const errorData = (data as ApiErrorResponse).error;
      throw new ApiError(
        errorData.code,
        errorData.message,
        response.status,
        errorData.details,
      );
    }

    return (data as ApiSuccessResponse<T>).data;
  }

  /**
   * Try to refresh the access token.
   * Queue mechanism ensures only one refresh runs at a time.
   */
  private async tryRefresh(): Promise<string | null> {
    if (isRefreshing) {
      // Wait for existing refresh to complete
      return refreshPromise;
    }

    isRefreshing = true;
    refreshPromise = doRefreshToken().finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });

    return refreshPromise;
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'GET' });
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'DELETE' });
  }
}

/** API client singleton */
export const apiClient = new HttpClient(env.NEXT_PUBLIC_API_URL);
