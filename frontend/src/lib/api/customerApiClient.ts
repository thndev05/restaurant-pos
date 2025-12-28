import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';
import { API_CONFIG } from '@/config/api.config';

/**
 * Customer API client for QR-based table ordering
 * Automatically adds session credentials to requests
 */
class CustomerApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_CONFIG.BASE_URL}/${API_CONFIG.VERSION}`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor: Add session credentials
    this.client.interceptors.request.use(
      (config) => {
        // Skip adding session headers for /sessions/init endpoint
        if (config.url?.includes('/sessions/init')) {
          return config;
        }

        const sessionData = localStorage.getItem('table_session');
        if (sessionData) {
          try {
            const { sessionId, sessionSecret } = JSON.parse(sessionData);
            config.headers['X-Table-Session'] = sessionId;
            config.headers['X-Table-Secret'] = sessionSecret;
          } catch (error) {
            console.error('Failed to parse session data:', error);
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor: Handle errors
    this.client.interceptors.response.use(
      (response) => response.data,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Session expired or invalid
          localStorage.removeItem('table_session');
          window.location.href = '/customer/session-expired';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Initialize session with QR token
   */
  async initSession(token: string, customerCount?: number, notes?: string) {
    return this.client.post(
      '/sessions/init',
      { customerCount, notes },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }

  /**
   * Get available menu items
   */
  async getMenu() {
    return this.client.get('/customer/menu');
  }

  /**
   * Get current session details
   */
  async getSession() {
    return this.client.get('/customer/session');
  }

  /**
   * Get session bill
   */
  async getSessionBill() {
    return this.client.get('/customer/session/bill');
  }

  /**
   * Create order
   */
  async createOrder(items: Array<{
    menuItemId: string;
    quantity: number;
    notes?: string;
  }>) {
    // Get sessionId from localStorage
    const sessionData = localStorage.getItem('table_session');
    let sessionId: string | undefined;
    
    if (sessionData) {
      try {
        const { sessionId: id } = JSON.parse(sessionData);
        sessionId = id;
      } catch (error) {
        console.error('Failed to parse session data:', error);
      }
    }

    const payload = {
      orderType: 'DINE_IN',
      sessionId,
      items,
    };
    return this.client.post('/customer/orders', payload);
  }

  /**
   * Create staff action (call waiter, request bill, etc.)
   */
  async createAction(actionType: 'CALL_STAFF' | 'REQUEST_BILL' | 'REQUEST_WATER' | 'REQUEST_UTENSILS' | 'OTHER', description?: string) {
    return this.client.post('/customer/actions', {
      actionType,
      description,
    });
  }

  /**
   * Get session actions
   */
  async getSessionActions() {
    return this.client.get('/customer/actions');
  }
}

export const customerApi = new CustomerApiClient();
