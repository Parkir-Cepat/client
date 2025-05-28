import { useState, useEffect, useCallback } from 'react';
import type { Coordinates } from '../types';

export interface UseLocationReturn {
  currentLocation: Coordinates | null;
  isLoading: boolean;
  error: string | null;
  getCurrentLocation: () => Promise<void>;
  watchPosition: () => void;
  stopWatching: () => void;
  geocodeAddress: (address: string) => Promise<Coordinates | null>;
  reverseGeocode: (coordinates: Coordinates) => Promise<string | null>;
}

export const useLocation = (): UseLocationReturn => {
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

  // Get current position once
  const getCurrentLocation = useCallback(async (): Promise<void> => {
    if (!navigator.geolocation) {
      setError('Geolocation tidak didukung oleh browser ini');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5 minutes
          }
        );
      });      const { latitude, longitude } = position.coords;
      setCurrentLocation({ lat: latitude, lng: longitude });
    } catch (err: unknown) {
      let errorMessage = 'Gagal mendapatkan lokasi';
      
      const error = err as GeolocationPositionError;
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Akses lokasi ditolak. Silakan aktifkan GPS dan izinkan akses lokasi.';          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Informasi lokasi tidak tersedia';
          break;
        case error.TIMEOUT:
          errorMessage = 'Timeout saat mencari lokasi';
          break;        default:
          errorMessage = error.message || 'Gagal mendapatkan lokasi';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Watch position for continuous updates
  const watchPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation tidak didukung oleh browser ini');
      return;
    }

    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        setError(null);
      },
      (err) => {
        setError('Gagal memantau lokasi: ' + err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // 1 minute
      }
    );

    setWatchId(id);
  }, [watchId]);

  // Stop watching position
  const stopWatching = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  }, [watchId]);

  // Geocode address to coordinates
  const geocodeAddress = useCallback(async (address: string): Promise<Coordinates | null> => {
    try {
      const geocoder = new google.maps.Geocoder();
      
      const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        geocoder.geocode({ address }, (results, status) => {
          if (status === 'OK' && results) {
            resolve(results);
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        });
      });

      if (result.length > 0) {
        const location = result[0].geometry.location;
        return {
          lat: location.lat(),
          lng: location.lng(),
        };
      }

      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }, []);

  // Reverse geocode coordinates to address
  const reverseGeocode = useCallback(async (coordinates: Coordinates): Promise<string | null> => {
    try {
      const geocoder = new google.maps.Geocoder();
      const latlng = new google.maps.LatLng(coordinates.lat, coordinates.lng);
      
      const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        geocoder.geocode({ location: latlng }, (results, status) => {
          if (status === 'OK' && results) {
            resolve(results);
          } else {
            reject(new Error(`Reverse geocoding failed: ${status}`));
          }
        });
      });

      if (result.length > 0) {
        return result[0].formatted_address;
      }

      return null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return {
    currentLocation,
    isLoading,
    error,
    getCurrentLocation,
    watchPosition,
    stopWatching,
    geocodeAddress,
    reverseGeocode,
  };
};
