import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreateSessionDto, UpdateSessionDto, CloseSessionDto } from './dto';
import { SessionStatus, TableStatus } from 'src/generated/prisma';

@Injectable()
export class SessionsService {
  constructor(private readonly prismaService: PrismaService) {}

  private get db() {
    return this.prismaService.tableSession;
  }

  async getAllSessions() {
    const sessions = await this.db.findMany({
      where: {
        status: {
          in: [SessionStatus.ACTIVE, SessionStatus.PAID],
        },
      },
      include: {
        table: true,
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
        startTime: 'asc',
      },
    });

    return sessions;
  }

  async createSession(createSessionDto: CreateSessionDto) {
    // Check if table exists
    const table = await this.prismaService.table.findUnique({
      where: { id: createSessionDto.tableId },
    });

    if (!table) {
      throw new BadRequestException(
        `Table with ID "${createSessionDto.tableId}" does not exist.`,
      );
    }

    // Check if table already has an active session
    const existingSession = await this.db.findFirst({
      where: {
        tableId: createSessionDto.tableId,
        status: {
          in: [SessionStatus.ACTIVE, SessionStatus.PAID],
        },
      },
    });

    if (existingSession) {
      throw new BadRequestException(
        'Table already has an active session. Please close the existing session first.',
      );
    }

    // Create session and update table status
    const session = await this.prismaService.$transaction(async (tx) => {
      const newSession = await tx.tableSession.create({
        data: {
          tableId: createSessionDto.tableId,
          customerCount: createSessionDto.customerCount,
          notes: createSessionDto.notes,
          status: SessionStatus.ACTIVE,
          startTime: new Date(),
        },
        include: {
          table: true,
          orders: true,
        },
      });

      // Update table status to occupied
      await tx.table.update({
        where: { id: createSessionDto.tableId },
        data: { status: TableStatus.OCCUPIED },
      });

      return newSession;
    });

    return {
      code: 201,
      message: 'Session created successfully.',
      data: session,
    };
  }

  async getSessionById(id: string) {
    const session = await this.db.findUnique({
      where: { id },
      include: {
        table: true,
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
    });

    if (!session) {
      throw new BadRequestException(`Session with ID "${id}" does not exist.`);
    }

    return session;
  }

  async updateSession(id: string, updateSessionDto: UpdateSessionDto) {
    const session = await this.getSessionById(id);

    if (session.status === SessionStatus.CLOSED) {
      throw new BadRequestException('Cannot update a closed session.');
    }

    await this.db.update({
      where: { id },
      data: updateSessionDto,
    });

    return {
      code: 200,
      message: `Session with ID "${id}" has been updated.`,
    };
  }

  async closeSession(id: string, closeSessionDto: CloseSessionDto) {
    const session = await this.getSessionById(id);

    if (session.status === SessionStatus.CLOSED) {
      throw new BadRequestException('Session is already closed.');
    }

    // Check if all orders are served or cancelled
    const pendingOrders = session.orders.filter(
      (order) => order.status !== 'SERVED' && order.status !== 'CANCELLED',
    );

    if (pendingOrders.length > 0) {
      throw new BadRequestException(
        'Cannot close session. There are pending orders.',
      );
    }

    await this.prismaService.$transaction([
      // Update session status
      this.db.update({
        where: { id },
        data: {
          status: SessionStatus.CLOSED,
          endTime: new Date(),
          notes: closeSessionDto.notes || session.notes,
        },
      }),
      // Update table status to available
      this.prismaService.table.update({
        where: { id: session.tableId },
        data: {
          status: TableStatus.AVAILABLE,
        },
      }),
    ]);

    return {
      code: 200,
      message: `Session with ID "${id}" has been closed.`,
    };
  }

  async getSessionBill(id: string) {
    const session = await this.getSessionById(id);

    // Calculate bill from orders
    let subTotal = 0;
    const orderItems: any[] = [];

    session.orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        subTotal += Number(item.priceAtOrder) * item.quantity;
        orderItems.push({
          name: item.itemNameAtOrder,
          quantity: item.quantity,
          price: Number(item.priceAtOrder),
          total: Number(item.priceAtOrder) * item.quantity,
        });
      });
    });

    const taxRate = 0.1; // 10% VAT
    const tax = subTotal * taxRate;
    const discount = 0; // Can be implemented based on business logic
    const total = subTotal + tax - discount;

    return {
      sessionId: session.id,
      tableNumber: session.table.number,
      customerCount: session.customerCount,
      startTime: session.startTime,
      items: orderItems,
      subTotal: Number(subTotal.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      discount: Number(discount.toFixed(2)),
      total: Number(total.toFixed(2)),
    };
  }
}
