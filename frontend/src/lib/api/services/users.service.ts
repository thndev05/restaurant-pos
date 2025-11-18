/**
 * Users API Service
 * Handles user management API calls
 */

import { BaseApiService } from '../base.service';
import { API_ENDPOINTS } from '@/config/api.config';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role: string;
  phone?: string;
  avatar?: string;
}

export interface UpdateUserData {
  email?: string;
  name?: string;
  role?: string;
  phone?: string;
  avatar?: string;
  isActive?: boolean;
}

class UsersService extends BaseApiService<User> {
  constructor() {
    super(API_ENDPOINTS.USERS.BASE);
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
    return this.update(id, data);
  }

  /**
   * Toggle user active status
   */
  async toggleUserStatus(id: string | number, isActive: boolean) {
    return this.patch(id, { isActive });
  }
}

export const usersService = new UsersService();
