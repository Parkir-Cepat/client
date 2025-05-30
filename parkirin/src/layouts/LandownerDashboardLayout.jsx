import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BuildingOfficeIcon, ChatBubbleLeftRightIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import useAuthStore from '../store/authStore';

const LandownerDashboardLayout = ({ children }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'My Parking Lots', href: '/parking/manage', icon: BuildingOfficeIcon },
    { name: 'Chat', href: '/chat', icon: ChatBubbleLeftRightIcon },
  ];

  return (
    <div className="min-h-screen flex bg-[#f9fafb]">
      {/* Sidebar */}
      <div className={`fixed z-30 inset-y-0 left-0 w-64 bg-[#f16634] shadow-lg flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center h-16 px-6 font-bold text-white text-2xl border-b border-[#f16634]/30">
          <img src='https://www.citypng.com/public/uploads/preview/creative-graphic-pinterest-red-p-letter-701751695135355tq5j7kknmm.png' className='h-8 mr-2' alt="" /> Parkirin
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <XMarkIcon className="h-6 w-6 text-white" />
          </button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map(item => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-4 py-3 rounded-lg transition font-medium text-base
                ${location.pathname === item.href ? 'bg-white text-[#f16634] shadow font-bold' : 'text-white hover:bg-white/10'}
              `}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="h-6 w-6 mr-3" />
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="px-6 pb-6 mt-auto">
          <div className="flex items-center space-x-3 mb-4">
            <img src={user?.avatar || '/avatar-default.png'} alt="avatar" className="h-10 w-10 rounded-full border-2 border-white" />
            <div>
              <div className="text-white font-semibold">{user?.name || 'Landowner'}</div>
              <div className="text-xs text-white/80">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 rounded-full text-base font-semibold text-[#f16634] bg-white border-2 border-[#f16634] hover:bg-[#f16634] hover:text-white transition shadow"
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
      <main className="flex-1 min-h-screen ml-0 lg:ml-64 py-6 px-2 sm:px-4">
        <div className="w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default LandownerDashboardLayout;
