import React from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { useAuthStore } from '../../store/authStore';
import { 
  MapPinIcon, 
  CreditCardIcon, 
  ClockIcon, 
  UserIcon,
  ChartBarIcon,
  BuildingOffice2Icon
} from '@heroicons/react/24/outline';

const GET_ME = gql`
  query Me {
    me {
      _id
      email
      name
      role
      saldo
      avatar
      is_email_verified
      created_at
    }
  }
`;

const GET_MY_ACTIVE_BOOKINGS = gql`
  query GetMyActiveBookings {
    getMyActiveBookings {
      _id
      startTime
      duration
      cost
      status
      qrCode
      entryQR
      exitQR
    }
  }
`;

const Dashboard = () => {
  const { user } = useAuthStore();
  const { data: userData, loading: userLoading } = useQuery(GET_ME);
  const { data: bookingsData, loading: bookingsLoading } = useQuery(GET_MY_ACTIVE_BOOKINGS);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount || 0);
  };

  if (userLoading) return (
    <div className="flex justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  const userInfo = userData?.me || user;

  return (
    <div className="w-full p-4 sm:p-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {userInfo?.name}!</h1>
            <p className="text-blue-100 mt-1">
              {userInfo?.role === 'landowner' ? 'Manage your parking lots' : 'Find and book parking'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {userInfo?.avatar ? (
              <img src={userInfo.avatar} alt="Avatar" className="w-12 h-12 rounded-full" />
            ) : (
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <UserIcon className="w-6 h-6" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Wallet Balance */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Wallet Balance</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(userInfo?.saldo)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CreditCardIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Active Bookings */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Bookings</p>
              <p className="text-2xl font-bold text-gray-900">
                {bookingsData?.getMyActiveBookings?.length || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <ClockIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Role Specific Stats */}
        {userInfo?.role === 'landowner' ? (
          <>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">My Parking Lots</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <BuildingOffice2Icon className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(0)}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <ChartBarIcon className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Nearby Parking</p>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <MapPinIcon className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(0)}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <ChartBarIcon className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          {bookingsLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : bookingsData?.getMyActiveBookings?.length > 0 ? (
            <div className="space-y-3">
              {bookingsData.getMyActiveBookings.slice(0, 3).map((booking) => (
                <div key={booking._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium">Booking #{booking._id.slice(-6)}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(booking.startTime).toLocaleDateString()} - {booking.duration}h
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    booking.status === 'confirmed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {userInfo?.role === 'landowner' ? (
              <>
                <button className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50">
                  <p className="font-medium">Add New Parking Lot</p>
                  <p className="text-sm text-gray-600">Create a new parking space</p>
                </button>
                <button className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50">
                  <p className="font-medium">View Analytics</p>
                  <p className="text-sm text-gray-600">Check your earnings and stats</p>
                </button>
              </>
            ) : (
              <>
                <button className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50">
                  <p className="font-medium">Find Parking</p>
                  <p className="text-sm text-gray-600">Search nearby parking spots</p>
                </button>
                <button className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50">
                  <p className="font-medium">Top Up Wallet</p>
                  <p className="text-sm text-gray-600">Add money to your wallet</p>
                </button>
              </>
            )}
            <button className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50">
              <p className="font-medium">View Profile</p>
              <p className="text-sm text-gray-600">Update your profile information</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;