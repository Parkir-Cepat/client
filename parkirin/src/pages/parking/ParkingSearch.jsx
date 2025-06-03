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
  
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);
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
  const [selectedParkingLot, setSelectedParkingLot] = useState(null); // Used in marker click handler
  const [viewMode, setViewMode] = useState('grid');
  const [favorites, setFavorites] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [popularLocations] = useState([
    { name: "Jakarta", count: 120 },
    { name: "Bandung", count: 85 },
    { name: "Surabaya", count: 73 },
    { name: "Yogyakarta", count: 64 },
    { name: "Bali", count: 50 }
  ]);
  // GraphQL query
  const { loading, data } = useQuery(GET_NEARBY_PARKINGS, {
    variables: {
      longitude: viewport.longitude,
      latitude: viewport.latitude,
      maxDistance: searchParams.radius,
      vehicleType: searchParams.vehicleType === 'all' ? null : searchParams.vehicleType
    },
    skip: !userLocation,
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
  }, [viewport.latitude, viewport.longitude, viewport.zoom]); // Include all dependencies

  // Get user's location
  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser');
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('User location obtained:', { latitude, longitude });
        
        setUserLocation({ latitude, longitude });
        setViewport({ latitude, longitude, zoom: 14 });
          // Update map center if map is loaded
        if (map.current) {
          map.current.setCenter({ lat: latitude, lng: longitude });
          map.current.setZoom(14);
          
          // Add user marker
          const userMarker = new window.google.maps.Marker({
            position: { lat: latitude, lng: longitude },
            map: map.current,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#4285F4",
              fillOpacity: 1,
              strokeColor: "#FFFFFF",
              strokeWeight: 2
            },
            title: "Your Location"
          });
          
          // Store user marker reference
          if (!markers.current.find(m => m.title === "Your Location")) {
            markers.current.push(userMarker);
          }
        }
      },
      (error) => {
        console.error('Error getting user location:', error.message);
      },
      options
    );
  }, [mapLoaded]);
  // Update markers when parking data changes
  useEffect(() => {
    if (!map.current || !data?.getNearbyParkings) return;
    
    // Clear existing markers
    markers.current.forEach(marker => marker.setMap(null));
    markers.current = [];      // Add markers for each parking lot
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
      location: searchData.location,
      dateTime: searchData.dateTime,
      duration: searchData.duration
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
        <div className="lg:col-span-1 space-y-6">
          <ParkingSearchBox 
            onSearch={handleSearch}
            recentSearches={recentSearches}
            popularLocations={popularLocations}
            loading={loading}
            className="shadow-md hover:shadow-lg transition-shadow"
          />
          
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
            </div>
          </Card>
          
          {/* Results */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {loading ? 'Searching...' : `${parkingLots.length} Parking Lots Found`}
              </h2>
            </div>
            
            <ParkingLotGrid
              parkingLots={parkingLots}
              loading={loading}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onFavoriteToggle={handleFavoriteToggle}
              className="mt-4"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkingSearch;
