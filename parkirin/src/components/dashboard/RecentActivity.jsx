import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { formatDate, formatTime } from '../../utils/formatters';

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
      booking_created: 'text-blue-600',
      booking_confirmed: 'text-green-600',
      booking_cancelled: 'text-red-600',
      booking_completed: 'text-green-600',
      payment_completed: 'text-green-600',
      payment_failed: 'text-red-600',
      chat_message: 'text-purple-600',
      parking_added: 'text-blue-600',
      parking_updated: 'text-yellow-600',
      user_registered: 'text-green-600',
      review_added: 'text-yellow-600'
    };
    return colors[type] || 'text-gray-600';
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
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!activities.length) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📋</div>
          <p className="text-gray-500">No recent activity</p>
          <p className="text-sm text-gray-400 mt-1">Your activity will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <button
          onClick={() => navigate('/activity')}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          View all
        </button>
      </div>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities.map((activity, index) => (
          <div
            key={activity.id || index}
            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => handleActivityClick(activity)}
          >
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm">
                {getActivityIcon(activity.type)}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className={`text-sm font-medium ${getActivityColor(activity.type)}`}>
                  {activity.title}
                </p>
                <span className="text-xs text-gray-500">
                  {formatTime(activity.timestamp)}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
              
              {activity.location && (
                <p className="text-xs text-gray-500 mt-1">📍 {activity.location}</p>
              )}
              
              <p className="text-xs text-gray-400 mt-1">
                {formatDate(activity.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

RecentActivity.propTypes = {
  activities: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      type: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      timestamp: PropTypes.string.isRequired,
      location: PropTypes.string,
      bookingId: PropTypes.string,
      parkingId: PropTypes.string,
      chatId: PropTypes.string
    })
  ),
  loading: PropTypes.bool,
  className: PropTypes.string
};

export default RecentActivity;