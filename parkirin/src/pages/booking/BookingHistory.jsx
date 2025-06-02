import { useQuery, gql } from '@apollo/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { CalendarDaysIcon, MapPinIcon, ClockIcon, CurrencyDollarIcon, EyeIcon, QrCodeIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const GET_BOOKING_HISTORY = gql`
  query GetMyBookingHistory {
    getMyBookingHistory {
      _id
      start_time
      duration
      cost
      status
      vehicle_type
      created_at
      updated_at
      parking {
        _id
        name
        address
        owner {
          _id
          name
          email
        }
      }
      qr_code
      entry_qr
      exit_qr
    }
  }
`;

const BookingHistory = () => {
  const { loading, error, data } = useQuery(GET_BOOKING_HISTORY);

  if (loading) return <LoadingSpinner size="large" />;
  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
        <p className="text-gray-600">{error.message}</p>
      </div>
    </div>
  );

  const bookings = data?.getMyBookingHistory || [];

  const getStatusConfig = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return { 
          bg: 'bg-emerald-50', 
          text: 'text-emerald-700', 
          border: 'border-emerald-200',
          icon: '✓'
        };
      case 'pending':
        return { 
          bg: 'bg-amber-50', 
          text: 'text-amber-700', 
          border: 'border-amber-200',
          icon: '⏳'
        };
      case 'cancelled':
        return { 
          bg: 'bg-red-50', 
          text: 'text-red-700', 
          border: 'border-red-200',
          icon: '✕'
        };
      case 'confirmed':
        return { 
          bg: 'bg-blue-50', 
          text: 'text-blue-700', 
          border: 'border-blue-200',
          icon: '✓'
        };
      case 'active':
        return { 
          bg: 'bg-purple-50', 
          text: 'text-purple-700', 
          border: 'border-purple-200',
          icon: '🔄'
        };
      default:
        return { 
          bg: 'bg-gray-50', 
          text: 'text-gray-700', 
          border: 'border-gray-200',
          icon: '●'
        };
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatVehicleType = (type) => {
    const vehicleConfig = {
      'car': { label: 'Mobil', icon: '🚗', color: 'text-blue-600' },
      'motorcycle': { label: 'Motor', icon: '🏍️', color: 'text-green-600' }
    };
    
    return vehicleConfig[type] || { label: type || '-', icon: '🚗', color: 'text-gray-600' };
  };

  // Sort bookings by booking date (most recent first)
  const sortedBookings = [...bookings].sort((a, b) => 
    new Date(b.created_at) - new Date(a.created_at)
  );

  // Statistics calculation
  const stats = {
    total: sortedBookings.length,
    completed: sortedBookings.filter(b => b.status === 'completed').length,
    cancelled: sortedBookings.filter(b => b.status === 'cancelled').length,
    pending: sortedBookings.filter(b => b.status === 'pending').length,
    totalSpent: sortedBookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + b.cost, 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Riwayat Booking</h1>
              <p className="mt-2 text-gray-600">Kelola dan lihat semua riwayat pemesanan parkir Anda</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                {sortedBookings.length} Total Records
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Booking</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <CalendarDaysIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Selesai</p>
                <p className="text-3xl font-bold text-emerald-600">{stats.completed}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <span className="text-emerald-600 text-xl">✓</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dibatalkan</p>
                <p className="text-3xl font-bold text-red-600">{stats.cancelled}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <span className="text-red-600 text-xl">✕</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pengeluaran</p>
                <p className="text-2xl font-bold text-purple-600">Rp {stats.totalSpent.toLocaleString('id-ID')}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <CurrencyDollarIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {sortedBookings.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CalendarDaysIcon className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Belum Ada Riwayat Booking</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Anda belum memiliki riwayat pemesanan parkir. Mulai cari dan booking tempat parkir sekarang!
              </p>
              <button className="mt-6 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300">
                Cari Parkir
              </button>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block lg:hidden divide-y divide-gray-200">
                {sortedBookings.map((booking) => {
                  const statusConfig = getStatusConfig(booking.status);
                  const vehicleConfig = formatVehicleType(booking.vehicle_type);
                  
                  return (
                    <div key={booking._id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-lg">{vehicleConfig.icon}</span>
                            <span className={`text-sm font-medium ${vehicleConfig.color}`}>
                              {vehicleConfig.label}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {booking.parking?.name || 'N/A'}
                          </h3>
                          <p className="text-sm text-gray-600 flex items-center">
                            <MapPinIcon className="w-4 h-4 mr-1" />
                            {booking.parking?.address || 'Address not available'}
                          </p>
                        </div>
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                          <span className="mr-1">{statusConfig.icon}</span>
                          {booking.status}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Booking ID</p>
                          <p className="text-sm font-medium text-gray-900">#{booking._id.slice(-8)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Durasi</p>
                          <p className="text-sm font-medium text-gray-900">{booking.duration} jam</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Tanggal</p>
                          <p className="text-sm font-medium text-gray-900">{formatDateTime(booking.created_at)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Biaya</p>
                          <p className="text-sm font-bold text-gray-900">Rp {booking.cost.toLocaleString('id-ID')}</p>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <button 
                          className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white py-2 px-4 rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-300"
                          onClick={() => window.location.href = `/booking/${booking._id}`}
                        >
                          <EyeIcon className="w-4 h-4 mr-2 inline" />
                          Lihat Detail
                        </button>
                        
                        {booking.qr_code && (
                          <button className="px-4 py-2 border border-blue-300 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-50 transition-colors duration-200">
                            <QrCodeIcon className="w-4 h-4" />
                          </button>
                        )}
                        
                        {booking.status === 'completed' && (
                          <button className="px-4 py-2 border border-green-300 text-green-600 rounded-xl text-sm font-medium hover:bg-green-50 transition-colors duration-200">
                            <ArrowDownTrayIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Booking Info
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Lokasi Parkir
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Kendaraan
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Waktu
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Durasi & Biaya
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedBookings.map((booking) => {
                      const statusConfig = getStatusConfig(booking.status);
                      const vehicleConfig = formatVehicleType(booking.vehicle_type);
                      
                      return (
                        <tr key={booking._id} className="hover:bg-gray-50 transition-colors duration-200">
                          {/* Booking Info */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-bold text-gray-900">#{booking._id.slice(-8)}</div>
                              <div className="text-xs text-gray-500">{formatDateTime(booking.created_at)}</div>
                            </div>
                          </td>
                          
                          {/* Parking Location */}
                          <td className="px-6 py-4">
                            <div className="max-w-xs">
                              <div className="text-sm font-semibold text-gray-900 truncate">
                                {booking.parking?.name || 'N/A'}
                              </div>
                              <div className="text-xs text-gray-500 truncate flex items-center mt-1">
                                <MapPinIcon className="w-3 h-3 mr-1 flex-shrink-0" />
                                {booking.parking?.address || 'Address not available'}
                              </div>
                              {booking.parking?.owner && (
                                <div className="text-xs text-gray-400 mt-1">
                                  Owner: {booking.parking.owner.name}
                                </div>
                              )}
                            </div>
                          </td>
                          
                          {/* Vehicle Type */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-lg mr-2">{vehicleConfig.icon}</span>
                              <span className={`text-sm font-medium ${vehicleConfig.color}`}>
                                {vehicleConfig.label}
                              </span>
                            </div>
                          </td>
                          
                          {/* Time */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 flex items-center">
                              <ClockIcon className="w-4 h-4 mr-1 text-gray-400" />
                              {formatDateTime(booking.start_time)}
                            </div>
                          </td>
                          
                          {/* Duration & Cost */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{booking.duration} jam</div>
                              <div className="text-sm font-bold text-green-600">Rp {booking.cost.toLocaleString('id-ID')}</div>
                            </div>
                          </td>
                          
                          {/* Status */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                              <span className="mr-1">{statusConfig.icon}</span>
                              {booking.status}
                            </span>
                          </td>
                          
                          {/* Actions */}
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <button 
                                className="bg-gradient-to-r from-orange-500 to-pink-500 text-white p-2 rounded-lg hover:shadow-lg transition-all duration-300 group"
                                onClick={() => window.location.href = `/booking/${booking._id}`}
                                title="Lihat Detail"
                              >
                                <EyeIcon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                              </button>
                              
                              {booking.qr_code && (
                                <button 
                                  className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 hover:shadow-lg transition-all duration-300 group"
                                  title="Lihat QR Code"
                                >
                                  <QrCodeIcon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                                </button>
                              )}
                              
                              {booking.status === 'completed' && (
                                <button 
                                  className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 hover:shadow-lg transition-all duration-300 group"
                                  title="Download Receipt"
                                >
                                  <ArrowDownTrayIcon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingHistory;