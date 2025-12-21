import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma/prisma.service';
import {
  GetAnalyticsDto,
  GetComparisonDto,
  GetBestSellingItemsDto,
} from './dto';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getRevenueStats(dto: GetAnalyticsDto) {
    const result = await this.prisma.$queryRaw<
      Array<{
        total_revenue: number;
        total_orders: bigint;
        avg_order_value: number;
        total_items_sold: bigint;
        total_customers: bigint;
      }>
    >`
      SELECT * FROM get_revenue_stats(
        ${dto.startDate}::TIMESTAMP,
        ${dto.endDate}::TIMESTAMP
      )
    `;

    return result[0]
      ? {
          totalRevenue: Number(result[0].total_revenue),
          totalOrders: Number(result[0].total_orders),
          avgOrderValue: Number(result[0].avg_order_value),
          totalItemsSold: Number(result[0].total_items_sold),
          totalCustomers: Number(result[0].total_customers),
        }
      : {
          totalRevenue: 0,
          totalOrders: 0,
          avgOrderValue: 0,
          totalItemsSold: 0,
          totalCustomers: 0,
        };
  }

  async getDailyRevenue(dto: GetAnalyticsDto) {
    const result = await this.prisma.$queryRaw<
      Array<{
        date: Date;
        revenue: number;
        orders: bigint;
        items_sold: bigint;
      }>
    >`
      SELECT * FROM get_daily_revenue(
        ${dto.startDate}::TIMESTAMP,
        ${dto.endDate}::TIMESTAMP
      )
    `;

    return result.map((row) => ({
      date: row.date,
      revenue: Number(row.revenue),
      orders: Number(row.orders),
      itemsSold: Number(row.items_sold),
    }));
  }

  async getBestSellingItems(dto: GetBestSellingItemsDto) {
    const limit = dto.limit || 10;
    const result = await this.prisma.$queryRaw<
      Array<{
        item_id: string;
        item_name: string;
        item_image: string;
        quantity_sold: bigint;
        total_revenue: number;
        order_count: bigint;
      }>
    >`
      SELECT * FROM get_best_selling_items(
        ${dto.startDate}::TIMESTAMP,
        ${dto.endDate}::TIMESTAMP,
        ${limit}
      )
    `;

    return result.map((row) => ({
      id: row.item_id,
      name: row.item_name,
      image: row.item_image,
      quantitySold: Number(row.quantity_sold),
      revenue: Number(row.total_revenue),
      orderCount: Number(row.order_count),
    }));
  }

  async getCategoryPerformance(dto: GetAnalyticsDto) {
    const result = await this.prisma.$queryRaw<
      Array<{
        category_id: string;
        category_name: string;
        items_sold: bigint;
        revenue: number;
        order_count: bigint;
      }>
    >`
      SELECT * FROM get_category_performance(
        ${dto.startDate}::TIMESTAMP,
        ${dto.endDate}::TIMESTAMP
      )
    `;

    return result.map((row) => ({
      id: row.category_id,
      name: row.category_name,
      itemsSold: Number(row.items_sold),
      revenue: Number(row.revenue),
      orderCount: Number(row.order_count),
    }));
  }

  async getHourlySales(dto: GetAnalyticsDto) {
    const result = await this.prisma.$queryRaw<
      Array<{
        hour: number;
        revenue: number;
        order_count: bigint;
        avg_order_value: number;
      }>
    >`
      SELECT * FROM get_hourly_sales(
        ${dto.startDate}::TIMESTAMP,
        ${dto.endDate}::TIMESTAMP
      )
    `;

    return result.map((row) => ({
      hour: row.hour,
      revenue: Number(row.revenue),
      orderCount: Number(row.order_count),
      avgOrderValue: Number(row.avg_order_value),
    }));
  }

  async getPaymentMethodStats(dto: GetAnalyticsDto) {
    const result = await this.prisma.$queryRaw<
      Array<{
        payment_method: string;
        transaction_count: bigint;
        total_amount: number;
        percentage: number;
      }>
    >`
      SELECT * FROM get_payment_method_stats(
        ${dto.startDate}::TIMESTAMP,
        ${dto.endDate}::TIMESTAMP
      )
    `;

    return result.map((row) => ({
      method: row.payment_method,
      transactionCount: Number(row.transaction_count),
      totalAmount: Number(row.total_amount),
      percentage: Number(row.percentage),
    }));
  }

  async getOrderTypeStats(dto: GetAnalyticsDto) {
    const result = await this.prisma.$queryRaw<
      Array<{
        order_type: string;
        order_count: bigint;
        total_revenue: number;
        avg_order_value: number;
      }>
    >`
      SELECT * FROM get_order_type_stats(
        ${dto.startDate}::TIMESTAMP,
        ${dto.endDate}::TIMESTAMP
      )
    `;

    return result.map((row) => ({
      type: row.order_type,
      orderCount: Number(row.order_count),
      revenue: Number(row.total_revenue),
      avgOrderValue: Number(row.avg_order_value),
    }));
  }

  async getTableUtilizationStats(dto: GetAnalyticsDto) {
    const result = await this.prisma.$queryRaw<
      Array<{
        table_id: string;
        table_number: number;
        session_count: bigint;
        total_revenue: number;
        avg_session_duration: string;
        total_customers: number;
      }>
    >`
      SELECT * FROM get_table_utilization_stats(
        ${dto.startDate}::TIMESTAMP,
        ${dto.endDate}::TIMESTAMP
      )
    `;

    return result.map((row) => ({
      tableId: row.table_id,
      tableNumber: row.table_number,
      sessionCount: Number(row.session_count),
      revenue: Number(row.total_revenue),
      avgDuration: row.avg_session_duration,
      totalCustomers: row.total_customers,
    }));
  }

  async getPeakHoursAnalysis(dto: GetAnalyticsDto) {
    const result = await this.prisma.$queryRaw<
      Array<{
        time_period: string;
        order_count: bigint;
        revenue: number;
        avg_order_value: number;
      }>
    >`
      SELECT * FROM get_peak_hours_analysis(
        ${dto.startDate}::TIMESTAMP,
        ${dto.endDate}::TIMESTAMP
      )
    `;

    return result.map((row) => ({
      period: row.time_period,
      orderCount: Number(row.order_count),
      revenue: Number(row.revenue),
      avgOrderValue: Number(row.avg_order_value),
    }));
  }

  async getRevenueComparison(dto: GetComparisonDto) {
    const result = await this.prisma.$queryRaw<
      Array<{
        current_revenue: number;
        previous_revenue: number;
        revenue_change: number;
        revenue_change_percent: number;
        current_orders: bigint;
        previous_orders: bigint;
        order_change: bigint;
        order_change_percent: number;
      }>
    >`
      SELECT * FROM get_revenue_comparison(
        ${dto.startDate}::TIMESTAMP,
        ${dto.endDate}::TIMESTAMP,
        ${dto.previousStartDate}::TIMESTAMP,
        ${dto.previousEndDate}::TIMESTAMP
      )
    `;

    return result[0]
      ? {
          current: {
            revenue: Number(result[0].current_revenue),
            orders: Number(result[0].current_orders),
          },
          previous: {
            revenue: Number(result[0].previous_revenue),
            orders: Number(result[0].previous_orders),
          },
          change: {
            revenue: Number(result[0].revenue_change),
            revenuePercent: Number(result[0].revenue_change_percent),
            orders: Number(result[0].order_change),
            ordersPercent: Number(result[0].order_change_percent),
          },
        }
      : null;
  }

  async getDashboardData(dto: GetAnalyticsDto) {
    const [
      stats,
      dailyRevenue,
      bestSellingItems,
      categoryPerformance,
      paymentMethods,
      orderTypes,
      peakHours,
    ] = await Promise.all([
      this.getRevenueStats(dto),
      this.getDailyRevenue(dto),
      this.getBestSellingItems({ ...dto, limit: 10 }),
      this.getCategoryPerformance(dto),
      this.getPaymentMethodStats(dto),
      this.getOrderTypeStats(dto),
      this.getPeakHoursAnalysis(dto),
    ]);

    return {
      stats,
      dailyRevenue,
      bestSellingItems,
      categoryPerformance,
      paymentMethods,
      orderTypes,
      peakHours,
    };
  }
}
