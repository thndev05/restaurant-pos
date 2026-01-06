import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/prisma/prisma.service';
import { CreateNotificationDto, QueryNotificationsDto } from './dto';
import {
  Notification,
  NotificationType,
  RoleName,
  Prisma,
} from '../../generated/prisma';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    return this.prisma.notification.create({
      data: createNotificationDto,
    });
  }

  async createForMultipleUsers(
    userIds: string[],
    type: NotificationType,
    title: string,
    message: string,
    metadata?: Record<string, unknown>,
  ): Promise<Notification[]> {
    this.logger.log(
      `Creating ${userIds.length} notifications of type ${type} for users: ${userIds.join(', ')}`,
    );

    const notifications = await this.prisma.$transaction(
      userIds.map((userId) =>
        this.prisma.notification.create({
          data: {
            userId,
            type,
            title,
            message,
            metadata: metadata as Prisma.InputJsonValue | undefined,
          },
        }),
      ),
    );

    this.logger.log(
      `Created ${notifications.length} notifications successfully`,
    );
    return notifications;
  }

  async findAll(userId: string, query: QueryNotificationsDto) {
    const { isRead, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(isRead !== undefined && { isRead }),
    };

    this.logger.log(`Fetching notifications for user: ${userId}, isRead: ${isRead}, page: ${page}, limit: ${limit}`);

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    const unreadCount = notifications.filter(n => !n.isRead).length;
    this.logger.log(`Returned ${notifications.length} notifications (${unreadCount} unread) for user ${userId}`);

    return {
      data: notifications,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId: string): Promise<Notification | null> {
    return this.prisma.notification.findFirst({
      where: { id, userId },
    });
  }

  async markAsRead(id: string, _userId: string): Promise<Notification> {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAsUnread(id: string, _userId: string): Promise<Notification> {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: false },
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  /**
   * Mark old notifications as read (older than specified hours)
   */
  async markOldNotificationsAsRead(userId: string, hoursOld: number = 24): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hoursOld);

    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
        createdAt: {
          lt: cutoffDate,
        },
      },
      data: { isRead: true },
    });

    return result.count;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  async remove(id: string, _userId: string): Promise<Notification> {
    return this.prisma.notification.delete({
      where: { id },
    });
  }

  /**
   * Get user IDs by role names
   */
  async getUserIdsByRoles(roleNames: RoleName[]): Promise<string[]> {
    const users = await this.prisma.user.findMany({
      where: {
        role: {
          name: { in: roleNames },
        },
        isActive: true,
      },
      select: { id: true },
    });
    return users.map((user) => user.id);
  }

  /**
   * Determine which roles should receive notifications for specific event types
   */
  getRolesForNotificationType(type: NotificationType): RoleName[] {
    const roleMap: Record<NotificationType, RoleName[]> = {
      // Reservation notifications - Admin, Manager and Waiter
      [NotificationType.RESERVATION_NEW]: [
        RoleName.ADMIN,
        RoleName.MANAGER,
        RoleName.WAITER,
      ],
      [NotificationType.RESERVATION_CONFIRMED]: [
        RoleName.ADMIN,
        RoleName.MANAGER,
        RoleName.WAITER,
      ],
      [NotificationType.RESERVATION_CANCELLED]: [
        RoleName.ADMIN,
        RoleName.MANAGER,
        RoleName.WAITER,
      ],

      // Order notifications
      [NotificationType.ORDER_NEW]: [
        RoleName.ADMIN,
        RoleName.MANAGER,
        RoleName.KITCHEN,
        RoleName.WAITER,
      ],
      [NotificationType.ORDER_CONFIRMED]: [
        RoleName.ADMIN,
        RoleName.MANAGER,
        RoleName.KITCHEN,
        RoleName.WAITER,
      ],
      [NotificationType.ORDER_READY]: [
        RoleName.ADMIN,
        RoleName.MANAGER,
        RoleName.WAITER,
      ],
      [NotificationType.ORDER_ITEM_READY]: [
        RoleName.ADMIN,
        RoleName.MANAGER,
        RoleName.WAITER,
      ],

      // Payment notifications - Admin, Cashier and Manager
      [NotificationType.PAYMENT_SUCCESS]: [
        RoleName.ADMIN,
        RoleName.CASHIER,
        RoleName.MANAGER,
      ],
      [NotificationType.PAYMENT_FAILED]: [
        RoleName.ADMIN,
        RoleName.CASHIER,
        RoleName.MANAGER,
      ],

      // Customer requests - Admin, Waiter and Manager
      [NotificationType.CUSTOMER_REQUEST]: [
        RoleName.ADMIN,
        RoleName.WAITER,
        RoleName.MANAGER,
      ],

      // Table session notifications - Admin, Waiter and Manager
      [NotificationType.TABLE_SESSION_STARTED]: [
        RoleName.ADMIN,
        RoleName.WAITER,
        RoleName.MANAGER,
      ],

      // System alerts - All staff
      [NotificationType.SYSTEM_ALERT]: [
        RoleName.ADMIN,
        RoleName.MANAGER,
        RoleName.CASHIER,
        RoleName.WAITER,
        RoleName.KITCHEN,
      ],
    };

    return roleMap[type] || [RoleName.MANAGER];
  }

  /**
   * Create notification and send to appropriate roles
   */
  async createAndNotifyRoles(
    type: NotificationType,
    title: string,
    message: string,
    metadata?: Record<string, unknown>,
  ): Promise<Notification[]> {
    const roles = this.getRolesForNotificationType(type);
    const userIds = await this.getUserIdsByRoles(roles);

    if (userIds.length === 0) {
      this.logger.warn(`No users found for roles: ${roles.join(', ')}`);
      return [];
    }

    const notifications = await this.createForMultipleUsers(
      userIds,
      type,
      title,
      message,
      metadata,
    );

    this.logger.log(
      `Created ${notifications.length} notifications of type ${type} for roles: ${roles.join(', ')}`,
    );

    return notifications;
  }
}
