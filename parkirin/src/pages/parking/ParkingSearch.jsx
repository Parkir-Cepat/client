import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@apollo/client';
import { Card, Badge, Button, LoadingSpinner } from '../../components/common';
import { ParkingSearchBox, ParkingLotGrid } from '../../components/parking';
import GoogleMapsService from '../../services/googleMapsService';
import { GET_NEARBY_PARKINGS } from '../../graphql/queries';

const ParkingSearch = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);
  const userLocationRef = useRef(null);
  
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);const [viewport, setViewport] = useState({
    latitude: -7.7956,  // Default to Yogyakarta coordinates (more central Indonesia)
    longitude: 110.3695,
    zoom: 13
  });

  const [searchParams, setSearchParams] = useState({
    radius: 2000, // 2km radius
    vehicleType: 'all',
    minPrice: 0,
    maxPrice: 100000
  });  const [userLocation, setUserLocation] = useState(null);
  const [selectedParkingLot, setSelectedParkingLot] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [favorites, setFavorites] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [popularLocations] = useState([
    { name: "Jakarta", count: 120 },
    { name: "Bandung", count: 85 },
    { name: "Surabaya", count: 73 },
    { name: "Yogyakarta", count: 64 },
    { name: "Bali", count: 50 }
  ]);  // GraphQL query
  const { loading, data } = useQuery(GET_NEARBY_PARKINGS, {
    variables: {
      longitude: userLocation?.longitude || viewport.longitude,
      latitude: userLocation?.latitude || viewport.latitude,
      maxDistance: searchParams.radius,
      vehicleType: searchParams.vehicleType === 'all' ? null : searchParams.vehicleType
    },
    skip: false, // Always run query, use default coordinates if userLocation not available
  });

  // Initialize Google Maps with better error handling
  useEffect(() => {
    const initMap = async () => {
      if (!mapContainer.current || map.current) return;
      
      try {
        setMapError(null);
        console.log('Initializing Google Maps...');
        
        // Create map instance
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
            }
          ],
          gestureHandling: 'auto',
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true
        });
        
        console.log('Map created successfully');
        setMapLoaded(true);
        
      } catch (error) {
        console.error('Error initializing Google Maps:', error);
        setMapError(error.message);
      }    };

    // Add delay to ensure component is mounted
    const timeoutId = setTimeout(initMap, 100);
    
    return () => clearTimeout(timeoutId);
  }, [viewport.latitude, viewport.longitude, viewport.zoom]); // Include all dependencies  // Get user's location with better accuracy and real-time tracking
  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser');
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds timeout
      maximumAge: 60000 // 1 minute cache for initial position
    };

    const watchOptions = {
      enableHighAccuracy: true,
      timeout: 5000, // Shorter timeout for watch updates
      maximumAge: 30000 // 30 seconds cache for watch position
    };

    let isFirstPosition = true;

    const successCallback = (position) => {
      const { latitude, longitude, accuracy } = position.coords;
      const timestamp = new Date(position.timestamp);
      
      console.log('User location obtained:', { 
        latitude, 
        longitude, 
        accuracy: `${accuracy}m`,
        timestamp: timestamp.toLocaleString(),
        isFirst: isFirstPosition
      });
      
      // Validate coordinates are within reasonable bounds for Indonesia
      if (latitude >= -11 && latitude <= 6 && longitude >= 95 && longitude <= 141) {
        setUserLocation({ latitude, longitude });
          // Only update viewport on first position or if user moved significantly
        if (isFirstPosition || !userLocationRef.current || 
            Math.abs(latitude - userLocationRef.current.latitude) > 0.001 || 
            Math.abs(longitude - userLocationRef.current.longitude) > 0.001) {
          
          setViewport({ latitude, longitude, zoom: 15 });
        }
        
        // Update ref
        userLocationRef.current = { latitude, longitude };
        
        // Update map center if map is loaded
        if (map.current) {
          // Only recenter on first position to avoid constant map jumping
          if (isFirstPosition) {
            map.current.setCenter({ lat: latitude, lng: longitude });
            map.current.setZoom(15);
          }
          
          // Clear existing user marker
          markers.current.forEach(marker => {
            if (marker.title === "Your Location") {
              marker.setMap(null);
            }
          });
          markers.current = markers.current.filter(marker => marker.title !== "Your Location");
          
          // Add new user marker with distinctive styling and pulsing animation
          const userMarker = new window.google.maps.Marker({
            position: { lat: latitude, lng: longitude },
            map: map.current,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 15,
              fillColor: "#4285F4", // Google blue
              fillOpacity: 0.8,
              strokeColor: "#FFFFFF",
              strokeWeight: 4
            },
            title: "Your Location",
            zIndex: 1000 // Ensure it appears on top
          });
          
          // Add accuracy circle
          const accuracyCircle = new window.google.maps.Circle({
            center: { lat: latitude, lng: longitude },
            radius: accuracy,
            fillColor: "#4285F4",
            fillOpacity: 0.1,
            strokeColor: "#4285F4",
            strokeOpacity: 0.3,
            strokeWeight: 1,
            map: map.current
          });
          
          // Add info window for user location
          const userInfoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 8px; font-family: Arial, sans-serif;">
                <h3 style="margin: 0 0 8px 0; color: #1976d2; font-size: 16px;">📍 Your Current Location</h3>
                <div style="font-size: 12px; color: #666; line-height: 1.4;">
                  <strong>Coordinates:</strong><br>
                  Lat: ${latitude.toFixed(6)}<br>
                  Lng: ${longitude.toFixed(6)}<br>
                  <strong>Accuracy:</strong> ${accuracy.toFixed(0)}m<br>
                  <strong>Last Update:</strong> ${timestamp.toLocaleTimeString()}
                </div>
              </div>
            `
          });
          
          userMarker.addListener('click', () => {
            userInfoWindow.open(map.current, userMarker);
          });
          
          // Store marker references
          markers.current.push(userMarker);
          markers.current.push(accuracyCircle);
        }
        
        isFirstPosition = false;
      } else {
        console.warn('Location coordinates appear to be outside Indonesia bounds:', { latitude, longitude });
      }
    };

    const errorCallback = (error) => {
      let errorMessage = 'Error getting user location: ';
      switch(error.code) {
        case error.PERMISSION_DENIED:
          errorMessage += 'Location access denied. Please enable location permissions.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage += 'Location information is unavailable. Please check your GPS.';
          break;
        case error.TIMEOUT:
          errorMessage += 'Location request timed out. Trying again...';
          break;
        default:
          errorMessage += 'An unknown error occurred.';
          break;
      }
      console.error(errorMessage);
      
      // Show user-friendly error message
      setMapError(errorMessage);
    };

    // Get initial position
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);
    
    // Watch position for real-time updates
    const watchId = navigator.geolocation.watchPosition(successCallback, errorCallback, watchOptions);

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        console.log('Stopped watching user location');
      }
    };
  }, [mapLoaded]); // Only depend on mapLoaded to avoid infinite loops  // Update markers when parking data changes
  useEffect(() => {
    if (!map.current || !data?.getNearbyParkings) return;
    
    // Clear existing parking lot markers only (preserve user location markers)
    markers.current.forEach(marker => {
      if (marker.title !== "Your Location" && !marker.center) { // Not user location marker or accuracy circle
        marker.setMap(null);
      }
    });
    markers.current = markers.current.filter(marker => 
      marker.title === "Your Location" || marker.center // Keep user location markers and accuracy circle
    );// Add markers for each parking lot
    data.getNearbyParkings.forEach(lot => {
      if (!lot.location || !lot.location.coordinates) return;
      
      const [longitude, latitude] = lot.location.coordinates;
      
      const marker = new window.google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: map.current,
        title: lot.name,
        icon: {
          path: "M12,2C8.13,2 5,5.13 5,9c0,5.25 7,13 7,13s7,-7.75 7,-13c0,-3.87 -3.13,-7 -7,-7zM12,11.5c-1.38,0 -2.5,-1.12 -2.5,-2.5s1.12,-2.5 2.5,-2.5 2.5,1.12 2.5,2.5 -1.12,2.5 -2.5,2.5z",
          fillColor: "#f16634",
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 1,
          scale: 2,
          anchor: new window.google.maps.Point(12, 22)
        }
      });
      
      // Add click listener to marker
      marker.addListener('click', () => {
        setSelectedParkingLot(lot);
        
        // Center map on selected parking lot
        map.current.panTo({ lat: latitude, lng: longitude });
        map.current.setZoom(16);
      });
      
      markers.current.push(marker);
    });
  }, [data]);
  const handleSearch = (searchData) => {
    // Save to recent searches
    const newSearch = {
      location: searchData.location
    };
    
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s.location !== searchData.location);
      return [newSearch, ...filtered].slice(0, 5);
    });
    
    // TODO: Implement geocoding to get coordinates from location string
    // For now, we'll just use the map center
    console.log('Search data:', searchData);
  };
  const handleFavoriteToggle = (id) => {
    setFavorites(prev => {
      if (prev.includes(id)) {
        return prev.filter(favId => favId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Function to manually refresh user location
  const refreshUserLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser');
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0 // Force fresh location
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('Manual location refresh:', { latitude, longitude });
        
        setUserLocation({ latitude, longitude });
        userLocationRef.current = { latitude, longitude };
        setViewport({ latitude, longitude, zoom: 15 });
        
        if (map.current) {
          map.current.setCenter({ lat: latitude, lng: longitude });
          map.current.setZoom(15);
        }
      },
      (error) => {
        console.error('Error refreshing location:', error);
        alert('Could not get your current location. Please check your location settings.');
      },
      options
    );
  };

  // Function to center map on user location
  const centerOnUserLocation = () => {
    if (userLocation && map.current) {
      map.current.setCenter({ lat: userLocation.latitude, lng: userLocation.longitude });
      map.current.setZoom(15);
    } else {
      refreshUserLocation();
    }
  };
  // Transform data for ParkingLotGrid component
  const parkingLots = data?.getNearbyParkings?.map(lot => ({
    ...lot,
    isFavorite: favorites.includes(lot._id)
  })) || [];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Find Parking</h1>
        <p className="text-gray-600">Search for available parking spots near your destination</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search Panel */}
        <div className="lg:col-span-1 space-y-6">          <ParkingSearchBox 
            onSearch={handleSearch}
            recentSearches={recentSearches}
            popularLocations={popularLocations}
            loading={loading}
            className="shadow-md hover:shadow-lg transition-shadow"
          />
          
          {/* Location Controls */}
          <Card className="p-4 shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">📍 Location Controls</h3>
            <div className="space-y-2">
              {userLocation && (
                <div className="text-xs text-gray-600 mb-2">
                  Current: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="small"
                  onClick={refreshUserLocation}
                  className="flex-1 text-xs"
                >
                  🔄 Refresh Location
                </Button>
                <Button
                  variant="outline"
                  size="small"
                  onClick={centerOnUserLocation}
                  className="flex-1 text-xs"
                  disabled={!userLocation}
                >
                  🎯 Center Map
                </Button>
              </div>
              {mapError && (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                  {mapError}
                </div>
              )}
            </div>
          </Card>
          
          {/* Filters Card */}
          <Card className="p-6 shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
            
            <div className="space-y-4">
              {/* Vehicle Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
                <div className="flex gap-2">
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-lg border ${
                      searchParams.vehicleType === 'all'
                        ? 'bg-orange-50 text-orange-600 border-orange-300'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setSearchParams(prev => ({ ...prev, vehicleType: 'all' }))}
                  >
                    All
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-lg border ${
                      searchParams.vehicleType === 'car'
                        ? 'bg-orange-50 text-orange-600 border-orange-300'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setSearchParams(prev => ({ ...prev, vehicleType: 'car' }))}
                  >
                    Car
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-lg border ${
                      searchParams.vehicleType === 'motorcycle'
                        ? 'bg-orange-50 text-orange-600 border-orange-300'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setSearchParams(prev => ({ ...prev, vehicleType: 'motorcycle' }))}
                  >
                    Motorcycle
                  </button>
                </div>
              </div>
              
              {/* Distance Filter */}
              <div>
                <div className="flex justify-between">
                  <label className="block text-sm font-medium text-gray-700">Distance</label>
                  <span className="text-sm text-gray-500">{searchParams.radius / 1000} km</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="5000"
                  step="500"
                  value={searchParams.radius}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, radius: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500 mt-2"
                />
              </div>
              
              {/* Price Filter */}
              <div>
                <div className="flex justify-between">
                  <label className="block text-sm font-medium text-gray-700">Price Range</label>
                  <span className="text-sm text-gray-500">
                    Rp {searchParams.minPrice.toLocaleString('id-ID')} - Rp {searchParams.maxPrice.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="mt-2">
                  {/* Double range slider would be ideal here, but for simplicity using separate sliders */}
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    step="5000"
                    value={searchParams.minPrice}
                    onChange={(e) => setSearchParams(prev => ({ 
                      ...prev, 
                      minPrice: parseInt(e.target.value),
                      maxPrice: Math.max(prev.maxPrice, parseInt(e.target.value))
                    }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500 mb-3"
                  />
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    step="5000"
                    value={searchParams.maxPrice}
                    onChange={(e) => setSearchParams(prev => ({ 
                      ...prev, 
                      maxPrice: parseInt(e.target.value),
                      minPrice: Math.min(prev.minPrice, parseInt(e.target.value))
                    }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                </div>
              </div>
              
              {/* Filter Actions */}
              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  size="medium"
                  className="flex-1"
                  onClick={() => setSearchParams({
                    radius: 2000,
                    vehicleType: 'all',
                    minPrice: 0,
                    maxPrice: 100000
                  })}
                >
                  Reset
                </Button>
                <Button 
                  variant="primary" 
                  size="medium" 
                  className="flex-1"
                >
                  Apply
                </Button>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Map and Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Map Container */}
          <Card className="overflow-hidden shadow-md">
            <div className="h-[400px] relative">
              {!mapLoaded && !mapError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <LoadingSpinner size="large" variant="pulse" text="Loading map..." />
                </div>
              )}
              
              {mapError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 p-4">
                  <div className="text-center">
                    <div className="text-red-500 text-3xl mb-2">⚠️</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Map could not be loaded</h3>
                    <p className="text-gray-600 text-sm">{mapError}</p>
                  </div>
                </div>
              )}
                <div 
                ref={mapContainer} 
                className="w-full h-full"
                style={{ display: mapError ? 'none' : 'block' }}
              />
              
              {/* Floating Location Button */}
              {mapLoaded && (
                <button
                  onClick={centerOnUserLocation}
                  className="absolute bottom-4 right-4 bg-white hover:bg-gray-50 p-3 rounded-full shadow-lg border border-gray-200 transition-all duration-200 hover:shadow-xl"
                  title="Go to my location"
                  disabled={!userLocation}
                >
                  <svg 
                    className={`w-5 h-5 ${userLocation ? 'text-blue-600' : 'text-gray-400'}`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </Card>
          
          {/* Results */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {loading ? 'Searching...' : `${parkingLots.length} Parking Lots Found`}
              </h2>
            </div>            <ParkingLotGrid
              parkingLots={parkingLots}
              loading={loading}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onFavoriteToggle={handleFavoriteToggle}
              onParkingLotSelect={setSelectedParkingLot}
              className="mt-4"
            />
          </div>
        </div>
      </div>

      {/* Selected Parking Lot Detail Modal */}
      {selectedParkingLot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedParkingLot.name}</h2>
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => setSelectedParkingLot(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </Button>
              </div>
              
              {/* Parking Lot Image */}
              <div className="mb-4">
                <img
                  src={selectedParkingLot.images?.[0] || '/images/parking-default.jpg'}
                  alt={selectedParkingLot.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
              
              {/* Parking Lot Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Location</h3>
                  <p className="text-gray-600">{selectedParkingLot.address}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Price per Hour</h4>
                    <p className="text-orange-600 font-semibold">
                      Rp {selectedParkingLot.pricePerHour?.toLocaleString('id-ID') || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Capacity</h4>
                    <p className="text-gray-600">{selectedParkingLot.capacity} spots</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedParkingLot.features?.map((feature, index) => (
                      <Badge key={index} variant="secondary" size="small">
                        {feature}
                      </Badge>
                    )) || <span className="text-gray-500">No features listed</span>}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">Operating Hours</h4>
                  <p className="text-gray-600">
                    {selectedParkingLot.operatingHours || '24/7'}
                  </p>
                </div>
                
                {selectedParkingLot.description && (
                  <div>
                    <h4 className="font-medium text-gray-900">Description</h4>
                    <p className="text-gray-600">{selectedParkingLot.description}</p>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <Button
                  variant="primary"
                  size="medium"
                  className="flex-1"
                  onClick={() => {
                    // Navigate to booking page or handle booking
                    console.log('Book parking:', selectedParkingLot);
                  }}
                >
                  Book Now
                </Button>
                <Button
                  variant="outline"
                  size="medium"
                  onClick={() => {
                    // Add to favorites
                    handleFavoriteToggle(selectedParkingLot.id);
                  }}
                >
                  ♡ Favorite
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ParkingSearch;
