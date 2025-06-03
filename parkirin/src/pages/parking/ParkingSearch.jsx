import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { GET_NEARBY_PARKINGS } from "../../graphql/queries";
import { useNavigate } from 'react-router-dom';
import { useJsApiLoader, GoogleMap, Marker } from '@react-google-maps/api';

const containerStyle = { width: '100%', height: '100%' };

const ParkingSearch = () => {
  // Load Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });
  
  // Map center state
  const [center, setCenter] = useState({ lat: -6.2088, lng: 106.8456 });
  const [zoom, setZoom] = useState(13);

  // Search filters
  const [searchParams, setSearchParams] = useState({
    radius: 2000, // 2km radius
    vehicleType: "all",
    minPrice: 0,
    maxPrice: 100000,
  });
  const [userLocation, setUserLocation] = useState(null);

  const navigate = useNavigate();

  // Fetch parking spots based on center
  const { loading, error, data } = useQuery(GET_NEARBY_PARKINGS, {
    variables: {
      longitude: center.lng,
      latitude: center.lat,
      maxDistance: searchParams.radius,
      vehicleType: searchParams.vehicleType === 'all' ? null : searchParams.vehicleType,
    },
    skip: !userLocation,
  });

  // Get user location once on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const { latitude, longitude } = coords;
          setUserLocation({ latitude, longitude });
          setCenter({ lat: latitude, lng: longitude });
          setZoom(15);
        },
        () => {
          setUserLocation(null);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
      );
    }
  }, []);
 
  if (loadError) return <div>Error loading Google Maps</div>;
  if (!isLoaded) return <LoadingSpinner size="large" />;
  if (loading) return <LoadingSpinner size="large" />;
  if (error) return <div>Error: {error.message}</div>;

  // Render map and markers
  return (
    <div className="h-[calc(100vh-64px)] bg-[#f9fafb]">
      <div className="grid grid-cols-1 md:grid-cols-3 h-full">
        {/* Filters column */}
        <div className="p-6 bg-white border-r border-gray-100 rounded-xl shadow-lg m-4 md:m-6 md:mr-0">
          <h2 className="text-xl font-bold text-[#f16634] mb-6">
            Search Filters
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Radius (km)
              </label>
              <input
                type="range"
                min="0.5"
                max="10000"
                step="2"
                value={searchParams.radius / 1000}
                onChange={(e) =>
                  setSearchParams((prev) => ({
                    ...prev,
                    radius: e.target.value * 1000,
                  }))
                }
                className="w-full accent-[#f16634]"
              />
              <span className="text-sm text-[#f16634] font-bold">
                {searchParams.radius / 1000} km
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Type
              </label>
              <select
                value={searchParams.vehicleType}
                onChange={(e) =>
                  setSearchParams((prev) => ({
                    ...prev,
                    vehicleType: e.target.value,
                  }))
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              >
                <option value="all">All</option>
                <option value="car">Car</option>
                <option value="motorcycle">Motorcycle</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Range (Rp)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  value={searchParams.minPrice}
                  onChange={(e) =>
                    setSearchParams((prev) => ({
                      ...prev,
                      minPrice: parseFloat(e.target.value),
                    }))
                  }
                  placeholder="Min"
                  className="w-full border-gray-300 rounded-md shadow-sm"
                />
                <input
                  type="number"
                  value={searchParams.maxPrice}
                  onChange={(e) =>
                    setSearchParams((prev) => ({
                      ...prev,
                      maxPrice: parseFloat(e.target.value),
                    }))
                  }
                  placeholder="Max"
                  className="w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
            </div>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-bold text-[#f16634] mb-4">
              Available Parking Spots
            </h3>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#f16634]/40">
              {data.getNearbyParkings.map(spot => (
                <div
                  key={spot._id}
                  className="bg-white p-4 rounded-xl shadow border-gray-100 cursor-pointer"
                  onClick={() => navigate(`/parking/${spot._id}`)}
                >
                  <h4 className="font-bold text-[#f16634] text-lg mb-1">{spot.name}</h4>
                  <p className="text-sm text-gray-500 mb-1">{spot.address}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Map column */}
        <div className="md:col-span-2 p-4 md:p-6">
          <div className="bg-white rounded-xl shadow-lg h-full">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                Parking Locations
              </h2>
            </div>
            <div className="relative h-[calc(100%-80px)]">
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={zoom}
              >
                {userLocation && <Marker position={center} title="Your Location" />}
                {data.getNearbyParkings.map(spot => (
                  <Marker
                    key={spot._id}
                    position={{ lat: spot.location.coordinates[1], lng: spot.location.coordinates[0] }}
                    onClick={() => navigate(`/parking/${spot._id}`)}
                  />
                ))}
              </GoogleMap>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkingSearch;
