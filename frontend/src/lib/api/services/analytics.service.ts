import apiClient from '../client';

export interface AnalyticsQuery {
  startDate: string;
  endDate: string;
}

export interface RevenueStats {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  totalItemsSold: number;
  totalCustomers: number;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  orders: number;
  itemsSold: number;
}

export interface BestSellingItem {
  id: string;
  name: string;
  image: string | null;
  quantitySold: number;
  revenue: number;
  orderCount: number;
}

export interface CategoryPerformance {
  id: string;
  name: string;
  itemsSold: number;
  revenue: number;
  orderCount: number;
}

export interface HourlySale {
  hour: number;
  revenue: number;
  orderCount: number;
  avgOrderValue: number;
}

export interface PaymentMethodStat {
  method: string;
  transactionCount: number;
  totalAmount: number;
  percentage: number;
}

export interface OrderTypeStat {
  type: string;
  orderCount: number;
  revenue: number;
  avgOrderValue: number;
}

export interface PeakHourAnalysis {
  period: string;
  orderCount: number;
  revenue: number;
  avgOrderValue: number;
}

export interface DashboardData {
  stats: RevenueStats;
  dailyRevenue: DailyRevenue[];
  bestSellingItems: BestSellingItem[];
  categoryPerformance: CategoryPerformance[];
  paymentMethods: PaymentMethodStat[];
  orderTypes: OrderTypeStat[];
  peakHours: PeakHourAnalysis[];
}

export const analyticsService = {
  async getDashboardData(query: AnalyticsQuery): Promise<DashboardData> {
    const response = await apiClient.get('/analytics/dashboard', { params: query });
    return response.data;
  },

  async getRevenueStats(query: AnalyticsQuery): Promise<RevenueStats> {
    const response = await apiClient.get('/analytics/revenue-stats', { params: query });
    return response.data;
  },

  async getDailyRevenue(query: AnalyticsQuery): Promise<DailyRevenue[]> {
    const response = await apiClient.get('/analytics/daily-revenue', { params: query });
    return response.data;
  },

  async getBestSellingItems(
    query: AnalyticsQuery & { limit?: number }
  ): Promise<BestSellingItem[]> {
    const response = await apiClient.get('/analytics/best-selling-items', { params: query });
    return response.data;
  },

  async getCategoryPerformance(query: AnalyticsQuery): Promise<CategoryPerformance[]> {
    const response = await apiClient.get('/analytics/category-performance', { params: query });
    return response.data;
  },

  async getHourlySales(query: AnalyticsQuery): Promise<HourlySale[]> {
    const response = await apiClient.get('/analytics/hourly-sales', { params: query });
    return response.data;
  },

  async getPaymentMethodStats(query: AnalyticsQuery): Promise<PaymentMethodStat[]> {
    const response = await apiClient.get('/analytics/payment-methods', { params: query });
    return response.data;
  },

  async getOrderTypeStats(query: AnalyticsQuery): Promise<OrderTypeStat[]> {
    const response = await apiClient.get('/analytics/order-types', { params: query });
    return response.data;
  },

  async getPeakHoursAnalysis(query: AnalyticsQuery): Promise<PeakHourAnalysis[]> {
    const response = await apiClient.get('/analytics/peak-hours', { params: query });
    return response.data;
  },
};
