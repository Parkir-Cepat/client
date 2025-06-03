import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Card, Badge } from '../common';
import { formatDate, formatTime } from '../../utils/formatters';

const NotificationsList = ({ 
  notifications = [], 
  loading = false, 
  onMarkAsRead, 
  onMarkAllAsRead,
  onDelete,
  className = '' 
}) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-full mr-4"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  const getNotificationIcon = (type) => {
    const icons = {
      booking_confirmation: '✅',
      booking_reminder: '⏰',
      booking_cancellation: '❌',
      payment_success: '💰',
      payment_failed: '⚠️',
      promotion: '🎉',
      system: '🔔',
      chat: '💬'
    };
    return icons[type] || '📋';
  };

  const getNotificationColor = (type) => {
    const colors = {
      booking_confirmation: 'success',
      booking_reminder: 'warning',
      booking_cancellation: 'danger',
      payment_success: 'success',
      payment_failed: 'danger',
      promotion: 'purple',
      system: 'info',
      chat: 'info'
    };
    return colors[type] || 'default';
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification._id);
    }

    switch (notification.type) {
      case 'booking_confirmation':
      case 'booking_reminder':
      case 'booking_cancellation':
        navigate(`/bookings/${notification.refId}`);
        break;
      case 'payment_success':
      case 'payment_failed':
        navigate('/wallet');
        break;
      case 'chat':
        navigate(`/chat/${notification.refId}`);
        break;
      case 'promotion':
        if (notification.link) {
          window.open(notification.link, '_blank');
        }
        break;
      default:
        break;
    }
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
        
        {notifications.length > 0 && onMarkAllAsRead && (
          <button 
            onClick={onMarkAllAsRead}
            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            Mark all as read
          </button>
        )}
      </div>
      
      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🔔</div>
          <h3 className="text-lg font-semibold text-gray-900">No notifications</h3>
          <p className="text-gray-600 mt-1">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div 
              key={notification._id} 
              className={`flex p-3 rounded-lg cursor-pointer transition-colors relative ${
                notification.read 
                  ? 'bg-white hover:bg-gray-50' 
                  : 'bg-orange-50 hover:bg-orange-100'
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              {/* Indicator for unread notifications */}
              {!notification.read && (
                <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-orange-500"></div>
              )}
              
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mr-4 mt-1">
                {getNotificationIcon(notification.type)}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className={`font-semibold ${notification.read ? 'text-gray-900' : 'text-gray-900'}`}>
                    {notification.title}
                  </h3>
                  
                  <Badge 
                    variant={getNotificationColor(notification.type)} 
                    size="small"
                  >
                    {notification.type?.replace('_', ' ')}
                  </Badge>
                </div>
                
                <p className={`text-sm mt-1 ${notification.read ? 'text-gray-600' : 'text-gray-800'}`}>
                  {notification.message}
                </p>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="text-xs text-gray-500">
                    {formatDate(notification.createdAt)} • {formatTime(notification.createdAt)}
                  </div>
                  
                  {onDelete && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(notification._id);
                      }}
                      className="text-xs text-gray-400 hover:text-red-500"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

NotificationsList.propTypes = {
  notifications: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      read: PropTypes.bool.isRequired,
      createdAt: PropTypes.string.isRequired,
      refId: PropTypes.string,
      link: PropTypes.string
    })
  ),
  loading: PropTypes.bool,
  onMarkAsRead: PropTypes.func,
  onMarkAllAsRead: PropTypes.func,
  onDelete: PropTypes.func,
  className: PropTypes.string
};

export default NotificationsList;
