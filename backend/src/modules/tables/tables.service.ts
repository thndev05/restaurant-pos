import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreateTableDto, UpdateTableDto, GetTablesDto } from './dto';
import { TableStatus } from 'src/generated/prisma';

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

    return this.db.findMany({
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
      },
      orderBy: { number: 'asc' },
    });
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
    const table = await this.getTableById(id);
    if (!table) {
      throw new BadRequestException(`Table with ID "${id}" does not exist.`);
    }

    if (!Object.values(TableStatus).includes(status)) {
      throw new BadRequestException(`Invalid table status: ${status}`);
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

  async deleteTable(id: string) {
    const table = await this.getTableById(id);
    if (!table) {
      throw new BadRequestException(`Table with ID "${id}" does not exist.`);
    }

    await this.db.delete({ where: { id } });

    return {
      code: 200,
      message: `Table with ID "${id}" has been deleted.`,
    };
  }
}
