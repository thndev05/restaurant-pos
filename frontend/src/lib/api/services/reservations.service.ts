/**
 * Reservations API Service
 * Handles reservation management API calls
 */

import { BaseApiService } from '../base.service';
import { API_ENDPOINTS } from '@/config/api.config';
import apiClient from '../client';
import type { ApiResponse } from '../types';
import type { AxiosError } from 'axios';

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: string;
  location?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

export interface Reservation {
  id: string;
  reservationTime: string;
  partySize: number;
  status: ReservationStatus;
  notes?: string;
  guestName?: string;
  guestPhone?: string;
  customerId?: string;
  tableId: string;
  createdAt: string;
  updatedAt: string;
  table?: Table;
  customer?: Customer;
}

export interface CreateReservationData {
  reservationTime: string;
  partySize: number;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  notes?: string;
  tableId: string;
}

export interface UpdateReservationData {
  reservationTime?: string;
  partySize?: number;
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;
  notes?: string;
  tableId?: string;
  status?: ReservationStatus;
}

export interface GetReservationsParams {
  status?: ReservationStatus;
  tableId?: string;
  startDate?: string;
  endDate?: string;
}

class ReservationsService extends BaseApiService<Reservation> {
  constructor() {
    super(API_ENDPOINTS.RESERVATIONS.BASE);
  }

  /**
   * Get all reservations with optional filters
   */
  async getReservations(params?: GetReservationsParams): Promise<Reservation[]> {
    try {
      const response = await apiClient.get<Reservation[]>(this.endpoint, {
        params,
      });
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Get a single reservation by ID
   */
  async getReservationById(id: string): Promise<Reservation> {
    try {
      const response = await apiClient.get<Reservation>(API_ENDPOINTS.RESERVATIONS.BY_ID(id));
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Create a new reservation
   */
  async createReservation(data: CreateReservationData): Promise<Reservation> {
    try {
      const response = await apiClient.post<Reservation>(this.endpoint, data);
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Get available tables for a given time and party size
   */
  async getAvailableTables(reservationTime: string, partySize: number): Promise<Table[]> {
    try {
      const response = await apiClient.get<Table[]>(API_ENDPOINTS.RESERVATIONS.AVAILABLE_TABLES, {
        params: {
          reservationTime,
          partySize,
        },
      });
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Update an existing reservation
   */
  async updateReservation(id: string, data: UpdateReservationData): Promise<Reservation> {
    try {
      const response = await apiClient.patch<Reservation>(
        API_ENDPOINTS.RESERVATIONS.BY_ID(id),
        data
      );
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Confirm a reservation
   */
  async confirmReservation(id: string): Promise<Reservation> {
    try {
      const response = await apiClient.patch<Reservation>(API_ENDPOINTS.RESERVATIONS.CONFIRM(id));
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Complete a reservation
   */
  async completeReservation(id: string): Promise<Reservation> {
    try {
      const response = await apiClient.patch<Reservation>(API_ENDPOINTS.RESERVATIONS.COMPLETE(id));
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Mark reservation as no-show
   */
  async markAsNoShow(id: string): Promise<Reservation> {
    try {
      const response = await apiClient.patch<Reservation>(API_ENDPOINTS.RESERVATIONS.NO_SHOW(id));
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Cancel a reservation
   */
  async cancelReservation(id: string): Promise<Reservation> {
    try {
      const response = await apiClient.patch<Reservation>(API_ENDPOINTS.RESERVATIONS.CANCEL(id));
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Get upcoming reservations (next 24 hours)
   */
  async getUpcomingReservations(): Promise<Reservation[]> {
    try {
      const response = await apiClient.get<Reservation[]>(API_ENDPOINTS.RESERVATIONS.UPCOMING);
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Get reservation statistics
   */
  async getReservationStatistics(): Promise<{
    today: {
      total: number;
      pending: number;
      confirmed: number;
      completed: number;
      cancelled: number;
      noShow: number;
    };
  }> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.RESERVATIONS.STATISTICS);
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Delete a reservation (hard delete)
   */
  async deleteReservation(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete<ApiResponse<void>>(
        API_ENDPOINTS.RESERVATIONS.BY_ID(id)
      );
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }
}

export const reservationsService = new ReservationsService();
