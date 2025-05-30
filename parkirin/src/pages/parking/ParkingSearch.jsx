import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@apollo/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import GoogleMapsService from '../../services/googleMapsService';
import { GET_NEARBY_PARKINGS } from '../../graphql/queries';

const ParkingSearch = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);
  
  const [mapLoaded, setMapLoaded] = useState(false);
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
          // Import marker library
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
          
          const userMarker = new AdvancedMarkerElement({
            position: { lat: userLocation.latitude, lng: userLocation.longitude },
            map: map.current,
            title: 'Your Location',
            content: markerElement
          });
            markers.current.push(userMarker);
        } catch (error) {
          console.warn('Error creating user location marker:', error);
        }
      }

      // Add parking spot markers using integrated service
      if (data?.getNearbyParkings) {
        try {
          // Global function for parking selection (called from info window)
          window.selectParking = (parkingId) => {
            const selectedParking = data.getNearbyParkings.find(p => p._id === parkingId);
            if (selectedParking) {
              console.log('Selected parking:', selectedParking);
              // TODO: Navigate to booking page or show booking modal
              alert(`Selected parking: ${selectedParking.name}`);
            }
          };
            const parkingMarkers = await GoogleMapsService.createParkingMarkers(
            map.current,
            data.getNearbyParkings,
            (parkingData) => {
              console.log('Parking marker clicked:', parkingData);
              // You can add additional click handling here
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

  if (loading) return <LoadingSpinner size="large" />;
  if (error) return <div>Error loading parking spots</div>;

  return (
    <div className="h-[calc(100vh-64px)] bg-[#f9fafb]">
      <div className="grid grid-cols-1 md:grid-cols-3 h-full">
        {/* Filters */}
        <div className="p-6 bg-white border-r border-gray-100 rounded-xl shadow-lg m-4 md:m-6 md:mr-0">
          <h2 className="text-xl font-bold text-[#f16634] mb-6">Search Filters</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Radius (km)</label>
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
                className="w-full accent-[#f16634]"
              />
              <span className="text-sm text-[#f16634] font-bold">{searchParams.radius / 1000} km</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
              <select
                value={searchParams.vehicleType}
                onChange={(e) => setSearchParams(prev => ({
                  ...prev,
                  vehicleType: e.target.value
                }))}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f16634] focus:border-[#f16634] sm:text-sm rounded-md"
              >
                <option value="all">All</option>
                <option value="car">Car</option>
                <option value="motorcycle">Motorcycle</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price Range (Rp)</label>
              <div className="mt-1 grid grid-cols-2 gap-4">
                <input
                  type="number"
                  value={searchParams.minPrice}
                  onChange={(e) => setSearchParams(prev => ({
                    ...prev,
                    minPrice: parseFloat(e.target.value)
                  }))}
                  placeholder="Min"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#f16634] focus:border-[#f16634] sm:text-sm"
                />
                <input
                  type="number"
                  value={searchParams.maxPrice}
                  onChange={(e) => setSearchParams(prev => ({
                    ...prev,
                    maxPrice: parseFloat(e.target.value)
                  }))}
                  placeholder="Max"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#f16634] focus:border-[#f16634] sm:text-sm"
                />
              </div>
            </div>
          </div>
          {/* Results List */}
          <div className="mt-8">
            <h3 className="text-lg font-bold text-[#f16634] mb-4">Available Parking Spots</h3>
            <div className="space-y-4">
              {data?.getNearbyParkings?.map((spot) => (
                <div
                  key={spot._id}
                  className="bg-white p-4 rounded-xl shadow border border-gray-100 hover:shadow-lg transition-shadow flex flex-col gap-2"
                >
                  <h4 className="font-bold text-[#f16634] text-lg mb-1">{spot.name}</h4>
                  <p className="text-sm text-gray-500 mb-1">{spot.address}</p>
                  <div className="flex flex-wrap gap-2 items-center text-sm">
                    <span className="bg-[#f16634]/10 text-[#f16634] px-2 py-1 rounded-full font-bold">Car: Rp {spot.rates?.car || 0}/hour</span>
                    <span className="bg-[#f16634]/10 text-[#f16634] px-2 py-1 rounded-full font-bold">Motorcycle: Rp {spot.rates?.motorcycle || 0}/hour</span>
                    <span className="text-gray-500">Cars: {spot.available?.car || 0} | Motorcycles: {spot.available?.motorcycle || 0} available</span>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center text-sm">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full font-bold">{spot.status || 'Open'}</span>
                    <span className="flex items-center gap-1 text-yellow-600 font-bold">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 15.585l6.146 3.233-.927-7.037L20 6.798l-6.884-.645L10 0 6.884 6.153 0 6.798l4.781 4.983-.927 7.037L10 15.585z" clipRule="evenodd" /></svg>
                      {spot.rating || 'N/A'} ({spot.review_count || 0} reviews)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>        {/* Map */}
        <div className="col-span-2 relative rounded-xl overflow-hidden m-4 md:m-6 md:ml-0 shadow-lg">
          <div 
            ref={mapContainer}
            style={{ width: '100%', height: '100%', minHeight: '400px' }}
          />
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <LoadingSpinner size="large" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParkingSearch;
