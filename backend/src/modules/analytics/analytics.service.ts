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
      SELECT 
        COALESCE(SUM(p.total_amount), 0) as total_revenue,
        COUNT(DISTINCT p.order_id) as total_orders,
        COALESCE(AVG(p.total_amount), 0) as avg_order_value,
        COALESCE(SUM(oi.quantity), 0) as total_items_sold,
        COUNT(DISTINCT o.customer_phone) FILTER (WHERE o.customer_phone IS NOT NULL) as total_customers
      FROM payments p
      LEFT JOIN orders o ON p.order_id = o.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE p.status = 'SUCCESS'
        AND p.payment_time >= ${dto.startDate}::TIMESTAMP
        AND p.payment_time <= ${dto.endDate}::TIMESTAMP
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
      SELECT 
        DATE(p.payment_time) as date,
        COALESCE(SUM(p.total_amount), 0) as revenue,
        COUNT(DISTINCT p.order_id) as orders,
        COALESCE(SUM(oi.quantity), 0) as items_sold
      FROM payments p
      LEFT JOIN orders o ON p.order_id = o.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE p.status = 'SUCCESS'
        AND p.payment_time >= ${dto.startDate}::TIMESTAMP
        AND p.payment_time <= ${dto.endDate}::TIMESTAMP
      GROUP BY DATE(p.payment_time)
      ORDER BY date ASC
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
      SELECT 
        mi.id as item_id,
        mi.name::TEXT as item_name,
        mi.image::TEXT as item_image,
        SUM(oi.quantity) as quantity_sold,
        SUM(oi.quantity * oi.price_at_order) as total_revenue,
        COUNT(DISTINCT oi.order_id) as order_count
      FROM order_items oi
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      JOIN orders o ON oi.order_id = o.id
      JOIN payments p ON o.id = p.order_id
      WHERE p.status = 'SUCCESS'
        AND p.payment_time >= ${dto.startDate}::TIMESTAMP
        AND p.payment_time <= ${dto.endDate}::TIMESTAMP
        AND oi.status != 'CANCELLED'
      GROUP BY mi.id, mi.name, mi.image
      ORDER BY quantity_sold DESC
      LIMIT ${limit}
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
      SELECT 
        c.id as category_id,
        c.name::TEXT as category_name,
        SUM(oi.quantity) as items_sold,
        SUM(oi.quantity * oi.price_at_order) as revenue,
        COUNT(DISTINCT oi.order_id) as order_count
      FROM order_items oi
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      JOIN categories c ON mi.category_id = c.id
      JOIN orders o ON oi.order_id = o.id
      JOIN payments p ON o.id = p.order_id
      WHERE p.status = 'SUCCESS'
        AND p.payment_time >= ${dto.startDate}::TIMESTAMP
        AND p.payment_time <= ${dto.endDate}::TIMESTAMP
        AND oi.status != 'CANCELLED'
      GROUP BY c.id, c.name
      ORDER BY revenue DESC
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
      SELECT 
        EXTRACT(HOUR FROM p.payment_time)::INT as hour,
        COALESCE(SUM(p.total_amount), 0) as revenue,
        COUNT(DISTINCT p.order_id) as order_count,
        COALESCE(AVG(p.total_amount), 0) as avg_order_value
      FROM payments p
      WHERE p.status = 'SUCCESS'
        AND p.payment_time >= ${dto.startDate}::TIMESTAMP
        AND p.payment_time <= ${dto.endDate}::TIMESTAMP
      GROUP BY EXTRACT(HOUR FROM p.payment_time)
      ORDER BY hour ASC
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
      WITH payment_totals AS (
        SELECT 
          p.payment_method::TEXT as method,
          COUNT(*) as txn_count,
          COALESCE(SUM(p.total_amount), 0) as amount
        FROM payments p
        WHERE p.status = 'SUCCESS'
          AND p.payment_time >= ${dto.startDate}::TIMESTAMP
          AND p.payment_time <= ${dto.endDate}::TIMESTAMP
        GROUP BY p.payment_method
      ),
      grand_total AS (
        SELECT COALESCE(SUM(amount), 0) as total
        FROM payment_totals
      )
      SELECT 
        pt.method::TEXT as payment_method,
        pt.txn_count as transaction_count,
        pt.amount as total_amount,
        CASE 
          WHEN gt.total > 0 THEN ROUND((pt.amount / gt.total * 100), 2)
          ELSE 0 
        END as percentage
      FROM payment_totals pt
      CROSS JOIN grand_total gt
      ORDER BY pt.amount DESC
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
      SELECT 
        o.order_type::TEXT,
        COUNT(*) as order_count,
        COALESCE(SUM(p.total_amount), 0) as total_revenue,
        COALESCE(AVG(p.total_amount), 0) as avg_order_value
      FROM orders o
      JOIN payments p ON o.id = p.order_id
      WHERE p.status = 'SUCCESS'
        AND p.payment_time >= ${dto.startDate}::TIMESTAMP
        AND p.payment_time <= ${dto.endDate}::TIMESTAMP
      GROUP BY o.order_type
      ORDER BY total_revenue DESC
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
      SELECT 
        t.id as table_id,
        t.number as table_number,
        COUNT(DISTINCT ts.id) as session_count,
        COALESCE(SUM(p.total_amount), 0) as total_revenue,
        AVG(ts.end_time - ts.start_time) as avg_session_duration,
        COALESCE(SUM(ts.customer_count), 0)::INT as total_customers
      FROM tables t
      LEFT JOIN table_sessions ts ON t.id = ts.table_id
      LEFT JOIN payments p ON ts.id = p.session_id
      WHERE ts.start_time >= ${dto.startDate}::TIMESTAMP
        AND ts.start_time <= ${dto.endDate}::TIMESTAMP
        AND ts.status = 'CLOSED'
      GROUP BY t.id, t.number
      ORDER BY total_revenue DESC
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
      SELECT 
        CASE 
          WHEN EXTRACT(HOUR FROM p.payment_time) BETWEEN 6 AND 11 THEN 'Breakfast (6-11)'
          WHEN EXTRACT(HOUR FROM p.payment_time) BETWEEN 12 AND 14 THEN 'Lunch (12-14)'
          WHEN EXTRACT(HOUR FROM p.payment_time) BETWEEN 15 AND 17 THEN 'Afternoon (15-17)'
          WHEN EXTRACT(HOUR FROM p.payment_time) BETWEEN 18 AND 22 THEN 'Dinner (18-22)'
          ELSE 'Late Night (23-5)'
        END as time_period,
        COUNT(*) as order_count,
        COALESCE(SUM(p.total_amount), 0) as revenue,
        COALESCE(AVG(p.total_amount), 0) as avg_order_value
      FROM payments p
      WHERE p.status = 'SUCCESS'
        AND p.payment_time >= ${dto.startDate}::TIMESTAMP
        AND p.payment_time <= ${dto.endDate}::TIMESTAMP
      GROUP BY time_period
      ORDER BY revenue DESC
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
      WITH current_period AS (
        SELECT 
          COALESCE(SUM(total_amount), 0) as revenue,
          COUNT(*) as orders
        FROM payments
        WHERE status = 'SUCCESS'
          AND payment_time >= ${dto.startDate}::TIMESTAMP
          AND payment_time <= ${dto.endDate}::TIMESTAMP
      ),
      previous_period AS (
        SELECT 
          COALESCE(SUM(total_amount), 0) as revenue,
          COUNT(*) as orders
        FROM payments
        WHERE status = 'SUCCESS'
          AND payment_time >= ${dto.previousStartDate}::TIMESTAMP
          AND payment_time <= ${dto.previousEndDate}::TIMESTAMP
      )
      SELECT 
        cp.revenue as current_revenue,
        pp.revenue as previous_revenue,
        (cp.revenue - pp.revenue) as revenue_change,
        CASE 
          WHEN pp.revenue > 0 THEN ROUND(((cp.revenue - pp.revenue) / pp.revenue * 100), 2)
          ELSE 0 
        END as revenue_change_percent,
        cp.orders as current_orders,
        pp.orders as previous_orders,
        (cp.orders - pp.orders) as order_change,
        CASE 
          WHEN pp.orders > 0 THEN ROUND((((cp.orders - pp.orders)::DECIMAL / pp.orders) * 100), 2)
          ELSE 0 
        END as order_change_percent
      FROM current_period cp
      CROSS JOIN previous_period pp
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
