import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@apollo/client';
import { useGeolocation } from '../hooks/useGeolocation';
import { useDebounce } from '../hooks/useDebounce';
import { ParkingMap, SearchFilters, ParkingList, ParkingGrid } from '../components/parking';
import { LoadingSpinner, Button, Card, Alert } from '../components/common';
import { GET_NEARBY_PARKING_LOTS, SEARCH_PARKING_LOTS } from '../graphql/queries';
import { 
  MapViewIcon, 
  ListBulletIcon, 
  FunnelIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    vehicleType: '',
    minPrice: '',
    maxPrice: '',
    rating: '',
    sortBy: 'distance'
  });
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
  const [showFilters, setShowFilters] = useState(false);
  const [mapCenter, setMapCenter] = useState(null);
  const [selectedParking, setSelectedParking] = useState(null);

  const { location, loading: locationLoading, error: locationError } = useGeolocation();
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Determine which query to use based on search
  const useNearbyQuery = !debouncedSearch && location;
  const useSearchQuery = debouncedSearch;

  // Query for nearby parking lots
  const { 
    data: nearbyData, 
    loading: nearbyLoading, 
    error: nearbyError,
    refetch: refetchNearby
  } = useQuery(GET_NEARBY_PARKING_LOTS, {
    variables: {
      longitude: location?.longitude,
      latitude: location?.latitude,
      maxDistance: 5000,
      vehicleType: filters.vehicleType || null
    },
    skip: !useNearbyQuery,
    fetchPolicy: 'cache-and-network'
  });

  // Query for search results
  const { 
    data: searchData, 
    loading: searchLoading, 
    error: searchError,
    refetch: refetchSearch
  } = useQuery(SEARCH_PARKING_LOTS, {
    variables: {
      query: debouncedSearch,
      vehicleType: filters.vehicleType || null,
      minPrice: filters.minPrice ? parseFloat(filters.minPrice) : null,
      maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : null,
      rating: filters.rating ? parseFloat(filters.rating) : null,
      sortBy: filters.sortBy
    },
    skip: !useSearchQuery,
    fetchPolicy: 'cache-and-network'
  });

  // Determine current data and loading state
  const currentData = useSearchQuery ? searchData : nearbyData;
  const currentLoading = useSearchQuery ? searchLoading : nearbyLoading;
  const currentError = useSearchQuery ? searchError : nearbyError;
  const parkingLots = currentData?.searchParkingLots || currentData?.getNearbyParkingLots || [];

  // Set initial map center when location is available
  useEffect(() => {
    if (location && !mapCenter) {
      setMapCenter([location.longitude, location.latitude]);
    }
  }, [location, mapCenter]);

  // Handle search input change
  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      vehicleType: '',
      minPrice: '',
      maxPrice: '',
      rating: '',
      sortBy: 'distance'
    });
    setSearchQuery('');
  }, []);

  // Handle parking selection
  const handleParkingSelect = useCallback((parking) => {
    setSelectedParking(parking);
    if (parking && parking.location?.coordinates) {
      setMapCenter([parking.location.coordinates[0], parking.location.coordinates[1]]);
    }
  }, []);

  // Refetch data when filters change
  useEffect(() => {
    if (useNearbyQuery) {
      refetchNearby();
    } else if (useSearchQuery) {
      refetchSearch();
    }
  }, [filters, useNearbyQuery, useSearchQuery, refetchNearby, refetchSearch]);

  const isLoading = locationLoading || currentLoading;
  const hasError = locationError || currentError;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-2xl">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari tempat parkir..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-2">
              {/* Filter Toggle */}
              <Button
                variant={showFilters ? "primary" : "outline"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <FunnelIcon className="h-4 w-4" />
                Filter
                {Object.values(filters).some(v => v) && (
                  <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    !
                  </span>
                )}
              </Button>

              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewMode === 'map' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('map')}
                  className="flex items-center gap-1"
                >
                  <MapViewIcon className="h-4 w-4" />
                  Map
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="flex items-center gap-1"
                >
                  <ListBulletIcon className="h-4 w-4" />
                  List
                </Button>
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <SearchFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onClear={clearFilters}
              />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Location Error */}
        {locationError && (
          <Alert
            type="warning"
            title="Lokasi tidak tersedia"
            message="Kami tidak bisa mengakses lokasi Anda. Hasil pencarian mungkin tidak akurat."
            className="mb-6"
          />
        )}

        {/* Error State */}
        {hasError && !locationError && (
          <Alert
            type="error"
            title="Terjadi kesalahan"
            message={currentError?.message || "Gagal memuat data tempat parkir"}
            className="mb-6"
          />
        )}

        {/* Loading State */}
        {isLoading && (
          <Card className="p-8">
            <LoadingSpinner size="lg" className="mx-auto" />
            <p className="text-center text-gray-600 mt-4">
              {locationLoading ? "Mengakses lokasi..." : "Mencari tempat parkir..."}
            </p>
          </Card>
        )}

        {/* Results */}
        {!isLoading && !hasError && (
          <>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {searchQuery ? `Hasil pencarian "${searchQuery}"` : "Tempat parkir terdekat"}
                </h2>
                <p className="text-gray-600">
                  {parkingLots.length} tempat parkir ditemukan
                </p>
              </div>
              
              {Object.values(filters).some(v => v) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="flex items-center gap-2"
                >
                  <AdjustmentsHorizontalIcon className="h-4 w-4" />
                  Reset Filter
                </Button>
              )}
            </div>

            {/* Map View */}
            {viewMode === 'map' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Map */}
                  <div className="lg:col-span-2">
                    <Card className="p-0 overflow-hidden">
                      <div className="h-96 lg:h-[600px]">
                        <ParkingMap
                          center={mapCenter}
                          parkingLots={parkingLots}
                          selectedParking={selectedParking}
                          onParkingSelect={handleParkingSelect}
                          userLocation={location}
                        />
                      </div>
                    </Card>
                  </div>

                  {/* Selected Parking Details */}
                  <div className="space-y-4">
                    {selectedParking ? (
                      <Card className="p-4">
                        <h3 className="font-semibold text-lg mb-2">
                          {selectedParking.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          {selectedParking.address}
                        </p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Tarif Motor:</span>
                            <span className="font-medium">
                              Rp {selectedParking.rates?.motorcycle?.toLocaleString()}/jam
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tarif Mobil:</span>
                            <span className="font-medium">
                              Rp {selectedParking.rates?.car?.toLocaleString()}/jam
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Slot Tersedia:</span>
                            <span className="font-medium">
                              {selectedParking.available?.motorcycle || 0} motor, {selectedParking.available?.car || 0} mobil
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Rating:</span>
                            <span className="font-medium">
                              ⭐ {selectedParking.rating || 0}/5
                            </span>
                          </div>
                        </div>
                        <Button 
                          className="w-full mt-4"
                          onClick={() => window.location.href = `/parking/${selectedParking._id}`}
                        >
                          Lihat Detail & Booking
                        </Button>
                      </Card>
                    ) : (
                      <Card className="p-6 text-center">
                        <MapViewIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">
                          Klik pada pin di peta untuk melihat detail tempat parkir
                        </p>
                      </Card>
                    )}

                    {/* Quick Filters */}
                    <Card className="p-4">
                      <h4 className="font-medium mb-3">Filter Cepat</h4>
                      <div className="space-y-2">
                        <Button
                          variant={filters.vehicleType === 'motorcycle' ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => handleFilterChange({ vehicleType: filters.vehicleType === 'motorcycle' ? '' : 'motorcycle' })}
                          className="w-full"
                        >
                          🏍️ Motor
                        </Button>
                        <Button
                          variant={filters.vehicleType === 'car' ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => handleFilterChange({ vehicleType: filters.vehicleType === 'car' ? '' : 'car' })}
                          className="w-full"
                        >
                          🚗 Mobil
                        </Button>
                        <Button
                          variant={filters.rating === '4' ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => handleFilterChange({ rating: filters.rating === '4' ? '' : '4' })}
                          className="w-full"
                        >
                          ⭐ Rating 4+
                        </Button>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="space-y-6">
                {parkingLots.length > 0 ? (
                  <ParkingGrid 
                    parkingLots={parkingLots}
                    userLocation={location}
                  />
                ) : (
                  <Card className="p-8 text-center">
                    <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Tidak ada tempat parkir ditemukan
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Coba ubah kata kunci pencarian atau filter Anda
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={clearFilters}
                    >
                      Reset Pencarian
                    </Button>
                  </Card>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Search;