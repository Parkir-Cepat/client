import React from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
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

const GET_MY_PARKINGS = gql`
  query GetMyParkings {
    getMyParkings {
      _id
      name
      status
    }
  }
`;

const Dashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { data: userData, loading: userLoading } = useQuery(GET_ME);
  const { data: bookingsData, loading: bookingsLoading } = useQuery(GET_MY_ACTIVE_BOOKINGS);
  const { data: parkingsData, loading: parkingsLoading } = useQuery(GET_MY_PARKINGS, {
    skip: user?.role !== 'landowner'
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount || 0);
  };

  const handleNavigate = (path) => {
    navigate(path);
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
      <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-6 text-white mb-6">        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {userInfo?.name}!</h1>
            <p className="text-orange-100 mt-1">
              {userInfo?.role === 'landowner' ? 'Manage your parking lots' : 'Find and book parking'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {userInfo?.avatar ? (
              <img src={userInfo.avatar} alt="Avatar" className="w-12 h-12 rounded-full border-2 border-white" />
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
                  <p className="text-2xl font-bold text-gray-900">
                    {parkingsLoading ? '...' : (parkingsData?.getMyParkings?.length || 0)}
                  </p>
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
      </div>      {/* My Parking Lots List */}
      {userInfo?.role === 'landowner' && parkingsData?.getMyParkings?.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">My Parking Lots</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {parkingsData.getMyParkings.map((lot) => (
                  <tr key={lot._id} className="border-b">
                    <td className="px-4 py-2">{lot.name}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        lot.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {lot.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">                      <button
                        className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-blue-700"
                        onClick={() => navigate(`/landownerdashboard/parking/${lot._id}`)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
        </div>        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {userInfo?.role === 'landowner' ? (
              <>
                <button 
                  onClick={() => handleNavigate('/parking')}
                  className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-200 transition-colors"
                >
                  <p className="font-medium text-gray-900">Add New Parking Lot</p>
                  <p className="text-sm text-gray-600">Create a new parking space for rent</p>
                </button>
                <button 
                  onClick={() => handleNavigate('/parking')}
                  className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-200 transition-colors"
                >
                  <p className="font-medium text-gray-900">Manage Parking Lots</p>
                  <p className="text-sm text-gray-600">View and edit your parking lots</p>
                </button>
                <button 
                  onClick={() => handleNavigate('/dashboard/chat')}
                  className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-200 transition-colors"
                >
                  <p className="font-medium text-gray-900">Chat with Customers</p>
                  <p className="text-sm text-gray-600">Communicate with customers</p>
                </button>
              </>
            ) : (              <>
                <button 
                  onClick={() => handleNavigate('/search')}
                  className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-200 transition-colors"
                >
                  <p className="font-medium text-gray-900">Find Parking</p>
                  <p className="text-sm text-gray-600">Find the nearest parking spaces</p>
                </button>
                <button 
                  onClick={() => handleNavigate('/wallet')}
                  className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-200 transition-colors"
                >
                  <p className="font-medium text-gray-900">Top Up Balance</p>
                  <p className="text-sm text-gray-600">Add balance to your wallet</p>
                </button>
              </>
            )}
            <button 
              onClick={() => handleNavigate('/profile')}
              className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-200 transition-colors"
            >
              <p className="font-medium text-gray-900">View Profile</p>
              <p className="text-sm text-gray-600">Update your profile information</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;