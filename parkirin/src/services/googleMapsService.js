/**
 * Google Maps Service
 * Comprehensive Google Maps integration for client-server architecture
 * Handles API loading, geocoding, places search, and mapping functions
 */

class GoogleMapsService {
  constructor() {
    this.apiKey = null;
    this.isLoaded = false;
    this.loadingPromise = null;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Fetch Google Maps API key from server
   * @returns {Promise<string>} API key
   */
  async fetchApiKey() {
    if (this.apiKey) return this.apiKey;

    try {
      const response = await fetch('/api/google-maps-key');
      if (!response.ok) {
        throw new Error(`Failed to fetch API key: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.apiKey) {
        throw new Error('API key not found in response');
      }
      
      this.apiKey = data.apiKey;
      return this.apiKey;
    } catch (error) {
      console.error('Error fetching Google Maps API key:', error);
      throw new Error('Failed to load Google Maps API key');
    }
  }
  /**
   * Load Google Maps JavaScript API
   * @returns {Promise<void>}
   */
  async loadGoogleMaps() {
    if (this.isLoaded && window.google?.maps) {
      return Promise.resolve();
    }

    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = new Promise((resolve, reject) => {
      (async () => {
        try {
          const apiKey = await this.fetchApiKey();
          
          // Check if Google Maps is already loaded
          if (window.google?.maps) {
            this.isLoaded = true;
            resolve();
            return;
          }

          // Create script element
          const script = document.createElement('script');
          script.type = 'text/javascript';
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry,marker&loading=async`;
          script.defer = true;
          script.async = true;          script.onload = async () => {
            if (window.google?.maps) {
              try {
                // Import the marker library to ensure AdvancedMarkerElement is available
                await window.google.maps.importLibrary("marker");
                this.isLoaded = true;
                resolve();
              } catch (error) {
                console.warn('Failed to import marker library, using legacy API:', error);
                this.isLoaded = true;
                resolve();
              }
            } else {
              reject(new Error('Google Maps failed to load properly'));
            }
          };

          script.onerror = () => {
            reject(new Error('Failed to load Google Maps script'));
          };

          document.head.appendChild(script);
        } catch (error) {
          reject(error);
        }
      })();
    });

    return this.loadingPromise;
  }

  /**
   * Geocode an address to coordinates
   * @param {string} address - Address to geocode
   * @returns {Promise<Object>} Geocoding result
   */
  async geocode(address) {
    if (!address?.trim()) {
      throw new Error('Address is required');
    }

    const cacheKey = `geocode_${address}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      await this.loadGoogleMaps();
      
      const geocoder = new window.google.maps.Geocoder();
      
      return new Promise((resolve, reject) => {
        geocoder.geocode({ address }, (results, status) => {
          if (status === window.google.maps.GeocoderStatus.OK && results[0]) {
            const result = {
              location: {
                lat: results[0].geometry.location.lat(),
                lng: results[0].geometry.location.lng()
              },
              formatted_address: results[0].formatted_address,
              place_id: results[0].place_id
            };
            
            this.setCache(cacheKey, result);
            resolve(result);
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        });
      });
    } catch (error) {
      console.error('Geocoding error:', error);
      throw new Error('Failed to geocode address');
    }
  }

  /**
   * Reverse geocode coordinates to address
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Promise<Object>} Reverse geocoding result
   */
  async reverseGeocode(lat, lng) {
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      throw new Error('Valid latitude and longitude are required');
    }

    const cacheKey = `reverse_${lat}_${lng}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      await this.loadGoogleMaps();
      
      const geocoder = new window.google.maps.Geocoder();
      const latlng = { lat, lng };
      
      return new Promise((resolve, reject) => {
        geocoder.geocode({ location: latlng }, (results, status) => {
          if (status === window.google.maps.GeocoderStatus.OK && results[0]) {
            const result = {
              formatted_address: results[0].formatted_address,
              address_components: results[0].address_components,
              place_id: results[0].place_id
            };
            
            this.setCache(cacheKey, result);
            resolve(result);
          } else {
            reject(new Error(`Reverse geocoding failed: ${status}`));
          }
        });
      });
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw new Error('Failed to reverse geocode coordinates');
    }
  }

  /**
   * Search for nearby places
   * @param {Object} location - { lat, lng }
   * @param {number} radius - Search radius in meters
   * @param {string} type - Place type (e.g., 'parking')
   * @returns {Promise<Array>} Places results
   */
  async searchNearbyPlaces(location, radius = 5000, type = 'parking') {
    if (!location?.lat || !location?.lng) {
      throw new Error('Valid location coordinates are required');
    }

    const cacheKey = `places_${location.lat}_${location.lng}_${radius}_${type}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      await this.loadGoogleMaps();
      
      const service = new window.google.maps.places.PlacesService(
        document.createElement('div')
      );
      
      const request = {
        location: new window.google.maps.LatLng(location.lat, location.lng),
        radius: radius,
        type: type
      };
      
      return new Promise((resolve, reject) => {
        service.nearbySearch(request, (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            const places = results.map(place => ({
              place_id: place.place_id,
              name: place.name,
              rating: place.rating,
              vicinity: place.vicinity,
              location: {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
              },
              types: place.types,
              photos: place.photos?.map(photo => ({
                url: photo.getUrl({ maxWidth: 400, maxHeight: 300 })
              })) || []
            }));
            
            this.setCache(cacheKey, places);
            resolve(places);
          } else {
            reject(new Error(`Places search failed: ${status}`));
          }
        });
      });
    } catch (error) {
      console.error('Places search error:', error);
      throw new Error('Failed to search nearby places');
    }
  }

  /**
   * Calculate distance between two points
   * @param {Object} origin - { lat, lng }
   * @param {Object} destination - { lat, lng }
   * @returns {Promise<Object>} Distance calculation result
   */
  async calculateDistance(origin, destination) {
    if (!origin?.lat || !origin?.lng || !destination?.lat || !destination?.lng) {
      throw new Error('Valid origin and destination coordinates are required');
    }

    try {
      await this.loadGoogleMaps();
      
      const service = new window.google.maps.DistanceMatrixService();
      
      return new Promise((resolve, reject) => {
        service.getDistanceMatrix({
          origins: [origin],
          destinations: [destination],
          travelMode: window.google.maps.TravelMode.DRIVING,
          unitSystem: window.google.maps.UnitSystem.METRIC,
          avoidHighways: false,
          avoidTolls: false
        }, (response, status) => {
          if (status === window.google.maps.DistanceMatrixStatus.OK) {
            const element = response.rows[0].elements[0];
            if (element.status === 'OK') {
              resolve({
                distance: element.distance,
                duration: element.duration,
                status: element.status
              });
            } else {
              reject(new Error(`Distance calculation failed: ${element.status}`));
            }
          } else {
            reject(new Error(`Distance Matrix request failed: ${status}`));
          }
        });
      });
    } catch (error) {
      console.error('Distance calculation error:', error);
      throw new Error('Failed to calculate distance');
    }
  }

  /**
   * Get directions between two points
   * @param {Object} origin - { lat, lng } or address string
   * @param {Object} destination - { lat, lng } or address string
   * @param {string} travelMode - DRIVING, WALKING, BICYCLING, TRANSIT
   * @returns {Promise<Object>} Directions result
   */
  async getDirections(origin, destination, travelMode = 'DRIVING') {
    if (!origin || !destination) {
      throw new Error('Origin and destination are required');
    }

    try {
      await this.loadGoogleMaps();
      
      const directionsService = new window.google.maps.DirectionsService();
      
      return new Promise((resolve, reject) => {
        directionsService.route({
          origin: origin,
          destination: destination,
          travelMode: window.google.maps.TravelMode[travelMode],
          unitSystem: window.google.maps.UnitSystem.METRIC
        }, (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            resolve({
              routes: result.routes,
              status: status
            });
          } else {
            reject(new Error(`Directions request failed: ${status}`));
          }
        });
      });
    } catch (error) {
      console.error('Directions error:', error);
      throw new Error('Failed to get directions');
    }
  }

  /**
   * Create a map instance
   * @param {HTMLElement} container - Map container element
   * @param {Object} options - Map options
   * @returns {Promise<google.maps.Map>} Map instance
   */
  async createMap(container, options = {}) {
    if (!container) {
      throw new Error('Map container element is required');
    }

    try {
      await this.loadGoogleMaps();
      
      const defaultOptions = {
        center: { lat: -6.2088, lng: 106.8456 }, // Jakarta default
        zoom: 12,
        mapTypeId: 'roadmap',
        disableDefaultUI: false,
        gestureHandling: 'auto',
        styles: [
          {
            featureType: 'poi.business',
            stylers: [{ visibility: 'off' }]
          }
        ]
      };

      const mapOptions = { ...defaultOptions, ...options };
      return new window.google.maps.Map(container, mapOptions);
    } catch (error) {
      console.error('Map creation error:', error);
      throw new Error('Failed to create map');
    }
  }  /**
   * Create a marker
   * @param {Object} options - Marker options
   * @returns {google.maps.marker.AdvancedMarkerElement} Marker instance
   */
  async createMarker(options = {}) {
    if (!window.google?.maps) {
      throw new Error('Google Maps not loaded');
    }

    try {
      // Import marker library
      const { AdvancedMarkerElement, PinElement } = await window.google.maps.importLibrary("marker");
      
      const markerOptions = {
        position: options.position,
        map: options.map,
        title: options.title
      };

      if (options.content) {
        markerOptions.content = options.content;
      }

      return new AdvancedMarkerElement(markerOptions);
    } catch (error) {
      console.error('Failed to create AdvancedMarkerElement:', error);
      throw error;
    }
  }
  /**
   * Create parking markers on map with server data integration
   * @param {Object} map - Google Maps instance
   * @param {Array} parkingSpots - Array of parking data from server
   * @param {Function} onMarkerClick - Callback for marker clicks
   * @returns {Array} Created markers
   */
  async createParkingMarkers(map, parkingSpots, onMarkerClick = null) {
    if (!map || !window.google?.maps) {
      throw new Error('Google Maps not loaded or map instance not provided');
    }

    if (!Array.isArray(parkingSpots)) {
      throw new Error('Parking spots must be an array');
    }    const markers = [];

    for (const spot of parkingSpots) {
      try {
        // Validate parking spot data
        if (!spot.location?.coordinates || !Array.isArray(spot.location.coordinates)) {
          console.warn(`Skipping parking spot ${spot._id}: invalid location data`);
          continue;
        }

        const [lng, lat] = spot.location.coordinates;
        
        if (!this.isValidCoordinates(lat, lng)) {
          console.warn(`Skipping parking spot ${spot._id}: invalid coordinates`);
          continue;
        }

        // Determine marker color based on availability
        let markerColor = '#dc2626'; // red - no availability
        if ((spot.available?.car > 0) || (spot.available?.motorcycle > 0)) {
          markerColor = '#16a34a'; // green - available
        } else if ((spot.available?.car === 0 && spot.capacity?.car > 0) || 
                   (spot.available?.motorcycle === 0 && spot.capacity?.motorcycle > 0)) {
          markerColor = '#ea580c'; // orange - full
        }        let marker;

        // Import marker library
        const { AdvancedMarkerElement, PinElement } = await window.google.maps.importLibrary("marker");
        
        // Create custom SVG content for AdvancedMarkerElement
        const markerElement = document.createElement('div');
        markerElement.innerHTML = `
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 3C11.58 3 8 6.58 8 11c0 6.5 8 18 8 18s8-11.5 8-18c0-4.42-3.58-8-8-8z" fill="${markerColor}" stroke="white" stroke-width="2"/>
            <circle cx="16" cy="11" r="4" fill="white"/>
            <text x="16" y="15" text-anchor="middle" fill="${markerColor}" font-size="12" font-weight="bold">P</text>
          </svg>
        `;
        markerElement.style.cursor = 'pointer';

        marker = new AdvancedMarkerElement({
          position: { lat, lng },
          map: map,
          title: spot.name,
          content: markerElement,
          zIndex: spot.available?.car > 0 || spot.available?.motorcycle > 0 ? 1000 : 100
        });

        // Create info window content
        const infoContent = this.createParkingInfoWindow(spot);
        const infoWindow = new window.google.maps.InfoWindow({
          content: infoContent
        });

        // Add click event
        marker.addListener('click', () => {
          // Close all other info windows
          markers.forEach(m => m.infoWindow?.close());
          
          infoWindow.open(map, marker);
          
          if (onMarkerClick) {
            onMarkerClick(spot, marker);
          }
        });

        // Store reference to info window
        marker.infoWindow = infoWindow;
        marker.parkingData = spot;
        
        markers.push(marker);
      } catch (error) {
        console.error(`Error creating marker for parking spot ${spot._id}:`, error);
      }
    }

    return markers;
  }

  /**
   * Create HTML content for parking info window
   * @param {Object} parking - Parking data
   * @returns {string} HTML content
   */
  createParkingInfoWindow(parking) {
    const carAvailable = parking.available?.car || 0;
    const motorcycleAvailable = parking.available?.motorcycle || 0;
    const carRate = parking.rates?.car || 0;
    const motorcycleRate = parking.rates?.motorcycle || 0;
    
    // Format rates as currency
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(amount);
    };

    return `
      <div class="parking-info-window" style="min-width: 250px; font-family: system-ui, -apple-system, sans-serif;">
        <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 8px;">
          <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #111827;">${parking.name}</h3>
          <p style="margin: 0; font-size: 14px; color: #6b7280;">${parking.address}</p>
        </div>
        
        <div style="margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-size: 14px; color: #374151;">🚗 Mobil:</span>
            <span style="font-size: 14px; font-weight: 500; color: ${carAvailable > 0 ? '#16a34a' : '#dc2626'};">
              ${carAvailable} tersedia
            </span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-size: 14px; color: #374151;">🏍️ Motor:</span>
            <span style="font-size: 14px; font-weight: 500; color: ${motorcycleAvailable > 0 ? '#16a34a' : '#dc2626'};">
              ${motorcycleAvailable} tersedia
            </span>
          </div>
        </div>
        
        <div style="margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-size: 14px; color: #374151;">💰 Tarif Mobil:</span>
            <span style="font-size: 14px; font-weight: 500;">${formatCurrency(carRate)}/jam</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="font-size: 14px; color: #374151;">💰 Tarif Motor:</span>
            <span style="font-size: 14px; font-weight: 500;">${formatCurrency(motorcycleRate)}/jam</span>
          </div>
        </div>
        
        ${parking.operational_hours ? `
          <div style="margin-bottom: 12px;">
            <span style="font-size: 14px; color: #374151;">🕒 Jam Operasional:</span>
            <span style="font-size: 14px; font-weight: 500;">${parking.operational_hours.open} - ${parking.operational_hours.close}</span>
          </div>
        ` : ''}
        
        ${parking.facilities && parking.facilities.length > 0 ? `
          <div style="margin-bottom: 12px;">
            <div style="font-size: 14px; color: #374151; margin-bottom: 4px;">🏢 Fasilitas:</div>
            <div style="font-size: 12px; color: #6b7280;">
              ${parking.facilities.join(', ')}
            </div>
          </div>
        ` : ''}
        
        <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
          <button 
            onclick="window.selectParking && window.selectParking('${parking._id}')"
            style="width: 100%; padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer;"
            onmouseover="this.style.background='#1d4ed8'"
            onmouseout="this.style.background='#2563eb'"
          >
            Pilih Lokasi Parkir
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Cache management
   */
  setCache(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  getFromCache(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  clearCache() {
    this.cache.clear();
  }

  /**
   * Error handling helper
   */
  handleApiError(error, context = 'Google Maps operation') {
    console.error(`${context} error:`, error);
    
    if (error.message?.includes('QUOTA_EXCEEDED')) {
      throw new Error('Google Maps API quota exceeded. Please try again later.');
    } else if (error.message?.includes('REQUEST_DENIED')) {
      throw new Error('Google Maps API request denied. Please check API key.');
    } else if (error.message?.includes('INVALID_REQUEST')) {
      throw new Error('Invalid request to Google Maps API.');
    } else {
      throw new Error(`${context} failed. Please try again.`);
    }
  }

  /**
   * Utility method to validate coordinates
   */
  isValidCoordinates(lat, lng) {
    return (
      typeof lat === 'number' && 
      typeof lng === 'number' && 
      lat >= -90 && lat <= 90 && 
      lng >= -180 && lng <= 180
    );
  }

  /**
   * Format coordinates for display
   */
  formatCoordinates(lat, lng, precision = 6) {
    if (!this.isValidCoordinates(lat, lng)) {
      return 'Invalid coordinates';
    }
    return `${lat.toFixed(precision)}, ${lng.toFixed(precision)}`;
  }
}

// Export singleton instance
const googleMapsService = new GoogleMapsService();
export default googleMapsService;
