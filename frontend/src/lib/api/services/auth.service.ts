/**
 * Auth API Service
 * Handles authentication related API calls
 */

import apiClient from '../client';
import { API_ENDPOINTS } from '@/config/api.config';
import type { ApiResponse } from '../types';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  name: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: string;
    name: string;
    username: string;
    role: {
      name: string;
      displayName: string;
    };
    permissions: string[];
  };
}

export interface User {
  id: string;
  name: string;
  username: string;
  role: {
    name: string;
    displayName: string;
  };
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

class AuthService {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<{ code: number; message: string; data: AuthResponse }>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );

    // Store tokens and user data
    const { accessToken, refreshToken, user } = response.data.data;
    localStorage.setItem('access_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
    localStorage.setItem('user', JSON.stringify(user));

    return response.data.data;
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<{
    id: string;
    name: string;
    username: string;
    role: { name: string; displayName: string };
    permissions: string[];
  }> {
    const response = await apiClient.post<{
      code: number;
      message: string;
      data: {
        id: string;
        name: string;
        username: string;
        role: { name: string; displayName: string };
        permissions: string[];
      };
    }>(API_ENDPOINTS.AUTH.REGISTER, data);

    return response.data.data;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    // Clear stored data
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  /**
   * Get current user from localStorage
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<{ accessToken: string }> {
    const refreshToken = localStorage.getItem('refresh_token');

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<{
      code: number;
      message: string;
      data: { accessToken: string };
    }>(API_ENDPOINTS.AUTH.REFRESH, { refreshToken });

    // Update stored token
    localStorage.setItem('access_token', response.data.data.accessToken);

    return response.data.data;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }
}

export const authService = new AuthService();
