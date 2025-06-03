// src/components/layout/Header.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button, Dropdown, Badge } from '../common';
import { classNames } from '../../utils/helpers';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navigationItems = [
    { name: 'Find Parking', href: '/search', icon: '🔍' },
    { name: 'My Bookings', href: '/bookings', icon: '📅' },
    { name: 'History', href: '/history', icon: '📋' },
  ];

  const ownerNavigationItems = [
    { name: 'Dashboard', href: '/owner/dashboard', icon: '📊' },
    { name: 'My Parkings', href: '/owner/parkings', icon: '🅿️' },
    { name: 'Bookings', href: '/owner/bookings', icon: '📋' },
    { name: 'Analytics', href: '/owner/analytics', icon: '📈' },
  ];

  const adminNavigationItems = [
    { name: 'Admin Dashboard', href: '/admin/dashboard', icon: '⚙️' },
    { name: 'Users', href: '/admin/users', icon: '👥' },
    { name: 'Parkings', href: '/admin/parkings', icon: '🅿️' },
    { name: 'Reports', href: '/admin/reports', icon: '📊' },
  ];

  const getNavigationItems = () => {
    if (!isAuthenticated) return [];
    
    switch (user?.role) {
      case 'ADMIN':
        return adminNavigationItems;
      case 'PARKING_OWNER':
        return ownerNavigationItems;
      case 'USER':
      default:
        return navigationItems;
    }
  };

  const currentNavItems = getNavigationItems();

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <header 
      className={classNames(
        'sticky top-0 z-40 transition-all duration-300 border-b',
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-gray-200' 
          : 'bg-white border-gray-200'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-orange">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Parkirin</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {currentNavItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={classNames(
                  'flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative group',
                  isActivePath(item.href)
                    ? 'text-orange-600 bg-orange-50'
                    : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                )}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
                {isActivePath(item.href) && (
                  <span className="absolute h-0.5 w-full bg-orange-500 bottom-0 left-0 rounded"></span>
                )}
                <span className="absolute h-0.5 w-0 bg-orange-500 bottom-0 left-0 rounded transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <button className="relative p-2 text-gray-500 hover:text-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-full transition-colors duration-200">
                  <span className="sr-only">View notifications</span>
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5-5V9.09c0-2.28-1.82-4.09-4-4.09S7 6.81 7 9.09V12l-5 5h5m7 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <Badge
                    variant="danger"
                    size="small"
                    className="absolute -top-1 -right-1 bg-orange-500 text-white"
                  >
                    3
                  </Badge>
                </button>

                {/* User Dropdown */}
                <Dropdown
                  trigger={
                    <button className="flex items-center space-x-2 p-2 rounded-full hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors duration-200">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-sm font-medium text-white">
                          {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </span>
                      </div>
                      <span className="hidden md:block text-sm font-medium text-gray-700">
                        {user?.firstName} {user?.lastName}
                      </span>
                      <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  }
                  placement="bottom-right"
                  className="mt-2 py-2 w-56 rounded-xl shadow-xl bg-white border border-gray-200 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  
                  <Dropdown.Item onClick={() => navigate('/profile')} className="hover:bg-orange-50">
                    <div className="flex items-center space-x-2">
                      <svg className="h-4 w-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Profile</span>
                    </div>
                  </Dropdown.Item>
                  
                  <Dropdown.Item onClick={() => navigate('/settings')} className="hover:bg-orange-50">
                    <div className="flex items-center space-x-2">
                      <svg className="h-4 w-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Settings</span>
                    </div>
                  </Dropdown.Item>
                  
                  <Dropdown.Divider />
                  
                  <Dropdown.Item onClick={handleLogout} className="hover:bg-red-50">
                    <div className="flex items-center space-x-2 text-red-600">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Sign out</span>
                    </div>
                  </Dropdown.Item>
                </Dropdown>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="ghost" size="small" rounded="full">
                    Sign in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="small" rounded="full" className="shadow-orange">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-full text-gray-500 hover:text-orange-500 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-3 fade-in">
            <nav className="space-y-1 px-2">
              {currentNavItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={classNames(
                    'flex items-center space-x-3 px-3 py-3 rounded-xl text-base font-medium transition-colors duration-200',
                    isActivePath(item.href)
                      ? 'text-orange-600 bg-orange-50'
                      : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

export default Header;
