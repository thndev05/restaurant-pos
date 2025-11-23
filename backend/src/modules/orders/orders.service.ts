import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import {
  CreateOrderDto,
  AddOrderItemsDto,
  UpdateOrderItemDto,
  UpdateOrderStatusDto,
  UpdateOrderItemStatusDto,
  GetOrdersDto,
} from './dto';
import { OrderStatus, OrderItemStatus, Prisma } from 'src/generated/prisma';

@Injectable()
export class OrdersService {
  constructor(private readonly prismaService: PrismaService) {}

  private get db() {
    return this.prismaService.order;
  }

  private get orderItemDb() {
    return this.prismaService.orderItem;
  }

  async getOrders(getOrdersDto: GetOrdersDto) {
    const where: Prisma.OrderWhereInput = {};

    if (getOrdersDto.status) {
      where.status = getOrdersDto.status;
    }

    if (getOrdersDto.sessionId) {
      where.sessionId = getOrdersDto.sessionId;
    }

    if (getOrdersDto.startDate || getOrdersDto.endDate) {
      where.createdAt = {};
      if (getOrdersDto.startDate) {
        where.createdAt.gte = new Date(getOrdersDto.startDate);
      }
      if (getOrdersDto.endDate) {
        where.createdAt.lte = new Date(getOrdersDto.endDate);
      }
    }

    return this.db.findMany({
      where,
      include: {
        orderItems: {
          include: {
            menuItem: true,
          },
        },
        session: {
          include: {
            table: true,
          },
        },
        confirmedBy: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async createOrder(createOrderDto: CreateOrderDto) {
    const { sessionId, items, notes } = createOrderDto;

    // Verify session exists and is active
    const session = await this.prismaService.tableSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new BadRequestException(
        `Session with ID "${sessionId}" does not exist.`,
      );
    }

    if (session.status === 'CLOSED') {
      throw new BadRequestException(
        'Cannot create order for a closed session.',
      );
    }

    // Get menu items and validate
    const menuItemIds = items.map((item) => item.menuItemId);
    const menuItems = await this.prismaService.menuItem.findMany({
      where: {
        id: { in: menuItemIds },
        isAvailable: true,
      },
    });

    if (menuItems.length !== menuItemIds.length) {
      throw new BadRequestException('Some menu items are not available.');
    }

    // Create order with items
    const order = await this.db.create({
      data: {
        sessionId,
        notes,
        status: OrderStatus.PENDING,
        orderItems: {
          create: items.map((item) => {
            const menuItem = menuItems.find((m) => m.id === item.menuItemId);
            return {
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              priceAtOrder: menuItem!.price,
              itemNameAtOrder: menuItem!.name,
              notes: item.notes,
              status: OrderItemStatus.PENDING,
            };
          }),
        },
      },
      include: {
        orderItems: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    return {
      code: 201,
      message: 'Order created successfully.',
      data: order,
    };
  }

  async addOrderItems(orderId: string, addOrderItemsDto: AddOrderItemsDto) {
    const order = await this.getOrderById(orderId);

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot add items to a cancelled order.');
    }

    if (order.status === OrderStatus.SERVED) {
      throw new BadRequestException('Cannot add items to a served order.');
    }

    const { items } = addOrderItemsDto;

    // Get menu items and validate
    const menuItemIds = items.map((item) => item.menuItemId);
    const menuItems = await this.prismaService.menuItem.findMany({
      where: {
        id: { in: menuItemIds },
        isAvailable: true,
      },
    });

    if (menuItems.length !== menuItemIds.length) {
      throw new BadRequestException('Some menu items are not available.');
    }

    // Add items to order
    await this.orderItemDb.createMany({
      data: items.map((item) => {
        const menuItem = menuItems.find((m) => m.id === item.menuItemId);
        return {
          orderId,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          priceAtOrder: menuItem!.price,
          itemNameAtOrder: menuItem!.name,
          notes: item.notes,
          status: OrderItemStatus.PENDING,
        };
      }),
    });

    return {
      code: 200,
      message: 'Items added to order successfully.',
    };
  }

  async updateOrderItem(
    itemId: string,
    updateOrderItemDto: UpdateOrderItemDto,
  ) {
    const orderItem = await this.orderItemDb.findUnique({
      where: { id: itemId },
      include: {
        order: true,
      },
    });

    if (!orderItem) {
      throw new BadRequestException(
        `Order item with ID "${itemId}" does not exist.`,
      );
    }

    if (orderItem.order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException(
        'Cannot update items from a cancelled order.',
      );
    }

    if (orderItem.status === OrderItemStatus.SERVED) {
      throw new BadRequestException('Cannot update a served item.');
    }

    await this.orderItemDb.update({
      where: { id: itemId },
      data: updateOrderItemDto,
    });

    return {
      code: 200,
      message: 'Order item updated successfully.',
    };
  }

  async deleteOrderItem(itemId: string) {
    const orderItem = await this.orderItemDb.findUnique({
      where: { id: itemId },
      include: {
        order: {
          include: {
            orderItems: true,
          },
        },
      },
    });

    if (!orderItem) {
      throw new BadRequestException(
        `Order item with ID "${itemId}" does not exist.`,
      );
    }

    if (orderItem.order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException(
        'Cannot delete items from a cancelled order.',
      );
    }

    if (orderItem.status === OrderItemStatus.SERVED) {
      throw new BadRequestException('Cannot delete a served item.');
    }

    // Check if this is the last item in the order
    if (orderItem.order.orderItems.length === 1) {
      throw new BadRequestException(
        'Cannot delete the last item. Cancel the entire order instead.',
      );
    }

    await this.orderItemDb.delete({
      where: { id: itemId },
    });

    return {
      code: 200,
      message: 'Order item deleted successfully.',
    };
  }

  async getOrderById(id: string) {
    const order = await this.db.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            menuItem: true,
          },
        },
        session: {
          include: {
            table: true,
          },
        },
      },
    });

    if (!order) {
      throw new BadRequestException(`Order with ID "${id}" does not exist.`);
    }

    return order;
  }

  async updateOrderStatus(
    id: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    const order = await this.getOrderById(id);

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot update a cancelled order.');
    }

    const { status } = updateOrderStatusDto;

    // Automatically update all order items status when order status changes
    let orderItemStatus: OrderItemStatus | undefined;

    if (status === OrderStatus.PREPARING) {
      orderItemStatus = OrderItemStatus.COOKING;
    } else if (status === OrderStatus.READY) {
      orderItemStatus = OrderItemStatus.READY;
    } else if (status === OrderStatus.SERVED) {
      orderItemStatus = OrderItemStatus.SERVED;
    } else if (status === OrderStatus.CANCELLED) {
      orderItemStatus = OrderItemStatus.CANCELLED;
    }

    // Update order status
    await this.db.update({
      where: { id },
      data: { status },
    });

    // Update order items status if needed
    if (orderItemStatus) {
      await this.orderItemDb.updateMany({
        where: {
          orderId: id,
          status: { not: OrderItemStatus.CANCELLED },
        },
        data: { status: orderItemStatus },
      });
    }

    return {
      code: 200,
      message: `Order status updated to "${status}".`,
    };
  }

  async updateOrderItemStatus(
    itemId: string,
    updateOrderItemStatusDto: UpdateOrderItemStatusDto,
  ) {
    const orderItem = await this.orderItemDb.findUnique({
      where: { id: itemId },
      include: {
        order: true,
      },
    });

    if (!orderItem) {
      throw new BadRequestException(
        `Order item with ID "${itemId}" does not exist.`,
      );
    }

    if (orderItem.order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException(
        'Cannot update items from a cancelled order.',
      );
    }

    if (orderItem.status === OrderItemStatus.CANCELLED) {
      throw new BadRequestException('Cannot update a cancelled item.');
    }

    const { status } = updateOrderItemStatusDto;

    await this.orderItemDb.update({
      where: { id: itemId },
      data: { status },
    });

    return {
      code: 200,
      message: `Order item status updated to "${status}".`,
    };
  }

  async cancelOrder(id: string) {
    const order = await this.getOrderById(id);

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Order is already cancelled.');
    }

    if (order.status === OrderStatus.SERVED) {
      throw new BadRequestException('Cannot cancel a served order.');
    }

    await this.prismaService.$transaction([
      this.db.update({
        where: { id },
        data: { status: OrderStatus.CANCELLED },
      }),
      this.orderItemDb.updateMany({
        where: {
          orderId: id,
          status: { not: OrderItemStatus.SERVED },
        },
        data: { status: OrderItemStatus.CANCELLED },
      }),
    ]);

    return {
      code: 200,
      message: `Order with ID "${id}" has been cancelled.`,
    };
  }
}
