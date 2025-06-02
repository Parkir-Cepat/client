import React, { useState, useEffect } from 'react';
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
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import useAuthStore from '../store/authStore';

const UserDashboardLayout = ({ children }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Animation on mount
  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: HomeIcon,
      description: 'Overview & Stats',
      badge: null
    },
    { 
      name: 'Find Parking', 
      href: '/parking/search', 
      icon: MapIcon,
      description: 'Discover spots',
      badge: 'NEW'
    },
    { 
      name: 'My Bookings', 
      href: '/bookings', 
      icon: ClockIcon,
      description: 'Active & History',
      badge: user?.activeBookings || null
    },
    { 
      name: 'Wallet', 
      href: '/wallet', 
      icon: CreditCardIcon,
      description: 'Balance & Top-up',
      badge: null
    },
    { 
      name: 'Chat Support', 
      href: '/chat', 
      icon: ChatBubbleLeftRightIcon,
      description: 'Help & Support',
      badge: user?.unreadMessages || null
    },
    { 
      name: 'Profile', 
      href: '/profile', 
      icon: UserIcon,
      description: 'Account settings',
      badge: null
    },
  ];

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'}`}>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-orange-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Enhanced Sidebar */}
      <div className={`fixed z-30 inset-y-0 left-0 w-72 transform transition-all duration-300 ease-in-out lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="h-full bg-white/80 backdrop-blur-xl border-r border-white/20 shadow-2xl flex flex-col relative overflow-hidden">
          {/* Sidebar Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#f16634] via-[#f16634] to-[#f89b6c]"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-white/10"></div>
          
          {/* Header */}
          <div className="relative z-10 flex items-center justify-between h-20 px-6 border-b border-white/20">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img 
                  src='/logo_ParkGo.png' 
                  className='h-10 w-10 rounded-xl shadow-lg' 
                  alt="ParkGo Logo" 
                />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-white font-black text-xl tracking-tight">ParkGo</h1>
                <p className="text-white/70 text-xs font-medium">Smart Parking</p>
              </div>
            </div>
            <button 
              className="lg:hidden p-2 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 transition-all duration-200"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* User Profile Section */}
          <div className="relative z-10 p-6 border-b border-white/20">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img 
                  src={user?.avatar || '/avatar-default.png'} 
                  alt="User Avatar" 
                  className="h-14 w-14 rounded-full border-3 border-white/50 shadow-lg object-cover" 
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/90 text-xs font-medium">{getGreeting()}</p>
                <h3 className="text-white font-bold text-lg leading-tight truncate">
                  {user?.name || 'User'}
                </h3>
                <p className="text-white/70 text-sm truncate">{user?.email}</p>
              </div>
            </div>
            
            {/* Balance Card */}
            <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-xs font-medium">Wallet Balance</p>
                  <p className="text-white font-bold text-lg">
                    {user?.saldo ? `Rp ${user.saldo.toLocaleString('id-ID')}` : 'Rp 0'}
                  </p>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <CreditCardIcon className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="relative z-10 flex-1 px-4 py-4 space-y-2 overflow-y-auto">
            {navigation.map((item, index) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group relative flex items-center px-4 py-3 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                    isActive 
                      ? 'bg-white/90 text-[#f16634] shadow-lg backdrop-blur-sm' 
                      : 'text-white/90 hover:bg-white/20 hover:text-white'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    animation: mounted ? 'slideInLeft 0.6s ease-out forwards' : 'none'
                  }}
                >
                  <div className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${
                    isActive ? 'bg-[#f16634] text-white shadow-lg' : 'bg-white/10 group-hover:bg-white/20'
                  }`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold text-sm ${isActive ? 'text-[#f16634]' : ''}`}>
                        {item.name}
                      </span>
                      {item.badge && (
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                          item.badge === 'NEW' 
                            ? 'bg-green-400 text-green-900' 
                            : 'bg-red-400 text-red-900'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs mt-1 ${
                      isActive ? 'text-[#f16634]/70' : 'text-white/60'
                    }`}>
                      {item.description}
                    </p>
                  </div>

                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-[#f16634] rounded-r-full"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer Actions */}
          <div className="relative z-10 p-4 border-t border-white/20">
            <div className="space-y-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleDarkMode}
                className="w-full flex items-center justify-between px-4 py-3 bg-white/10 rounded-2xl text-white/90 hover:bg-white/20 transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
                  <span className="font-medium text-sm">
                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                  </span>
                </div>
                <div className={`w-12 h-6 bg-white/20 rounded-full relative transition-all duration-300 ${
                  isDarkMode ? 'bg-blue-500' : ''
                }`}>
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                    isDarkMode ? 'transform translate-x-6' : ''
                  }`}></div>
                </div>
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 bg-red-500/20 border-2 border-red-400/50 text-white rounded-2xl font-semibold hover:bg-red-500/30 hover:border-red-400 transition-all duration-200 backdrop-blur-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Main Content */}
      <div className="flex-1 flex flex-col min-h-screen relative z-10">
        {/* Top Navigation Bar */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-3 bg-gradient-to-r from-[#f16634] to-[#f89b6c] rounded-2xl shadow-lg text-white hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-lg mx-4">
              <div className="relative w-full">
                {/* <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" /> */}
                {/* <input
                  type="text"
                  placeholder="Search parking spots, locations..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#f16634] focus:border-transparent transition-all duration-200"
                /> */}
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-3">
              {/* Time Display */}
              <div className="hidden lg:block text-right">
                <p className="text-xs text-gray-500 font-medium">
                  {currentTime.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                </p>
                <p className="text-sm font-bold text-gray-700">
                  {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {/* Notifications */}
              {/* <button className="relative p-3 bg-gray-50/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 hover:bg-gray-100/80 transition-all duration-200">
                <BellIcon className="h-5 w-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white font-bold flex items-center justify-center">
                  3
                </span>
              </button> */}

              {/* Profile Menu */}
              <div className="relative">
                {/* <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 p-2 bg-gray-50/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 hover:bg-gray-100/80 transition-all duration-200" */}
                {/* > */}
                  {/* <img 
                    src={user?.avatar || '/avatar-default.png'} 
                    alt="Profile" 
                    className="h-8 w-8 rounded-full object-cover" 
                  />
                  <ChevronDownIcon className="h-4 w-4 text-gray-600" /> */}
                {/* </button> */}

                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 py-2 z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100/50 rounded-xl mx-2 transition-all duration-200"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      View Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100/50 rounded-xl mx-2 transition-all duration-200"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      Settings
                    </Link>
                    <hr className="my-2 border-gray-200" />
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        handleLogout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl mx-2 transition-all duration-200"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-8 relative">
          <div className={`transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {children}
          </div>
        </main>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
};

export default UserDashboardLayout;