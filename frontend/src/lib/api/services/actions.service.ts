/**
 * Actions API Service
 * Handles staff action management API calls
 */

import { BaseApiService } from '../base.service';
import { API_ENDPOINTS } from '@/config/api.config';
import apiClient from '../client';

export type ActionType =
  | 'CALL_STAFF'
  | 'REQUEST_BILL'
  | 'REQUEST_WATER'
  | 'REQUEST_UTENSILS'
  | 'OTHER';
export type ActionStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface CreateActionData {
  sessionId: string;
  actionType: ActionType;
  description?: string;
}

export interface UpdateActionData {
  status?: ActionStatus;
  description?: string;
  handledById?: string;
}

export interface HandledBy {
  id: string;
  name: string;
  username: string;
}

export interface ActionSession {
  id: string;
  startTime: string;
  endTime?: string;
  status: string;
  customerCount?: number;
  table: {
    id: string;
    number: number;
    capacity: number;
    status: string;
  };
}

export interface Action {
  id: string;
  actionType: ActionType;
  status: ActionStatus;
  description?: string;
  sessionId: string;
  handledById?: string;
  createdAt: string;
  updatedAt: string;
  session?: ActionSession;
  handledBy?: HandledBy;
}

export interface GetActionsParams {
  status?: ActionStatus;
}

class ActionsApiService extends BaseApiService {
  constructor() {
    super(API_ENDPOINTS.ACTIONS.BASE);
  }

  /**
   * Create a new action
   */
  async createAction(data: CreateActionData): Promise<Action> {
    const response = await apiClient.post<{ data: Action }>(API_ENDPOINTS.ACTIONS.BASE, data);
    return response.data.data;
  }

  /**
   * Get all actions with optional filtering
   */
  async getAllActions(params?: GetActionsParams): Promise<Action[]> {
    const response = await apiClient.get<{ data: Action[] }>(API_ENDPOINTS.ACTIONS.BASE, {
      params,
    });
    return response.data.data;
  }

  /**
   * Get pending actions only
   */
  async getPendingActions(): Promise<Action[]> {
    const response = await apiClient.get<{ data: Action[] }>(API_ENDPOINTS.ACTIONS.PENDING);
    return response.data.data;
  }

  /**
   * Get actions by session ID
   */
  async getActionsBySessionId(sessionId: string): Promise<Action[]> {
    const response = await apiClient.get<{ data: Action[] }>(
      API_ENDPOINTS.ACTIONS.BY_SESSION(sessionId)
    );
    return response.data.data;
  }

  /**
   * Get action by ID
   */
  async getActionById(id: string): Promise<Action> {
    const response = await apiClient.get<{ data: Action }>(API_ENDPOINTS.ACTIONS.BY_ID(id));
    return response.data.data;
  }

  /**
   * Update action
   */
  async updateAction(id: string, data: UpdateActionData): Promise<Action> {
    const response = await apiClient.patch<{ data: Action }>(API_ENDPOINTS.ACTIONS.BY_ID(id), data);
    return response.data.data;
  }

  /**
   * Delete action
   */
  async deleteAction(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.ACTIONS.BY_ID(id));
  }

  /**
   * Handle action (mark as in progress with handler)
   */
  async handleAction(id: string, handledById: string): Promise<Action> {
    return this.updateAction(id, {
      status: 'IN_PROGRESS',
      handledById,
    });
  }

  /**
   * Complete action
   */
  async completeAction(id: string, handledById: string): Promise<Action> {
    return this.updateAction(id, {
      status: 'COMPLETED',
      handledById,
    });
  }

  /**
   * Cancel action
   */
  async cancelAction(id: string): Promise<Action> {
    return this.updateAction(id, {
      status: 'CANCELLED',
    });
  }
}

export const actionsService = new ActionsApiService();
export default actionsService;
