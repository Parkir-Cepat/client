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
  XMarkIcon
} from '@heroicons/react/24/outline';
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
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Find Parking', href: '/parking/search', icon: MapIcon },
    { name: 'My Bookings', href: '/bookings', icon: ClockIcon },
    { name: 'Wallet', href: '/wallet', icon: CreditCardIcon },
    { name: 'Chat Support', href: '/chat', icon: ChatBubbleLeftRightIcon },
    { name: 'Profile', href: '/profile', icon: UserIcon },
  ];

  return (
    <div className="min-h-screen flex bg-[#f9fafb]">
      {/* Sidebar */}
      <div className={`fixed z-30 inset-y-0 left-0 w-60 bg-[#f16634] shadow-lg flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center h-16 px-4 font-bold text-white text-xl border-b border-[#f16634]/30">
          <img src='/assets/logo_ParkGo.png' className='h-8 mr-2' alt="ParkGo Logo" /> Parkirin
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <XMarkIcon className="h-6 w-6 text-white" />
          </button>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map(item => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition font-normal text-base
                ${location.pathname === item.href ? 'bg-white text-[#f16634] font-bold shadow' : 'text-white hover:bg-white/10'}
              `}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col items-center gap-2 px-4 pb-6">
          <img src={user?.avatar || '/avatar-default.png'} alt="avatar" className="h-10 w-10 rounded-full border-2 border-white mb-1" />
          <div className="text-white font-semibold text-sm text-center leading-tight">{user?.name || 'User'}</div>
          <div className="text-xs text-white/70 text-center mb-1">{user?.email}</div>
          <span className="px-3 py-1 bg-white text-[#f16634] rounded-full text-xs font-bold shadow mb-1">Balance: {user?.saldo ? `Rp ${user.saldo.toLocaleString('id-ID')}` : 'Rp 0'}</span>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 border-2 border-white text-white rounded-full text-sm font-semibold hover:bg-white hover:text-[#f16634] transition"
          >
            Logout
          </button>
        </div>
      </div>
      {/* Hamburger for mobile */}
      <button className="fixed top-4 left-4 z-40 lg:hidden bg-[#f16634] p-2 rounded-full shadow-lg" onClick={() => setSidebarOpen(true)}>
        <Bars3Icon className="h-6 w-6 text-white" />
      </button>
      {/* Main Content */}
      <main className="flex-1 min-h-screen ml-0 lg:ml-60 py-6 px-2 sm:px-4">
        <div className="w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default UserDashboardLayout;
