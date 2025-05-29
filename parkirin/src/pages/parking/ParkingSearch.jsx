import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import Map, { Marker, NavigationControl, GeolocateControl } from 'react-map-gl';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { GET_NEARBY_PARKINGS } from '../../graphql/queries';

const ParkingSearch = () => {
  const [viewport, setViewport] = useState({
    latitude: -6.2088,  // Default to Jakarta's coordinates
    longitude: 106.8456,
    zoom: 13
  });

  const [searchParams, setSearchParams] = useState({
    radius: 2000, // 2km radius
    vehicleType: 'all',
    minPrice: 0,
    maxPrice: 100000
  });

  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          setViewport(prev => ({
            ...prev,
            latitude,
            longitude
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }  }, []);
  const { loading, error, data } = useQuery(GET_NEARBY_PARKINGS, {
    variables: {
      longitude: viewport.longitude,
      latitude: viewport.latitude,
      maxDistance: searchParams.radius,
      vehicleType: searchParams.vehicleType === 'all' ? null : searchParams.vehicleType
    },
    skip: !userLocation,
  });

  if (loading) return <LoadingSpinner size="large" />;
  if (error) return <div>Error loading parking spots</div>;

  return (
    <div className="h-[calc(100vh-64px)]">
      <div className="grid grid-cols-1 md:grid-cols-3 h-full">
        {/* Filters */}
        <div className="p-4 bg-white border-r border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Search Filters</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Search Radius (km)
              </label>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.5"
                value={searchParams.radius / 1000}
                onChange={(e) => setSearchParams(prev => ({
                  ...prev,
                  radius: e.target.value * 1000
                }))}
                className="w-full"
              />
              <span className="text-sm text-gray-500">{searchParams.radius / 1000} km</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Vehicle Type
              </label>
              <select
                value={searchParams.vehicleType}
                onChange={(e) => setSearchParams(prev => ({
                  ...prev,
                  vehicleType: e.target.value
                }))}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="all">All</option>
                <option value="car">Car</option>
                <option value="motorcycle">Motorcycle</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Price Range (Rp)
              </label>
              <div className="mt-1 grid grid-cols-2 gap-4">
                <input
                  type="number"
                  value={searchParams.minPrice}
                  onChange={(e) => setSearchParams(prev => ({
                    ...prev,
                    minPrice: parseFloat(e.target.value)
                  }))}
                  placeholder="Min"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                <input
                  type="number"
                  value={searchParams.maxPrice}
                  onChange={(e) => setSearchParams(prev => ({
                    ...prev,
                    maxPrice: parseFloat(e.target.value)
                  }))}
                  placeholder="Max"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            </div>
          </div>          {/* Results List */}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Available Parking Spots</h3>            <div className="space-y-4">
              {data?.getNearbyParkings?.map((spot) => (
                <div
                  key={spot._id}
                  className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <h4 className="font-medium text-gray-900">{spot.name}</h4>
                  <p className="text-sm text-gray-500">{spot.address}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-sm font-medium text-primary-600">
                      Car: Rp {spot.rates?.car || 0}/hour | Motorcycle: Rp {spot.rates?.motorcycle || 0}/hour
                    </span>
                    <span className="text-sm text-gray-500">
                      Cars: {spot.available?.car || 0} | Motorcycles: {spot.available?.motorcycle || 0} available
                    </span>
                  </div>                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Status: {spot.status || 'Open'}
                    </span>
                    <div className="flex items-center">
                      <svg
                        className="h-4 w-4 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 15.585l6.146 3.233-.927-7.037L20 6.798l-6.884-.645L10 0 6.884 6.153 0 6.798l4.781 4.983-.927 7.037L10 15.585z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="ml-1 text-sm text-gray-500">{spot.rating || 'N/A'} ({spot.review_count || 0} reviews)</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="col-span-2 relative">          <Map
            {...viewport}
            onMove={evt => setViewport(evt.viewState)}
            mapStyle="mapbox://styles/mapbox/streets-v11"
            mapboxAccessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
            style={{ width: '100%', height: '100%' }}
          >
            <GeolocateControl position="top-right" />
            <NavigationControl position="top-right" />
            
            {/* User's location */}
            {userLocation && (
              <Marker
                longitude={userLocation.longitude}
                latitude={userLocation.latitude}
                color="#2563eb"
              />
            )}            {/* Parking spots */}
            {data?.getNearbyParkings?.map((spot) => (
              <Marker
                key={spot._id}
                longitude={spot.location.coordinates[0]}
                latitude={spot.location.coordinates[1]}
              >
                <div className="bg-primary-500 text-white px-2 py-1 rounded text-sm">
                  {spot.name}
                </div>
              </Marker>
            ))}
          </Map>
        </div>
      </div>
    </div>
  );
};

export default ParkingSearch;
