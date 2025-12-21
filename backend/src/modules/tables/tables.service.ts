import {
  BadRequestException,
  Injectable,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreateTableDto, UpdateTableDto, GetTablesDto } from './dto';
import { TableStatus, ReservationStatus } from 'src/generated/prisma';

@Injectable()
export class TablesService {
  constructor(private readonly prismaService: PrismaService) {}

  private get db() {
    return this.prismaService.table;
  }

  async getTables(getTablesDto: GetTablesDto) {
    const { status } = getTablesDto;

    if (status && !Object.values(TableStatus).includes(status)) {
      throw new BadRequestException(`Invalid table status: ${status}`);
    }

    const tables = await this.db.findMany({
      where: {
        ...(status && { status }),
      },
      include: {
        sessions: {
          where: {
            status: 'ACTIVE',
          },
          include: {
            orders: {
              include: {
                orderItems: {
                  include: {
                    menuItem: true,
                  },
                },
              },
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
          orderBy: {
            startTime: 'desc',
          },
          take: 1,
        },
        reservations: {
          where: {
            status: {
              in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED],
            },
            reservationTime: {
              gte: new Date(),
            },
          },
          orderBy: {
            reservationTime: 'asc',
          },
        },
      },
      orderBy: { number: 'asc' },
    });

    return tables;
  }

  async getTableById(id: string) {
    const table = await this.db.findUnique({
      where: { id },
      include: {
        sessions: {
          where: {
            status: 'ACTIVE',
          },
          include: {
            orders: {
              include: {
                orderItems: {
                  include: {
                    menuItem: true,
                  },
                },
              },
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
          orderBy: {
            startTime: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!table) {
      throw new BadRequestException(`Table with ID "${id}" does not exist.`);
    }

    return table;
  }

  async createTable(createTableDto: CreateTableDto) {
    const { number } = createTableDto;

    const existingTableNumber = await this.db.findFirst({
      where: { number: { equals: number } },
    });

    if (existingTableNumber) {
      throw new BadRequestException(`Table "${number}" already exists.`);
    }

    return this.db.create({ data: createTableDto });
  }

  async updateTable(id: string, updateTableDto: UpdateTableDto) {
    const { number } = updateTableDto;
    if (number) {
      const existingTableNumber = await this.db.findFirst({
        where: { number: { equals: number }, id: { not: id } },
      });

      if (existingTableNumber) {
        throw new BadRequestException(`Table "${number}" already exists.`);
      }
    }

    const table = await this.getTableById(id);
    if (!table) {
      throw new BadRequestException(`Table with ID "${id}" does not exist.`);
    }

    await this.db.update({
      where: { id },
      data: updateTableDto,
    });

    return {
      code: 200,
      message: `Table with ID "${id}" has been updated.`,
    };
  }

  async updateTableStatus(id: string, status: TableStatus) {
    const table = await this.db.findUnique({
      where: { id },
      include: {
        sessions: {
          where: {
            status: {
              in: ['ACTIVE', 'PAID'],
            },
          },
        },
      },
    });

    if (!table) {
      throw new BadRequestException(`Table with ID "${id}" does not exist.`);
    }

    if (!Object.values(TableStatus).includes(status)) {
      throw new BadRequestException(`Invalid table status: ${status}`);
    }

    // Prevent changing status to AVAILABLE if there's an active session
    if (
      status === TableStatus.AVAILABLE &&
      table.sessions &&
      table.sessions.length > 0
    ) {
      throw new BadRequestException(
        'Cannot set table to AVAILABLE status while there are active sessions. Please close the session first.',
      );
    }

    // Check for active confirmed reservations in current time window
    const now = new Date();
    const twoHoursBefore = new Date(now);
    twoHoursBefore.setHours(twoHoursBefore.getHours() - 2);
    const twoHoursAfter = new Date(now);
    twoHoursAfter.setHours(twoHoursAfter.getHours() + 2);

    const activeReservation = await this.prismaService.reservation.findFirst({
      where: {
        tableId: id,
        status: ReservationStatus.CONFIRMED,
        reservationTime: {
          gte: twoHoursBefore,
          lte: twoHoursAfter,
        },
      },
    });

    // Prevent changing from RESERVED status if there's an active confirmed reservation
    if (
      table.status === TableStatus.RESERVED &&
      activeReservation &&
      status !== TableStatus.RESERVED &&
      status !== TableStatus.OUT_OF_SERVICE
    ) {
      throw new ConflictException(
        `Cannot change table status. Table has an active confirmed reservation at ${activeReservation.reservationTime.toLocaleString()}. Please cancel or complete the reservation first.`,
      );
    }

    await this.db.update({
      where: { id },
      data: { status },
    });

    return {
      code: 200,
      message: `Table with ID "${id}" status has been updated to "${status}".`,
    };
  }

  /**
   * Get upcoming reservations for a specific table
   */
  async getUpcomingReservations(tableId: string) {
    const table = await this.db.findUnique({
      where: { id: tableId },
    });

    if (!table) {
      throw new BadRequestException(
        `Table with ID "${tableId}" does not exist.`,
      );
    }

    const now = new Date();

    return this.prismaService.reservation.findMany({
      where: {
        tableId,
        status: {
          in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED],
        },
        reservationTime: {
          gte: now,
        },
      },
      include: {
        customer: true,
      },
      orderBy: {
        reservationTime: 'asc',
      },
    });
  }

  async deleteTable(id: string) {
    const table = await this.db.findUnique({
      where: { id },
      include: {
        sessions: {
          where: {
            status: {
              in: ['ACTIVE', 'PAID'],
            },
          },
        },
      },
    });

    if (!table) {
      throw new BadRequestException(`Table with ID "${id}" does not exist.`);
    }

    // Check if table has active sessions
    if (table.sessions && table.sessions.length > 0) {
      throw new BadRequestException(
        'Cannot delete table with active sessions. Please close all sessions first.',
      );
    }

    await this.db.delete({ where: { id } });

    return {
      code: 200,
      message: `Table with ID "${id}" has been deleted.`,
    };
  }
}
