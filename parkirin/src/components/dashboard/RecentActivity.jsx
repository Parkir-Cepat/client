import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { formatDate, formatTime } from '../../utils/formatters';
import { Card, Badge, LoadingSpinner } from '../common';

const RecentActivity = ({ activities = [], loading = false, className = '' }) => {
  const navigate = useNavigate();

  const getActivityIcon = (type) => {
    const icons = {
      booking_created: '📅',
      booking_confirmed: '✅',
      booking_cancelled: '❌',
      booking_completed: '🎯',
      payment_completed: '💳',
      payment_failed: '❌',
      chat_message: '💬',
      parking_added: '🏢',
      parking_updated: '📝',
      user_registered: '👋',
      review_added: '⭐'
    };
    return icons[type] || '📋';
  };

  const getActivityColor = (type) => {
    const colors = {
      booking_created: 'blue',
      booking_confirmed: 'success',
      booking_cancelled: 'danger',
      booking_completed: 'success',
      payment_completed: 'success',
      payment_failed: 'danger',
      chat_message: 'purple',
      parking_added: 'orange',
      parking_updated: 'warning',
      user_registered: 'success',
      review_added: 'warning'
    };
    return colors[type] || 'default';
  };

  const handleActivityClick = (activity) => {
    switch (activity.type) {
      case 'booking_created':
      case 'booking_confirmed':
      case 'booking_cancelled':
      case 'booking_completed':
        navigate(`/bookings/${activity.bookingId}`);
        break;
      case 'payment_completed':
      case 'payment_failed':
        navigate('/wallet');
        break;
      case 'chat_message':
        navigate(`/chat/${activity.chatId}`);
        break;
      case 'parking_added':
      case 'parking_updated':
        navigate(`/parking/${activity.parkingId}`);
        break;
      case 'review_added':
        navigate(`/parking/${activity.parkingId}`);
        break;
      case 'user_registered':
        navigate('/profile');
        break;
      default:
        break;
    }
  };

  const getActivityTitle = (activity) => {
    const titles = {
      booking_created: 'Booking Created',
      booking_confirmed: 'Booking Confirmed',
      booking_cancelled: 'Booking Cancelled',
      booking_completed: 'Booking Completed',
      payment_completed: 'Payment Successful',
      payment_failed: 'Payment Failed',
      chat_message: 'New Message',
      parking_added: 'Parking Lot Added',
      parking_updated: 'Parking Lot Updated',
      user_registered: 'Account Created',
      review_added: 'Review Added'
    };
    return titles[activity.type] || 'Activity';
  };

  return (
    <Card className={className}>
      <div className="p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <LoadingSpinner size="medium" variant="pulse" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📭</div>
            <p>No recent activity found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div 
                key={activity.id || index}
                onClick={() => handleActivityClick(activity)}
                className="flex items-start rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer border border-gray-100 hover:border-orange-200"
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-3 text-xl`}>
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title || getActivityTitle(activity)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {activity.message}
                      </p>
                    </div>
                    
                    <Badge 
                      variant={getActivityColor(activity.type)} 
                      size="small"
                      className="ml-2"
                    >
                      {activity.type?.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center mt-2 text-xs text-gray-400">
                    <span>{formatDate(activity.createdAt)}</span>
                    <span className="mx-1">•</span>
                    <span>{formatTime(activity.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

RecentActivity.propTypes = {
  activities: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      type: PropTypes.string,
      title: PropTypes.string,
      message: PropTypes.string,
      createdAt: PropTypes.string,
      bookingId: PropTypes.string,
      parkingId: PropTypes.string,
      chatId: PropTypes.string
    })
  ),
  loading: PropTypes.bool,
  className: PropTypes.string
};

export default RecentActivity;