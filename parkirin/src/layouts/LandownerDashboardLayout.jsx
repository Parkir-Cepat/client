import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  BuildingOfficeIcon, 
  ChatBubbleLeftRightIcon, 
  Bars3Icon, 
  XMarkIcon,
  BellIcon,
  PlusCircleIcon
} from '@heroicons/react/24/outline';
import useAuthStore from '../store/authStore';
import { Badge, Button, LogoGroup } from '../components/common';

const LandownerDashboardLayout = ({ children }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'My Parking Lots', href: '/parking/manage', icon: BuildingOfficeIcon },
    { name: 'Chat', href: '/chat', icon: ChatBubbleLeftRightIcon },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed z-30 inset-y-0 left-0 w-72 bg-gradient-to-b from-orange-500 to-orange-600 shadow-xl flex flex-col transition-all duration-300 ease-in-out lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center h-16 px-6 font-bold text-white text-xl border-b border-white/10">
          <LogoGroup size="medium" variant="light" />
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <XMarkIcon className="h-6 w-6 text-white" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-thin">
          {navigation.map(item => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition duration-200 font-medium text-base
                ${location.pathname === item.href 
                  ? 'bg-white text-orange-600 shadow-md' 
                  : 'text-white hover:bg-white/10'
                }`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className={`h-5 w-5 ${location.pathname === item.href ? 'text-orange-500' : ''}`} />
              <span>{item.name}</span>
            </Link>
          ))}
          
          {/* Add new parking lot button */}
          <div className="pt-4">
            <Button
              variant="glass"
              size="medium"
              fullWidth
              className="mt-2"
              icon={<PlusCircleIcon className="h-5 w-5" />}
              onClick={() => navigate('/parking/create')}
            >
              Add New Parking Lot
            </Button>
          </div>
        </nav>
        
        <div className="mt-auto border-t border-white/10 pt-4 pb-6 px-6">
          <div className="flex items-start gap-4 mb-4">
            <img 
              src={user?.avatar || '/avatar-default.png'} 
              alt="avatar" 
              className="h-12 w-12 rounded-full border-2 border-white object-cover shadow-md" 
            />
            <div className="flex-1">
              <div className="text-white font-semibold">{user?.name || 'Landowner'}</div>
              <div className="text-xs text-white/70 mb-1 truncate">{user?.email}</div>
              <Badge variant="warning" size="small">
                Landowner
              </Badge>
            </div>
          </div>
          
          <div className="mb-4 px-3 py-2 bg-white/10 rounded-lg">
            <span className="text-xs text-white/70">Managed Properties</span>
            <div className="text-white font-bold text-lg">
              {user?.parkingLots?.length || 0} locations
            </div>
          </div>
          
          <Button 
            variant="glass" 
            size="medium" 
            fullWidth 
            onClick={handleLogout} 
            icon={<LogoutIcon className="h-4 w-4" />}
          >
            Logout
          </Button>
        </div>
      </div>
      
      {/* Header */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className={`sticky top-0 z-20 px-4 lg:pl-6 pr-6 h-16 flex items-center transition-all duration-200 ${scrolled ? 'bg-white/80 backdrop-blur shadow-sm' : 'bg-transparent'}`}>
          {/* Mobile menu button */}
          <button 
            className="lg:hidden mr-4 text-gray-600" 
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          {/* Page title - can be dynamic based on current route */}
          <h1 className="text-xl font-semibold text-gray-800">
            {navigation.find(item => item.href === location.pathname)?.name || 'Landowner Dashboard'}
          </h1>
          
          <div className="ml-auto flex items-center space-x-4">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => navigate('/notifications')}
            >
              <BellIcon className="h-5 w-5 text-gray-600" />
              <Badge variant="danger" size="dot" className="absolute top-0 right-0" />
            </Button>
            
            {/* Profile - mobile only */}
            <div className="lg:hidden">
              <img 
                src={user?.avatar || '/avatar-default.png'} 
                alt="avatar" 
                className="h-8 w-8 rounded-full border border-gray-200 cursor-pointer shadow-sm"
                onClick={() => navigate('/profile')}
              />
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main className="flex-1 p-4 lg:p-6 max-w-7xl mx-auto w-full animate-fadeIn">
          {children}
        </main>
      </div>
    </div>
  );
};

// Simple logout icon component
const LogoutIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z"
      clipRule="evenodd"
    />
    <path
      fillRule="evenodd"
      d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-.943a.75.75 0 10-1.004-1.114l-2.5 2.25a.75.75 0 000 1.114l2.5 2.25a.75.75 0 101.004-1.114l-1.048-.943h9.546A.75.75 0 0019 10z"
      clipRule="evenodd"
    />
  </svg>
);

export default LandownerDashboardLayout;
