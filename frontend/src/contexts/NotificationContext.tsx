/**
 * Notification Context
 * Manages WebSocket connection for real-time notifications
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
  useCallback,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { authService } from '@/lib/api/services/auth.service';
import { API_CONFIG } from '@/config/api.config';

// API URL
const API_BASE_URL = API_CONFIG.BASE_URL;
const API_VERSION = API_CONFIG.VERSION;

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  fetchNotifications: (params?: {
    isRead?: boolean;
    page?: number;
    limit?: number;
  }) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Fetch notifications from API
  const fetchNotifications = useCallback(
    async (params?: { isRead?: boolean; page?: number; limit?: number }) => {
      try {
        const token = authService.getAccessToken();
        if (!token) return;

        const queryParams = new URLSearchParams();
        if (params?.isRead !== undefined) queryParams.append('isRead', String(params.isRead));
        if (params?.page) queryParams.append('page', String(params.page));
        if (params?.limit) queryParams.append('limit', String(params.limit));

        console.log('📥 Fetching notifications with params:', params);

        const response = await fetch(
          `${API_BASE_URL}/${API_VERSION}/notifications?${queryParams}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error('Failed to fetch notifications');

        const data = await response.json();
        const fetchedNotifications = data.data || [];

        console.log(`📦 Fetched ${fetchedNotifications.length} notifications from API`);

        // Always replace notifications to prevent duplicates
        setNotifications(fetchedNotifications);

        // Update unread count
        const unreadNotifications = fetchedNotifications.filter((n: Notification) => !n.isRead);
        setUnreadCount(unreadNotifications.length);

        console.log(
          `✅ Updated state: ${fetchedNotifications.length} total, ${unreadNotifications.length} unread`
        );
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    },
    []
  );

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const token = authService.getAccessToken();
      if (!token) return;

      const response = await fetch(
        `${API_BASE_URL}/${API_VERSION}/notifications/${notificationId}/read`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to mark notification as read');

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === notificationId ? { ...notif, isRead: true } : notif))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      // Also emit through socket
      if (socketRef.current?.connected) {
        socketRef.current.emit('markAsRead', notificationId);
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const token = authService.getAccessToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/${API_VERSION}/notifications/mark-all-read`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to mark all notifications as read');

      // Update local state
      setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
      setUnreadCount(0);

      // Also emit through socket
      if (socketRef.current?.connected) {
        socketRef.current.emit('markAllAsRead');
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    const token = authService.getAccessToken();
    const user = authService.getCurrentUser();

    // Only connect if user is authenticated and is staff
    if (!token || !user || !user.role) {
      return;
    }

    // Initialize socket connection
    const socket = io(`${API_BASE_URL}/notifications`, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    // Listen for new notifications
    socket.on('notification', (notification: Notification) => {
      console.log('🔔 New notification received:', notification);

      // Add to notifications list with deduplication
      setNotifications((prev) => {
        // Check if notification already exists
        const exists = prev.some((n) => n.id === notification.id);
        if (exists) {
          console.log('⚠️ Duplicate notification prevented:', notification.id);
          return prev;
        }
        return [notification, ...prev];
      });

      // Increment unread count if notification is unread
      if (!notification.isRead) {
        setUnreadCount((prev) => prev + 1);
      }

      // Show browser notification for critical notifications (no toast dependency)
      const criticalTypes = [
        'CUSTOMER_REQUEST',
        'ORDER_NEW',
        'ORDER_READY',
        'ORDER_ITEM_READY',
        'PAYMENT_FAILED',
      ];

      if (criticalTypes.includes(notification.type)) {
        // Use browser notifications if available
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico',
          });
        }
      }
    });

    // Listen for unread count updates
    socket.on('unreadCount', (count: number) => {
      console.log('📊 Unread count updated:', count);
      setUnreadCount(count);
    });

    // Fetch initial notifications
    fetchNotifications({ limit: 50 });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [fetchNotifications]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
