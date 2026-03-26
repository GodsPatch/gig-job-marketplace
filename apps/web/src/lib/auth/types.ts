/**
 * Auth types for frontend auth state management.
 */

export interface UserResponse {
  id: string;
  email: string;
  fullName: string | null;
  role: 'worker' | 'employer' | 'admin';
  status: 'active' | 'inactive' | 'banned';
  phoneNumber: string | null;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: UserResponse | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  role?: 'worker' | 'employer';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  fullName?: string;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
}

export type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: UserResponse; accessToken: string } }
  | { type: 'AUTH_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'SET_TOKEN'; payload: { accessToken: string } }
  | { type: 'UPDATE_USER'; payload: { user: UserResponse } };
