import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
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
  HeartIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import GoogleMapsService from '../../services/googleMapsService';
import { GET_NEARBY_PARKINGS } from '../../graphql/queries';

const ParkingSearch = () => {
  const navigate = useNavigate();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);
  
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [selectedParking, setSelectedParking] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showListView, setShowListView] = useState(false);
  const [showRadiusModal, setShowRadiusModal] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [maxDistance, setMaxDistance] = useState(5); // Default 5km
  const [tempRadius, setTempRadius] = useState(5); // Temporary radius for modal

  // Border radius configuration with #promptBoost specifications
  const [radiusConfig, setRadiusConfig] = useState({
    // Global radius in pixels
    global: 12,
    // Individual corner radius settings (in pixels)
    topLeft: 12,
    topRight: 12,
    bottomLeft: 12,
    bottomRight: 12,
    // Percentage support
    usePercentage: false,
    percentage: 50,
    // Responsive settings
    mobile: 8,
    tablet: 10,
    desktop: 12
  });

  const [searchParams, setSearchParams] = useState({
    radius: 5000, // 5km radius
    vehicleType: 'all',
    minPrice: 0,
    maxPrice: 100000
  });

  // Animation on mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // GraphQL query with proper error handling
  const { loading, error, data, refetch } = useQuery(GET_NEARBY_PARKINGS, {
    variables: {
      longitude: userLocation?.longitude || 106.8456,
      latitude: userLocation?.latitude || -6.2088,
      maxDistance: searchParams.radius,
      vehicleType: searchParams.vehicleType === 'all' ? null : searchParams.vehicleType
    },
    skip: !userLocation,
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true
  });

  // Generate CSS border radius based on configuration
  const generateBorderRadius = (config = radiusConfig) => {
    if (config.usePercentage) {
      return `${config.percentage}%`;
    }
    
    // Check if using individual corners
    if (config.topLeft !== config.global || 
        config.topRight !== config.global || 
        config.bottomLeft !== config.global || 
        config.bottomRight !== config.global) {
      return `${config.topLeft}px ${config.topRight}px ${config.bottomRight}px ${config.bottomLeft}px`;
    }
    
    return `${config.global}px`;
  };

  // Get responsive border radius
  const getResponsiveBorderRadius = () => {
    const width = window.innerWidth;
    if (width < 768) return `${radiusConfig.mobile}px`;
    if (width < 1024) return `${radiusConfig.tablet}px`;
    return `${radiusConfig.desktop}px`;
  };

  // Distance calculation utility
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Format distance for display
  const formatDistance = (distance) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  // Handle radius change and refetch data
  const handleRadiusChange = (newRadius) => {
    setMaxDistance(newRadius);
    setSearchParams(prev => ({ ...prev, radius: newRadius * 1000 }));
    
    // Refetch data with new radius
    if (userLocation) {
      refetch({
        longitude: userLocation.longitude,
        latitude: userLocation.latitude,
        maxDistance: newRadius * 1000,
        vehicleType: searchParams.vehicleType === 'all' ? null : searchParams.vehicleType
      });
    }
  };

  // Apply radius configuration
  const applyRadiusConfig = () => {
    handleRadiusChange(tempRadius);
    setShowRadiusModal(false);
  };

  // Reset radius to default
  const resetRadius = () => {
    setTempRadius(5);
    setRadiusConfig({
      global: 12,
      topLeft: 12,
      topRight: 12,
      bottomLeft: 12,
      bottomRight: 12,
      usePercentage: false,
      percentage: 50,
      mobile: 8,
      tablet: 10,
      desktop: 12
    });
  };

  // Get user's location with better error handling
  useEffect(() => {
    const getUserLocation = async () => {
      if (!navigator.geolocation) {
        console.error('Geolocation is not supported by this browser');
        setUserLocation({
          latitude: -6.2088,
          longitude: 106.8456
        });
        return;
      }

      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 10000,
          });
        });

        const { latitude, longitude } = position.coords;
        console.log('User location obtained:', { latitude, longitude });
        setUserLocation({ latitude, longitude });
      } catch (error) {
        console.error('Error getting location:', error);
        setUserLocation({
          latitude: -6.2088,
          longitude: 106.8456
        });
      }
    };

    getUserLocation();
  }, []);

  // Initialize Google Maps with comprehensive error handling
  useEffect(() => {
    let isMounted = true;
    
    const initMap = async () => {
      if (!mapContainer.current || map.current) return;

      try {
        setMapError(null);
        console.log('Starting Google Maps initialization...');
        
        if (!GoogleMapsService) {
          throw new Error('GoogleMapsService not available');
        }

        await GoogleMapsService.loadGoogleMaps();
        
        if (!window.google?.maps) {
          throw new Error('Google Maps JavaScript API failed to load');
        }

        console.log('Google Maps API loaded successfully');

        const mapCenter = userLocation 
          ? { lat: userLocation.latitude, lng: userLocation.longitude }
          : { lat: -6.2088, lng: 106.8456 };

        console.log('Creating map with center:', mapCenter);

        const mapInstance = await GoogleMapsService.createMap(mapContainer.current, {
          center: mapCenter,
          zoom: 13,
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
          gestureHandling: 'greedy',
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          clickableIcons: false
        });
        
        if (isMounted && mapInstance) {
          map.current = mapInstance;
          setMapLoaded(true);
          console.log('Google Maps initialized successfully');
          
          window.google.maps.event.addListenerOnce(mapInstance, 'idle', () => {
            console.log('Map idle event fired - map is ready');
            setMapLoaded(true);
          });
        }
      } catch (error) {
        console.error('Error initializing Google Maps:', error);
        if (isMounted) {
          setMapError(error.message || 'Failed to initialize Google Maps');
        }
      }
    };

    const timer = setTimeout(initMap, 500);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [userLocation]);

  // Handle parking selection from list - navigate to detail page
  const handleParkingClick = (parking) => {
    if (parking?._id) {
      navigate(`/parking/${parking._id}`);
    }
  };

  // Handle parking selection from map
  const handleMapParkingClick = (parking) => {
    setSelectedParking(parking);
    setShowDetailModal(true);
    
    if (map.current && parking.location?.coordinates) {
      const [lng, lat] = parking.location.coordinates;
      map.current.setCenter({ lat, lng });
      map.current.setZoom(16);
    }
  };

  // Clear existing markers
  const clearMarkers = () => {
    if (markers.current) {
      markers.current.forEach(marker => {
        if (marker && marker.setMap) {
          marker.setMap(null);
        }
      });
      markers.current = [];
    }
  };

  // Add markers for parking spots and user location
  useEffect(() => {
    const addMarkers = async () => {
      if (!map.current || !mapLoaded || !window.google?.maps) {
        console.log('Map not ready for markers:', { 
          mapExists: !!map.current, 
          mapLoaded, 
          googleMapsExists: !!window.google?.maps 
        });
        return;
      }

      console.log('Adding markers to map...');
      
      clearMarkers();

      try {
        if (userLocation) {
          console.log('Adding user location marker');
          
          const userIcon = {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="8" fill="#2563eb" stroke="white" stroke-width="2"/>
                <circle cx="12" cy="12" r="3" fill="white"/>
              </svg>
            `)}`,
            scaledSize: new window.google.maps.Size(24, 24),
            anchor: new window.google.maps.Point(12, 12)
          };
          
          const userMarker = new window.google.maps.Marker({
            position: { lat: userLocation.latitude, lng: userLocation.longitude },
            map: map.current,
            title: 'Your Location',
            icon: userIcon,
            zIndex: 1000
          });
          
          markers.current.push(userMarker);
        }

        if (data?.getNearbyParkings?.length > 0) {
          console.log('Adding parking markers:', data.getNearbyParkings.length);
          
          window.selectParking = (parkingId) => {
            const selectedParking = data.getNearbyParkings.find(p => p._id === parkingId);
            if (selectedParking) {
              handleMapParkingClick(selectedParking);
            }
          };

          const parkingMarkers = await GoogleMapsService.createParkingMarkers(
            map.current,
            data.getNearbyParkings,
            (parkingData) => {
              handleMapParkingClick(parkingData);
            }
          );
          
          if (parkingMarkers && parkingMarkers.length > 0) {
            markers.current.push(...parkingMarkers);
            console.log('Added parking markers:', parkingMarkers.length);

            GoogleMapsService.fitBoundsToMarkersAndLocation(
              map.current, 
              parkingMarkers, 
              userLocation,
              {
                padding: 60,
                maxZoom: 15
              }
            );
          }
        } else if (userLocation) {
          GoogleMapsService.centerMapOnLocation(
            map.current,
            userLocation.latitude,
            userLocation.longitude,
            13
          );
        }
      } catch (error) {
        console.error('Error adding markers:', error);
      }
    };

    addMarkers();
  }, [mapLoaded, data, userLocation]);

  // Radius Configuration Modal Component
  const RadiusConfigModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white max-w-md w-full shadow-2xl overflow-hidden"
        style={{ borderRadius: generateBorderRadius() }}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div 
              className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center"
              style={{ borderRadius: getResponsiveBorderRadius() }}
            >
              <Cog6ToothIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Search Radius</h2>
              <p className="text-xs text-gray-600">Configure search distance</p>
            </div>
          </div>
          <button
            onClick={() => setShowRadiusModal(false)}
            className="p-2 hover:bg-gray-100 transition-colors"
            style={{ borderRadius: getResponsiveBorderRadius() }}
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Radius Display */}
          <div 
            className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 border border-orange-200"
            style={{ borderRadius: generateBorderRadius() }}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {tempRadius} km
              </div>
              <div className="text-sm text-orange-700">
                Current search radius
              </div>
            </div>
          </div>

          {/* Radius Slider */}
          <div className="space-y-4">
            <label className="text-sm font-semibold text-gray-700 block">
              Search Distance: {tempRadius} km
            </label>
            
            <div className="px-2">
              <input
                type="range"
                min="0.5"
                max="50"
                step="0.5"
                value={tempRadius}
                onChange={(e) => setTempRadius(parseFloat(e.target.value))}
                className="w-full h-3 bg-gray-200 appearance-none cursor-pointer accent-orange-500"
                style={{ borderRadius: generateBorderRadius() }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>500m</span>
                <span>25km</span>
                <span>50km</span>
              </div>
            </div>

            {/* Preset Distance Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {[1, 5, 10, 20].map(distance => (
                <button
                  key={distance}
                  onClick={() => setTempRadius(distance)}
                  className={`py-2 px-3 text-sm font-semibold transition-all duration-200 ${
                    tempRadius === distance
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={{ borderRadius: generateBorderRadius() }}
                >
                  {distance}km
                </button>
              ))}
            </div>

            {/* Quick Distance Options */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Quick Options</h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Walking', value: 2, icon: '🚶‍♂️' },
                  { label: 'Cycling', value: 8, icon: '🚴‍♂️' },
                  { label: 'Driving', value: 15, icon: '🚗' },
                  { label: 'Long Distance', value: 30, icon: '🛣️' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTempRadius(option.value)}
                    className={`p-3 text-left transition-all duration-200 border ${
                      tempRadius === option.value
                        ? 'border-orange-500 bg-orange-50 text-orange-600'
                        : 'border-gray-200 bg-white hover:border-gray-300 text-gray-600'
                    }`}
                    style={{ borderRadius: generateBorderRadius() }}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{option.icon}</span>
                      <div>
                        <div className="text-sm font-semibold">{option.label}</div>
                        <div className="text-xs opacity-75">{option.value}km radius</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Border Radius Configuration */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-700">UI Border Radius</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600">Global Radius (px)</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={radiusConfig.global}
                    onChange={(e) => setRadiusConfig(prev => ({
                      ...prev,
                      global: parseInt(e.target.value) || 0
                    }))}
                    className="w-full px-2 py-1 text-sm border border-gray-300 focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                    style={{ borderRadius: generateBorderRadius() }}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="usePercentage"
                    checked={radiusConfig.usePercentage}
                    onChange={(e) => setRadiusConfig(prev => ({
                      ...prev,
                      usePercentage: e.target.checked
                    }))}
                    className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                    style={{ borderRadius: '4px' }}
                  />
                  <label htmlFor="usePercentage" className="text-xs text-gray-600">
                    Use %
                  </label>
                  {radiusConfig.usePercentage && (
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={radiusConfig.percentage}
                      onChange={(e) => setRadiusConfig(prev => ({
                        ...prev,
                        percentage: parseInt(e.target.value) || 0
                      }))}
                      className="w-16 px-1 py-1 text-xs border border-gray-300"
                      style={{ borderRadius: generateBorderRadius() }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={resetRadius}
              className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
              style={{ borderRadius: generateBorderRadius() }}
            >
              Reset
            </button>
            <button
              onClick={applyRadiusConfig}
              className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold hover:from-orange-600 hover:to-orange-700 transition-colors shadow-lg"
              style={{ borderRadius: generateBorderRadius() }}
            >
              Apply Changes
            </button>
          </div>

          {/* Usage Examples */}
          <div 
            className="bg-gray-50 p-3 border border-gray-200"
            style={{ borderRadius: generateBorderRadius() }}
          >
            <h5 className="text-xs font-semibold text-gray-700 mb-2">Border Radius Examples:</h5>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div 
                className="bg-white p-2 border border-gray-300 text-center"
                style={{ borderRadius: '4px' }}
              >
                4px
              </div>
              <div 
                className="bg-white p-2 border border-gray-300 text-center"
                style={{ borderRadius: '12px' }}
              >
                12px
              </div>
              <div 
                className="bg-white p-2 border border-gray-300 text-center"
                style={{ borderRadius: '50%' }}
              >
                50%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render map container with comprehensive error handling
  const renderMapContainer = () => {
    if (mapError) {
      return (
        <div className="col-span-2 relative h-full min-h-[400px]">
          <div 
            className="w-full h-full flex items-center justify-center bg-red-50 border-2 border-red-200"
            style={{ borderRadius: generateBorderRadius() }}
          >
            <div className="text-center p-8">
              <div 
                className="w-16 h-16 bg-red-100 flex items-center justify-center mx-auto mb-4"
                style={{ borderRadius: radiusConfig.usePercentage ? '50%' : generateBorderRadius() }}
              >
                <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Map Failed to Load</h3>
              <p className="text-red-600 text-sm mb-4">{mapError}</p>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setMapError(null);
                    setMapLoaded(false);
                    if (map.current) {
                      map.current = null;
                    }
                    window.location.reload();
                  }}
                  className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors mr-2"
                  style={{ borderRadius: generateBorderRadius() }}
                >
                  <ArrowPathIcon className="w-4 h-4 inline mr-2" />
                  Retry
                </button>
                <button
                  onClick={() => setShowListView(true)}
                  className="px-4 py-2 bg-gray-600 text-white hover:bg-gray-700 transition-colors"
                  style={{ borderRadius: generateBorderRadius() }}
                >
                  View List Instead
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="col-span-2 relative h-full min-h-[400px]">
        <div 
          ref={mapContainer}
          className="w-full h-full overflow-hidden"
          style={{ 
            minHeight: '400px', 
            height: '100%',
            borderRadius: generateBorderRadius()
          }}
        />
        {!mapLoaded && !mapError && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100"
            style={{ borderRadius: generateBorderRadius() }}
          >
            <div className="text-center space-y-4">
              <div className="relative">
                <div 
                  className="w-16 h-16 border-4 border-gray-200 animate-spin border-t-orange-500 mx-auto"
                  style={{ borderRadius: '50%' }}
                ></div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Loading Map</h3>
                <p className="text-gray-600">Initializing Google Maps...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Loading state
  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div 
              className="w-20 h-20 border-4 border-orange-200 animate-spin border-t-orange-500 mx-auto"
              style={{ borderRadius: '50%' }}
            ></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-900">Finding Parking Spots</h3>
            <p className="text-gray-600">Searching for nearby parking locations...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center">
          <div 
            className="bg-white/80 backdrop-blur-xl shadow-2xl border border-red-100 p-10"
            style={{ borderRadius: generateBorderRadius() }}
          >
            <ExclamationTriangleIcon className="w-20 h-20 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load Parking Data</h2>
            <p className="text-gray-600 mb-6">{error.message}</p>
            <button 
              onClick={() => refetch()}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold hover:from-red-600 hover:to-rose-600 transform hover:scale-105 transition-all duration-300 shadow-lg"
              style={{ borderRadius: generateBorderRadius() }}
            >
              <ArrowPathIcon className="w-5 h-5 inline mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg">
        <div className="px-4 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 bg-white/20 hover:bg-white/30 transition-colors"
                style={{ borderRadius: radiusConfig.usePercentage ? '50%' : generateBorderRadius() }}
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Find Parking</h1>
                <p className="text-orange-100">Discover parking spots near you</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowRadiusModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 text-white hover:bg-white/30 transition-colors"
                style={{ borderRadius: radiusConfig.usePercentage ? '50px' : generateBorderRadius() }}
              >
                <MapPinIcon className="w-5 h-5" />
                <span className="font-medium">{formatDistance(maxDistance)}</span>
                <Cog6ToothIcon className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setShowListView(!showListView)}
                className="p-2 bg-white/20 hover:bg-white/30 transition-colors"
                style={{ borderRadius: radiusConfig.usePercentage ? '50%' : generateBorderRadius() }}
              >
                {showListView ? (
                  <MapPinIcon className="w-6 h-6 text-white" />
                ) : (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {showListView ? (
          // List View
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {loading ? "Searching..." : `${data?.getNearbyParkings?.length || 0} Parking Spots Found`}
              </h2>
              <p className="text-gray-600">
                Showing parking within {formatDistance(maxDistance)}
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="text-center">
                  <div 
                    className="w-12 h-12 border-4 border-orange-200 animate-spin border-t-orange-500 mx-auto mb-4"
                    style={{ borderRadius: '50%' }}
                  ></div>
                  <p className="text-gray-600">Finding nearby parking...</p>
                </div>
              </div>
            ) : data?.getNearbyParkings?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.getNearbyParkings.map((parking) => (
                  <div
                    key={parking._id}
                    onClick={() => handleParkingClick(parking)}
                    className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 overflow-hidden"
                    style={{ borderRadius: generateBorderRadius() }}
                  >
                    {parking.images?.[0] && (
                      <div className="relative h-48">
                        <img
                          src={parking.images[0]}
                          alt={parking.name}
                          className="w-full h-full object-cover"
                        />
                        <div 
                          className="absolute top-3 left-3 px-2 py-1 text-xs font-bold bg-green-500 text-white"
                          style={{ borderRadius: radiusConfig.usePercentage ? '50px' : generateBorderRadius() }}
                        >
                          OPEN
                        </div>
                      </div>
                    )}
                    
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{parking.name}</h3>
                        <span className="text-sm text-gray-500 ml-2">
                          {userLocation && parking.location?.coordinates && 
                            formatDistance(calculateDistance(
                              userLocation.latitude,
                              userLocation.longitude,
                              parking.location.coordinates[1],
                              parking.location.coordinates[0]
                            ))
                          }
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{parking.address}</p>
                      
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div 
                          className="bg-blue-50 p-3"
                          style={{ borderRadius: generateBorderRadius() }}
                        >
                          <p className="text-xs text-blue-600 font-medium">Car Slots</p>
                          <p className="text-lg font-bold text-blue-800">
                            {parking.available?.car || 0}/{parking.capacity?.car || 0}
                          </p>
                        </div>
                        <div 
                          className="bg-purple-50 p-3"
                          style={{ borderRadius: generateBorderRadius() }}
                        >
                          <p className="text-xs text-purple-600 font-medium">Bike Slots</p>
                          <p className="text-lg font-bold text-purple-800">
                            {parking.available?.motorcycle || 0}/{parking.capacity?.motorcycle || 0}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium text-gray-700">
                            {parking.rating || 'N/A'}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({parking.review_count || 0})
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">From</p>
                          <p className="text-lg font-bold text-orange-600">
                            Rp {(parking.rates?.motorcycle || 0).toLocaleString()}/hr
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <MapPinIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Parking Spots Found</h3>
                <p className="text-gray-500 mb-4">
                  No parking spots found within {formatDistance(maxDistance)}
                </p>
                <button
                  onClick={() => setShowRadiusModal(true)}
                  className="px-6 py-3 bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                  style={{ borderRadius: generateBorderRadius() }}
                >
                  Adjust Search Radius
                </button>
              </div>
            )}
          </div>
        ) : (
          // Map View with enhanced layout
          <div className="h-[calc(100vh-120px)] grid grid-cols-1 lg:grid-cols-3">
            {/* Filters Sidebar */}
            <div className="bg-white/70 backdrop-blur-xl border-r border-white/20 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Search Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <MagnifyingGlassIcon className="h-5 w-5 text-orange-500" />
                    <h2 className="text-xl font-bold text-orange-600">Search Filters</h2>
                  </div>
                  
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search parking spots..."
                      className="w-full pl-10 pr-4 py-3 bg-gray-50/80 backdrop-blur-sm border border-gray-200/50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      style={{ borderRadius: generateBorderRadius() }}
                    />
                  </div>
                </div>

                {/* Current Radius Display */}
                <div 
                  className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 border border-orange-200"
                  style={{ borderRadius: generateBorderRadius() }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-orange-700 font-medium">Search Radius</div>
                      <div className="text-lg font-bold text-orange-600">{formatDistance(maxDistance)}</div>
                    </div>
                    <button
                      onClick={() => setShowRadiusModal(true)}
                      className="p-2 bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                      style={{ borderRadius: getResponsiveBorderRadius() }}
                    >
                      <Cog6ToothIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Results List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-orange-600 flex items-center space-x-2">
                      <span>Available Spots</span>
                      <span className="text-sm font-normal text-gray-500">({data?.getNearbyParkings?.length || 0})</span>
                    </h3>
                  </div>

                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {data?.getNearbyParkings?.map((spot, index) => (
                      <div
                        key={spot._id}
                        onClick={() => handleParkingClick(spot)}
                        className="group bg-white/80 backdrop-blur-sm shadow-sm border border-white/50 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-[1.02] overflow-hidden relative"
                        style={{ 
                          borderRadius: generateBorderRadius(),
                          animationDelay: `${index * 100}ms`,
                          animation: mounted ? 'slideInUp 0.6s ease-out forwards' : 'none'
                        }}
                      >
                        <div className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <div 
                                  className="w-2 h-2 bg-green-400 animate-pulse"
                                  style={{ borderRadius: '50%' }}
                                ></div>
                                <h4 className="font-bold text-orange-600 text-lg leading-tight truncate group-hover:text-orange-700 transition-colors">
                                  {spot.name}
                                </h4>
                              </div>
                              <p className="text-sm text-gray-600 line-clamp-2">{spot.address}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <div 
                              className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 border border-blue-100"
                              style={{ borderRadius: generateBorderRadius() }}
                            >
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
                            <div 
                              className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 border border-purple-100"
                              style={{ borderRadius: generateBorderRadius() }}
                            >
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

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div 
                                className="flex items-center space-x-1 bg-yellow-50 px-2 py-1 border border-yellow-200"
                                style={{ borderRadius: radiusConfig.usePercentage ? '50px' : generateBorderRadius() }}
                              >
                                <StarIcon className="h-3 w-3 text-yellow-400 fill-current" />
                                <span className="text-xs font-bold text-yellow-700">
                                  {spot.rating || 'N/A'}
                                </span>
                                <span className="text-xs text-yellow-600">
                                  ({spot.review_count || 0})
                                </span>
                              </div>
                            </div>
                            <div 
                              className="px-2 py-1 text-xs font-bold bg-green-100 text-green-800 border border-green-200"
                              style={{ borderRadius: radiusConfig.usePercentage ? '50px' : generateBorderRadius() }}
                            >
                              Open
                            </div>
                          </div>

                          <div className="mt-3 text-xs text-gray-500 group-hover:text-orange-600 transition-colors text-center">
                            Click to view details →
                          </div>
                        </div>
                      </div>
                    ))}

                    {(!data?.getNearbyParkings || data.getNearbyParkings.length === 0) && (
                      <div className="text-center py-8">
                        <MapPinIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-sm font-semibold text-gray-600 mb-2">No Parking Spots Found</h3>
                        <p className="text-xs text-gray-500">Try adjusting your search radius or filters</p>
                        <button
                          onClick={() => setShowRadiusModal(true)}
                          className="mt-3 px-4 py-2 bg-orange-500 text-white text-xs hover:bg-orange-600 transition-colors"
                          style={{ borderRadius: generateBorderRadius() }}
                        >
                          Adjust Radius
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Map Container */}
            {renderMapContainer()}
          </div>
        )}
      </div>

      {/* Radius Configuration Modal */}
      {showRadiusModal && <RadiusConfigModal />}

      {/* Detail Modal */}
      {showDetailModal && selectedParking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div 
            className="bg-white max-w-md w-full shadow-2xl"
            style={{ borderRadius: generateBorderRadius() }}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center"
                  style={{ borderRadius: getResponsiveBorderRadius() }}
                >
                  <MapPinIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{selectedParking.name}</h2>
                  <p className="text-xs text-gray-600">Quick View</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 transition-colors"
                style={{ borderRadius: getResponsiveBorderRadius() }}
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-600">{selectedParking.address}</p>
              
              <div className="grid grid-cols-2 gap-3">
                <div 
                  className="bg-blue-50 p-3 border border-blue-100"
                  style={{ borderRadius: generateBorderRadius() }}
                >
                  <p className="text-xs text-blue-600 font-medium">Car Slots</p>
                  <p className="text-lg font-bold text-blue-800">
                    {selectedParking.available?.car || 0}/{selectedParking.capacity?.car || 0}
                  </p>
                </div>
                <div 
                  className="bg-purple-50 p-3 border border-purple-100"
                  style={{ borderRadius: generateBorderRadius() }}
                >
                  <p className="text-xs text-purple-600 font-medium">Bike Slots</p>
                  <p className="text-lg font-bold text-purple-800">
                    {selectedParking.available?.motorcycle || 0}/{selectedParking.capacity?.motorcycle || 0}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleParkingClick(selectedParking)}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                style={{ borderRadius: generateBorderRadius() }}
              >
                View Full Details
              </button>
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