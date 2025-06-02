import React, { useState, useRef } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { MagnifyingGlassIcon, MapPinIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const containerStyle = { width: '100%', height: '400px' };
const libraries = ['places'];

// Default center to Jakarta, Indonesia
const defaultCenter = { lat: -6.2088, lng: 106.8456 };

const MapPicker = ({ 
  center = defaultCenter, 
  onSelect, 
  showSearchBox = true, 
  className = "",
  height = "400px" 
}) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries
  });

  const [markerPosition, setMarkerPosition] = useState(center);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  
  const mapRef = useRef(null);
  const geocoderRef = useRef(null);

  // Initialize geocoder when map loads
  const onMapLoad = (map) => {
    mapRef.current = map;
    if (window.google && window.google.maps) {
      geocoderRef.current = new window.google.maps.Geocoder();
      // Get initial address from coordinates
      reverseGeocode(markerPosition);
    }
  };

  // Reverse geocode to get address from coordinates
  const reverseGeocode = async (position) => {
    if (!geocoderRef.current) return;
    
    try {
      const response = await new Promise((resolve, reject) => {
        geocoderRef.current.geocode(
          { location: position },
          (results, status) => {
            if (status === 'OK') resolve(results);
            else reject(status);
          }
        );
      });
      
      if (response && response[0]) {
        setSelectedAddress(response[0].formatted_address);
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      setSelectedAddress('Alamat tidak ditemukan');
    }
  };

  // Search for places
  const handleSearch = async () => {
    if (!searchQuery.trim() || !geocoderRef.current) return;
    
    setIsSearching(true);
    setSearchError('');
    
    try {
      const response = await new Promise((resolve, reject) => {
        geocoderRef.current.geocode(
          { 
            address: searchQuery,
            componentRestrictions: { country: 'ID' } // Restrict to Indonesia
          },
          (results, status) => {
            if (status === 'OK') resolve(results);
            else reject(status);
          }
        );
      });
      
      if (response && response[0]) {
        const location = response[0].geometry.location;
        const newPosition = {
          lat: location.lat(),
          lng: location.lng()
        };
        
        setMarkerPosition(newPosition);
        setSelectedAddress(response[0].formatted_address);
        
        // Pan map to new location
        if (mapRef.current) {
          mapRef.current.panTo(newPosition);
          mapRef.current.setZoom(16);
        }
        
        // Notify parent component
        onSelect(newPosition);
        setSearchQuery('');
      }
    } catch (error) {
      console.error('Geocoding failed:', error);
      setSearchError('Lokasi tidak ditemukan. Coba dengan nama tempat yang lebih spesifik.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const newPosition = { lat, lng };
    
    setMarkerPosition(newPosition);
    onSelect(newPosition);
    reverseGeocode(newPosition);
  };

  const handleDragEnd = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const newPosition = { lat, lng };
    
    setMarkerPosition(newPosition);
    onSelect(newPosition);
    reverseGeocode(newPosition);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <div className="text-center">
          <p className="text-red-600 font-medium">Gagal memuat peta</p>
          <p className="text-sm text-gray-500 mt-1">Periksa koneksi internet Anda</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Memuat peta...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {showSearchBox && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Cari alamat atau nama tempat..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
            <button
              type="button"
              onClick={handleSearch}
              disabled={!searchQuery.trim() || isSearching}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSearching ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <MagnifyingGlassIcon className="w-4 h-4" />
              )}
              Cari
            </button>
          </div>
          
          {searchError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{searchError}</p>
            </div>
          )}
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <InformationCircleIcon className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-blue-700 text-sm">
                <p className="font-medium mb-1">Tips penggunaan:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Cari dengan nama tempat: "Mall Central Park Jakarta"</li>
                  <li>• Atau klik langsung pada peta untuk memilih lokasi</li>
                  <li>• Seret marker untuk menyesuaikan posisi yang tepat</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative">
        <GoogleMap
          mapContainerStyle={{ ...containerStyle, height }}
          center={markerPosition}
          zoom={15}
          onClick={handleMapClick}
          onLoad={onMapLoad}
          options={{
            streetViewControl: false,
            mapTypeControl: true,
            fullscreenControl: false
          }}
        >
          <Marker
            position={markerPosition}
            draggable
            onDragEnd={handleDragEnd}
            title="Seret untuk mengubah posisi"
          />
        </GoogleMap>
      </div>

      {selectedAddress && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <MapPinIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-green-700 font-medium text-sm">Lokasi Terpilih:</p>
              <p className="text-green-600 text-sm mt-1">{selectedAddress}</p>
              <p className="text-green-600 text-xs mt-1">
                Koordinat: {markerPosition.lat.toFixed(6)}, {markerPosition.lng.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPicker;
