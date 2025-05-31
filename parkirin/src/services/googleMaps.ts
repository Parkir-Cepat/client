import type { Coordinates } from '../types';

export interface GoogleMapsConfig {
  apiKey: string;
  libraries: Array<'places' | 'geometry' | 'drawing' | 'visualization'>;
  language: string;
  region: string;
}

export interface PlaceResult {
  place_id: string;
  formatted_address: string;
  name: string;
  geometry: {
    location: Coordinates;
  };
  types: string[];
}

export interface DirectionsResult {
  routes: google.maps.DirectionsRoute[];
  distance: {
    text: string;
    value: number; // in meters
  };
  duration: {
    text: string;
    value: number; // in seconds
  };
}

class GoogleMapsService {
  private config: GoogleMapsConfig;
  private isLoaded: boolean = false;
  private placesService: google.maps.places.PlacesService | null = null;
  private directionsService: google.maps.DirectionsService | null = null;
  private geocoder: google.maps.Geocoder | null = null;

  constructor() {
    this.config = {
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
      libraries: ['places', 'geometry'],
      language: 'id',
      region: 'ID',
    };
  }

  // Initialize Google Maps API
  async initialize(): Promise<void> {
    if (this.isLoaded) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      if (typeof google !== 'undefined' && google.maps) {
        this.initializeServices();
        this.isLoaded = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      const libraries = this.config.libraries.join(',');
      
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.config.apiKey}&libraries=${libraries}&language=${this.config.language}&region=${this.config.region}`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        this.initializeServices();
        this.isLoaded = true;
        resolve();
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load Google Maps API'));
      };

      document.head.appendChild(script);
    });
  }

  private initializeServices(): void {
    // Create a dummy map element for services that require it
    const dummyElement = document.createElement('div');
    const dummyMap = new google.maps.Map(dummyElement, {
      center: { lat: -6.2088, lng: 106.8456 }, // Jakarta
      zoom: 10,
    });

    this.placesService = new google.maps.places.PlacesService(dummyMap);
    this.directionsService = new google.maps.DirectionsService();
    this.geocoder = new google.maps.Geocoder();
  }

  // Search places by text
  async searchPlaces(query: string, location?: Coordinates): Promise<PlaceResult[]> {
    await this.initialize();
    
    if (!this.placesService) {
      throw new Error('Places service not initialized');
    }

    return new Promise((resolve, reject) => {
      const request: google.maps.places.TextSearchRequest = {
        query,
        location: location ? new google.maps.LatLng(location.lat, location.lng) : undefined,
        radius: 50000, // 50km
      };

      this.placesService!.textSearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const places: PlaceResult[] = results.map(place => ({
            place_id: place.place_id!,
            formatted_address: place.formatted_address!,
            name: place.name!,
            geometry: {
              location: {
                lat: place.geometry!.location!.lat(),
                lng: place.geometry!.location!.lng(),
              },
            },
            types: place.types!,
          }));
          resolve(places);
        } else {
          reject(new Error(`Places search failed: ${status}`));
        }
      });
    });
  }

  // Get place details
  async getPlaceDetails(placeId: string): Promise<google.maps.places.PlaceResult | null> {
    await this.initialize();
    
    if (!this.placesService) {
      throw new Error('Places service not initialized');
    }

    return new Promise((resolve, reject) => {
      const request = {
        placeId,
        fields: ['place_id', 'name', 'formatted_address', 'geometry', 'types', 'rating', 'photos'],
      };

      this.placesService!.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          resolve(place);
        } else if (status === google.maps.places.PlacesServiceStatus.NOT_FOUND) {
          resolve(null);
        } else {
          reject(new Error(`Place details failed: ${status}`));
        }
      });
    });
  }

  // Calculate distance between two points
  calculateDistance(from: Coordinates, to: Coordinates): number {
    const fromLatLng = new google.maps.LatLng(from.lat, from.lng);
    const toLatLng = new google.maps.LatLng(to.lat, to.lng);
    
    return google.maps.geometry.spherical.computeDistanceBetween(fromLatLng, toLatLng);
  }

  // Get directions between two points
  async getDirections(
    origin: Coordinates,
    destination: Coordinates,
    travelMode: google.maps.TravelMode = google.maps.TravelMode.DRIVING
  ): Promise<DirectionsResult> {
    await this.initialize();
    
    if (!this.directionsService) {
      throw new Error('Directions service not initialized');
    }

    return new Promise((resolve, reject) => {
      const request: google.maps.DirectionsRequest = {
        origin: new google.maps.LatLng(origin.lat, origin.lng),
        destination: new google.maps.LatLng(destination.lat, destination.lng),
        travelMode,
      };

      this.directionsService!.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          const route = result.routes[0];
          const leg = route.legs[0];
          
          resolve({
            routes: result.routes,
            distance: leg.distance!,
            duration: leg.duration!,
          });
        } else {
          reject(new Error(`Directions failed: ${status}`));
        }
      });
    });
  }

  // Geocode address
  async geocodeAddress(address: string): Promise<Coordinates | null> {
    await this.initialize();
    
    if (!this.geocoder) {
      throw new Error('Geocoder not initialized');
    }

    return new Promise((resolve, reject) => {
      this.geocoder!.geocode({ address }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng(),
          });
        } else if (status === google.maps.GeocoderStatus.ZERO_RESULTS) {
          resolve(null);
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
  }

  // Reverse geocode coordinates
  async reverseGeocode(coordinates: Coordinates): Promise<string | null> {
    await this.initialize();
    
    if (!this.geocoder) {
      throw new Error('Geocoder not initialized');
    }

    return new Promise((resolve, reject) => {
      const latLng = new google.maps.LatLng(coordinates.lat, coordinates.lng);
      
      this.geocoder!.geocode({ location: latLng }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
          resolve(results[0].formatted_address);
        } else if (status === google.maps.GeocoderStatus.ZERO_RESULTS) {
          resolve(null);
        } else {
          reject(new Error(`Reverse geocoding failed: ${status}`));
        }
      });
    });
  }

  // Format distance
  formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    } else {
      return `${(meters / 1000).toFixed(1)} km`;
    }
  }

  // Format duration
  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}j ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  // Check if coordinates are in Indonesia
  isInIndonesia(coordinates: Coordinates): boolean {
    // Rough bounding box for Indonesia
    const bounds = {
      north: 6,
      south: -11,
      east: 141,
      west: 95,
    };
    
    return (
      coordinates.lat >= bounds.south &&
      coordinates.lat <= bounds.north &&
      coordinates.lng >= bounds.west &&
      coordinates.lng <= bounds.east
    );
  }

  // Get nearby places
  async getNearbyPlaces(
    location: Coordinates,
    radius: number = 1000,
    type?: string
  ): Promise<PlaceResult[]> {
    await this.initialize();
    
    if (!this.placesService) {
      throw new Error('Places service not initialized');
    }

    return new Promise((resolve, reject) => {      const request: google.maps.places.PlaceSearchRequest = {
        location: new google.maps.LatLng(location.lat, location.lng),
        radius,
        type: type as string, // Use string type to avoid namespace issues
      };

      this.placesService!.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const places: PlaceResult[] = results.map(place => ({
            place_id: place.place_id!,
            formatted_address: place.vicinity!,
            name: place.name!,
            geometry: {
              location: {
                lat: place.geometry!.location!.lat(),
                lng: place.geometry!.location!.lng(),
              },
            },
            types: place.types!,
          }));
          resolve(places);
        } else {
          reject(new Error(`Nearby search failed: ${status}`));
        }
      });
    });
  }
}

export const googleMapsService = new GoogleMapsService();
