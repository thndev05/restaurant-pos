import { useNotifications } from '@/contexts';
import { formatDistanceToNow } from 'date-fns';
import {
  Bell,
  CalendarCheck,
  CalendarX,
  ShoppingBag,
  CheckCircle,
  Clock,
  CreditCard,
  XCircle,
  Users,
  AlertCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface NotificationListProps {
  onClose?: () => void;
}

const notificationIcons: Record<string, React.ReactNode> = {
  RESERVATION_NEW: <CalendarCheck className="h-5 w-5 text-blue-500" />,
  RESERVATION_CONFIRMED: <CalendarCheck className="h-5 w-5 text-green-500" />,
  RESERVATION_CANCELLED: <CalendarX className="h-5 w-5 text-red-500" />,
  ORDER_NEW: <ShoppingBag className="h-5 w-5 text-purple-500" />,
  ORDER_CONFIRMED: <CheckCircle className="h-5 w-5 text-green-500" />,
  ORDER_READY: <Clock className="h-5 w-5 text-orange-500" />,
  ORDER_ITEM_READY: <Clock className="h-5 w-5 text-orange-500" />,
  PAYMENT_SUCCESS: <CreditCard className="h-5 w-5 text-green-500" />,
  PAYMENT_FAILED: <XCircle className="h-5 w-5 text-red-500" />,
  CUSTOMER_REQUEST: <Users className="h-5 w-5 text-yellow-500" />,
  SYSTEM_ALERT: <AlertCircle className="h-5 w-5 text-gray-500" />,
};

export function NotificationList({ onClose }: NotificationListProps) {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();

  const handleMarkAsRead = async (notificationId: string, isRead: boolean) => {
    if (!isRead) {
      await markAsRead(notificationId);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const recentNotifications = notifications.slice(0, 10);

  return (
    <div className="max-h-96 overflow-y-auto">
      {recentNotifications.length === 0 ? (
        <div className="px-4 py-12 text-center">
          <Bell className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-2 text-sm text-gray-500">No notifications</p>
        </div>
      ) : (
        <>
          {unreadCount > 0 && (
            <div className="border-b border-gray-200 px-4 py-2">
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs font-medium text-blue-600 hover:text-blue-800"
              >
                Mark all as read
              </button>
            </div>
          )}

          <div className="divide-y divide-gray-200">
            {recentNotifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleMarkAsRead(notification.id, notification.isRead)}
                className={`w-full px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                  !notification.isRead ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {notificationIcons[notification.type] || (
                      <Bell className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}
                    >
                      {notification.title}
                    </p>
                    <p className="mt-0.5 text-sm text-gray-500">{notification.message}</p>
                    <p className="mt-1 text-xs text-gray-400">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="flex-shrink-0">
                      <span className="inline-block h-2 w-2 rounded-full bg-blue-600"></span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
            <Link
              to="/staff/notifications"
              onClick={onClose}
              className="block text-center text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              View all notifications
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
