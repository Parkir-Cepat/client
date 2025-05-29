import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { formatDistance, formatCurrency } from '../../utils/formatters';
import { MAP_DEFAULTS } from '../../utils/constants';

// Set Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const ParkingMap = ({
  parkingLots = [],
  userLocation = null,
  onParkingClick = null,
  height = '400px',
  showUserLocation = true,
  showNavigationControls = true,
  fitBounds = true,
  zoom = MAP_DEFAULTS.ZOOM,
  center = MAP_DEFAULTS.CENTER
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: userLocation ? [userLocation.longitude, userLocation.latitude] : center,
        zoom: zoom
      });

      // Add navigation controls
      if (showNavigationControls) {
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      }

      // Add geolocate control
      if (showUserLocation) {
        const geolocateControl = new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true,
          showUserHeading: true
        });
        map.current.addControl(geolocateControl, 'top-right');
      }

      map.current.on('load', () => {
        setMapLoaded(true);
      });

      return () => {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, [userLocation, center, zoom, showNavigationControls, showUserLocation]);

  // Add user location marker
  useEffect(() => {
    if (!map.current || !mapLoaded || !userLocation || !showUserLocation) return;

    // Create user location marker
    const userMarker = new mapboxgl.Marker({
      color: '#3B82F6',
      scale: 0.8
    })
      .setLngLat([userLocation.longitude, userLocation.latitude])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 })
          .setHTML('<div class="text-sm font-medium">Your Location</div>')
      )
      .addTo(map.current);

    return () => {
      userMarker.remove();
    };
  }, [userLocation, mapLoaded, showUserLocation]);

  // Add parking lot markers
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add new markers
    parkingLots.forEach((parking) => {
      if (!parking.location?.coordinates) return;

      const [lng, lat] = parking.location.coordinates;

      // Create custom marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'parking-marker';
      markerElement.innerHTML = `
        <div class="w-8 h-8 bg-green-500 border-2 border-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-green-600 transition-colors">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2v0a2 2 0 01-2-2v-2a2 2 0 00-2-2H8z" />
          </svg>
        </div>
      `;

      // Create popup content
      const popupHTML = `
        <div class="p-3 min-w-[250px]">
          <h3 class="font-semibold text-gray-900 mb-2">${parking.name}</h3>
          <p class="text-sm text-gray-600 mb-2">${parking.address}</p>
          
          <div class="grid grid-cols-2 gap-2 mb-3 text-xs">
            <div>
              <span class="text-gray-500">Car:</span>
              <span class="font-medium">${parking.available?.car || 0}/${parking.capacity?.car || 0}</span>
            </div>
            <div>
              <span class="text-gray-500">Motorcycle:</span>
              <span class="font-medium">${parking.available?.motorcycle || 0}/${parking.capacity?.motorcycle || 0}</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2 mb-3 text-xs">
            <div>
              <span class="text-gray-500">Car Rate:</span>
              <span class="font-medium">${formatCurrency(parking.rates?.car || 0)}/hr</span>
            </div>
            <div>
              <span class="text-gray-500">Motorcycle Rate:</span>
              <span class="font-medium">${formatCurrency(parking.rates?.motorcycle || 0)}/hr</span>
            </div>
          </div>

          ${parking.distance ? `
            <div class="text-xs text-gray-500 mb-2">
              Distance: ${formatDistance(parking.distance)}
            </div>
          ` : ''}

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <span class="text-yellow-400 text-sm">★</span>
              <span class="text-sm text-gray-600 ml-1">${parking.rating || 0}</span>
            </div>
            <button 
              class="view-details-btn bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700 transition-colors"
              data-parking-id="${parking._id}"
            >
              View Details
            </button>
          </div>
        </div>
      `;

      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false
      }).setHTML(popupHTML);

      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map.current);

      // Add click handler for marker
      markerElement.addEventListener('click', () => {
        if (onParkingClick) {
          onParkingClick(parking);
        }
      });

      // Add click handler for popup button
      popup.on('open', () => {
        const viewBtn = document.querySelector(`[data-parking-id="${parking._id}"]`);
        if (viewBtn) {
          viewBtn.addEventListener('click', () => {
            if (onParkingClick) {
              onParkingClick(parking);
            }
          });
        }
      });

      markers.current.push(marker);
    });

    // Fit bounds to show all markers
    if (fitBounds && parkingLots.length > 0) {
      const coordinates = parkingLots
        .filter(parking => parking.location?.coordinates)
        .map(parking => parking.location.coordinates);

      if (userLocation && showUserLocation) {
        coordinates.push([userLocation.longitude, userLocation.latitude]);
      }

      if (coordinates.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        coordinates.forEach(coord => bounds.extend(coord));
        
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 15
        });
      }
    }

    return () => {
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
    };
  }, [parkingLots, mapLoaded, fitBounds, userLocation, showUserLocation, onParkingClick]);

  return (
    <div className="relative">
      <div
        ref={mapContainer}
        style={{ height }}
        className="w-full rounded-lg overflow-hidden border border-gray-200"
      />
      
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 text-xs">
        <h4 className="font-semibold text-gray-900 mb-2">Legend</h4>
        <div className="space-y-1">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-gray-600">Your Location</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-gray-600">Parking Available</span>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      {parkingLots.length > 0 && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 text-sm">
          <span className="font-medium text-gray-900">
            {parkingLots.length} parking lot{parkingLots.length !== 1 ? 's' : ''} found
          </span>
        </div>
      )}
    </div>
  );
};

export default ParkingMap;