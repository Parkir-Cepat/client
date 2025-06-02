import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { toast } from 'react-hot-toast';
import { 
  MapPinIcon,
  StarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  TruckIcon,
  CalendarIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CameraIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import { 
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid 
} from '@heroicons/react/24/solid';

// GraphQL Queries and Mutations
const GET_PARKING = gql`
  query GetParking($id: ID!) {
    getParking(id: $id) {
      _id
      name
      address
      location {
        type
        coordinates
      }
      owner_id
      owner {
        _id
        email
        name
        role
      }
      capacity {
        car
        motorcycle
      }
      available {
        car
        motorcycle
      }
      rates {
        car
        motorcycle
      }
      operational_hours {
        open
        close
      }
      facilities
      images
      status
      rating
      review_count
      created_at
      updated_at
    }
  }
`;

const CREATE_BOOKING = gql`
  mutation CreateBooking($input: CreateBookingInput!) {
    createBooking(input: $input) {
      booking {
        _id
        user_id
        parking_id
        vehicle_type
        start_time
        duration
        cost
        status
        created_at
        updated_at
        user {
          _id
          name
          email
          saldo
        }
        parking {
          _id
          name
          address
          rates {
            car
            motorcycle
          }
        }
      }
      qr_code
      total_cost
      message
    }
  }
`;

// Custom hook for parking data management
const useParkingData = (id) => {
  const { data, loading, error, refetch } = useQuery(GET_PARKING, {
    variables: { id },
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-and-network'
  });

  const parking = useMemo(() => data?.getParking, [data]);

  return { parking, loading, error, refetch };
};

// Utility functions
const formatOperationalHours = (operational_hours) => {
  if (!operational_hours?.open || !operational_hours?.close) return 'Hours not specified';
  return `${operational_hours.open} - ${operational_hours.close}`;
};

const formatRating = (rating) => {
  return rating ? rating.toFixed(1) : '0.0';
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(price || 0);
};

const getAvailabilityStatus = (available, capacity) => {
  const total = (available?.car || 0) + (available?.motorcycle || 0);
  const totalCapacity = (capacity?.car || 0) + (capacity?.motorcycle || 0);
  
  if (total === 0) return { status: 'full', color: 'red', text: 'Full' };
  if (total / totalCapacity > 0.7) return { status: 'available', color: 'green', text: 'Available' };
  if (total / totalCapacity > 0.3) return { status: 'limited', color: 'yellow', text: 'Limited' };
  return { status: 'few', color: 'orange', text: 'Few spots left' };
};

// Loading Component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
    <div className="text-center space-y-6">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin border-t-[#f16634] mx-auto"></div>
        <div className="absolute inset-0 w-20 h-20 border-4 border-transparent rounded-full animate-ping border-t-orange-400 mx-auto"></div>
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-gray-800">Loading Parking Details</h3>
        <p className="text-gray-600">Fetching the latest information...</p>
      </div>
    </div>
  </div>
);

// Error Component
const ErrorDisplay = ({ error, onRetry, onBack }) => (
  <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 flex items-center justify-center p-4">
    <div className="max-w-lg w-full">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-red-100 p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-100 to-rose-100 rounded-full flex items-center justify-center">
          <ExclamationTriangleIcon className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Unable to Load Parking Details</h2>
        <p className="text-slate-600 mb-6">{error?.message || 'An unexpected error occurred'}</p>
        <div className="flex gap-3 justify-center">
          <button 
            onClick={onBack}
            className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-xl hover:from-gray-600 hover:to-gray-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Back to Search
          </button>
          <button 
            onClick={onRetry}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold rounded-xl hover:from-red-600 hover:to-rose-600 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center space-x-2"
          >
            <ArrowPathIcon className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Not Found Component
const NotFoundDisplay = ({ onBack }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
    <div className="text-center p-8">
      <MapPinIcon className="w-20 h-20 text-gray-300 mx-auto mb-6" />
      <h2 className="text-2xl font-bold text-gray-600 mb-4">Parking Spot Not Found</h2>
      <p className="text-gray-500 mb-8 max-w-md">The parking spot you're looking for doesn't exist or has been removed.</p>
      <button 
        onClick={onBack}
        className="px-8 py-3 bg-gradient-to-r from-[#f16634] to-[#f89b6c] text-white font-semibold rounded-xl hover:from-[#d45528] hover:to-[#e67e4e] transform hover:scale-105 transition-all duration-200 shadow-lg"
      >
        Back to Search
      </button>
    </div>
  </div>
);

// Header Component
const ParkingHeader = ({ parking, onBack, onRefresh, isRefreshing }) => (
  <div className="bg-white/90 backdrop-blur-xl border-b border-white/20 shadow-sm sticky top-0 z-40">
    <div className="px-4 lg:px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors group"
            aria-label="Go back"
          >
            <ArrowLeftIcon className="w-6 h-6 text-gray-600 group-hover:text-gray-800" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-[#f16634] to-[#f89b6c] rounded-2xl flex items-center justify-center shadow-lg">
              <MapPinIcon className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-[#f16634] to-[#f89b6c] bg-clip-text text-transparent">
                {parking.name}
              </h1>
              <p className="text-sm text-gray-600">Parking Details</p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors group disabled:opacity-50"
          aria-label="Refresh data"
        >
          <ArrowPathIcon className={`w-5 h-5 text-gray-600 group-hover:text-gray-800 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  </div>
);

// Image Gallery Component
const ImageGallery = ({ images, name }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [imageError, setImageError] = useState(false);

  if (!images || images.length === 0 || imageError) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <div className="text-center">
            <CameraIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No images available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="relative h-64 bg-gray-200">
        <img
          src={images[currentImage]}
          alt={`${name} - Image ${currentImage + 1}`}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentImage ? 'bg-white' : 'bg-white/50'
                }`}
                aria-label={`View image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status, availability }) => {
  const availabilityStatus = getAvailabilityStatus(availability.available, availability.capacity);
  
  const getStatusConfig = () => {
    if (status !== 'active') {
      return { color: 'red', text: 'Closed', bgColor: 'bg-red-100', textColor: 'text-red-800' };
    }
    
    switch (availabilityStatus.status) {
      case 'available':
        return { color: 'green', text: 'Open & Available', bgColor: 'bg-green-100', textColor: 'text-green-800' };
      case 'limited':
        return { color: 'yellow', text: 'Open - Limited', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' };
      case 'few':
        return { color: 'orange', text: 'Open - Few spots', bgColor: 'bg-orange-100', textColor: 'text-orange-800' };
      default:
        return { color: 'red', text: 'Full', bgColor: 'bg-red-100', textColor: 'text-red-800' };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}>
      <div className={`w-2 h-2 rounded-full mr-2 bg-${statusConfig.color}-400`}></div>
      {statusConfig.text}
    </div>
  );
};

// Availability Card Component
const AvailabilityCard = ({ type, available, capacity, rate, icon: Icon, colorScheme }) => (
  <div className={`bg-gradient-to-r ${colorScheme.from} ${colorScheme.to} rounded-xl p-6 border ${colorScheme.border}`}>
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <Icon className={`w-6 h-6 ${colorScheme.iconColor}`} />
        <span className={`font-semibold ${colorScheme.textColor}`}>{type}</span>
      </div>
      <StatusBadge 
        status={available > 0 ? 'available' : 'full'} 
        availability={{ available: { [type.toLowerCase()]: available }, capacity: { [type.toLowerCase()]: capacity } }}
      />
    </div>
    
    <div className="space-y-3">
      <div>
        <p className={`text-3xl font-bold ${colorScheme.textColor}`}>
          {available} / {capacity}
        </p>
        <p className={`text-sm ${colorScheme.subTextColor}`}>Available spots</p>
      </div>
      
      <div className="flex items-center justify-between">
        <span className={`text-sm ${colorScheme.subTextColor}`}>Rate per hour</span>
        <span className={`font-bold ${colorScheme.textColor}`}>
          {formatPrice(rate)}
        </span>
      </div>
    </div>
  </div>
);

// Action Button Component
const ActionButton = ({ variant = 'primary', children, onClick, disabled, className = '', ...props }) => {
  const baseClasses = "font-semibold rounded-xl transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gradient-to-r from-[#f16634] to-[#f89b6c] text-white hover:from-[#d45528] hover:to-[#e67e4e] hover:shadow-xl transform hover:scale-105",
    secondary: "border border-gray-300 text-gray-700 hover:bg-gray-50",
    outline: "border-2 border-[#f16634] text-[#f16634] hover:bg-[#f16634] hover:text-white"
  };

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Enhanced Book Now Section Component - HANYA CREATE BOOKING
const EnhancedBookNowSection = ({ parking, navigate }) => {
  const [selectedVehicleType, setSelectedVehicleType] = useState('car');
  const [selectedDuration, setSelectedDuration] = useState(2);
  const [isBooking, setIsBooking] = useState(false);

  const [createBooking] = useMutation(CREATE_BOOKING, {
    onCompleted: (data) => {
      console.log('Booking created successfully:', data.createBooking);
      setIsBooking(false);
      
      // Show success notification dengan booking ID
      toast.success(`Booking created successfully! ID: ${data.createBooking.booking._id}`, {
        duration: 4000,
        position: 'top-center',
      });
      
      // Redirect to My Bookings page
      setTimeout(() => {
        navigate('/bookings');
      }, 1500);
    },
    onError: (error) => {
      console.error('Booking creation failed:', error);
      toast.error(error.message || 'Failed to create booking');
      setIsBooking(false);
    }
  });

  const handleBookNow = async () => {
    if (!parking) {
      toast.error('Parking information not available');
      return;
    }

    try {
      setIsBooking(true);
      
      // Show loading notification
      toast.loading('Creating your booking...', {
        id: 'booking-process'
      });

      // Calculate start time (current time)
      const startTime = new Date();
      
      // Create booking input dengan field yang sesuai server
      const bookingInput = {
        parking_id: parking._id,
        vehicle_type: selectedVehicleType,
        start_time: startTime.toISOString(),
        duration: selectedDuration
      };

      // Create booking ONLY - no payment processing
      await createBooking({
        variables: { input: bookingInput }
      });

      // Dismiss loading toast
      toast.dismiss('booking-process');

    } catch (error) {
      console.error('Booking process failed:', error);
      toast.dismiss('booking-process');
      
      // Handle specific error cases
      if (error.message.includes('tidak tersedia') || error.message.includes('not available')) {
        toast.error('No parking slots available for the selected vehicle type.', {
          duration: 4000
        });
      } else if (error.message.includes('penuh') || error.message.includes('full')) {
        toast.error('Parking lot is currently full. Please try again later.', {
          duration: 4000
        });
      } else {
        toast.error(error.message || 'Booking failed. Please try again.', {
          duration: 4000
        });
      }
      
      setIsBooking(false);
    }
  };

  const totalCost = (parking.rates?.[selectedVehicleType] || 0) * selectedDuration;
  const isAvailable = parking.status === 'active' && (parking.available?.[selectedVehicleType] || 0) > 0;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-[#f16634] mb-4">Quick Booking</h3>
      
      {/* Vehicle Type Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Vehicle Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setSelectedVehicleType('car')}
            disabled={isBooking}
            className={`p-3 rounded-lg border text-sm font-medium transition-colors disabled:opacity-50 ${
              selectedVehicleType === 'car'
                ? 'border-[#f16634] bg-orange-50 text-[#f16634]'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            🚗 Car
          </button>
          <button
            onClick={() => setSelectedVehicleType('motorcycle')}
            disabled={isBooking}
            className={`p-3 rounded-lg border text-sm font-medium transition-colors disabled:opacity-50 ${
              selectedVehicleType === 'motorcycle'
                ? 'border-[#f16634] bg-orange-50 text-[#f16634]'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            🏍️ Motor
          </button>
        </div>
      </div>

      {/* Duration Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Duration (hours)
        </label>
        <select
          value={selectedDuration}
          onChange={(e) => setSelectedDuration(parseInt(e.target.value))}
          disabled={isBooking}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f16634] focus:border-transparent disabled:opacity-50"
        >
          {[1, 2, 3, 4, 5, 6, 8, 12, 24].map(hour => (
            <option key={hour} value={hour}>
              {hour} hour{hour > 1 ? 's' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Availability Info */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-xs text-gray-600 mb-1">Available slots for {selectedVehicleType}:</div>
        <div className="flex justify-between items-center">
          <span className="font-bold text-gray-800">
            {parking.available?.[selectedVehicleType] || 0} / {parking.capacity?.[selectedVehicleType] || 0}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full ${
            (parking.available?.[selectedVehicleType] || 0) > 0 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {(parking.available?.[selectedVehicleType] || 0) > 0 ? 'Available' : 'Full'}
          </span>
        </div>
      </div>

      {/* Pricing Preview */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Estimated Cost:</span>
          <span className="font-bold text-[#f16634]">
            {formatPrice(totalCost)}
          </span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {formatPrice(parking.rates?.[selectedVehicleType] || 0)} × {selectedDuration} hour{selectedDuration > 1 ? 's' : ''}
        </div>
      </div>

      {/* Booking Status Info */}
      <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
          <span className="text-xs text-yellow-800 font-medium">
            Booking will be created with "pending" status - payment required separately
          </span>
        </div>
      </div>

      {/* Book Now Button */}
      <ActionButton 
        variant="primary"
        onClick={handleBookNow}
        className={`w-full py-4 text-lg relative ${isBooking ? 'cursor-not-allowed' : ''}`}
        disabled={!isAvailable || isBooking}
      >
        {isBooking ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Creating Booking...</span>
          </div>
        ) : parking.status !== 'active' ? (
          'Currently Closed'
        ) : (parking.available?.[selectedVehicleType] || 0) <= 0 ? (
          `No ${selectedVehicleType} slots available`
        ) : (
          'Create Booking'
        )}
      </ActionButton>

      {/* Quick booking info */}
      <div className="mt-3 text-xs text-gray-500 text-center">
        <p>Creates booking reservation • Payment processing later • Secure booking</p>
      </div>
    </div>
  );
};

// Main Component
const ParkingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { parking, loading, error, refetch } = useParkingData(id);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Handlers
  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleBackToSearch = useCallback(() => {
    navigate('/parking/search');
  }, [navigate]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } catch (err) {
      console.error('Refresh failed:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  const handleToggleFavorite = useCallback(() => {
    setIsFavorite(prev => !prev);
    // TODO: Implement favorite functionality
  }, []);

  const handleContactOwner = useCallback(() => {
    // Karena field phone tidak ada, kita bisa gunakan email atau fallback
    if (parking?.owner?.email) {
      window.open(`mailto:${parking.owner.email}`, '_self');
    }
  }, [parking]);

  // Render loading state
  if (loading) return <LoadingSpinner />;

  // Render error state
  if (error) {
    return <ErrorDisplay error={error} onRetry={handleRetry} onBack={handleBackToSearch} />;
  }

  // Render not found state
  if (!parking) {
    return <NotFoundDisplay onBack={handleBackToSearch} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <ParkingHeader 
        parking={parking}
        onBack={handleBack}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <ImageGallery images={parking.images} name={parking.name} />

            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{parking.name}</h2>
                  <div className="flex items-start space-x-2 text-gray-600 mb-4">
                    <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{parking.address}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <StatusBadge 
                      status={parking.status} 
                      availability={{ available: parking.available, capacity: parking.capacity }}
                    />
                    {parking.rating > 0 && (
                      <div className="flex items-center space-x-1">
                        <StarIconSolid className="w-5 h-5 text-yellow-400" />
                        <span className="font-semibold text-gray-900">{formatRating(parking.rating)}</span>
                        <span className="text-gray-500 text-sm">({parking.review_count} reviews)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Operating Hours */}
              {parking.operational_hours && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Operating Hours</h3>
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">{formatOperationalHours(parking.operational_hours)}</span>
                  </div>
                </div>
              )}

              {/* Basic parking information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900">Location</h3>
                  <p className="text-gray-600 flex items-start space-x-2">
                    <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span>{parking.address}</span>
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900">Status</h3>
                  <p className="text-gray-600">
                    {parking.status === 'active' ? 'Currently Open' : 'Currently Closed'}
                  </p>
                </div>
              </div>
            </div>

            {/* Availability & Pricing */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">Current Availability & Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AvailabilityCard
                  type="Cars"
                  available={parking.available?.car || 0}
                  capacity={parking.capacity?.car || 0}
                  rate={parking.rates?.car || 0}
                  icon={TruckIcon}
                  colorScheme={{
                    from: 'from-blue-50',
                    to: 'to-indigo-50',
                    border: 'border-blue-100',
                    iconColor: 'text-blue-600',
                    textColor: 'text-blue-900',
                    subTextColor: 'text-blue-600'
                  }}
                />
                <AvailabilityCard
                  type="Motorcycles"
                  available={parking.available?.motorcycle || 0}
                  capacity={parking.capacity?.motorcycle || 0}
                  rate={parking.rates?.motorcycle || 0}
                  icon={({ className }) => <div className={`w-6 h-6 bg-purple-600 rounded-sm ${className}`} />}
                  colorScheme={{
                    from: 'from-purple-50',
                    to: 'to-pink-50',
                    border: 'border-purple-100',
                    iconColor: 'text-purple-600',
                    textColor: 'text-purple-900',
                    subTextColor: 'text-purple-600'
                  }}
                />
              </div>
            </div>

            {/* Facilities */}
            {parking.facilities && parking.facilities.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8">
                <h3 className="text-xl font-bold text-[#f16634] mb-6">Facilities & Amenities</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {parking.facilities.map((facility, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                      <span className="text-sm font-medium text-gray-700">{facility}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location Map Placeholder */}
            <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8">
              <h3 className="text-xl font-bold text-[#f16634] mb-6">Location</h3>
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-64 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPinIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Interactive map will be displayed here</p>
                  {parking.location?.coordinates && (
                    <p className="text-xs text-gray-400 mt-2">
                      Coordinates: {parking.location.coordinates[1]}, {parking.location.coordinates[0]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enhanced Quick Booking - HANYA CREATE BOOKING */}
            <EnhancedBookNowSection parking={parking} navigate={navigate} />
            
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="grid grid-cols-2 gap-3">
                <ActionButton 
                  variant="secondary"
                  onClick={handleToggleFavorite}
                  className="flex items-center justify-center px-4 py-3"
                >
                  {isFavorite ? (
                    <HeartIconSolid className="w-4 h-4 mr-2 text-red-500" />
                  ) : (
                    <HeartIcon className="w-4 h-4 mr-2 text-gray-600" />
                  )}
                  <span className="text-sm font-medium">{isFavorite ? 'Saved' : 'Save'}</span>
                </ActionButton>
                
                <ActionButton 
                  variant="secondary"
                  onClick={handleContactOwner}
                  className="flex items-center justify-center px-4 py-3"
                  disabled={!parking.owner?.email}
                >
                  <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2 text-gray-600" />
                  <span className="text-sm font-medium">Contact</span>
                </ActionButton>
              </div>
            </div>

            {/* Owner Information */}
            {parking.owner && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-[#f16634] mb-4">Owner Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#f16634] to-[#f89b6c] rounded-full flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{parking.owner.name || 'Owner'}</p>
                      <p className="text-sm text-gray-600">{parking.owner.email}</p>
                      <p className="text-xs text-gray-500 capitalize">{parking.owner.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Booking Process Info */}
            <div className="bg-orange-50 rounded-xl p-6 border border-orange-100">
              <h3 className="font-semibold text-orange-900 mb-4">Booking Process</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-orange-800">1</span>
                  </div>
                  <span className="text-orange-800">Create booking reservation</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-orange-800">2</span>
                  </div>
                  <span className="text-orange-800">Complete payment separately</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-orange-800">3</span>
                  </div>
                  <span className="text-orange-800">Receive confirmation & QR code</span>
                </div>
              </div>
            </div>

            {/* Help & Support */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Have questions about this parking location or need assistance with booking?
              </p>
              <ActionButton 
                variant="outline"
                className="w-full py-2 text-sm"
                onClick={() => navigate('/support')}
              >
                Contact Support
              </ActionButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkingDetail;