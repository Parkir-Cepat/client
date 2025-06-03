import React, { useState, useEffect, useRef } from 'react';
import { MapPinIcon } from '@heroicons/react/24/outline';

const SimpleParkingMap = ({
  parkingLots = [],
  userLocation = null, // eslint-disable-line no-unused-vars
  onParkingClick = null,
  height = '300px',
  className = ''
}) => {
  const mapContainer = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error] = useState(null);

  useEffect(() => {
    // Simulate loading time for now
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleParkingClick = (parking) => {
    if (onParkingClick) {
      onParkingClick(parking);
    }
  };

  if (loading) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="flex flex-col items-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <p className="text-sm text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Map unavailable</p>
          <p className="text-xs text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative bg-gray-100 rounded-lg overflow-hidden ${className}`}
      style={{ height }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <MapPinIcon className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Simple Map View</h3>
          <p className="text-sm text-gray-600 mb-4">
            {parkingLots.length} parking location{parkingLots.length !== 1 ? 's' : ''} found
          </p>
          
          {parkingLots.length > 0 && (
            <div className="max-w-md space-y-2">
              {parkingLots.slice(0, 3).map((parking, index) => (
                <div
                  key={parking._id || index}
                  className="bg-white rounded-lg p-3 shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleParkingClick(parking)}
                >
                  <div className="flex items-center space-x-2">
                    <MapPinIcon className="h-4 w-4 text-orange-500 flex-shrink-0" />
                    <div className="text-left">
                      <p className="font-medium text-sm text-gray-800">{parking.name}</p>
                      <p className="text-xs text-gray-600">{parking.address}</p>
                    </div>
                  </div>
                </div>
              ))}
              {parkingLots.length > 3 && (
                <p className="text-xs text-gray-500">
                  +{parkingLots.length - 3} more locations
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div ref={mapContainer} className="w-full h-full opacity-20">
        {/* Placeholder for actual map implementation */}
        <div className="w-full h-full bg-gradient-to-br from-green-100 to-blue-100"></div>
      </div>
    </div>
  );
};

export default SimpleParkingMap;