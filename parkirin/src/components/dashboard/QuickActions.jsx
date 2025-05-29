import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Button } from '../common';

const QuickActions = ({ userRole = 'user', className = '' }) => {
  const navigate = useNavigate();

  const userActions = [
    {
      id: 'search-parking',
      label: 'Find Parking',
      description: 'Search for available parking spots nearby',
      icon: '🔍',
      color: 'blue',
      onClick: () => navigate('/parking/search')
    },
    {
      id: 'view-bookings',
      label: 'My Bookings',
      description: 'View and manage your booking history',
      icon: '📋',
      color: 'green',
      onClick: () => navigate('/bookings')
    },
    {
      id: 'wallet',
      label: 'Wallet',
      description: 'Manage your payments and transactions',
      icon: '💳',
      color: 'purple',
      onClick: () => navigate('/wallet')
    },
    {
      id: 'chat',
      label: 'Messages',
      description: 'Chat with parking lot owners',
      icon: '💬',
      color: 'yellow',
      onClick: () => navigate('/chat')
    }
  ];

  const landownerActions = [
    {
      id: 'manage-parking',
      label: 'Manage Parking',
      description: 'Add or edit your parking lots',
      icon: '🏢',
      color: 'blue',
      onClick: () => navigate('/parking/manage')
    },
    {
      id: 'view-earnings',
      label: 'Earnings',
      description: 'View your income and analytics',
      icon: '💰',
      color: 'green',
      onClick: () => navigate('/wallet')
    },
    {
      id: 'bookings-received',
      label: 'Bookings',
      description: 'Manage incoming booking requests',
      icon: '📅',
      color: 'purple',
      onClick: () => navigate('/bookings/received')
    },
    {
      id: 'customer-chat',
      label: 'Customer Chat',
      description: 'Communicate with your customers',
      icon: '💬',
      color: 'yellow',
      onClick: () => navigate('/chat')
    }
  ];

  const adminActions = [
    {
      id: 'user-management',
      label: 'User Management',
      description: 'Manage users and permissions',
      icon: '👥',
      color: 'blue',
      onClick: () => navigate('/admin/users')
    },
    {
      id: 'parking-approval',
      label: 'Parking Approval',
      description: 'Review and approve parking lots',
      icon: '✅',
      color: 'green',
      onClick: () => navigate('/admin/parking-approval')
    },
    {
      id: 'system-analytics',
      label: 'Analytics',
      description: 'View system-wide analytics',
      icon: '📊',
      color: 'purple',
      onClick: () => navigate('/admin/analytics')
    },
    {
      id: 'support',
      label: 'Support',
      description: 'Handle customer support requests',
      icon: '🎧',
      color: 'yellow',
      onClick: () => navigate('/admin/support')
    }
  ];

  const getActions = () => {
    switch (userRole) {
      case 'landowner':
        return landownerActions;
      case 'admin':
        return adminActions;
      default:
        return userActions;
    }
  };

  const actions = getActions();

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map((action) => (
          <div
            key={action.id}
            className="p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer group"
            onClick={action.onClick}
          >
            <div className="flex items-start space-x-3">
              <div className="text-2xl">{action.icon}</div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                  {action.label}
                </h4>
                <p className="text-xs text-gray-500 mt-1">{action.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

QuickActions.propTypes = {
  userRole: PropTypes.oneOf(['user', 'landowner', 'admin']),
  className: PropTypes.string
};

export default QuickActions;