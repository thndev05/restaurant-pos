import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreatePaymentDto, ProcessPaymentDto } from './dto';
import {
  PaymentStatus,
  SessionStatus,
  TableStatus,
  OrderStatus,
  OrderItemStatus,
} from 'src/generated/prisma';

@Injectable()
export class PaymentsService {
  constructor(private readonly prismaService: PrismaService) {}

  private get db() {
    return this.prismaService.payment;
  }

  async createPayment(createPaymentDto: CreatePaymentDto) {
    // For orders without session (TAKEAWAY), we'll directly update order status to PAID
    // instead of creating a payment record
    if (createPaymentDto.orderId && !createPaymentDto.sessionId) {
      const order = await this.prismaService.order.findUnique({
        where: { id: createPaymentDto.orderId },
      });

      if (!order) {
        throw new BadRequestException(
          `Order with ID "${createPaymentDto.orderId}" does not exist.`,
        );
      }

      if (order.status === OrderStatus.PAID) {
        throw new BadRequestException('Order is already paid.');
      }

      if (order.status === OrderStatus.CANCELLED) {
        throw new BadRequestException(
          'Cannot create payment for cancelled order.',
        );
      }

      // Update order status to PAID
      await this.prismaService.order.update({
        where: { id: createPaymentDto.orderId },
        data: { status: OrderStatus.PAID },
      });

      // Return a mock payment response for consistency
      return {
        code: 201,
        message: 'Order marked as paid successfully.',
        data: {
          id: `mock-${createPaymentDto.orderId}`,
          orderId: createPaymentDto.orderId,
          totalAmount: createPaymentDto.totalAmount,
          subTotal: createPaymentDto.subTotal,
          tax: createPaymentDto.tax || '0',
          discount: createPaymentDto.discount || '0',
          paymentMethod: createPaymentDto.paymentMethod,
          status: PaymentStatus.SUCCESS,
          notes: createPaymentDto.notes,
        },
      };
    }

    // Original logic for session-based payments
    const session = await this.prismaService.tableSession.findUnique({
      where: { id: createPaymentDto.sessionId },
      include: {
        table: true,
        payment: true,
      },
    });

    if (!session) {
      throw new BadRequestException(
        `Session with ID "${createPaymentDto.sessionId}" does not exist.`,
      );
    }

    if (session.status === SessionStatus.CLOSED) {
      throw new BadRequestException(
        'Cannot create payment for a closed session.',
      );
    }

    if (session.payment) {
      throw new BadRequestException('Payment already exists for this session.');
    }

    // Create payment
    const payment = await this.db.create({
      data: {
        sessionId: createPaymentDto.sessionId!,
        totalAmount: createPaymentDto.totalAmount,
        subTotal: createPaymentDto.subTotal,
        tax: createPaymentDto.tax || '0',
        discount: createPaymentDto.discount || '0',
        paymentMethod: createPaymentDto.paymentMethod,
        status: PaymentStatus.PENDING,
        notes: createPaymentDto.notes,
      },
      include: {
        session: {
          include: {
            table: true,
          },
        },
      },
    });

    return {
      code: 201,
      message: 'Payment created successfully.',
      data: payment,
    };
  }

  async getPaymentById(id: string) {
    const payment = await this.db.findUnique({
      where: { id },
      include: {
        session: {
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
            },
          },
        },
      },
    });

    if (!payment) {
      throw new BadRequestException(`Payment with ID "${id}" does not exist.`);
    }

    return payment;
  }

  async getPaymentBySessionId(sessionId: string) {
    const payment = await this.db.findUnique({
      where: { sessionId },
      include: {
        session: {
          include: {
            table: true,
          },
        },
      },
    });

    if (!payment) {
      throw new BadRequestException(
        `Payment for session ID "${sessionId}" does not exist.`,
      );
    }

    return payment;
  }

  async processPayment(id: string, processPaymentDto: ProcessPaymentDto) {
    const startTime = Date.now();
    console.log(
      `[Payment:${id}] Starting payment processing with transaction ID: ${processPaymentDto.transactionId}`,
    );

    try {
      const result = await this.prismaService.$transaction(async (tx) => {
        // Lock payment row to prevent race conditions
        const paymentLock = await tx.$queryRaw<
          Array<{ id: string; status: string; session_id: string | null }>
        >`
          SELECT id, status, session_id FROM payments WHERE id = ${id}::uuid FOR UPDATE
        `;

        if (!paymentLock || paymentLock.length === 0) {
          throw new BadRequestException(
            `Payment with ID "${id}" does not exist.`,
          );
        }

        const paymentStatus = paymentLock[0].status as PaymentStatus;
        const sessionId = paymentLock[0].session_id;

        console.log(
          `[Payment:${id}] Acquired lock. Current status: ${paymentStatus}`,
        );

        if (paymentStatus === PaymentStatus.SUCCESS) {
          throw new BadRequestException('Payment has already been processed.');
        }

        if (paymentStatus === PaymentStatus.REFUNDED) {
          throw new BadRequestException(
            'Payment has been refunded and cannot be processed.',
          );
        }

        const now = new Date();

        // Update payment status
        const updatedPayment = await tx.payment.update({
          where: { id },
          data: {
            status: PaymentStatus.SUCCESS,
            paymentTime: now,
            transactionId: processPaymentDto.transactionId,
            notes: processPaymentDto.notes,
          },
          include: {
            session: sessionId
              ? {
                  include: {
                    table: true,
                  },
                }
              : undefined,
          },
        });

        console.log(
          `[Payment:${id}] Updated payment status to SUCCESS at ${now.toISOString()}`,
        );

        if (sessionId) {
          console.log(`[Payment:${id}] Processing session: ${sessionId}`);

          // Lock session to prevent concurrent modifications
          const sessionLock = await tx.$queryRaw<
            Array<{ id: string; status: string; table_id: string }>
          >`
            SELECT id, status, table_id FROM table_sessions WHERE id = ${sessionId}::uuid FOR UPDATE
          `;

          if (!sessionLock || sessionLock.length === 0) {
            throw new BadRequestException(
              `Session ${sessionId} not found during payment processing.`,
            );
          }

          const sessionStatus = sessionLock[0].status as SessionStatus;
          const tableId = sessionLock[0].table_id;

          if (sessionStatus === SessionStatus.CLOSED) {
            throw new BadRequestException(
              'Cannot process payment for already closed session.',
            );
          }

          console.log(
            `[Payment:${id}] Session ${sessionId} locked. Current status: ${sessionStatus}, Table: ${tableId}`,
          );

          // Batch update orders and items in parallel
          const [updatedOrders, updatedItems] = await Promise.all([
            tx.order.updateMany({
              where: {
                sessionId,
                status: {
                  not: OrderStatus.CANCELLED,
                },
              },
              data: {
                status: OrderStatus.PAID,
              },
            }),
            tx.orderItem.updateMany({
              where: {
                order: {
                  sessionId,
                },
                status: {
                  not: OrderItemStatus.CANCELLED,
                },
              },
              data: {
                status: OrderItemStatus.SERVED,
              },
            }),
          ]);

          console.log(
            `[Payment:${id}] Batch updated ${updatedOrders.count} orders and ${updatedItems.count} items`,
          );

          // Close session and release table in parallel
          await Promise.all([
            tx.tableSession.update({
              where: { id: sessionId },
              data: {
                status: SessionStatus.CLOSED,
                endTime: now,
              },
            }),
            tx.table.update({
              where: { id: tableId },
              data: {
                status: TableStatus.AVAILABLE,
              },
            }),
          ]);

          console.log(
            `[Payment:${id}] Closed session ${sessionId} and released table ${tableId}`,
          );
        }

        const duration = Date.now() - startTime;
        console.log(
          `[Payment:${id}] Transaction completed successfully in ${duration}ms`,
        );

        return updatedPayment;
      });

      const totalDuration = Date.now() - startTime;
      console.log(
        `[Payment:${id}] Payment processed successfully in ${totalDuration}ms`,
      );

      return {
        code: 200,
        message: 'Payment processed successfully.',
        data: result,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(
        `[Payment:${id}] Payment processing failed after ${duration}ms:`,
        error instanceof BadRequestException ? error.message : error,
      );
      throw error;
    }
  }

  async getAllPayments(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      this.db.findMany({
        skip,
        take: limit,
        include: {
          session: {
            include: {
              table: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.db.count(),
    ]);

    return {
      code: 200,
      data: payments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
