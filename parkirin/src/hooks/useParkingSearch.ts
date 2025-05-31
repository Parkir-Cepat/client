import { useLazyQuery } from '@apollo/client';
import { SEARCH_PARKING_LOTS } from '../apollo/parkingQueries';
import type { SearchParkingLotsInput } from '../types/search';

export function useParkingSearch() {
  const [searchParking, { loading, error, data }] = useLazyQuery(SEARCH_PARKING_LOTS, {
    fetchPolicy: 'network-only',
  });

  const searchParkingLots = async (query: string) => {
    try {
      const { data: result } = await searchParking({
        variables: { query },
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
