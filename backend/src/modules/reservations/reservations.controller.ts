import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import {
  CreateReservationDto,
  UpdateReservationDto,
  GetReservationsDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Throttle, SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  /**
   * Get all reservations with optional filters
   * Protected endpoint - requires authentication and read permission
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('reservations.read')
  @Get()
  getReservations(@Query() query: GetReservationsDto) {
    return this.reservationsService.getReservations(
      query.status,
      query.tableId,
      query.startDate,
      query.endDate,
    );
  }

  /**
   * Get available tables for a given time and party size
   * Public endpoint
   * NOTE: Must come before :id route to avoid path conflicts
   */
  @Public()
  @Get('available-tables')
  getAvailableTables(
    @Query('reservationTime') reservationTime: string,
    @Query('partySize') partySize: string,
  ) {
    return this.reservationsService.getAvailableTables(
      reservationTime,
      parseInt(partySize),
    );
  }

  /**
   * Get upcoming reservations (next 24 hours)
   * Protected endpoint - requires authentication and read permission
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('reservations.read')
  @Get('upcoming')
  getUpcomingReservations() {
    return this.reservationsService.getUpcomingReservations();
  }

  /**
   * Get reservation statistics
   * Protected endpoint - requires authentication and read permission
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('reservations.read')
  @Get('statistics')
  getReservationStatistics() {
    return this.reservationsService.getReservationStatistics();
  }

  /**
   * Get a single reservation by ID
   * Protected endpoint - requires authentication and read permission
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('reservations.read')
  @Get(':id')
  getReservationById(@Param('id') id: string) {
    return this.reservationsService.getReservationById(id);
  }

  /**
   * Create a new reservation
   * Public endpoint with rate limiting (3 requests per minute)
   */
  @SkipThrottle({ default: false })
  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post()
  createReservation(@Body() createReservationDto: CreateReservationDto) {
    return this.reservationsService.createReservation(createReservationDto);
  }

  /**
   * Update an existing reservation
   * Protected endpoint - requires authentication and update permission
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('reservations.update')
  @Patch(':id')
  updateReservation(
    @Param('id') id: string,
    @Body() updateReservationDto: UpdateReservationDto,
  ) {
    return this.reservationsService.updateReservation(id, updateReservationDto);
  }

  /**
   * Confirm a reservation
   * Protected endpoint - requires authentication and confirm permission
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('reservations.confirm')
  @Patch(':id/confirm')
  confirmReservation(@Param('id') id: string) {
    return this.reservationsService.confirmReservation(id);
  }

  /**
   * Complete a reservation
   * Protected endpoint - requires authentication and update permission
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('reservations.update')
  @Patch(':id/complete')
  completeReservation(@Param('id') id: string) {
    return this.reservationsService.completeReservation(id);
  }

  /**
   * Mark reservation as no-show
   * Protected endpoint - requires authentication and update permission
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('reservations.update')
  @Patch(':id/no-show')
  markAsNoShow(@Param('id') id: string) {
    return this.reservationsService.markAsNoShow(id);
  }

  /**
   * Cancel a reservation
   * Public endpoint with rate limiting (5 requests per minute)
   */
  @SkipThrottle({ default: false })
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Patch(':id/cancel')
  cancelReservation(@Param('id') id: string) {
    return this.reservationsService.cancelReservation(id);
  }

  /**
   * Delete a reservation (hard delete)
   * Protected endpoint - requires authentication and delete permission
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('reservations.delete')
  @Delete(':id')
  deleteReservation(@Param('id') id: string) {
    return this.reservationsService.deleteReservation(id);
  }
}
