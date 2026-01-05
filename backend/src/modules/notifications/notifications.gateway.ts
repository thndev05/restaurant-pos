import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NotificationsService } from './notifications.service';
import { Notification, NotificationType } from '../../generated/prisma';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
  role?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private connectedClients = new Map<string, AuthenticatedSocket>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = this.extractTokenFromHandshake(client);
      if (!token) {
        this.logger.warn(`Client ${client.id} disconnected: No token provided`);
        client.disconnect();
        return;
      }

      const payload = await this.verifyToken(token);
      if (!payload) {
        this.logger.warn(`Client ${client.id} disconnected: Invalid token`);
        client.disconnect();
        return;
      }

      client.userId = payload.userId;
      client.username = payload.username;
      client.role = payload.role;

      // Join user to their personal room
      client.join(`user:${client.userId}`);

      // Store connected client
      this.connectedClients.set(client.id, client);

      this.logger.log(
        `Client connected: ${client.id} (User: ${client.username}, Role: ${client.role})`,
      );

      // Send unread count on connection
      if (client.userId) {
        const unreadCount = await this.notificationsService.getUnreadCount(
          client.userId,
        );
        client.emit('unreadCount', unreadCount);
      }
    } catch (error) {
      this.logger.error(`Error during connection: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.connectedClients.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  private extractTokenFromHandshake(client: Socket): string | null {
    const token =
      client.handshake.auth?.token ||
      client.handshake.headers?.authorization?.replace('Bearer ', '');
    return token || null;
  }

  private async verifyToken(token: string): Promise<any> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'your-secret-key',
      });
    } catch (error) {
      this.logger.error(`Token verification failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Emit notification to specific user
   */
  async emitToUser(userId: string, notification: Notification) {
    this.logger.log(
      `Emitting notification ${notification.id} to user ${userId} (room: user:${userId})`,
    );
    this.server.to(`user:${userId}`).emit('notification', notification);

    // Also emit updated unread count
    const unreadCount = await this.notificationsService.getUnreadCount(userId);
    this.logger.log(`Emitting unread count ${unreadCount} to user ${userId}`);
    this.server.to(`user:${userId}`).emit('unreadCount', unreadCount);
  }

  /**
   * Emit payment status update to specific user
   */
  emitPaymentStatus(
    userId: string,
    paymentData: {
      paymentId: string;
      status: string;
      amount: number;
      transactionId?: string;
    },
  ) {
    this.logger.log(
      `Emitting payment status to user ${userId}: ${paymentData.status}`,
    );
    this.server.to(`user:${userId}`).emit('paymentStatus', paymentData);
  }

  /**
   * Emit payment status to all connected clients (for admin monitoring)
   */
  emitPaymentStatusToAll(paymentData: {
    paymentId: string;
    status: string;
    amount: number;
    transactionId?: string;
    sessionId?: string;
  }) {
    this.logger.log(
      `Broadcasting payment status: ${paymentData.status} for payment ${paymentData.paymentId}`,
    );
    this.server.emit('paymentStatus', paymentData);
  }

  /**
   * Emit notification to multiple users
   */
  async emitToUsers(userIds: string[], notification: Notification) {
    for (const userId of userIds) {
      await this.emitToUser(userId, notification);
    }
  }

  /**
   * Emit notifications to users based on their roles
   */
  async emitToRoles(
    type: NotificationType,
    title: string,
    message: string,
    metadata?: any,
  ) {
    const notifications = await this.notificationsService.createAndNotifyRoles(
      type,
      title,
      message,
      metadata,
    );

    // Group notifications by userId for efficient emission
    const notificationsByUser = new Map<string, Notification>();
    notifications.forEach((notification) => {
      notificationsByUser.set(notification.userId, notification);
    });

    // Emit to each user
    for (const [userId, notification] of notificationsByUser) {
      await this.emitToUser(userId, notification);
    }

    return notifications;
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() notificationId: string,
  ) {
    try {
      if (!client.userId) {
        return { success: false, error: 'User not authenticated' };
      }
      await this.notificationsService.markAsRead(notificationId, client.userId);
      const unreadCount = await this.notificationsService.getUnreadCount(
        client.userId,
      );
      client.emit('unreadCount', unreadCount);
      return { success: true };
    } catch (error) {
      this.logger.error(`Error marking notification as read: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('markAllAsRead')
  async handleMarkAllAsRead(@ConnectedSocket() client: AuthenticatedSocket) {
    try {
      if (!client.userId) {
        return { success: false, error: 'User not authenticated' };
      }
      await this.notificationsService.markAllAsRead(client.userId);
      const unreadCount = await this.notificationsService.getUnreadCount(
        client.userId,
      );
      client.emit('unreadCount', unreadCount);
      return { success: true };
    } catch (error) {
      this.logger.error(
        `Error marking all notifications as read: ${error.message}`,
      );
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('getUnreadCount')
  async handleGetUnreadCount(@ConnectedSocket() client: AuthenticatedSocket) {
    try {
      if (!client.userId) {
        return { count: 0 };
      }
      const unreadCount = await this.notificationsService.getUnreadCount(
        client.userId,
      );
      return { count: unreadCount };
    } catch (error) {
      this.logger.error(`Error getting unread count: ${error.message}`);
      return { count: 0 };
    }
  }
}
