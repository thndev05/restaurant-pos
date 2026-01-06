import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import {
  CreateOrderDto,
  AddOrderItemsDto,
  UpdateOrderItemDto,
  UpdateOrderStatusDto,
  UpdateOrderItemStatusDto,
  GetOrdersDto,
  OrderBill,
  OrderBillItem,
} from './dto';
import {
  OrderStatus,
  OrderItemStatus,
  OrderType,
  Prisma,
  NotificationType,
} from 'src/generated/prisma';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

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

    if (getOrdersDto.orderType) {
      where.orderType = getOrdersDto.orderType;
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
    const { orderType, sessionId, items, notes, customerName, customerPhone } =
      createOrderDto;

    // Validate based on order type
    if (orderType === OrderType.DINE_IN) {
      if (!sessionId) {
        throw new BadRequestException(
          'Session ID is required for dine-in orders.',
        );
      }

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
    } else if (orderType === OrderType.TAKE_AWAY) {
      if (!customerName || !customerPhone) {
        throw new BadRequestException(
          'Customer name and phone are required for take-away orders.',
        );
      }
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

    // Determine initial status based on autoConfirm flag
    // When created by staff (Session Management or Create Order button), skip PENDING
    const initialStatus = createOrderDto.autoConfirm
      ? OrderStatus.CONFIRMED
      : OrderStatus.PENDING;
    const initialItemStatus = createOrderDto.autoConfirm
      ? OrderItemStatus.COOKING
      : OrderItemStatus.PENDING;

    // Create order with items
    console.log('\n========== CREATING ORDER IN DB ==========');
    console.log(`  Order Type: ${orderType}`);
    console.log(`  Session ID: ${sessionId}`);
    console.log(`  Initial Status: ${initialStatus}`);
    console.log(`  Initial Item Status: ${initialItemStatus}`);
    console.log(`  Items Count: ${items.length}`);
    console.log('==========================================\n');

    const order = await this.db.create({
      data: {
        orderType,
        sessionId: orderType === OrderType.DINE_IN ? sessionId : undefined,
        customerName:
          orderType === OrderType.TAKE_AWAY ? customerName : undefined,
        customerPhone:
          orderType === OrderType.TAKE_AWAY ? customerPhone : undefined,
        notes,
        status: initialStatus,
        orderItems: {
          create: items.map((item) => {
            const menuItem = menuItems.find((m) => m.id === item.menuItemId);
            return {
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              priceAtOrder: menuItem!.price,
              itemNameAtOrder: menuItem!.name,
              notes: item.notes,
              status: initialItemStatus,
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
        session: {
          include: {
            table: true,
          },
        },
      },
    });

    console.log('\n========== ORDER CREATED SUCCESSFULLY ==========');
    console.log(`  Order ID: ${order.id}`);
    console.log(`  Order Status: ${order.status}`);
    console.log(`  Session ID: ${order.sessionId}`);
    console.log(`  Session exists: ${!!order.session}`);
    if (order.session) {
      console.log(`  Session Table ID: ${order.session.tableId}`);
      console.log(`  Session Status: ${order.session.status}`);
    }
    console.log(`  Order Items: ${order.orderItems.length}`);
    console.log('===============================================\n');

    // Send notification to staff based on order status
    if (order.status === OrderStatus.CONFIRMED) {
      const tableInfo = order.session?.table
        ? `Table ${order.session.table.number}`
        : 'Take-away';
      await this.notificationsGateway.emitToRoles(
        NotificationType.ORDER_CONFIRMED,
        'New Order Confirmed',
        `Order with ${order.orderItems.length} items confirmed for ${tableInfo}`,
        { orderId: order.id, sessionId: order.sessionId },
      );
    } else if (order.status === OrderStatus.PENDING) {
      const tableInfo = order.session?.table
        ? `Table ${order.session.table.number}`
        : 'Take-away';
      await this.notificationsGateway.emitToRoles(
        NotificationType.ORDER_NEW,
        'New Order Created',
        `New order with ${order.orderItems.length} items for ${tableInfo}`,
        { orderId: order.id, sessionId: order.sessionId },
      );
    }

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

    if (order.status === OrderStatus.PAID) {
      throw new BadRequestException('Cannot add items to a paid order.');
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

    // Add items to order - use COOKING status for items added to existing orders
    // (skip PENDING stage and go directly to kitchen)
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
          status: OrderItemStatus.COOKING,
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
        confirmedBy: {
          select: {
            id: true,
            name: true,
            username: true,
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
    const previousStatus = order.status;

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

    // Send notification when order is confirmed (PENDING -> CONFIRMED)
    if (
      previousStatus === OrderStatus.PENDING &&
      status === OrderStatus.CONFIRMED
    ) {
      const tableInfo = order.session?.table
        ? `Table ${order.session.table.number}`
        : order.customerName || 'Customer';
      await this.notificationsGateway.emitToRoles(
        NotificationType.ORDER_CONFIRMED,
        'Order Confirmed',
        `Order #${order.id.substring(0, 8)} for ${tableInfo} has been confirmed and sent to kitchen`,
        { orderId: order.id, orderType: order.orderType },
      );
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

    const itemMeta = orderItem as typeof orderItem & {
      cookingStartedAt?: Date | null;
      readyAt?: Date | null;
      servedAt?: Date | null;
      rejectionReason?: string | null;
    };

    const { status, reason } = updateOrderItemStatusDto;
    const now = new Date();
    const data: Prisma.OrderItemUpdateInput & Record<string, unknown> = {
      status,
    };

    if (status === OrderItemStatus.COOKING && !itemMeta.cookingStartedAt) {
      data['cookingStartedAt'] = now;
    }

    if (status === OrderItemStatus.READY) {
      data['readyAt'] = now;
    }

    if (status === OrderItemStatus.SERVED) {
      data['servedAt'] = now;
    }

    if (status === OrderItemStatus.CANCELLED && reason) {
      data['rejectionReason'] = reason;
    }

    await this.orderItemDb.update({
      where: { id: itemId },
      data,
    });

    // Send notification when order item is ready
    if (status === OrderItemStatus.READY) {
      await this.notificationsGateway.emitToRoles(
        NotificationType.ORDER_ITEM_READY,
        'Order Item Ready',
        `${orderItem.itemNameAtOrder} is ready for serving`,
        { orderId: orderItem.orderId, orderItemId: itemId },
      );
    }

    return {
      code: 200,
      message: `Order item status updated to "${status}".`,
    };
  }

  async cancelOrder(id: string) {
    await this.prismaService.$transaction(async (tx) => {
      // Use FOR UPDATE lock to prevent race conditions
      const order = await tx.$queryRaw<Array<{ id: string; status: string }>>`
        SELECT id, status FROM orders WHERE id = ${id}::uuid FOR UPDATE
      `;

      if (!order || order.length === 0) {
        throw new BadRequestException(`Order with ID "${id}" does not exist.`);
      }

      const orderStatus = order[0].status as OrderStatus;

      if (orderStatus === OrderStatus.CANCELLED) {
        throw new BadRequestException('Order is already cancelled.');
      }

      if (orderStatus === OrderStatus.SERVED) {
        throw new BadRequestException('Cannot cancel a served order.');
      }

      if (orderStatus === OrderStatus.PAID) {
        throw new BadRequestException('Cannot cancel a paid order.');
      }

      await tx.order.update({
        where: { id },
        data: { status: OrderStatus.CANCELLED },
      });

      await tx.orderItem.updateMany({
        where: {
          orderId: id,
          status: { not: OrderItemStatus.SERVED },
        },
        data: { status: OrderItemStatus.CANCELLED },
      });
    });

    return {
      code: 200,
      message: `Order with ID "${id}" has been cancelled.`,
    };
  }

  async getOrderBill(id: string): Promise<OrderBill> {
    console.log('Getting order bill for ID:', id);

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new BadRequestException(`Invalid order ID format: ${id}`);
    }

    const order = await this.getOrderById(id);

    if (!order.orderItems || order.orderItems.length === 0) {
      throw new BadRequestException('Order has no items to calculate bill.');
    }

    // Calculate bill from order items
    let subTotal = 0;
    const orderItems: OrderBillItem[] = [];

    order.orderItems.forEach((item) => {
      const itemTotal = Number(item.priceAtOrder) * item.quantity;
      subTotal += itemTotal;
      orderItems.push({
        name: item.itemNameAtOrder,
        quantity: item.quantity,
        price: Number(item.priceAtOrder),
        total: Number(itemTotal.toFixed(2)),
      });
    });

    const taxRate = 0.1; // 10% VAT
    const tax = subTotal * taxRate;
    const discount = 0; // Can be implemented based on business logic
    const total = subTotal + tax - discount;

    const billData: OrderBill = {
      orderId: order.id,
      orderNumber: order.id.substring(0, 8).toUpperCase(), // Use first 8 chars of UUID
      orderType: order.orderType,
      createdAt: order.createdAt,
      confirmedBy: order.confirmedBy ? order.confirmedBy.name : null,
      items: orderItems,
      subTotal: Number(subTotal.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      discount: Number(discount.toFixed(2)),
      total: Number(total.toFixed(2)),
    };

    // Add session/table info for dine-in orders
    if (order.orderType === OrderType.DINE_IN && order.session) {
      billData.tableNumber = order.session.table.number;
      billData.customerCount = order.session.customerCount ?? undefined;
      billData.sessionId = order.session.id;
    } else if (order.orderType === OrderType.TAKE_AWAY) {
      // Add customer info for takeaway orders
      billData.customerName = order.customerName ?? undefined;
      billData.customerPhone = order.customerPhone ?? undefined;
    }

    return billData;
  }
}
