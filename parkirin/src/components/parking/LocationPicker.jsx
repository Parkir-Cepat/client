import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MagnifyingGlassIcon, MapPinIcon, XMarkIcon } from '@heroicons/react/24/outline';
import GoogleMapsService from '../../services/googleMapsService';

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
  
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [selectedAddress, setSelectedAddress] = useState(initialAddress);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [mapError, setMapError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Helper functions
  const reverseGeocode = useCallback(async (location) => {
    try {
      const address = await GoogleMapsService.reverseGeocode(location.lat, location.lng);
      setSelectedAddress(address);
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      setSelectedAddress('Alamat tidak ditemukan');
    }
  }, []);

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
      title: 'Lokasi Terpilih'
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

  const initializeMap = useCallback(async () => {
    if (!mapContainer.current || !window.google) return;

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

      setMapLoaded(true);
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Gagal memuat peta');
    }
  }, [selectedLocation, addMarker, reverseGeocode]);

  const loadGoogleMaps = useCallback(async () => {
    try {
      await GoogleMapsService.loadGoogleMapsAPI();
      initializeMap();
    } catch (error) {
      console.error('Error loading Google Maps:', error);
      setMapError('Gagal memuat Google Maps API');
    }
  }, [initializeMap]);

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
      alert('Geolokasi tidak didukung oleh browser ini');
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
        alert('Gagal mendapatkan lokasi. Pastikan Anda mengizinkan akses lokasi.');
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [addMarker, reverseGeocode]);

  // Effects
  useEffect(() => {
    if (isOpen && !mapLoaded) {
      loadGoogleMaps();
    }
  }, [isOpen, mapLoaded, loadGoogleMaps]);

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
        coordinates: selectedLocation,
        address: selectedAddress
      });
      onClose();
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleCancel}></div>
        
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl h-[600px] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Pilih Lokasi Parkir</h3>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari alamat atau tempat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <button
                onClick={getCurrentLocation}
                disabled={isLoading}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-orange-500 hover:text-orange-600 disabled:opacity-50"
              >
                <MapPinIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {searchResults.map((result) => (
                  <button
                    key={result.place_id}
                    onClick={() => selectSearchResult(result.place_id)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">{result.structured_formatting.main_text}</div>
                    <div className="text-sm text-gray-500">{result.structured_formatting.secondary_text}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Map Container */}
          <div className="flex-1 relative">
            {mapError ? (
              <div className="flex items-center justify-center h-full text-red-500">
                <div className="text-center">
                  <p className="text-lg font-medium">Error: {mapError}</p>
                  <button
                    onClick={loadGoogleMaps}
                    className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    Coba Lagi
                  </button>
                </div>
              </div>
            ) : (
              <div ref={mapContainer} className="w-full h-full" />
            )}
            
            {isLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Memuat...</p>
                </div>
              </div>
            )}
          </div>

          {/* Selected Location Info */}
          {selectedLocation && selectedAddress && (
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-start space-x-3">
                <MapPinIcon className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Lokasi Terpilih:</p>
                  <p className="text-sm text-gray-600">{selectedAddress}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Koordinat: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-4 border-t border-gray-200">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedLocation || !selectedAddress}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Konfirmasi Lokasi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;
