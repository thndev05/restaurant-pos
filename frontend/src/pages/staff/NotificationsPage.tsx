import { useState, useEffect } from 'react';
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
  Check,
  CheckCheck,
} from 'lucide-react';

const notificationIcons: Record<string, React.ReactNode> = {
  RESERVATION_NEW: <CalendarCheck className="h-6 w-6 text-blue-500" />,
  RESERVATION_CONFIRMED: <CalendarCheck className="h-6 w-6 text-green-500" />,
  RESERVATION_CANCELLED: <CalendarX className="h-6 w-6 text-red-500" />,
  ORDER_NEW: <ShoppingBag className="h-6 w-6 text-purple-500" />,
  ORDER_CONFIRMED: <CheckCircle className="h-6 w-6 text-green-500" />,
  ORDER_READY: <Clock className="h-6 w-6 text-orange-500" />,
  ORDER_ITEM_READY: <Clock className="h-6 w-6 text-orange-500" />,
  PAYMENT_SUCCESS: <CreditCard className="h-6 w-6 text-green-500" />,
  PAYMENT_FAILED: <XCircle className="h-6 w-6 text-red-500" />,
  CUSTOMER_REQUEST: <Users className="h-6 w-6 text-yellow-500" />,
  SYSTEM_ALERT: <AlertCircle className="h-6 w-6 text-gray-500" />,
};

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead, fetchNotifications, unreadCount } =
    useNotifications();
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  // Fetch notifications on mount and when tab changes
  useEffect(() => {
    if (activeTab === 'unread') {
      fetchNotifications({ isRead: false });
    } else {
      fetchNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleTabChange = (tab: 'all' | 'unread') => {
    setActiveTab(tab);
  };

  const displayedNotifications =
    activeTab === 'unread' ? notifications.filter((n) => !n.isRead) : notifications;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-1 text-sm text-gray-500">
            Stay updated with important events and alerts
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <CheckCheck className="h-4 w-4" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange('all')}
            className={`border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            All
            <span className="ml-2 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
              {notifications.length}
            </span>
          </button>
          <button
            onClick={() => handleTabChange('unread')}
            className={`border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap ${
              activeTab === 'unread'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Unread
            {unreadCount > 0 && (
              <span className="ml-2 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-600">
                {unreadCount}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Notifications List */}
      {displayedNotifications.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white px-6 py-12 text-center">
          <Bell className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-sm font-medium text-gray-900">No notifications</h3>
          <p className="mt-2 text-sm text-gray-500">
            {activeTab === 'unread'
              ? 'You have no unread notifications'
              : 'You have no notifications yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayedNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`group relative rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md ${
                !notification.isRead ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {notificationIcons[notification.type] || (
                    <Bell className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p
                        className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}
                      >
                        {notification.title}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                      <p className="mt-2 text-xs text-gray-400">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="ml-4 flex items-center space-x-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                      >
                        <Check className="h-3 w-3" />
                        <span>Mark as read</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
              {!notification.isRead && (
                <div className="absolute top-4 right-4">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-600"></span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
