import { apiClient } from './client';
import { UserResponse, RegisterData, LoginData, UpdateProfileData } from '../auth/types';
import { env } from '../config/env';

/**
 * Auth API functions — typed wrappers for auth endpoints.
 */

interface AuthResponse {
  user: UserResponse;
  accessToken: string;
}

interface RefreshResponse {
  accessToken: string;
}

interface ProfileResponse {
  user: UserResponse;
}

/**
 * Register a new user.
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
  return apiClient.post<AuthResponse>('/api/v1/auth/register', data);
}

/**
 * Login with email and password.
 */
export async function login(data: LoginData): Promise<AuthResponse> {
  return apiClient.post<AuthResponse>('/api/v1/auth/login', data);
}

/**
 * Refresh access token using httpOnly cookie.
 * Uses raw fetch because we don't want the interceptor to interfere.
 */
export async function refreshToken(): Promise<RefreshResponse> {
  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to refresh token');
  }

  return data.data;
}

/**
 * Logout — invalidate refresh token.
 */
export async function logout(): Promise<void> {
  await apiClient.post('/api/v1/auth/logout');
}

/**
 * Get the authenticated user's profile.
 * Optionally accepts a token for use during initial auth check.
 */
export async function getProfile(token?: string): Promise<ProfileResponse> {
  if (token) {
    // Direct fetch with provided token (used during refresh flow)
    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error?.message || 'Failed to get profile');
    return data.data;
  }
  return apiClient.get<ProfileResponse>('/api/v1/users/me');
}

/**
 * Update the authenticated user's profile.
 */
export async function updateProfile(data: UpdateProfileData): Promise<ProfileResponse> {
  return apiClient.patch<ProfileResponse>('/api/v1/users/me', data);
}
