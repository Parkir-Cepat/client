class GoogleMapsService {
  constructor() {
    this.isLoaded = false;
    this.isLoading = false;
    this.loadPromise = null;
    this.apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    this.cache = new Map();
  }

  /**
   * Load Google Maps JavaScript API with proper error handling
   * @returns {Promise<void>}
   */
  async loadGoogleMaps() {
    // Validate API key first
    if (!this.apiKey) {
      throw new Error('Google Maps API key is not configured. Please check VITE_GOOGLE_MAPS_API_KEY in your environment variables.');
    }

    if (this.isLoaded) {
      return Promise.resolve();
    }

    if (this.isLoading) {
      return this.loadPromise;
    }

    this.isLoading = true;
    this.loadPromise = new Promise((resolve, reject) => {
      // Check if Google Maps is already loaded
      if (window.google && window.google.maps && window.google.maps.Map) {
        this.isLoaded = true;
        this.isLoading = false;
        resolve();
        return;
      }

      // Set up global error handler for authentication failures
      window.gm_authFailure = () => {
        const error = new Error('Google Maps authentication failed. Please check your API key and billing settings.');
        console.error('Google Maps authentication failed');
        this.isLoading = false;
        reject(error);
      };

      // Create script element with proper error handling
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places,geometry&loading=async&v=weekly&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;
      
      // Global callback for successful load
      window.initGoogleMaps = () => {
        if (window.google && window.google.maps && window.google.maps.Map) {
          this.isLoaded = true;
          this.isLoading = false;
          // Clean up global callback
          delete window.initGoogleMaps;
          resolve();
        } else {
          const error = new Error('Google Maps API loaded but Map constructor not available');
          this.isLoading = false;
          reject(error);
        }
      };
      
      script.onerror = (error) => {
        console.error('Failed to load Google Maps script:', error);
        this.isLoading = false;
        // Clean up global callback
        delete window.initGoogleMaps;
        reject(new Error('Failed to load Google Maps API script. Please check your internet connection.'));
      };
      
      // Add timeout for loading
      const timeout = setTimeout(() => {
        if (!this.isLoaded) {
          this.isLoading = false;
          delete window.initGoogleMaps;
          reject(new Error('Google Maps API loading timeout. Please try again.'));
        }
      }, 15000); // 15 second timeout

      script.onload = () => {
        clearTimeout(timeout);
        // The actual initialization happens in the callback
      };
      
      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  isGoogleMapsLoaded() {
    return this.isLoaded && window.google && window.google.maps && window.google.maps.Map;
  }

  /**
   * Create a map instance with enhanced error handling
   * @param {HTMLElement} container - Map container element
   * @param {Object} options - Map options
   * @returns {Promise<google.maps.Map>} Map instance
   */
  async createMap(container, options = {}) {
    if (!container) {
      throw new Error('Map container element is required');
    }

    try {
      // Ensure Google Maps is loaded first
      await this.loadGoogleMaps();
      
      // Double-check that Google Maps is properly loaded
      if (!window.google?.maps?.Map) {
        throw new Error('Google Maps API not properly loaded after initialization');
      }
      
      // Validate container is still in DOM
      if (!container.isConnected) {
        throw new Error('Map container element is not attached to the DOM');
      }
      
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
      
      // Wait a small delay to ensure DOM is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const map = new window.google.maps.Map(container, mapOptions);
      
      // Wait for map to be ready
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Map initialization timeout'));
        }, 10000);

        const checkMapReady = () => {
          if (map.getDiv() && map.getCenter()) {
            clearTimeout(timeout);
            resolve(map);
          } else {
            setTimeout(checkMapReady, 100);
          }
        };

        // Try both idle event and polling
        window.google.maps.event.addListenerOnce(map, 'idle', () => {
          clearTimeout(timeout);
          resolve(map);
        });

        // Fallback polling
        setTimeout(checkMapReady, 500);
      });
      
    } catch (error) {
      console.error('Map creation error:', error);
      throw new Error(`Failed to create map: ${error.message}`);
    }
  }

  // ...existing methods for geocoding, markers, etc...
  
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
    }

    const markers = [];

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
        }

        let marker;

        try {
          // Try to use AdvancedMarkerElement if available
          if (typeof window.google.maps.importLibrary === 'function') {
            const { AdvancedMarkerElement } = await window.google.maps.importLibrary("marker");
            
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
          } else {
            // Fallback to legacy Marker with custom icon
            const icon = {
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 3C11.58 3 8 6.58 8 11c0 6.5 8 18 8 18s8-11.5 8-18c0-4.42-3.58-8-8-8z" fill="${markerColor}" stroke="white" stroke-width="2"/>
                  <circle cx="16" cy="11" r="4" fill="white"/>
                  <text x="16" y="15" text-anchor="middle" fill="${markerColor}" font-size="12" font-weight="bold">P</text>
                </svg>
              `)}`,
              scaledSize: new window.google.maps.Size(32, 32),
              anchor: new window.google.maps.Point(16, 32)
            };

            marker = new window.google.maps.Marker({
              position: { lat, lng },
              map: map,
              title: spot.name,
              icon: icon,
              zIndex: spot.available?.car > 0 || spot.available?.motorcycle > 0 ? 1000 : 100
            });
          }
        } catch (markerError) {
          console.error('Error creating marker, using basic marker:', markerError);
          // Basic fallback marker
          marker = new window.google.maps.Marker({
            position: { lat, lng },
            map: map,
            title: spot.name,
            zIndex: spot.available?.car > 0 || spot.available?.motorcycle > 0 ? 1000 : 100
          });
        }

        // Create info window content
        const infoContent = this.createParkingInfoWindow(spot);
        const infoWindow = new window.google.maps.InfoWindow({
          content: infoContent
        });

        // Add click event
        marker.addListener('click', () => {
          // Close all other info windows
          markers.forEach(m => m.infoWindow?.close());
          
          // Open this info window
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
   * Cache management
   */
  setCache(key, value) {
    this.cache.set(key, {
      data: value,
      timestamp: Date.now()
    });
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < 300000) { // 5 minutes
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }
}

// Export singleton instance
export default new GoogleMapsService();