/**
 * Roles API Service
 * Handles role management API calls
 */

import apiClient from '../client';
import { API_ENDPOINTS } from '@/config/api.config';

export interface Role {
  id: string;
  name: 'ADMIN' | 'MANAGER' | 'CASHIER' | 'WAITER' | 'KITCHEN';
  displayName: string;
  description?: string;
}

class RolesService {
  /**
   * Get all roles
   */
  async getRoles(): Promise<Role[]> {
    const response = await apiClient.get<Role[]>('roles');
    return response.data;
  }
}

export const rolesService = new RolesService();
