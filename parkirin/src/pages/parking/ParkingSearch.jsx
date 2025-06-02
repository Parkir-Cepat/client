import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@apollo/client';
import { 
  MagnifyingGlassIcon,
  MapPinIcon,
  AdjustmentsHorizontalIcon,
  StarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  FunnelIcon,
  XMarkIcon,
  TruckIcon,
  CalendarIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import GoogleMapsService from '../../services/googleMapsService';
import { GET_NEARBY_PARKINGS } from '../../graphql/queries';

const ParkingSearch = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);
  
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedParking, setSelectedParking] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewport, setViewport] = useState({
    latitude: -6.2088,  // Default to Jakarta's coordinates
    longitude: 106.8456,
    zoom: 13
  });

  const [searchParams, setSearchParams] = useState({
    radius: 2000, // 2km radius
    vehicleType: 'all',
    minPrice: 0,
    maxPrice: 100000
  });
  const [userLocation, setUserLocation] = useState(null);

  // Animation on mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // GraphQL query - must be defined before useEffect that uses `data`
  const { loading, error, data } = useQuery(GET_NEARBY_PARKINGS, {
    variables: {
      longitude: viewport.longitude,
      latitude: viewport.latitude,
      maxDistance: searchParams.radius,
      vehicleType: searchParams.vehicleType === 'all' ? null : searchParams.vehicleType
    },
    skip: !userLocation,
  });

  // Handle parking selection
  const handleParkingClick = (parking) => {
    setSelectedParking(parking);
    setShowDetailModal(true);
    
    // Center map on selected parking
    if (map.current && parking.location?.coordinates) {
      const [lng, lat] = parking.location.coordinates;
      map.current.setCenter({ lat, lng });
      map.current.setZoom(16);
    }
  };

  // Close detail modal
  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedParking(null);
  };

  // Handle booking navigation
  const handleBookNow = () => {
    if (selectedParking) {
      // Navigate to detailed parking page for booking
      window.location.href = `/parking/${selectedParking._id}`;
    }
  };

  // Initialize Google Maps
  useEffect(() => {
    const initMap = async () => {
      try {
        if (mapContainer.current && !map.current) {
          map.current = await GoogleMapsService.createMap(mapContainer.current, {
            center: { lat: viewport.latitude, lng: viewport.longitude },
            zoom: viewport.zoom,
            styles: [
              {
                featureType: "poi.business",
                stylers: [{ visibility: "off" }]
              },
              {
                featureType: "poi.park",
                elementType: "labels.text",
                stylers: [{ visibility: "off" }]
              },
              {
                featureType: "road",
                elementType: "geometry",
                stylers: [{ color: "#f8f9fa" }]
              },
              {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#e3f2fd" }]
              }
            ],
            gestureHandling: 'auto',
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true
          });
          
          setMapLoaded(true);
        }
      } catch (error) {
        console.error('Error initializing Google Maps:', error);
        // Handle error gracefully - maybe show a fallback UI
      }
    };

    initMap();
  }, [viewport.latitude, viewport.longitude, viewport.zoom]);

  // Get user's location and update map center
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          setViewport(prev => ({
            ...prev,
            latitude,
            longitude
          }));

          // Update map center if map is loaded
          if (map.current) {
            map.current.setCenter({ lat: latitude, lng: longitude });
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  // Clear existing markers
  const clearMarkers = () => {
    markers.current.forEach(marker => marker.setMap(null));
    markers.current = [];
  };

  // Add markers for parking spots and user location
  useEffect(() => {
    const addMarkers = async () => {
      if (!map.current || !mapLoaded) return;

      // Clear existing markers
      clearMarkers();

      // Add user location marker
      if (userLocation) {
        try {
          let userMarker;
          
          // Try to use AdvancedMarkerElement if available
          if (typeof window.google.maps.importLibrary === 'function') {
            const { AdvancedMarkerElement, PinElement } = await window.google.maps.importLibrary("marker");
            
            // Create marker element for AdvancedMarkerElement
            const markerElement = document.createElement('div');
            markerElement.innerHTML = `
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="8" fill="#2563eb" stroke="white" stroke-width="2"/>
                <circle cx="12" cy="12" r="3" fill="white"/>
              </svg>
            `;
            markerElement.style.width = '24px';
            markerElement.style.height = '24px';
            markerElement.style.cursor = 'pointer';
            
            userMarker = new AdvancedMarkerElement({
              position: { lat: userLocation.latitude, lng: userLocation.longitude },
              map: map.current,
              title: 'Your Location',
              content: markerElement
            });
          } else {
            // Fallback to legacy Marker
            const icon = {
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="8" fill="#2563eb" stroke="white" stroke-width="2"/>
                  <circle cx="12" cy="12" r="3" fill="white"/>
                </svg>
              `)}`,
              scaledSize: new window.google.maps.Size(24, 24),
              anchor: new window.google.maps.Point(12, 12)
            };
            
            userMarker = new window.google.maps.Marker({
              position: { lat: userLocation.latitude, lng: userLocation.longitude },
              map: map.current,
              title: 'Your Location',
              icon: icon
            });
          }
          
          markers.current.push(userMarker);
        } catch (error) {
          console.warn('Error creating user location marker, using basic marker:', error);
          // Final fallback to basic marker
          try {
            const basicUserMarker = new window.google.maps.Marker({
              position: { lat: userLocation.latitude, lng: userLocation.longitude },
              map: map.current,
              title: 'Your Location'
            });
            markers.current.push(basicUserMarker);
          } catch (fallbackError) {
            console.error('Failed to create user location marker:', fallbackError);
          }
        }
      }

      // Add parking spot markers using integrated service
      if (data?.getNearbyParkings) {
        try {
          // Global function for parking selection (called from info window)
          window.selectParking = (parkingId) => {
            const selectedParking = data.getNearbyParkings.find(p => p._id === parkingId);
            if (selectedParking) {
              handleParkingClick(selectedParking);
            }
          };
          const parkingMarkers = await GoogleMapsService.createParkingMarkers(
            map.current,
            data.getNearbyParkings,
            (parkingData) => {
              handleParkingClick(parkingData);
            }
          );
          
          markers.current.push(...parkingMarkers);

          // Fit map to show all markers if we have parking data
          if (parkingMarkers.length > 0) {
            GoogleMapsService.fitBoundsToMarkers(map.current, [...markers.current]);
          }
        } catch (error) {
          console.error('Error creating parking markers:', error);
        }
      }
    };

    addMarkers();
  }, [mapLoaded, data, userLocation]);

  // Enhanced loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-2000"></div>
        </div>
        
        <div className="relative z-10 text-center space-y-8">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin border-t-[#f16634] mx-auto"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent rounded-full animate-ping border-t-orange-400 mx-auto"></div>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Finding Perfect Parking Spots
            </h3>
            <p className="text-slate-600 text-lg">Discovering premium parking options near you...</p>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced error screen
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-red-100 p-10 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-100 to-rose-100 rounded-full flex items-center justify-center">
              <MapPinIcon className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Unable to Load Parking Data</h2>
            <p className="text-slate-600 mb-6">{error.message}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold rounded-2xl hover:from-red-600 hover:to-rose-600 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-orange-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm">
          <div className="px-4 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#f16634] to-[#f89b6c] rounded-2xl flex items-center justify-center shadow-lg">
                    <MapPinIcon className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-[#f16634] to-[#f89b6c] bg-clip-text text-transparent">
                      Find Parking
                    </h1>
                    <p className="text-sm text-gray-600">Discover premium spots near you</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600 bg-gray-50/80 backdrop-blur-sm px-4 py-2 rounded-2xl border border-gray-200/50">
                  <ClockIcon className="h-4 w-4" />
                  <span className="font-medium">Live Updates</span>
                </div>
                
                <button className="p-3 bg-gray-50/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 hover:bg-gray-100/80 transition-all duration-200">
                  <FunnelIcon className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-hidden">
          {/* Enhanced Filters Sidebar */}
          <div className="bg-white/70 backdrop-blur-xl border-r border-white/20 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Search Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <MagnifyingGlassIcon className="h-5 w-5 text-[#f16634]" />
                  <h2 className="text-xl font-bold text-[#f16634]">Search Filters</h2>
                </div>
                
                {/* Search Bar */}
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search parking spots..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-50/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#f16634] focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="space-y-6">
                {/* Radius Filter */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-700">Search Radius</label>
                    <span className="text-sm font-bold text-[#f16634] bg-orange-50 px-2 py-1 rounded-full">
                      {searchParams.radius / 1000} km
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="5"
                    step="0.5"
                    value={searchParams.radius / 1000}
                    onChange={(e) => setSearchParams(prev => ({
                      ...prev,
                      radius: e.target.value * 1000
                    }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#f16634]"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0.5km</span>
                    <span>2.5km</span>
                    <span>5km</span>
                  </div>
                </div>

                {/* Vehicle Type */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700">Vehicle Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'all', icon: '🚗🏍️', label: 'All' },
                      { value: 'car', icon: '🚗', label: 'Car' },
                      { value: 'motorcycle', icon: '🏍️', label: 'Bike' }
                    ].map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setSearchParams(prev => ({ ...prev, vehicleType: type.value }))}
                        className={`p-3 rounded-2xl border-2 transition-all duration-200 text-center ${
                          searchParams.vehicleType === type.value
                            ? 'border-[#f16634] bg-gradient-to-br from-orange-50 to-red-50 text-[#f16634]'
                            : 'border-gray-200 bg-white hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        <div className="text-lg mb-1">{type.icon}</div>
                        <div className="text-xs font-semibold">{type.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700">Price Range (Rp/hour)</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <input
                        type="number"
                        value={searchParams.minPrice}
                        onChange={(e) => setSearchParams(prev => ({
                          ...prev,
                          minPrice: parseFloat(e.target.value)
                        }))}
                        placeholder="Min"
                        className="w-full px-4 py-3 bg-gray-50/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#f16634] focus:border-transparent transition-all duration-200"
                      />
                      <CurrencyDollarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        value={searchParams.maxPrice}
                        onChange={(e) => setSearchParams(prev => ({
                          ...prev,
                          maxPrice: parseFloat(e.target.value)
                        }))}
                        placeholder="Max"
                        className="w-full px-4 py-3 bg-gray-50/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#f16634] focus:border-transparent transition-all duration-200"
                      />
                      <CurrencyDollarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Results List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#f16634] flex items-center space-x-2">
                    <span>Available Spots</span>
                    <span className="text-sm font-normal text-gray-500">({data?.getNearbyParkings?.length || 0})</span>
                  </h3>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {data?.getNearbyParkings?.map((spot, index) => (
                    <div
                      key={spot._id}
                      onClick={() => handleParkingClick(spot)}
                      className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-[1.02] overflow-hidden"
                      style={{ 
                        animationDelay: `${index * 100}ms`,
                        animation: mounted ? 'slideInUp 0.6s ease-out forwards' : 'none'
                      }}
                    >
                      <div className="p-5">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                              <h4 className="font-bold text-[#f16634] text-lg leading-tight truncate group-hover:text-[#d45528] transition-colors">
                                {spot.name}
                              </h4>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">{spot.address}</p>
                          </div>
                        </div>

                        {/* Pricing */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">🚗</span>
                              <div>
                                <p className="text-xs text-blue-600 font-semibold">Car</p>
                                <p className="text-sm font-bold text-blue-800">
                                  Rp {(spot.rates?.car || 0).toLocaleString()}/hr
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 border border-purple-100">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">🏍️</span>
                              <div>
                                <p className="text-xs text-purple-600 font-semibold">Bike</p>
                                <p className="text-sm font-bold text-purple-800">
                                  Rp {(spot.rates?.motorcycle || 0).toLocaleString()}/hr
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Availability */}
                        <div className="flex items-center justify-between text-sm mb-3">
                          <div className="flex items-center space-x-3">
                            <span className="text-gray-600 flex items-center space-x-1">
                              <span>🚗</span>
                              <span>{spot.available?.car || 0} available</span>
                            </span>
                            <span className="text-gray-600 flex items-center space-x-1">
                              <span>🏍️</span>
                              <span>{spot.available?.motorcycle || 0} available</span>
                            </span>
                          </div>
                        </div>

                        {/* Status and Rating */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded-full border border-yellow-200">
                              <StarIcon className="h-3 w-3 text-yellow-400 fill-current" />
                              <span className="text-xs font-bold text-yellow-700">
                                {spot.rating || 'N/A'}
                              </span>
                              <span className="text-xs text-yellow-600">
                                ({spot.review_count || 0})
                              </span>
                            </div>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                            spot.status === 'open' || !spot.status
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : 'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            {spot.status || 'Open'}
                          </div>
                        </div>
                      </div>

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-[#f16634]/5 to-[#f89b6c]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  ))}

                  {(!data?.getNearbyParkings || data.getNearbyParkings.length === 0) && (
                    <div className="text-center py-8">
                      <MapPinIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-sm font-semibold text-gray-600 mb-2">No Parking Spots Found</h3>
                      <p className="text-xs text-gray-500">Try adjusting your search radius or filters</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Map */}
          <div className="col-span-2 relative">
            <div 
              ref={mapContainer}
              className="w-full h-full"
              style={{ minHeight: '400px' }}
            />
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-gray-200 rounded-full animate-spin border-t-[#f16634] mx-auto"></div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Loading Map</h3>
                    <p className="text-gray-600">Preparing your parking map...</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Parking Detail Modal */}
      {showDetailModal && selectedParking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#f16634] to-[#f89b6c] rounded-xl flex items-center justify-center">
                  <MapPinIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedParking.name}</h2>
                  <p className="text-sm text-gray-600">Parking Details</p>
                </div>
              </div>
              <button
                onClick={closeDetailModal}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Image Gallery */}
              {selectedParking.images && selectedParking.images.length > 0 && (
                <div className="rounded-2xl overflow-hidden">
                  <img
                    src={selectedParking.images[0]}
                    alt={selectedParking.name}
                    className="w-full h-64 object-cover"
                  />
                </div>
              )}

              {/* Basic Info */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Status and Location */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900">Current Status</h3>
                      <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                        selectedParking.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedParking.status === 'active' ? 'Open' : 'Closed'}
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                      <p className="text-gray-600">{selectedParking.address}</p>
                    </div>
                    {selectedParking.operational_hours && (
                      <div className="flex items-center space-x-2">
                        <ClockIcon className="w-5 h-5 text-gray-400" />
                        <p className="text-gray-600">
                          {selectedParking.operational_hours.open} - {selectedParking.operational_hours.close}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Availability */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900">Current Availability</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <TruckIcon className="w-5 h-5 text-blue-600" />
                            <span className="font-medium text-blue-900">Cars</span>
                          </div>
                        </div>
                        <p className="text-2xl font-bold text-blue-900 mt-2">
                          {selectedParking.available?.car || 0} / {selectedParking.capacity?.car || 0}
                        </p>
                        <p className="text-sm text-blue-600">Available slots</p>
                      </div>
                      <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-5 h-5 bg-purple-600 rounded-sm"></div>
                            <span className="font-medium text-purple-900">Motorcycles</span>
                          </div>
                        </div>
                        <p className="text-2xl font-bold text-purple-900 mt-2">
                          {selectedParking.available?.motorcycle || 0} / {selectedParking.capacity?.motorcycle || 0}
                        </p>
                        <p className="text-sm text-purple-600">Available slots</p>
                      </div>
                    </div>
                  </div>

                  {/* Facilities */}
                  {selectedParking.facilities && selectedParking.facilities.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-900">Facilities & Amenities</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedParking.facilities.map((facility, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                          >
                            {facility}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rating and Reviews */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900">Rating & Reviews</h3>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <StarIcon className="w-6 h-6 text-yellow-400 fill-current" />
                        <span className="text-2xl font-bold text-gray-900">
                          {selectedParking.rating?.toFixed(1) || '0.0'}
                        </span>
                        <span className="text-gray-600">out of 5</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        ({selectedParking.review_count || 0} reviews)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Pricing */}
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Pricing</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Car (per hour)</span>
                        <span className="font-bold text-[#f16634]">
                          Rp {(selectedParking.rates?.car || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Motorcycle (per hour)</span>
                        <span className="font-bold text-[#f16634]">
                          Rp {(selectedParking.rates?.motorcycle || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <button
                      onClick={handleBookNow}
                      className="w-full bg-gradient-to-r from-[#f16634] to-[#f89b6c] text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      Book Now
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                      <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                        <HeartIcon className="w-4 h-4 mr-2 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Save</span>
                      </button>
                      <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                        <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Chat</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                    <h4 className="font-medium text-blue-900 mb-2">Quick Info</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <UserIcon className="w-4 h-4 text-blue-600" />
                        <span className="text-blue-800">Owner verified</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="w-4 h-4 text-blue-600" />
                        <span className="text-blue-800">Instant booking</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default ParkingSearch;