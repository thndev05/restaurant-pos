/**
 * Users API Service
 * Handles user management API calls
 */

import { BaseApiService } from '../base.service';
import { API_ENDPOINTS } from '@/config/api.config';
import apiClient from '../client';
import type { AxiosError } from 'axios';

export interface Role {
  id: string;
  name: 'ADMIN' | 'MANAGER' | 'CASHIER' | 'WAITER' | 'KITCHEN';
  displayName: string;
  description?: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  isActive: boolean;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  name: string;
  username: string;
  password: string;
  roleId: string;
}

export interface UpdateUserData {
  name?: string;
  roleId?: string;
  isActive?: boolean;
}

class UsersService extends BaseApiService<User> {
  constructor() {
    super(API_ENDPOINTS.USERS.BASE);
  }

  /**
   * Get all users with optional search
   * Override because backend returns array directly, not paginated response
   */
  async getAllUsers(query?: string): Promise<User[]> {
    try {
      const response = await apiClient.get<User[]>(this.endpoint, {
        params: query ? { query } : undefined,
      });
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Create a new user
   */
  async createUser(data: CreateUserData) {
    return this.create(data);
  }

  /**
   * Update user information
   */
  async updateUser(id: string | number, data: UpdateUserData) {
    return this.patch(id, data);
  }

  /**
   * Toggle user active status
   */
  async toggleUserStatus(id: string | number, isActive: boolean) {
    return this.patch(id, { isActive });
  }
}

export const usersService = new UsersService();
