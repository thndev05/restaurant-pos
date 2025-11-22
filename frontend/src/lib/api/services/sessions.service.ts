/**
 * Sessions API Service
 * Handles table session management API calls
 */

import { BaseApiService } from '../base.service';
import { API_ENDPOINTS } from '@/config/api.config';
import apiClient from '../client';

export type SessionStatus = 'ACTIVE' | 'PAID' | 'CLOSED';

export interface UpdateSessionData {
  status?: SessionStatus;
  customerCount?: number;
  notes?: string;
}

export interface CloseSessionData {
  notes?: string;
}

export interface CreateSessionData {
  tableId: string;
  customerCount?: number;
  notes?: string;
}

class SessionsService extends BaseApiService<never> {
  constructor() {
    super(API_ENDPOINTS.SESSIONS.BASE);
  }

  /**
   * Create a new session
   */
  async createSession(data: CreateSessionData): Promise<unknown> {
    const response = await apiClient.post(this.endpoint, data);
    return response.data;
  }

  /**
   * Get session by ID
   */
  async getSessionById(id: string | number): Promise<unknown> {
    const response = await apiClient.get(`${this.endpoint}/${id}`);
    return response.data;
  }

  /**
   * Update session information
   */
  async updateSession(id: string | number, data: UpdateSessionData): Promise<{ message: string }> {
    const response = await apiClient.patch<{ message: string }>(`${this.endpoint}/${id}`, data);
    return response.data;
  }

  /**
   * Close a session
   */
  async closeSession(id: string | number, data?: CloseSessionData): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      API_ENDPOINTS.SESSIONS.CLOSE(id),
      data || {}
    );
    return response.data;
  }
}

export const sessionsService = new SessionsService();
