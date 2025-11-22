import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreatePaymentDto, ProcessPaymentDto } from './dto';
import {
  PaymentStatus,
  SessionStatus,
  TableStatus,
} from 'src/generated/prisma';

@Injectable()
export class PaymentsService {
  constructor(private readonly prismaService: PrismaService) {}

  private get db() {
    return this.prismaService.payment;
  }

  async createPayment(createPaymentDto: CreatePaymentDto) {
    // Check if session exists
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
        sessionId: createPaymentDto.sessionId,
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
    const payment = await this.getPaymentById(id);

    if (payment.status === PaymentStatus.SUCCESS) {
      throw new BadRequestException('Payment has already been processed.');
    }

    if (payment.status === PaymentStatus.REFUNDED) {
      throw new BadRequestException(
        'Payment has been refunded and cannot be processed.',
      );
    }

    // Process payment within a transaction
    const result = await this.prismaService.$transaction(async (tx) => {
      // Update payment status
      const updatedPayment = await tx.payment.update({
        where: { id },
        data: {
          status: PaymentStatus.SUCCESS,
          paymentTime: new Date(),
          transactionId: processPaymentDto.transactionId,
          notes: processPaymentDto.notes || payment.notes,
        },
        include: {
          session: {
            include: {
              table: true,
            },
          },
        },
      });

      // Update session status to CLOSED
      await tx.tableSession.update({
        where: { id: payment.sessionId },
        data: {
          status: SessionStatus.CLOSED,
          endTime: new Date(),
        },
      });

      // Update table status to AVAILABLE
      await tx.table.update({
        where: { id: payment.session.tableId },
        data: {
          status: TableStatus.AVAILABLE,
        },
      });

      return updatedPayment;
    });

    return {
      code: 200,
      message: 'Payment processed successfully.',
      data: result,
    };
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
