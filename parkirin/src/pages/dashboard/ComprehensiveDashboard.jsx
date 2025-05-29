import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPinIcon,
  CalendarIcon,
  BellIcon,
  CurrencyDollarIcon,
  StarIcon,
  ChartBarIcon,
  UsersIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

// Import components
import { ParkingSearch } from '../../components/parking';
import { NotificationBell, NotificationDropdown } from '../../components/notification';
import { QuickActions, StatCard, RecentActivity } from '../../components/dashboard';
import { AdminDashboardStats, UserManagement } from '../../components/admin';
import { LandlordDashboard } from '../../components/landowner';

// Import stores
import { useAuthStore, useParkingStore, useBookingStore, useNotificationStore } from '../../store';

const ComprehensiveDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { nearbyParkings, fetchNearbyParkings, userLocation, setUserLocation } = useParkingStore();
  const { userBookings, fetchUserBookings } = useBookingStore();
  const { notifications, fetchNotifications, unreadCount } = useNotificationStore();
  
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Initialize dashboard data
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        // Get user location for nearby parkings
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };
              setUserLocation(location);
              fetchNearbyParkings(location.lat, location.lng);
            },
            (error) => {
              console.warn('Geolocation error:', error);
              // Use default Jakarta coordinates
              const defaultLocation = { lat: -6.2088, lng: 106.8456 };
              setUserLocation(defaultLocation);
              fetchNearbyParkings(defaultLocation.lat, defaultLocation.lng);
            }
          );
        }

        // Fetch user-specific data
        await Promise.all([
          fetchUserBookings(),
          fetchNotifications()
        ]);

      } catch (error) {
        console.error('Dashboard initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [fetchNearbyParkings, fetchUserBookings, fetchNotifications, setUserLocation]);

  // Handle search results
  const handleSearchResults = (results) => {
    setSearchResults(results);
  };

  // Handle search filters change
  const handleFiltersChange = (filters) => {
    console.log('Search filters:', filters);
  };

  // Quick stats for regular users
  const getUserStats = () => {
    const activeBookings = userBookings.filter(booking => booking.status === 'active').length;
    const totalSpent = userBookings
      .filter(booking => booking.paymentStatus === 'paid')
      .reduce((sum, booking) => sum + booking.totalAmount, 0);
    
    return [
      {
        title: 'Active Bookings',
        value: activeBookings,
        icon: CalendarIcon,
        color: 'bg-blue-500',
        change: null
      },
      {
        title: 'Total Bookings',
        value: userBookings.length,
        icon: MapPinIcon,
        color: 'bg-green-500',
        change: null
      },
      {
        title: 'Total Spent',
        value: `Rp ${totalSpent.toLocaleString()}`,
        icon: CurrencyDollarIcon,
        color: 'bg-purple-500',
        change: null
      },
      {
        title: 'Nearby Spots',
        value: nearbyParkings.length,
        icon: StarIcon,
        color: 'bg-yellow-500',
        change: null
      }
    ];
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Render based on user role
  if (user?.role === 'admin') {
    return (
      <div className="space-y-6">
        {/* Admin Header */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-2 text-sm text-gray-700">
                Manage the entire Parkirin system
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell 
                count={unreadCount}
                onClick={() => setShowNotifications(!showNotifications)}
              />
              {showNotifications && (
                <div className="absolute top-16 right-0 z-50">
                  <NotificationDropdown onClose={() => setShowNotifications(false)} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Admin Stats */}
        <AdminDashboardStats />

        {/* Admin Actions */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/admin/users')}
                className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <UsersIcon className="w-6 h-6 mr-2 text-gray-400" />
                <span className="text-sm font-medium">Manage Users</span>
              </button>
              <button
                onClick={() => navigate('/admin/parking-lots')}
                className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <BuildingOfficeIcon className="w-6 h-6 mr-2 text-gray-400" />
                <span className="text-sm font-medium">Parking Lots</span>
              </button>
              <button
                onClick={() => navigate('/admin/bookings')}
                className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <CalendarIcon className="w-6 h-6 mr-2 text-gray-400" />
                <span className="text-sm font-medium">Bookings</span>
              </button>
              <button
                onClick={() => navigate('/admin/analytics')}
                className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <ChartBarIcon className="w-6 h-6 mr-2 text-gray-400" />
                <span className="text-sm font-medium">Analytics</span>
              </button>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">User Management Preview</h3>
            <UserManagement />
          </div>
        </div>
      </div>
    );
  }

  if (user?.role === 'landowner') {
    return <LandlordDashboard />;
  }

  // Default user dashboard
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.name}!
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              Find and book parking spots with ease
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <NotificationBell 
              count={unreadCount}
              onClick={() => setShowNotifications(!showNotifications)}
            />
            {showNotifications && (
              <div className="absolute top-16 right-0 z-50">
                <NotificationDropdown onClose={() => setShowNotifications(false)} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {getUserStats().map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Search Section */}
        <div className="lg:col-span-2 space-y-6">
          <ParkingSearch 
            onResults={handleSearchResults}
            onFiltersChange={handleFiltersChange}
          />

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Search Results ({searchResults.length})
              </h3>
              <div className="space-y-4">
                {searchResults.map((parking) => (
                  <div 
                    key={parking.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/parking/${parking.id}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{parking.name}</h4>
                        <p className="text-sm text-gray-500">{parking.address}</p>
                        <div className="flex items-center mt-2 space-x-4">
                          <span className="text-sm text-gray-600">
                            {parking.distance} km away
                          </span>
                          <div className="flex items-center">
                            <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
                            <span className="text-sm">{parking.rating}</span>
                          </div>
                          <span className="text-sm text-green-600">
                            {parking.availableSpots} spots available
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          Rp {parking.pricePerHour.toLocaleString()}/hour
                        </p>
                        <button className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nearby Parkings */}
          {nearbyParkings.length > 0 && searchResults.length === 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Nearby Parking ({nearbyParkings.length})
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {nearbyParkings.map((parking) => (
                  <div 
                    key={parking.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/parking/${parking.id}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{parking.name}</h4>
                        <p className="text-sm text-gray-500">{parking.address}</p>
                        <div className="flex items-center mt-2 space-x-4">
                          <span className="text-sm text-gray-600">
                            {parking.distance} km
                          </span>
                          <div className="flex items-center">
                            <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
                            <span className="text-sm">{parking.rating}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          Rp {parking.pricePerHour.toLocaleString()}/h
                        </p>
                        <p className="text-sm text-green-600">
                          {parking.availableSpots} spots
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <QuickActions />

          {/* Recent Activity */}
          <RecentActivity bookings={userBookings.slice(0, 5)} />

          {/* Recent Notifications */}
          {notifications.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Recent Notifications
              </h3>
              <div className="space-y-3">
                {notifications.slice(0, 3).map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-3 rounded-lg border ${
                      notification.read 
                        ? 'bg-gray-50 border-gray-200' 
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => navigate('/notifications')}
                className="mt-4 w-full text-center text-sm text-blue-600 hover:text-blue-800"
              >
                View all notifications →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveDashboard;
