import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreateReservationDto, UpdateReservationDto } from './dto';
import { ReservationStatus } from 'src/generated/prisma';

@Injectable()
export class ReservationsService {
  constructor(private readonly prismaService: PrismaService) {}

  private get db() {
    return this.prismaService.reservation;
  }

  /**
   * Get all reservations with optional filters
   */
  async getReservations(
    status?: ReservationStatus,
    tableId?: string,
    startDate?: string,
    endDate?: string,
  ) {
    return this.db.findMany({
      where: {
        ...(status && { status }),
        ...(tableId && { tableId }),
        ...(startDate &&
          endDate && {
            reservationTime: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          }),
      },
      include: {
        table: true,
        customer: true,
      },
      orderBy: { reservationTime: 'asc' },
    });
  }

  /**
   * Get a single reservation by ID
   */
  async getReservationById(id: string) {
    const reservation = await this.db.findUnique({
      where: { id },
      include: {
        table: true,
        customer: true,
      },
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation with id ${id} not found.`);
    }

    return reservation;
  }

  /**
   * Create a new reservation with duplicate and conflict checking
   */
  async createReservation(createReservationDto: CreateReservationDto) {
    const {
      reservationTime,
      partySize,
      guestName,
      guestPhone,
      guestEmail,
      notes,
      tableId,
    } = createReservationDto;

    // Validate reservation time is in the future
    const reservationDate = new Date(reservationTime);
    if (reservationDate <= new Date()) {
      throw new BadRequestException('Reservation time must be in the future.');
    }

    // Check if table exists
    const table = await this.prismaService.table.findUnique({
      where: { id: tableId },
    });

    if (!table) {
      throw new NotFoundException(`Table with id ${tableId} not found.`);
    }

    // Check if table capacity is sufficient
    if (partySize > table.capacity) {
      throw new BadRequestException(
        `Table capacity (${table.capacity}) is insufficient for party size (${partySize}).`,
      );
    }

    // Check for duplicate reservation (same phone, same day, not cancelled)
    const startOfDay = new Date(reservationDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(reservationDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingReservation = await this.db.findFirst({
      where: {
        guestPhone,
        reservationTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          notIn: [ReservationStatus.CANCELLED, ReservationStatus.NO_SHOW],
        },
      },
    });

    if (existingReservation) {
      throw new ConflictException(
        'You already have a reservation for this day. Please contact us to modify your existing reservation.',
      );
    }

    // Check for table conflicts (same table, overlapping time within 2 hours)
    const twoHoursBefore = new Date(reservationDate);
    twoHoursBefore.setHours(twoHoursBefore.getHours() - 2);
    const twoHoursAfter = new Date(reservationDate);
    twoHoursAfter.setHours(twoHoursAfter.getHours() + 2);

    const conflictingReservation = await this.db.findFirst({
      where: {
        tableId,
        reservationTime: {
          gte: twoHoursBefore,
          lte: twoHoursAfter,
        },
        status: {
          in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED],
        },
      },
    });

    if (conflictingReservation) {
      throw new ConflictException(
        'This table is already reserved for a nearby time slot. Please choose a different time or table.',
      );
    }

    // Create or find customer
    let customer = await this.prismaService.customer.findFirst({
      where: { phone: guestPhone },
    });

    if (!customer) {
      customer = await this.prismaService.customer.create({
        data: {
          name: guestName,
          phone: guestPhone,
          email: guestEmail,
        },
      });
    }

    // Create reservation
    const reservation = await this.db.create({
      data: {
        reservationTime: reservationDate,
        partySize,
        guestName,
        guestPhone,
        notes,
        tableId,
        customerId: customer.id,
        status: ReservationStatus.PENDING,
      },
      include: {
        table: true,
        customer: true,
      },
    });

    return reservation;
  }

  /**
   * Update an existing reservation
   */
  async updateReservation(
    id: string,
    updateReservationDto: UpdateReservationDto,
  ) {
    const reservation = await this.getReservationById(id);

    if (!reservation) {
      throw new NotFoundException(`Reservation with id ${id} not found.`);
    }

    // If updating time, check for conflicts
    if (updateReservationDto.reservationTime) {
      const newReservationDate = new Date(updateReservationDto.reservationTime);

      if (newReservationDate <= new Date()) {
        throw new BadRequestException(
          'Reservation time must be in the future.',
        );
      }

      const twoHoursBefore = new Date(newReservationDate);
      twoHoursBefore.setHours(twoHoursBefore.getHours() - 2);
      const twoHoursAfter = new Date(newReservationDate);
      twoHoursAfter.setHours(twoHoursAfter.getHours() + 2);

      const conflictingReservation = await this.db.findFirst({
        where: {
          id: { not: id },
          tableId: updateReservationDto.tableId || reservation.tableId,
          reservationTime: {
            gte: twoHoursBefore,
            lte: twoHoursAfter,
          },
          status: {
            in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED],
          },
        },
      });

      if (conflictingReservation) {
        throw new ConflictException(
          'This table is already reserved for a nearby time slot.',
        );
      }
    }

    return this.db.update({
      where: { id },
      data: {
        ...updateReservationDto,
        ...(updateReservationDto.reservationTime && {
          reservationTime: new Date(updateReservationDto.reservationTime),
        }),
        updatedAt: new Date(),
      },
      include: {
        table: true,
        customer: true,
      },
    });
  }

  /**
   * Cancel a reservation
   */
  async cancelReservation(id: string) {
    const reservation = await this.getReservationById(id);

    if (reservation.status === ReservationStatus.CANCELLED) {
      throw new BadRequestException('Reservation is already cancelled.');
    }

    if (reservation.status === ReservationStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed reservation.');
    }

    return this.db.update({
      where: { id },
      data: {
        status: ReservationStatus.CANCELLED,
        updatedAt: new Date(),
      },
      include: {
        table: true,
        customer: true,
      },
    });
  }

  /**
   * Confirm a reservation
   */
  async confirmReservation(id: string) {
    const reservation = await this.getReservationById(id);

    if (reservation.status !== ReservationStatus.PENDING) {
      throw new BadRequestException(
        'Only pending reservations can be confirmed.',
      );
    }

    return this.db.update({
      where: { id },
      data: {
        status: ReservationStatus.CONFIRMED,
        updatedAt: new Date(),
      },
      include: {
        table: true,
        customer: true,
      },
    });
  }

  /**
   * Delete a reservation (hard delete)
   */
  async deleteReservation(id: string) {
    await this.getReservationById(id);

    await this.db.delete({
      where: { id },
    });

    return {
      code: 200,
      message: `Reservation with id ${id} has been deleted.`,
    };
  }

  /**
   * Get available tables for a given time and party size
   */
  async getAvailableTables(reservationTime: string, partySize: number) {
    const reservationDate = new Date(reservationTime);

    // Get time window (2 hours before and after)
    const twoHoursBefore = new Date(reservationDate);
    twoHoursBefore.setHours(twoHoursBefore.getHours() - 2);
    const twoHoursAfter = new Date(reservationDate);
    twoHoursAfter.setHours(twoHoursAfter.getHours() + 2);

    // Find all reserved table IDs in the time window
    const reservedTables = await this.db.findMany({
      where: {
        reservationTime: {
          gte: twoHoursBefore,
          lte: twoHoursAfter,
        },
        status: {
          in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED],
        },
      },
      select: {
        tableId: true,
      },
    });

    const reservedTableIds = reservedTables.map((r) => r.tableId);

    // Find available tables
    return this.prismaService.table.findMany({
      where: {
        id: {
          notIn: reservedTableIds,
        },
        capacity: {
          gte: partySize,
        },
        status: {
          in: ['AVAILABLE', 'RESERVED'],
        },
      },
      orderBy: [{ capacity: 'asc' }, { number: 'asc' }],
    });
  }
}
