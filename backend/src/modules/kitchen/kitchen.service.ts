import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';
import {
  OrderItemStatus,
  OrderStatus,
  OrderType,
  Prisma,
} from 'src/generated/prisma';
import { GetKitchenItemsDto, UpdateKitchenItemStatusDto } from './dto';

interface KitchenOrderItemRecord {
  id: string;
  orderId: string;
  itemNameAtOrder: string;
  quantity: number;
  status: OrderItemStatus;
  allergies?: string[] | null;
  notes?: string | null;
  cookingStartedAt?: Date | null;
  readyAt?: Date | null;
  createdAt: Date;
  order: {
    id: string;
    orderType: OrderType;
    createdAt: Date;
    session?: {
      table?: {
        number: number;
      } | null;
    } | null;
    customerName?: string | null;
    notes?: string | null;
  };
}

@Injectable()
export class KitchenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersService: OrdersService,
  ) {}

  async getKitchenQueue(query: GetKitchenItemsDto) {
    const includeCompleted = query.includeCompleted ?? false;
    const limit = query.limit ?? 50;
    const statuses = this.resolveStatuses(query.status, includeCompleted);

    const baseWhere = this.buildBaseWhere(query);
    const where: Prisma.OrderItemWhereInput = {
      ...baseWhere,
      status: { in: statuses },
    };

    const items = (await this.prisma.orderItem.findMany({
      where,
      include: {
        order: {
          include: {
            session: {
              include: {
                table: true,
              },
            },
          },
        },
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'asc' }],
      take: limit,
    })) as KitchenOrderItemRecord[];

    const stats = await this.buildStats(baseWhere);
    const mappedItems = items.map((item) => this.mapKitchenItem(item));
    const avgPrepMinutes = this.calculateAveragePrepTime(items);

    return {
      items: mappedItems,
      stats: {
        ...stats,
        avgPrepMinutes,
      },
      lastUpdated: new Date().toISOString(),
    };
  }

  async updateKitchenItemStatus(
    itemId: string,
    dto: UpdateKitchenItemStatusDto,
  ) {
    const orderItem = await this.prisma.orderItem.findUnique({
      where: { id: itemId },
    });

    if (!orderItem) {
      throw new NotFoundException(
        `Order item with ID "${itemId}" does not exist`,
      );
    }

    if (
      dto.status === OrderItemStatus.COOKING &&
      orderItem.status !== OrderItemStatus.PENDING
    ) {
      throw new BadRequestException(
        'Only pending items can be moved to cooking.',
      );
    }

    if (
      dto.status === OrderItemStatus.READY &&
      orderItem.status !== OrderItemStatus.COOKING
    ) {
      throw new BadRequestException(
        'Only cooking items can be marked as ready.',
      );
    }

    if (dto.status === OrderItemStatus.CANCELLED && !dto.reason?.trim()) {
      throw new BadRequestException(
        'A rejection reason is required when cancelling an item.',
      );
    }

    if (
      dto.status === OrderItemStatus.CANCELLED ||
      dto.status === OrderItemStatus.COOKING ||
      dto.status === OrderItemStatus.READY
    ) {
      return this.ordersService.updateOrderItemStatus(itemId, {
        status: dto.status,
        reason: dto.reason?.trim(),
      });
    }

    throw new BadRequestException('Unsupported status update.');
  }

  private resolveStatuses(
    explicitStatus: OrderItemStatus | undefined,
    includeCompleted: boolean,
  ) {
    if (explicitStatus) {
      return [explicitStatus];
    }

    const baseStatuses = [OrderItemStatus.PENDING, OrderItemStatus.COOKING];
    return includeCompleted
      ? [...baseStatuses, OrderItemStatus.READY]
      : baseStatuses;
  }

  private buildBaseWhere(dto: GetKitchenItemsDto): Prisma.OrderItemWhereInput {
    const orderFilter: Prisma.OrderWhereInput = {
      status: { notIn: [OrderStatus.CANCELLED, OrderStatus.PAID] },
    };

    if (dto.orderType) {
      orderFilter.orderType = dto.orderType;
    }

    const where: Prisma.OrderItemWhereInput = {
      order: { is: orderFilter },
    };

    if (dto.search?.trim()) {
      const search = dto.search.trim();
      const searchFilters: Prisma.OrderItemWhereInput[] = [
        {
          itemNameAtOrder: { contains: search, mode: 'insensitive' },
        },
        {
          notes: { contains: search, mode: 'insensitive' },
        },
        {
          order: {
            is: {
              customerName: { contains: search, mode: 'insensitive' },
            },
          },
        },
      ];

      const numericSearch = Number(search);
      if (!Number.isNaN(numericSearch)) {
        searchFilters.push({
          order: {
            is: {
              session: {
                is: {
                  table: {
                    is: {
                      number: numericSearch,
                    },
                  },
                },
              },
            },
          },
        });
      }

      where.OR = searchFilters;
    }

    return where;
  }

  private async buildStats(baseWhere: Prisma.OrderItemWhereInput) {
    const [pending, cooking, ready] = await Promise.all([
      this.prisma.orderItem.count({
        where: { ...baseWhere, status: OrderItemStatus.PENDING },
      }),
      this.prisma.orderItem.count({
        where: { ...baseWhere, status: OrderItemStatus.COOKING },
      }),
      this.prisma.orderItem.count({
        where: { ...baseWhere, status: OrderItemStatus.READY },
      }),
    ]);

    return {
      pending,
      cooking,
      ready,
      total: pending + cooking + ready,
    };
  }

  private mapKitchenItem(item: KitchenOrderItemRecord) {
    const isDineIn = item.order.orderType === OrderType.DINE_IN;
    const tableNumber = item.order.session?.table?.number;
    const tableLabel = isDineIn
      ? tableNumber
        ? `Table ${tableNumber}`
        : 'Table N/A'
      : item.order.customerName
        ? `Takeaway · ${item.order.customerName}`
        : 'Takeaway';

    return {
      id: item.id,
      orderId: item.orderId,
      orderCode: this.buildOrderCode(item.order.id),
      quantity: item.quantity,
      itemName: item.itemNameAtOrder,
      status: item.status,
      allergies: item.allergies || [],
      notes: item.notes,
      cookingStartedAt: item.cookingStartedAt,
      readyAt: item.readyAt,
      orderPlacedAt: item.order.createdAt,
      tableLabel,
      orderType: item.order.orderType,
    };
  }

  private buildOrderCode(orderId: string) {
    return `#${orderId.slice(0, 6).toUpperCase()}`;
  }

  private calculateAveragePrepTime(items: KitchenOrderItemRecord[]) {
    const completed = items.filter(
      (item) => item.cookingStartedAt && item.readyAt,
    );

    if (!completed.length) {
      return 0;
    }

    const totalMinutes = completed.reduce((sum, item) => {
      const diff = item.readyAt!.getTime() - item.cookingStartedAt!.getTime();
      return sum + Math.max(Math.round(diff / 60000), 0);
    }, 0);

    return Math.round(totalMinutes / completed.length);
  }
}
