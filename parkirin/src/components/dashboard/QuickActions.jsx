import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '../common';

const QuickActions = ({ userRole = 'user', className = '' }) => {
  const navigate = useNavigate();

  const userActions = [
    {
      id: 'search-parking',
      label: 'Find Parking',
      description: 'Search for available parking spots nearby',
      icon: '🔍',
      color: 'orange',
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
      color: 'blue',
      onClick: () => navigate('/wallet')
    },
    {
      id: 'chat',
      label: 'Messages',
      description: 'Chat with parking lot owners',
      icon: '💬',
      color: 'purple',
      onClick: () => navigate('/chat')
    }
  ];

  const landownerActions = [
    {
      id: 'manage-parking',
      label: 'Manage Parking',
      description: 'Add or edit your parking lots',
      icon: '🏢',
      color: 'orange',
      onClick: () => navigate('/parking/manage')
    },
    {
      id: 'add-parking',
      label: 'Add New Lot',
      description: 'List a new parking space',
      icon: '➕',
      color: 'green',
      onClick: () => navigate('/parking/create')
    },
    {
      id: 'view-earnings',
      label: 'Earnings',
      description: 'View your income and analytics',
      icon: '💰',
      color: 'blue',
      onClick: () => navigate('/wallet')
    },
    {
      id: 'messages',
      label: 'Messages',
      description: 'Respond to user inquiries',
      icon: '💬',
      color: 'purple',
      onClick: () => navigate('/chat')
    }
  ];

  const adminActions = [
    {
      id: 'manage-users',
      label: 'Manage Users',
      description: 'View and manage platform users',
      icon: '👥',
      color: 'orange',
      onClick: () => navigate('/admin/users')
    },
    {
      id: 'manage-parking',
      label: 'Parking Lots',
      description: 'Manage all parking spaces',
      icon: '🏢',
      color: 'green',
      onClick: () => navigate('/admin/parking')
    },
    {
      id: 'financials',
      label: 'Financials',
      description: 'Review platform finances',
      icon: '📊',
      color: 'blue',
      onClick: () => navigate('/admin/financials')
    },
    {
      id: 'settings',
      label: 'Settings',
      description: 'Configure platform settings',
      icon: '⚙️',
      color: 'purple',
      onClick: () => navigate('/admin/settings')
    }
  ];

  const actionsByRole = {
    user: userActions,
    landowner: landownerActions,
    admin: adminActions,
  };

  const actions = actionsByRole[userRole] || userActions;

  const getColorClass = (color) => {
    const colorClasses = {
      orange: 'bg-orange-100 text-orange-600 border-orange-200',
      blue: 'bg-blue-100 text-blue-600 border-blue-200',
      green: 'bg-green-100 text-green-600 border-green-200',
      purple: 'bg-purple-100 text-purple-600 border-purple-200',
      yellow: 'bg-yellow-100 text-yellow-600 border-yellow-200',
    };
    return colorClasses[color] || colorClasses.orange;
  };

  return (
    <Card className={className}>
      <div className="p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-5">Quick Actions</h2>
        <div className="space-y-3">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={action.onClick}
              className="w-full group flex items-center p-3 rounded-lg border hover:shadow-md transition duration-200 hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${getColorClass(action.color)}`}>
                <span className="text-xl">{action.icon}</span>
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900 group-hover:text-orange-600 transition-colors">{action.label}</div>
                <div className="text-xs text-gray-500">{action.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
};

QuickActions.propTypes = {
  userRole: PropTypes.oneOf(['user', 'landowner', 'admin']),
  className: PropTypes.string
};

export default QuickActions;