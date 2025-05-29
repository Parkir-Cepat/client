// src/hooks/useGeolocation.js
import { useState, useEffect } from 'react';

const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    accuracy: null,
    timestamp: null
  });
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError(new Error('Geolocation is not supported'));
      setLoading(false);
      return;
    }

    const handleSuccess = (position) => {
      const { latitude, longitude, accuracy } = position.coords;
      setLocation({
        latitude,
        longitude,
        accuracy,
        timestamp: position.timestamp
      });
      setError(null);
      setLoading(false);
    };

    const handleError = (error) => {
      setError(error);
      setLoading(false);
    };

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000, // 1 minute
      ...options
    };

    const watchId = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      defaultOptions
    );

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      defaultOptions
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Function to refresh location
  const refresh = () => {
    setLoading(true);
    setError(null);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setLocation({
          latitude,
          longitude,
          accuracy,
          timestamp: position.timestamp
        });
        setLoading(false);
      },
      (error) => {
        setError(error);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0, // Force fresh location
        ...options
      }
    );
  };

  return {
    location,
    error,
    loading,
    refresh,
    isAvailable: !!navigator.geolocation
  };
};

export default useGeolocation;
