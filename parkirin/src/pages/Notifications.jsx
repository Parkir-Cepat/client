import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_NOTIFICATIONS, MARK_NOTIFICATION_READ, MARK_ALL_NOTIFICATIONS_READ } from '../graphql/queries';
import { DELETE_NOTIFICATION } from '../graphql/mutations';
import { LoadingSpinner, Button, Badge } from '../components/common';
import { formatChatTime } from '../utils/formatters';

const Notifications = () => {
  const [filter, setFilter] = useState('all'); // all, unread, read

  const { data, loading, error, refetch } = useQuery(GET_NOTIFICATIONS, {
    variables: { filter },
    fetchPolicy: 'cache-and-network'
  });

  const [markAsRead] = useMutation(MARK_NOTIFICATION_READ, {
    onCompleted: () => refetch()
  });

  const [markAllAsRead] = useMutation(MARK_ALL_NOTIFICATIONS_READ, {
    onCompleted: () => refetch()
  });

  const [deleteNotification] = useMutation(DELETE_NOTIFICATION, {
    onCompleted: () => refetch()
  });

  const handleMarkAsRead = (notificationId) => {
    markAsRead({ variables: { notificationId } });
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleDelete = (notificationId) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      deleteNotification({ variables: { notificationId } });
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      booking_confirmed: '✅',
      booking_cancelled: '❌',
      payment_success: '💳',
      payment_failed: '⚠️',
      chat_message: '💬',
      parking_approved: '🏢',
      system_announcement: '📢',
      review_received: '⭐'
    };
    return icons[type] || '📄';
  };

  const getNotificationColor = (type) => {
    const colors = {
      booking_confirmed: 'green',
      booking_cancelled: 'red',
      payment_success: 'green',
      payment_failed: 'red',
      chat_message: 'blue',
      parking_approved: 'green',
      system_announcement: 'purple',
      review_received: 'yellow'
    };
    return colors[type] || 'gray';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading notifications..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Notifications</h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    );
  }

  const notifications = data?.getNotifications || [];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              Mark All as Read
            </Button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="mt-4 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'all', label: 'All', count: notifications.length },
              { key: 'unread', label: 'Unread', count: unreadCount },
              { key: 'read', label: 'Read', count: notifications.length - unreadCount }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <Badge className="ml-2" color={filter === tab.key ? 'blue' : 'gray'}>
                    {tab.count}
                  </Badge>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔔</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
          <p className="text-gray-500">
            {filter === 'unread' 
              ? "You're all caught up! No unread notifications."
              : "You don't have any notifications yet."
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg border p-4 hover:shadow-md transition-shadow ${
                !notification.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="text-2xl">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </h4>
                      {!notification.isRead && (
                        <Badge color="blue" size="sm">New</Badge>
                      )}
                      <Badge color={getNotificationColor(notification.type)} size="sm">
                        {notification.type.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center text-xs text-gray-500 mt-2">
                      <span>{formatChatTime(notification.createdAt)}</span>
                      {notification.actionUrl && (
                        <>
                          <span className="mx-2">•</span>
                          <a 
                            href={notification.actionUrl}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View Details
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {!notification.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                    >
                      Mark as Read
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="text-red-600 hover:text-red-800 text-xs"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;