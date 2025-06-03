// src/components/layout/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { classNames } from '../../utils/helpers';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const navigationItems = {
    user: [
      { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
      { name: 'Find Parking', href: '/search', icon: '🔍' },
      { name: 'My Bookings', href: '/bookings', icon: '📅' },
      { name: 'Wallet', href: '/wallet', icon: '💰' },
      { name: 'Chat', href: '/dashboard/chat', icon: '💬' },
      { name: 'Profile', href: '/profile', icon: '👤' },
    ],
    landowner: [
      { name: 'Dashboard', href: '/landownerdashboard', icon: '📊' },
      { name: 'My Parkings', href: '/parking', icon: '🅿️' },
      { name: 'Bookings', href: '/bookings', icon: '📋' },
      { name: 'Chat', href: '/dashboard/chat', icon: '💬' },
      { name: 'Profile', href: '/profile', icon: '👤' },
    ],
    admin: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: '🏛️' },
      { name: 'Users', href: '/admin/users', icon: '👥' },
      { name: 'Parkings', href: '/admin/parkings', icon: '🅿️' },
      { name: 'Bookings', href: '/admin/bookings', icon: '📋' },
      { name: 'Reports', href: '/admin/reports', icon: '📊' },
      { name: 'Analytics', href: '/admin/analytics', icon: '📈' },
      { name: 'Settings', href: '/admin/settings', icon: '⚙️' },
    ],
  };

  const currentItems = navigationItems[user?.role] || navigationItems.user;

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={classNames(
          'fixed inset-y-0 left-0 z-30 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-orange">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Parkirin</span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-full text-gray-500 hover:text-orange-500 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors duration-200"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User Info */}
          {user && (
            <div className="p-4 border-b border-gray-200 bg-orange-50">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-orange">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-12 h-12 rounded-full object-cover border-2 border-white"
                    />
                  ) : (
                    <span className="text-lg font-medium text-white">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-medium text-gray-900 truncate">
                    {user.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate mb-1">
                    {user.email}
                  </p>
                  <span className={classNames(
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                    {
                      'bg-orange-100 text-orange-800': user.role === 'user',
                      'bg-green-100 text-green-800': user.role === 'landowner',
                      'bg-purple-100 text-purple-800': user.role === 'admin',
                    }
                  )}>
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
            {currentItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={classNames(
                  'flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                  isActivePath(item.href)
                    ? 'bg-orange-50 text-orange-600 shadow-sm border-r-4 border-orange-500'
                    : 'text-gray-700 hover:bg-orange-50/70 hover:text-orange-600'
                )}
              >
                <span className="text-xl flex items-center justify-center w-7 h-7">{item.icon}</span>
                <span>{item.name}</span>
                
                {/* Indicator dot for active item */}
                {isActivePath(item.href) && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-orange-500"></span>
                )}
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>© 2024 Parkirin</span>
              <span className="px-2 py-1 bg-gray-200 rounded-full text-gray-600">v1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
