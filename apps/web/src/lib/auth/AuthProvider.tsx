'use client';

import { useReducer, useCallback, useEffect, useRef } from 'react';
import { AuthContext, AuthContextType } from './AuthContext';
import { AuthState, AuthAction, RegisterData, LoginData, UpdateProfileData, UserResponse } from './types';
import * as authApi from '../api/auth.api';

/**
 * Initial auth state — loading true until first refresh attempt completes.
 */
const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
};

/**
 * Auth state reducer.
 */
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true };
    case 'AUTH_SUCCESS':
      return {
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'AUTH_FAILURE':
      return {
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'SET_TOKEN':
      return { ...state, accessToken: action.payload.accessToken };
    case 'UPDATE_USER':
      return { ...state, user: action.payload.user };
    default:
      return state;
  }
}

// --- Module-level access token for HTTP client interceptor ---
let currentAccessToken: string | null = null;

export function getAccessToken(): string | null {
  return currentAccessToken;
}

export function setAccessToken(token: string | null): void {
  currentAccessToken = token;
}

/**
 * AuthProvider — wraps entire app with auth state management.
 *
 * On mount:
 * 1. Attempts to refresh auth using httpOnly cookie
 * 2. If successful → user is already logged in
 * 3. If failed → user needs to login
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const isRefreshing = useRef(false);

  // Keep module-level token in sync with state
  useEffect(() => {
    currentAccessToken = state.accessToken;
  }, [state.accessToken]);

  /**
   * Refresh auth — called on app load and when access token expires.
   */
  const refreshAuth = useCallback(async () => {
    if (isRefreshing.current) return;
    isRefreshing.current = true;

    try {
      const data = await authApi.refreshToken();
      dispatch({
        type: 'SET_TOKEN',
        payload: { accessToken: data.accessToken },
      });
      // If we don't have user data yet, fetch profile
      if (!state.user) {
        try {
          const profileData = await authApi.getProfile(data.accessToken);
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user: profileData.user, accessToken: data.accessToken },
          });
        } catch {
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user: state.user!, accessToken: data.accessToken },
          });
        }
      }
    } catch {
      dispatch({ type: 'AUTH_FAILURE' });
    } finally {
      isRefreshing.current = false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Initial auth check on mount.
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        const data = await authApi.refreshToken();
        const profileData = await authApi.getProfile(data.accessToken);
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: profileData.user, accessToken: data.accessToken },
        });
      } catch {
        dispatch({ type: 'AUTH_FAILURE' });
      }
    };
    initAuth();
  }, []);

  /**
   * Login — call API, set state.
   */
  const login = useCallback(async (data: LoginData) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const result = await authApi.login(data);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: result.user, accessToken: result.accessToken },
      });
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE' });
      throw error; // Re-throw for form error handling
    }
  }, []);

  /**
   * Register — call API, set state.
   */
  const register = useCallback(async (data: RegisterData) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const result = await authApi.register(data);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: result.user, accessToken: result.accessToken },
      });
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE' });
      throw error;
    }
  }, []);

  /**
   * Logout — call API, clear state.
   */
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore errors during logout
    }
    dispatch({ type: 'LOGOUT' });
  }, []);

  /**
   * Update profile — call API, update user in state.
   */
  const updateProfile = useCallback(async (data: UpdateProfileData): Promise<UserResponse> => {
    const result = await authApi.updateProfile(data);
    dispatch({
      type: 'UPDATE_USER',
      payload: { user: result.user },
    });
    return result.user;
  }, []);

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshAuth,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
