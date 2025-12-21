import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { ReservationStatus } from 'src/generated/prisma';

@Injectable()
export class ReservationsSchedulerService {
  private readonly logger = new Logger(ReservationsSchedulerService.name);

  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Run every 15 minutes to release expired reservations
   * Tables with confirmed reservations are automatically released
   * after the 2-hour time window passes
   */
  @Cron(CronExpression.EVERY_10_MINUTES)
  async releaseExpiredReservations() {
    this.logger.log('Running: Release expired reservations');

    const now = new Date();
    const twoHoursAgo = new Date(now);
    twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);

    try {
      // Find all confirmed reservations that have passed (outside 2-hour window)
      const expiredReservations = await this.prismaService.reservation.findMany(
        {
          where: {
            status: ReservationStatus.CONFIRMED,
            reservationTime: {
              lt: twoHoursAgo,
            },
          },
          include: {
            table: true,
          },
        },
      );

      this.logger.log(
        `Found ${expiredReservations.length} expired reservations`,
      );

      // Release tables that are still marked as RESERVED
      for (const reservation of expiredReservations) {
        await this.releaseTableIfNoActiveReservations(reservation.tableId);
      }

      this.logger.log('Completed: Release expired reservations');
    } catch (error) {
      this.logger.error('Error releasing expired reservations:', error);
    }
  }

  /**
   * Run every hour to mark no-shows
   * Reservations that are confirmed but 30 minutes past their time are marked as NO_SHOW
   */
  @Cron(CronExpression.EVERY_HOUR)
  async markNoShows() {
    this.logger.log('Running: Mark no-shows');

    const now = new Date();
    const thirtyMinutesAgo = new Date(now);
    thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);

    try {
      // Find confirmed reservations that are 30+ minutes past their time
      const noShowReservations = await this.prismaService.reservation.findMany({
        where: {
          status: ReservationStatus.CONFIRMED,
          reservationTime: {
            lt: thirtyMinutesAgo,
          },
        },
      });

      this.logger.log(`Found ${noShowReservations.length} potential no-shows`);

      // Update to NO_SHOW and release tables
      for (const reservation of noShowReservations) {
        await this.prismaService.reservation.update({
          where: { id: reservation.id },
          data: {
            status: ReservationStatus.NO_SHOW,
            updatedAt: new Date(),
          },
        });

        await this.releaseTableIfNoActiveReservations(reservation.tableId);
      }

      this.logger.log('Completed: Mark no-shows');
    } catch (error) {
      this.logger.error('Error marking no-shows:', error);
    }
  }

  /**
   * Run every 5 minutes to sync table statuses based on current reservations
   * Ensures tables are marked as RESERVED when they should be
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async syncTableStatuses() {
    this.logger.log('Running: Sync table statuses');

    const now = new Date();
    const twoHoursBefore = new Date(now);
    twoHoursBefore.setHours(twoHoursBefore.getHours() - 2);
    const twoHoursAfter = new Date(now);
    twoHoursAfter.setHours(twoHoursAfter.getHours() + 2);

    try {
      // Find all confirmed reservations in the current time window
      const activeReservations = await this.prismaService.reservation.findMany({
        where: {
          status: ReservationStatus.CONFIRMED,
          reservationTime: {
            gte: twoHoursBefore,
            lte: twoHoursAfter,
          },
        },
        include: {
          table: true,
        },
      });

      this.logger.log(`Found ${activeReservations.length} active reservations`);

      // Set tables to RESERVED if they should be
      for (const reservation of activeReservations) {
        const table = await this.prismaService.table.findUnique({
          where: { id: reservation.tableId },
          include: {
            sessions: {
              where: {
                status: { in: ['ACTIVE', 'PAID'] },
              },
            },
          },
        });

        // Only update if not occupied and not already RESERVED
        if (
          table &&
          (!table.sessions || table.sessions.length === 0) &&
          table.status !== 'RESERVED' &&
          table.status !== 'OUT_OF_SERVICE'
        ) {
          await this.prismaService.table.update({
            where: { id: table.id },
            data: { status: 'RESERVED' },
          });
          this.logger.log(`Set table ${table.number} to RESERVED`);
        }
      }

      // Release tables that should not be RESERVED
      const reservedTables = await this.prismaService.table.findMany({
        where: { status: 'RESERVED' },
      });

      for (const table of reservedTables) {
        await this.releaseTableIfNoActiveReservations(table.id);
      }

      this.logger.log('Completed: Sync table statuses');
    } catch (error) {
      this.logger.error('Error syncing table statuses:', error);
    }
  }

  /**
   * Helper: Release table to AVAILABLE if no active reservations exist
   */
  private async releaseTableIfNoActiveReservations(tableId: string) {
    const now = new Date();
    const twoHoursBefore = new Date(now);
    twoHoursBefore.setHours(twoHoursBefore.getHours() - 2);
    const twoHoursAfter = new Date(now);
    twoHoursAfter.setHours(twoHoursAfter.getHours() + 2);

    // Check for active reservations
    const activeReservation = await this.prismaService.reservation.findFirst({
      where: {
        tableId,
        reservationTime: {
          gte: twoHoursBefore,
          lte: twoHoursAfter,
        },
        status: ReservationStatus.CONFIRMED,
      },
    });

    // Check for active sessions
    const table = await this.prismaService.table.findUnique({
      where: { id: tableId },
      include: {
        sessions: {
          where: {
            status: { in: ['ACTIVE', 'PAID'] },
          },
        },
      },
    });

    if (!table) return;

    // Release to AVAILABLE if no active reservations and no active sessions
    if (
      !activeReservation &&
      (!table.sessions || table.sessions.length === 0) &&
      table.status === 'RESERVED'
    ) {
      await this.prismaService.table.update({
        where: { id: tableId },
        data: { status: 'AVAILABLE' },
      });
      this.logger.log(`Released table ${table.number} to AVAILABLE`);
    }
  }
}
