import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MagnifyingGlassIcon, MapPinIcon, XMarkIcon } from '@heroicons/react/24/outline';

const LocationPicker = ({ 
  onLocationSelect, 
  initialLocation = null, 
  initialAddress = '',
  isOpen = false,
  onClose 
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const autocompleteService = useRef(null);
  const placesService = useRef(null);
  
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [selectedAddress, setSelectedAddress] = useState(initialAddress);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [mapError, setMapError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  // Load Google Maps API
  const loadGoogleMaps = useCallback(async () => {
    console.log('Loading Google Maps API...');
    if (window.google && window.google.maps) {
      console.log('Google Maps already loaded');
      setMapsLoaded(true);
      return;
    }

    try {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      console.log('API Key:', apiKey ? 'Found' : 'Not found');
      if (!apiKey) {
        throw new Error('Google Maps API key not found');
      }

      // Check if script already exists
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        console.log('Google Maps script already exists');
        setMapsLoaded(true);
        return;
      }

      // Create script element
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('Google Maps API loaded successfully');
        setMapsLoaded(true);
      };
      
      script.onerror = () => {
        console.error('Failed to load Google Maps API');
        setMapError('Failed to load Google Maps API');
      };

      document.head.appendChild(script);
    } catch (error) {
      console.error('Error loading Google Maps:', error);
      setMapError('Failed to load Google Maps');
    }
  }, []);

  // Reverse geocode location to get address
  const reverseGeocode = useCallback(async (location) => {
    try {
      if (!window.google || !window.google.maps) return;

      const geocoder = new window.google.maps.Geocoder();
      const results = await new Promise((resolve, reject) => {
        geocoder.geocode(
          { location: { lat: location.lat, lng: location.lng } },
          (results, status) => {
            if (status === 'OK' && results[0]) {
              resolve(results);
            } else {
              reject(new Error('Geocoding failed'));
            }
          }
        );
      });

      if (results[0]) {
        setSelectedAddress(results[0].formatted_address);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      setSelectedAddress('Address not found');
    }
  }, []);

  // Add marker to map
  const addMarker = useCallback((location) => {
    if (!map.current || !window.google) return;

    // Remove existing marker
    if (marker.current) {
      marker.current.setMap(null);
    }

    // Add new marker
    marker.current = new window.google.maps.Marker({
      position: location,
      map: map.current,
      draggable: true,
      animation: window.google.maps.Animation.DROP,
      title: 'Selected Location'
    });

    // Add drag listener
    marker.current.addListener('dragend', (event) => {
      const newLocation = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };
      setSelectedLocation(newLocation);
      reverseGeocode(newLocation);
    });
  }, [reverseGeocode]);

  // Initialize map
  const initializeMap = useCallback(async () => {
    if (!mapContainer.current || !window.google || !mapsLoaded) return;

    try {
      const defaultLocation = selectedLocation || { lat: -6.2088, lng: 106.8456 }; // Jakarta

      map.current = new window.google.maps.Map(mapContainer.current, {
        center: defaultLocation,
        zoom: 15,
        styles: [
          {
            featureType: 'poi.business',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      // Initialize services
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
      placesService.current = new window.google.maps.places.PlacesService(map.current);

      // Add click listener
      map.current.addListener('click', (event) => {
        const location = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng()
        };
        setSelectedLocation(location);
        addMarker(location);
        reverseGeocode(location);
      });

      // Add initial marker if location exists
      if (selectedLocation) {
        addMarker(selectedLocation);
      }
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Failed to load map');
    }
  }, [selectedLocation, addMarker, reverseGeocode, mapsLoaded]);

  // Search functionality
  const handleSearch = useCallback(async (query) => {
    if (!query.trim() || !autocompleteService.current) return;

    try {
      setIsLoading(true);
      const request = {
        input: query,
        componentRestrictions: { country: 'ID' }
      };

      autocompleteService.current.getPlacePredictions(request, (predictions, status) => {
        setIsLoading(false);
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSearchResults(predictions.slice(0, 5));
        } else {
          setSearchResults([]);
        }
      });
    } catch (error) {
      console.error('Error searching places:', error);
      setIsLoading(false);
    }
  }, []);

  const selectSearchResult = useCallback((placeId) => {
    if (!placesService.current) return;

    placesService.current.getDetails({ placeId }, (place, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && place.geometry) {
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        
        setSelectedLocation(location);
        setSelectedAddress(place.formatted_address || place.name);
        addMarker(location);
        
        if (map.current) {
          map.current.setCenter(location);
          map.current.setZoom(17);
        }
        
        setSearchQuery('');
        setSearchResults([]);
      }
    });
  }, [addMarker]);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        setSelectedLocation(location);
        addMarker(location);
        reverseGeocode(location);
        
        if (map.current) {
          map.current.setCenter(location);
          map.current.setZoom(17);
        }
        
        setIsLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Failed to get location. Please allow location access.');
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [addMarker, reverseGeocode]);

  // Effects
  useEffect(() => {
    if (isOpen) {
      loadGoogleMaps();
    }
  }, [isOpen, loadGoogleMaps]);

  useEffect(() => {
    if (mapsLoaded && isOpen) {
      // Small delay to ensure DOM is rendered
      const timer = setTimeout(() => {
        initializeMap();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [mapsLoaded, isOpen, initializeMap]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, handleSearch]);

  // Event handlers
  const handleConfirm = () => {
    if (selectedLocation && selectedAddress) {
      onLocationSelect({
        coordinates: [selectedLocation.lng, selectedLocation.lat], // [longitude, latitude] format
        address: selectedAddress
      });
      onClose();
    }
  };
  const handleCancel = () => {
    onClose();
  };

  console.log('LocationPicker render - isOpen:', isOpen, 'mapsLoaded:', mapsLoaded, 'mapError:', mapError);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleCancel}></div>
      
      {/* Modal Container */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] max-h-[800px] flex flex-col overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-orange-600">
            <div>
              <h3 className="text-xl font-bold text-white">Pick Parking Location</h3>
              <p className="text-orange-100 text-sm mt-1">Click on the map or search for an address to select location</p>
            </div>
            <button
              onClick={handleCancel}
              className="text-white hover:text-orange-200 transition-colors p-1 rounded-full hover:bg-white/10"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex overflow-hidden">
            
            {/* Left Panel - Search & Info */}
            <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
              
              {/* Search Section */}
              <div className="p-4 bg-white border-b border-gray-200">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search address or place..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  />
                  <button
                    onClick={getCurrentLocation}
                    disabled={isLoading}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-orange-500 hover:text-orange-600 disabled:opacity-50"
                    title="Use current location"
                  >
                    <MapPinIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {searchResults.map((result) => (
                      <button
                        key={result.place_id}
                        onClick={() => selectSearchResult(result.place_id)}
                        className="w-full px-4 py-3 text-left hover:bg-orange-50 border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div className="font-medium text-gray-900 text-sm">{result.structured_formatting.main_text}</div>
                        <div className="text-xs text-gray-500 mt-1">{result.structured_formatting.secondary_text}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Location Info */}
              <div className="flex-1 p-4">
                {selectedLocation && selectedAddress ? (
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <MapPinIcon className="h-5 w-5 text-green-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Selected Location</h4>
                        <p className="text-sm text-gray-700 leading-relaxed mb-3">{selectedAddress}</p>
                        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                          <p><span className="font-medium">Latitude:</span> {selectedLocation.lat.toFixed(6)}</p>
                          <p><span className="font-medium">Longitude:</span> {selectedLocation.lng.toFixed(6)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg p-6 border border-gray-200 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MapPinIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Select Location</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Click on the map to set parking location or use search above
                    </p>
                  </div>
                )}

                {/* Instructions */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h5 className="text-xs font-medium text-blue-900 mb-2">Instructions:</h5>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Click on map to select location</li>
                    <li>• Drag marker to adjust position</li>
                    <li>• Use search for specific location</li>
                    <li>• Press location icon for current position</li>
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex space-x-3">
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={!selectedLocation || !selectedAddress}
                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>

            {/* Right Panel - Map */}
            <div className="flex-1 relative">
              {mapError ? (
                <div className="flex items-center justify-center h-full bg-gray-100">
                  <div className="text-center p-8">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <XMarkIcon className="h-8 w-8 text-red-500" />
                    </div>
                    <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Map</h3>
                    <p className="text-red-700 mb-4">{mapError}</p>
                    <button
                      onClick={loadGoogleMaps}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div ref={mapContainer} className="w-full h-full" />
                  
                  {/* Loading Overlay */}
                  {(isLoading || !mapsLoaded) && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
                        <p className="text-gray-600 font-medium">Loading map...</p>
                      </div>
                    </div>
                  )}

                  {/* Map Controls Overlay */}
                  <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2">
                    <button
                      onClick={getCurrentLocation}
                      disabled={isLoading}
                      className="p-2 text-orange-500 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors disabled:opacity-50"
                      title="My location"
                    >
                      <MapPinIcon className="h-5 w-5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;
