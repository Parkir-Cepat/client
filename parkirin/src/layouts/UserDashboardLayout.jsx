import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  MapIcon,
  ClockIcon,
  CreditCardIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  MapIcon as MapIconSolid,
  ClockIcon as ClockIconSolid,
  CreditCardIcon as CreditCardIconSolid,
  UserIcon as UserIconSolid,
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid
} from '@heroicons/react/24/solid';
import useAuthStore from '../store/authStore';

const UserDashboardLayout = ({ children }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: HomeIcon, 
      iconSolid: HomeIconSolid,
      description: 'Overview & Statistics'
    },
    { 
      name: 'Find Parking', 
      href: '/parking/search', 
      icon: MapIcon, 
      iconSolid: MapIconSolid,
      description: 'Search Available Spots'
    },
    { 
      name: 'My Bookings', 
      href: '/bookings', 
      icon: ClockIcon, 
      iconSolid: ClockIconSolid,
      description: 'Booking History'
    },
    { 
      name: 'My Wallet', 
      href: '/wallet', 
      icon: CreditCardIcon, 
      iconSolid: CreditCardIconSolid,
      description: 'Payments & Balance'
    },
    { 
      name: 'Chat Support', 
      href: '/chat', 
      icon: ChatBubbleLeftRightIcon, 
      iconSolid: ChatBubbleLeftRightIconSolid,
      description: 'Get Help & Support'
    },
    { 
      name: 'Profile', 
      href: '/profile', 
      icon: UserIcon, 
      iconSolid: UserIconSolid,
      description: 'Account Settings'
    },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed z-50 inset-y-0 left-0 w-72 bg-white shadow-strong flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 border-r border-gray-200`}>
        {/* Logo Section */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-gray-100 bg-gradient-to-r from-primary-600 to-secondary-600">
          <div className="flex items-center">
            <img src='/assets/logo_ParkGo.png' className='h-10 w-10 mr-3' alt="ParkGo Logo" />
            <div>
              <div className="font-bold text-white text-xl">Parkirin</div>
              <div className="text-primary-100 text-sm">Smart Parking Solution</div>
            </div>
          </div>
          <button 
            className="p-2 rounded-lg text-white hover:bg-white/10 lg:hidden transition-colors duration-200" 
            onClick={() => setSidebarOpen(false)}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* User Info Card */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img 
                src={user?.avatar || '/avatar-default.png'} 
                alt="avatar" 
                className="h-12 w-12 rounded-full border-2 border-primary-200 shadow-sm" 
              />
              <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-success-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 truncate">{user?.name || 'User'}</div>
              <div className="text-sm text-gray-500 truncate">{user?.email}</div>
              <div className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                Balance: Rp {(user?.saldo || 0).toLocaleString('id-ID')}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigation.map(item => {
            const isActive = location.pathname === item.href;
            const IconComponent = isActive ? item.iconSolid : item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-4 py-3 rounded-xl transition-all duration-200 relative ${
                  isActive 
                    ? 'bg-primary-50 text-primary-700 shadow-sm border border-primary-100' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-primary-600 rounded-r-full"></div>
                )}
                <IconComponent className={`h-5 w-5 mr-3 ${isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                <div className="flex-1">
                  <div className={`font-medium ${isActive ? 'text-primary-900' : 'text-gray-900'}`}>
                    {item.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {item.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-100 space-y-3">
          <button className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors duration-200">
            <BellIcon className="h-4 w-4 mr-2" />
            Notifications
          </button>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Navigation Bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-4 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                className="p-2 rounded-xl bg-primary-600 text-white shadow-sm hover:bg-primary-700 lg:hidden transition-colors duration-200" 
                onClick={() => setSidebarOpen(true)}
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              <div className="hidden lg:block">
                <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0] || 'User'}!</h1>
                <p className="text-gray-600">Manage your parking experience seamlessly</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="hidden md:flex items-center relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search parking spots..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 w-64"
                />
              </div>
              
              {/* Notification Bell */}
              <button className="relative p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors duration-200">
                <BellIcon className="h-6 w-6" />
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
              </button>
              
              {/* Profile Dropdown */}
              <div className="relative">
                <button className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                  <img 
                    src={user?.avatar || '/avatar-default.png'} 
                    alt="avatar" 
                    className="h-8 w-8 rounded-full border border-gray-200" 
                  />
                  <span className="hidden md:block text-sm font-medium text-gray-700">{user?.name?.split(' ')[0] || 'User'}</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="animate-fade-in">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserDashboardLayout;
