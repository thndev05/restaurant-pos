/**
 * Payments API Service
 * Handles payment processing API calls
 */

import { BaseApiService } from '../base.service';
import { API_ENDPOINTS } from '@/config/api.config';
import apiClient from '../client';

export type PaymentMethod = 'CASH' | 'BANKING' | 'CARD';
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface CreatePaymentData {
  sessionId?: string;
  orderId?: string;
  totalAmount: number;
  subTotal: number;
  tax?: number;
  discount?: number;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface ProcessPaymentData {
  transactionId?: string;
  notes?: string;
}

export interface Payment {
  id: string;
  sessionId: string;
  totalAmount: number;
  subTotal: number;
  tax: number;
  discount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  paymentTime?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

class PaymentsService extends BaseApiService<never> {
  constructor() {
    super(API_ENDPOINTS.PAYMENTS.BASE);
  }

  /**
   * Create a new payment for a session
   */
  async createPayment(
    data: CreatePaymentData
  ): Promise<{ code: number; message: string; data: Payment }> {
    const response = await apiClient.post(this.endpoint, {
      ...data,
      totalAmount: data.totalAmount.toString(),
      subTotal: data.subTotal.toString(),
      tax: data.tax?.toString() || '0',
      discount: data.discount?.toString() || '0',
    });
    return response.data;
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(id: string): Promise<Payment> {
    const response = await apiClient.get(`${this.endpoint}/${id}`);
    return response.data;
  }

  /**
   * Get payment by session ID
   */
  async getPaymentBySessionId(sessionId: string): Promise<Payment> {
    const response = await apiClient.get(API_ENDPOINTS.PAYMENTS.BY_SESSION(sessionId));
    return response.data;
  }

  /**
   * Process a payment (mark as paid)
   */
  async processPayment(
    id: string,
    data?: ProcessPaymentData
  ): Promise<{ code: number; message: string; data: Payment }> {
    const response = await apiClient.post(API_ENDPOINTS.PAYMENTS.PROCESS(id), data || {});
    return response.data;
  }

  /**
   * Get all payments with pagination
   */
  async getAllPayments(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    code: number;
    data: Payment[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const response = await apiClient.get(`${this.endpoint}?page=${page}&limit=${limit}`);
    return response.data;
  }
}

export const paymentsService = new PaymentsService();
