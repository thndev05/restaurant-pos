import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import {
  GetAnalyticsDto,
  GetComparisonDto,
  GetBestSellingItemsDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  async getDashboardData(@Query() dto: GetAnalyticsDto) {
    return this.analyticsService.getDashboardData(dto);
  }

  @Get('revenue-stats')
  async getRevenueStats(@Query() dto: GetAnalyticsDto) {
    return this.analyticsService.getRevenueStats(dto);
  }

  @Get('daily-revenue')
  async getDailyRevenue(@Query() dto: GetAnalyticsDto) {
    return this.analyticsService.getDailyRevenue(dto);
  }

  @Get('best-selling-items')
  async getBestSellingItems(@Query() dto: GetBestSellingItemsDto) {
    return this.analyticsService.getBestSellingItems(dto);
  }

  @Get('category-performance')
  async getCategoryPerformance(@Query() dto: GetAnalyticsDto) {
    return this.analyticsService.getCategoryPerformance(dto);
  }

  @Get('hourly-sales')
  async getHourlySales(@Query() dto: GetAnalyticsDto) {
    return this.analyticsService.getHourlySales(dto);
  }

  @Get('payment-methods')
  async getPaymentMethodStats(@Query() dto: GetAnalyticsDto) {
    return this.analyticsService.getPaymentMethodStats(dto);
  }

  @Get('order-types')
  async getOrderTypeStats(@Query() dto: GetAnalyticsDto) {
    return this.analyticsService.getOrderTypeStats(dto);
  }

  @Get('table-utilization')
  async getTableUtilizationStats(@Query() dto: GetAnalyticsDto) {
    return this.analyticsService.getTableUtilizationStats(dto);
  }

  @Get('peak-hours')
  async getPeakHoursAnalysis(@Query() dto: GetAnalyticsDto) {
    return this.analyticsService.getPeakHoursAnalysis(dto);
  }

  @Get('revenue-comparison')
  async getRevenueComparison(@Query() dto: GetComparisonDto) {
    return this.analyticsService.getRevenueComparison(dto);
  }
}
