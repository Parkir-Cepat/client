import React from 'react';
import { Link } from 'react-router-dom';
import { 
  HomeIcon, 
  BuildingOfficeIcon,
  ChartBarIcon,
  CreditCardIcon,
  UserIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import useAuthStore from '../store/authStore';

const LandownerDashboardLayout = ({ children }) => {
  const { user } = useAuthStore();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'My Parking Lots', href: '/parking/manage', icon: BuildingOfficeIcon },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
    { name: 'Bookings', href: '/bookings', icon: ClockIcon },
    { name: 'Earnings', href: '/wallet', icon: CreditCardIcon },
    { name: 'Chat', href: '/chat', icon: ChatBubbleLeftRightIcon },
    { name: 'Profile', href: '/profile', icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <img className="h-8 w-auto" src="/logo.png" alt="Parkirin" />
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-blue-600"
                  >
                    <item.icon className="h-5 w-5 mr-2" />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">
                  Total Earnings: {user?.saldo ? `Rp ${user.saldo.toLocaleString('id-ID')}` : 'Rp 0'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default LandownerDashboardLayout;
