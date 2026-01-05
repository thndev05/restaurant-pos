import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreatePaymentDto, ProcessPaymentDto, SepayWebhookDto } from './dto';
import {
  PaymentStatus,
  SessionStatus,
  TableStatus,
  OrderStatus,
  OrderItemStatus,
  NotificationType,
} from 'src/generated/prisma';
import {
  generateTransactionId,
  isValidTransactionId,
  getBankTransferInfo,
} from 'src/common/utils';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  private get db() {
    return this.prismaService.payment;
  }

  async createPayment(createPaymentDto: CreatePaymentDto) {
    // For orders without session (TAKEAWAY), handle based on payment method
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

      // For CASH payments, mark as paid immediately
      if (createPaymentDto.paymentMethod === 'CASH') {
        await this.prismaService.order.update({
          where: { id: createPaymentDto.orderId },
          data: { status: OrderStatus.PAID },
        });

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

      // For BANKING/CARD, create pending payment with transaction ID
      const transactionId = generateTransactionId();

      const payment = await this.db.create({
        data: {
          orderId: createPaymentDto.orderId,
          totalAmount: createPaymentDto.totalAmount,
          subTotal: createPaymentDto.subTotal,
          tax: createPaymentDto.tax || '0',
          discount: createPaymentDto.discount || '0',
          paymentMethod: createPaymentDto.paymentMethod,
          status: PaymentStatus.PENDING,
          transactionId,
          notes: createPaymentDto.notes,
        },
        include: {
          order: true,
        },
      });

      return {
        code: 201,
        message:
          'Payment created successfully. Waiting for bank transfer confirmation.',
        data: payment,
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

    // Generate unique transaction ID
    const transactionId = generateTransactionId();

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
        transactionId,
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
    console.log(`[Payment:${id}] Starting payment processing`);

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

  /**
   * Handle SePay webhook for bank transfer payment confirmation
   * Extracts transaction ID from transfer content and updates payment status
   */
  async handleSepayWebhook(webhookData: SepayWebhookDto) {
    console.log('[SePay Webhook] Received webhook:', {
      id: webhookData.id,
      amount: webhookData.transferAmount,
      content: webhookData.content,
      type: webhookData.transferType,
    });

    // Only process incoming transfers
    if (webhookData.transferType !== 'in') {
      console.log('[SePay Webhook] Skipping outgoing transfer');
      return {
        success: true,
        message: 'Outgoing transfer ignored',
      };
    }

    // Extract transaction ID from content
    // Expected format: content contains transaction ID like "TX1234567890"
    const transactionIdMatch = webhookData.content.match(/TX[A-Z0-9]{10}/);

    if (!transactionIdMatch) {
      console.log(
        '[SePay Webhook] No valid transaction ID found in content:',
        webhookData.content,
      );
      return {
        success: false,
        message: 'No transaction ID found in transfer content',
      };
    }

    const transactionId = transactionIdMatch[0];
    console.log('[SePay Webhook] Extracted transaction ID:', transactionId);

    // Validate transaction ID format
    if (!isValidTransactionId(transactionId)) {
      console.log(
        '[SePay Webhook] Invalid transaction ID format:',
        transactionId,
      );
      return {
        success: false,
        message: 'Invalid transaction ID format',
      };
    }

    // Find payment by transaction ID
    const payment = await this.db.findUnique({
      where: { transactionId },
      include: {
        session: {
          include: {
            table: true,
          },
        },
        order: true,
      },
    });

    if (!payment) {
      console.log(
        '[SePay Webhook] Payment not found for transaction ID:',
        transactionId,
      );
      return {
        success: false,
        message: `Payment not found for transaction ID: ${transactionId}`,
      };
    }

    // Check if payment is already successful
    if (payment.status === PaymentStatus.SUCCESS) {
      console.log('[SePay Webhook] Payment already processed:', payment.id);
      return {
        success: true,
        message: 'Payment already processed',
      };
    }

    // Verify amount matches
    // Database stores as Decimal (e.g., 100000.00)
    // SePay sends as integer (e.g., 100000)
    // Round both to nearest integer for comparison
    const expectedAmount = Math.round(
      parseFloat(payment.totalAmount.toString()),
    );
    const receivedAmount = Math.round(webhookData.transferAmount);

    if (expectedAmount !== receivedAmount) {
      console.log('[SePay Webhook] Amount mismatch:', {
        expected: expectedAmount,
        received: receivedAmount,
        expectedOriginal: payment.totalAmount.toString(),
        receivedOriginal: webhookData.transferAmount,
      });
      return {
        success: false,
        message: `Amount mismatch. Expected: ${expectedAmount}, Received: ${receivedAmount}`,
      };
    }

    // Update payment status to SUCCESS
    try {
      const now = new Date();

      await this.prismaService.$transaction(async (tx) => {
        // Update payment
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.SUCCESS,
            paymentTime: now,
            notes: payment.notes
              ? `${payment.notes}\nSePay Reference: ${webhookData.referenceCode}`
              : `SePay Reference: ${webhookData.referenceCode}`,
          },
        });

        // If payment has a session, close the session
        if (payment.sessionId) {
          await tx.tableSession.update({
            where: { id: payment.sessionId },
            data: {
              status: SessionStatus.CLOSED, // Changed from PAID to CLOSED - session ends after payment
              endTime: now,
            },
          });

          // Update all orders in the session to PAID
          await tx.order.updateMany({
            where: { sessionId: payment.sessionId },
            data: { status: OrderStatus.PAID },
          });

          // Update all order items to SERVED
          const sessionOrders = await tx.order.findMany({
            where: { sessionId: payment.sessionId },
            select: { id: true },
          });

          const orderIds = sessionOrders.map((order) => order.id);

          await tx.orderItem.updateMany({
            where: {
              orderId: { in: orderIds },
              status: { not: OrderItemStatus.CANCELLED },
            },
            data: { status: OrderItemStatus.SERVED },
          });

          // Free up the table
          const session = await tx.tableSession.findUnique({
            where: { id: payment.sessionId },
            select: { tableId: true },
          });

          if (session) {
            await tx.table.update({
              where: { id: session.tableId },
              data: { status: TableStatus.AVAILABLE },
            });
          }
        }

        // If payment has an order (without session), mark order as PAID
        if (payment.orderId) {
          await tx.order.update({
            where: { id: payment.orderId },
            data: { status: OrderStatus.PAID },
          });
        }
      });

      console.log(
        '[SePay Webhook] Payment processed successfully:',
        payment.id,
      );

      // Emit payment status update via WebSocket
      this.notificationsGateway.emitPaymentStatusToAll({
        paymentId: payment.id,
        status: 'SUCCESS',
        amount: parseFloat(payment.totalAmount.toString()),
        transactionId: payment.transactionId || undefined,
        sessionId: payment.sessionId || undefined,
      });

      // Send notification to staff about successful payment
      const tableInfo = payment.session?.table
        ? `Table ${payment.session.table.number}`
        : 'Take-away';
      await this.notificationsGateway.emitToRoles(
        NotificationType.PAYMENT_SUCCESS,
        'Payment Successful',
        `Payment of ${payment.totalAmount.toString()} VND received for ${tableInfo}`,
        { paymentId: payment.id, transactionId: payment.transactionId },
      );

      return {
        success: true,
        message: 'Payment processed successfully',
        paymentId: payment.id,
      };
    } catch (error) {
      console.error('[SePay Webhook] Error processing payment:', error);
      return {
        success: false,
        message: 'Error processing payment',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get payment QR code for bank transfer
   * Returns bank transfer information and QR code URL
   */
  async getPaymentQrCode(id: string) {
    const payment = await this.db.findUnique({
      where: { id },
      select: {
        id: true,
        transactionId: true,
        totalAmount: true,
        status: true,
        paymentMethod: true,
      },
    });

    if (!payment) {
      throw new BadRequestException(`Payment with ID "${id}" does not exist.`);
    }

    if (payment.paymentMethod !== 'BANKING') {
      throw new BadRequestException(
        'QR code is only available for bank transfer payments.',
      );
    }

    if (!payment.transactionId) {
      throw new BadRequestException('Payment does not have a transaction ID.');
    }

    if (payment.status === PaymentStatus.SUCCESS) {
      return {
        code: 200,
        message: 'Payment already completed',
        data: {
          status: payment.status,
          transactionId: payment.transactionId,
        },
      };
    }

    // Get bank transfer info with QR code
    const amount = parseFloat(payment.totalAmount.toString());
    const bankInfo = getBankTransferInfo(payment.transactionId, amount);

    return {
      code: 200,
      message: 'QR code generated successfully',
      data: {
        paymentId: payment.id,
        status: payment.status,
        ...bankInfo,
      },
    };
  }
}
