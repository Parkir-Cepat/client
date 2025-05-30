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
    <div className="h-[calc(100vh-64px)] bg-[#f9fafb]">
      <div className="grid grid-cols-1 md:grid-cols-3 h-full">
        {/* Filters */}
        <div className="p-6 bg-white border-r border-gray-100 rounded-xl shadow-lg m-4 md:m-6 md:mr-0">
          <h2 className="text-xl font-bold text-[#f16634] mb-6">Search Filters</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Radius (km)</label>
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
                className="w-full accent-[#f16634]"
              />
              <span className="text-sm text-[#f16634] font-bold">{searchParams.radius / 1000} km</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
              <select
                value={searchParams.vehicleType}
                onChange={(e) => setSearchParams(prev => ({
                  ...prev,
                  vehicleType: e.target.value
                }))}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f16634] focus:border-[#f16634] sm:text-sm rounded-md"
              >
                <option value="all">All</option>
                <option value="car">Car</option>
                <option value="motorcycle">Motorcycle</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price Range (Rp)</label>
              <div className="mt-1 grid grid-cols-2 gap-4">
                <input
                  type="number"
                  value={searchParams.minPrice}
                  onChange={(e) => setSearchParams(prev => ({
                    ...prev,
                    minPrice: parseFloat(e.target.value)
                  }))}
                  placeholder="Min"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#f16634] focus:border-[#f16634] sm:text-sm"
                />
                <input
                  type="number"
                  value={searchParams.maxPrice}
                  onChange={(e) => setSearchParams(prev => ({
                    ...prev,
                    maxPrice: parseFloat(e.target.value)
                  }))}
                  placeholder="Max"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#f16634] focus:border-[#f16634] sm:text-sm"
                />
              </div>
            </div>
          </div>
          {/* Results List */}
          <div className="mt-8">
            <h3 className="text-lg font-bold text-[#f16634] mb-4">Available Parking Spots</h3>
            <div className="space-y-4">
              {data?.getNearbyParkings?.map((spot) => (
                <div
                  key={spot._id}
                  className="bg-white p-4 rounded-xl shadow border border-gray-100 hover:shadow-lg transition-shadow flex flex-col gap-2"
                >
                  <h4 className="font-bold text-[#f16634] text-lg mb-1">{spot.name}</h4>
                  <p className="text-sm text-gray-500 mb-1">{spot.address}</p>
                  <div className="flex flex-wrap gap-2 items-center text-sm">
                    <span className="bg-[#f16634]/10 text-[#f16634] px-2 py-1 rounded-full font-bold">Car: Rp {spot.rates?.car || 0}/hour</span>
                    <span className="bg-[#f16634]/10 text-[#f16634] px-2 py-1 rounded-full font-bold">Motorcycle: Rp {spot.rates?.motorcycle || 0}/hour</span>
                    <span className="text-gray-500">Cars: {spot.available?.car || 0} | Motorcycles: {spot.available?.motorcycle || 0} available</span>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center text-sm">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full font-bold">{spot.status || 'Open'}</span>
                    <span className="flex items-center gap-1 text-yellow-600 font-bold">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 15.585l6.146 3.233-.927-7.037L20 6.798l-6.884-.645L10 0 6.884 6.153 0 6.798l4.781 4.983-.927 7.037L10 15.585z" clipRule="evenodd" /></svg>
                      {spot.rating || 'N/A'} ({spot.review_count || 0} reviews)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Map */}
        <div className="col-span-2 relative rounded-xl overflow-hidden m-4 md:m-6 md:ml-0 shadow-lg">
          <Map
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
                color="#f16634"
              />
            )}
            {/* Parking spots */}
            {data?.getNearbyParkings?.map((spot) => (
              <Marker
                key={spot._id}
                longitude={spot.location.coordinates[0]}
                latitude={spot.location.coordinates[1]}
              >
                <div className="bg-[#f16634] text-white px-2 py-1 rounded text-xs font-bold shadow">
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
