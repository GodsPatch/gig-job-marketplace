'use client';

import { createContext, useContext } from 'react';
import { AuthState, UserResponse, RegisterData, LoginData, UpdateProfileData } from './types';

export interface AuthContextType extends AuthState {
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<UserResponse>;
}

const defaultContext: AuthContextType = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshAuth: async () => {},
  updateProfile: async () => ({} as UserResponse),
};

export const AuthContext = createContext<AuthContextType>(defaultContext);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
