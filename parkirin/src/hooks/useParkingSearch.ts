import { useLazyQuery } from '@apollo/client';
import { SEARCH_PARKING_LOTS } from '../apollo/parkingQueries';
import type { SearchParkingLotsInput } from '../types/search';

export function useParkingSearch() {
  const [searchParking, { loading, error, data }] = useLazyQuery(SEARCH_PARKING_LOTS, {
    fetchPolicy: 'network-only',
  });

  const searchParkingLots = async (input: SearchParkingLotsInput) => {
    try {
      const { data: result } = await searchParking({
        variables: {          input: {
            latitude: input.lat,
            longitude: input.lng,
            maxDistance: input.radius || 5,
            vehicleType: input.vehicleType,
            minPrice: input.minPrice,
            maxPrice: input.maxPrice,
            sortBy: input.sortBy || 'distance',
          }
        },
      });
      return result?.searchParkingLots;
    } catch (err) {
      console.error('Error searching parking lots:', err);
      throw err;
    }
  };
  return {
    searchResults: data?.searchParkingLots || [],
    isLoading: loading,
    error: error?.message || null,
    searchParkingLots
  };
}
