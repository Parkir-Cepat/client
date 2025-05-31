import type { ParkingLot } from './index';

export interface SearchParkingLotsInput {
  lat: number;
  lng: number;
  radius?: number;
  vehicleType?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'distance' | 'price' | 'rating';
}

export interface SearchParkingLotsResponse {
  searchParkingLots: ParkingLot[];
}
