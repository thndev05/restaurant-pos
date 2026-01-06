import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import {
  CreateSessionDto,
  UpdateSessionDto,
  CloseSessionDto,
  InitSessionDto,
} from './dto';
import { SessionStatus, TableStatus, Order, NotificationType } from 'src/generated/prisma';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class SessionsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  private get db() {
    return this.prismaService.tableSession;
  }

  async getAllSessions() {
    const sessions = await this.db.findMany({
      where: {
        status: SessionStatus.ACTIVE, // Only get ACTIVE sessions (PAID is removed - sessions auto-close after payment)
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
    console.log('\n========== CREATE SESSION DEBUG ==========');
    console.log('Table ID:', createSessionDto.tableId);

    // Check if table exists
    const table = await this.prismaService.table.findUnique({
      where: { id: createSessionDto.tableId },
    });

    if (!table) {
      throw new BadRequestException(
        `Table with ID "${createSessionDto.tableId}" does not exist.`,
      );
    }

    console.log(`Table #${table.number} found`);

    // Check if table already has an active session
    // Only ONE active session allowed per table
    const existingSession = await this.db.findFirst({
      where: {
        tableId: createSessionDto.tableId,
        status: SessionStatus.ACTIVE, // Only check ACTIVE (sessions auto-close after payment)
      },
    });

    console.log(
      `Existing session: ${existingSession ? existingSession.id : 'NONE'}`,
    );

    if (existingSession) {
      console.log(
        'Table already has an active session - cannot create new session',
      );
      console.log('==========================================\n');

      throw new BadRequestException(
        `Table #${table.number} already has an active session. Please close the existing session first or use the existing session.`,
      );
    }

    // Create session and update table status
    console.log('Creating new session...');
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 120);

    const session = await this.prismaService.$transaction(async (tx) => {
      const newSession = await tx.tableSession.create({
        data: {
          tableId: createSessionDto.tableId,
          customerCount: createSessionDto.customerCount,
          notes: createSessionDto.notes,
          status: SessionStatus.ACTIVE,
          startTime: new Date(),
          expiresAt,
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

    console.log(`New session created: ${session.id}`);
    console.log('==========================================\n');

    // Send notification when customer scans QR code (creates session)
    await this.notificationsGateway.emitToRoles(
      NotificationType.TABLE_SESSION_STARTED,
      'New Table Session',
      `Customer scanned QR code - Table ${table.number} session started with ${session.customerCount} guests`,
      { sessionId: session.id, tableNumber: table.number, customerCount: session.customerCount },
    );

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
    console.log('\n========== CLOSE SESSION DEBUG ==========');
    console.log('Session ID:', id);

    const session = await this.getSessionById(id);

    if (session.status === SessionStatus.CLOSED) {
      throw new BadRequestException('Session is already closed.');
    }

    console.log(`Session for Table #${session.table.number}`);
    console.log(`Session orders: ${session.orders.length}`);

    // Check ALL active sessions for this table and their orders
    const allTableSessions = await this.db.findMany({
      where: {
        tableId: session.tableId,
        status: SessionStatus.ACTIVE,
      },
      include: {
        orders: true,
      },
    });

    console.log(`Total active sessions for table: ${allTableSessions.length}`);

    // Get all pending orders from all active sessions
    const allPendingOrders: Order[] = [];
    allTableSessions.forEach((sess) => {
      const pending = sess.orders.filter(
        (order) =>
          order.status !== 'SERVED' &&
          order.status !== 'CANCELLED' &&
          order.status !== 'PAID',
      );
      allPendingOrders.push(...pending);
    });

    console.log(
      `Total pending orders across all sessions: ${allPendingOrders.length}`,
    );

    if (allPendingOrders.length > 0) {
      console.log(
        'Pending orders:',
        allPendingOrders.map((o) => `${o.id} (${o.status})`),
      );
      console.log('=========================================\n');
      throw new BadRequestException(
        `Cannot close session. There are ${allPendingOrders.length} pending orders.`,
      );
    }

    // Close ALL active sessions for this table
    console.log('Closing all active sessions for the table...');

    await this.prismaService.$transaction(async (tx) => {
      // Close all active sessions for this table
      await tx.tableSession.updateMany({
        where: {
          tableId: session.tableId,
          status: SessionStatus.ACTIVE,
        },
        data: {
          status: SessionStatus.CLOSED,
          endTime: new Date(),
        },
      });

      // Update specific session with notes if provided
      if (closeSessionDto.notes) {
        await tx.tableSession.update({
          where: { id },
          data: {
            notes: closeSessionDto.notes,
          },
        });
      }

      // Update table status to available
      await tx.table.update({
        where: { id: session.tableId },
        data: {
          status: TableStatus.AVAILABLE,
        },
      });
    });

    console.log('All sessions closed successfully');
    console.log('=========================================\n');

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

  /**
   * Initialize a customer session from QR code token
   * This is the secure entry point for customer ordering
   *
   * Security: Each table can only have ONE active session at a time
   * This prevents multiple devices from creating separate sessions on the same table
   * Uses database transaction with row-level locking to prevent race conditions
   */
  async initializeSession(tableId: string, initDto: InitSessionDto) {
    console.log('\n========== INIT SESSION DEBUG ==========');
    console.log(`Table ID: ${tableId}`);
    console.log(`Init DTO:`, initDto);

    // Use a transaction with row-level locking to prevent race conditions
    return await this.prismaService.$transaction(
      async (tx) => {
        // Check if table exists and lock the row
        const table = await tx.table.findUnique({
          where: { id: tableId },
        });

        if (!table) {
          throw new BadRequestException('Table not found');
        }

        console.log(`Table #${table.number} found, status: ${table.status}`);

        // Check table status
        if (table.status === TableStatus.OUT_OF_SERVICE) {
          throw new BadRequestException('Table is out of service');
        }

        // Check if table already has an ACTIVE session
        // Sessions automatically close after payment, so we only need to check ACTIVE
        const activeSession = await tx.tableSession.findFirst({
          where: {
            tableId,
            status: SessionStatus.ACTIVE,
          },
        });

        if (activeSession) {
          console.log(
            `Table #${table.number} already has active session: ${activeSession.id} (Status: ${activeSession.status})`,
          );
          console.log('ERROR: Table is currently in use!');
          console.log('=========================================\n');

          throw new BadRequestException(
            `Table #${table.number} is currently in use. Please select another table or contact staff.`,
          );
        }

        console.log('No active session found. Creating new session...');

        // Calculate expiration (120 minutes from now)
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 120);

        // Create new session
        const newSession = await tx.tableSession.create({
          data: {
            tableId,
            customerCount: initDto.customerCount,
            notes: initDto.notes,
            status: SessionStatus.ACTIVE,
            expiresAt,
            startTime: new Date(),
          },
        });

        // Update table status to OCCUPIED
        await tx.table.update({
          where: { id: tableId },
          data: { status: TableStatus.OCCUPIED },
        });

        console.log(`New session created: ${newSession.id}`);
        console.log('=========================================\n');

        return {
          sessionId: newSession.id,
          sessionSecret: newSession.sessionSecret,
          tableInfo: {
            id: table.id,
            number: table.number,
            capacity: table.capacity,
            status: TableStatus.OCCUPIED,
          },
          expiresAt: newSession.expiresAt,
        };
      },
      {
        isolationLevel: 'Serializable', // Highest isolation level to prevent race conditions
        maxWait: 5000, // Wait up to 5 seconds for a transaction slot
        timeout: 10000, // Transaction timeout 10 seconds
      },
    );
  }

  /**
   * Validate session credentials
   * Used by TableSessionGuard
   */
  async validateSession(sessionId: string, sessionSecret: string) {
    const session = await this.db.findUnique({
      where: { id: sessionId },
      include: {
        table: true,
      },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid session');
    }

    if (session.sessionSecret !== sessionSecret) {
      throw new UnauthorizedException('Invalid session credentials');
    }

    if (session.status !== SessionStatus.ACTIVE) {
      throw new UnauthorizedException('Session is not active');
    }

    if (session.expiresAt && session.expiresAt < new Date()) {
      throw new UnauthorizedException('Session has expired');
    }

    return session;
  }

  /**
   * Get session with full details for customer
   */
  async getCustomerSession(sessionId: string) {
    const session = await this.db.findUnique({
      where: { id: sessionId },
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
        staffActions: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!session) {
      throw new BadRequestException('Session not found');
    }

    return session;
  }
}
