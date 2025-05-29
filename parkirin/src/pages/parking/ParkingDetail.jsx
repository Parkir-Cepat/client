import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { 
  MapPinIcon, 
  ClockIcon, 
  StarIcon, 
  CarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const GET_PARKING_LOT = gql`
  query GetParkingLot($id: ID!) {
    getParkingLot(id: $id) {
      _id
      name
      address
      description
      images
      location {
        coordinates
      }
      available {
        car
        motorcycle
      }
      capacity {
        car
        motorcycle
      }
      rates {
        car
        motorcycle
      }
      operationalHours {
        open
        close
      }
      facilities
      rating
      status
    }
  }
`;

const ParkingDetail = () => {
  const { id } = useParams();
  const { data, loading, error } = useQuery(GET_PARKING_LOT, {
    variables: { id }
  });

  if (loading) return (
    <div className="flex justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (error) return (
    <div className="text-red-600 p-4">Error: {error.message}</div>
  );

  const parking = data?.getParkingLot;

  if (!parking) return (
    <div className="text-center p-8">
      <p className="text-gray-500">Parking lot not found</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        {parking.images?.length > 0 && (
          <div className="h-64 bg-gray-200">
            <img
              src={parking.images[0]}
              alt={parking.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{parking.name}</h1>
              <div className="flex items-center text-gray-600 mt-1">
                <MapPinIcon className="w-4 h-4 mr-1" />
                <span>{parking.address}</span>
              </div>
            </div>
            <div className="flex items-center">
              <StarIcon className="w-5 h-5 text-yellow-400 fill-current" />
              <span className="ml-1 text-gray-900 font-medium">{parking.rating || 0}</span>
            </div>
          </div>

          {parking.description && (
            <p className="text-gray-600 mb-4">{parking.description}</p>
          )}

          {/* Status */}
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              parking.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {parking.status === 'active' ? 'Open' : 'Closed'}
            </span>
            
            <div className="flex items-center text-gray-600">
              <ClockIcon className="w-4 h-4 mr-1" />
              <span>{parking.operationalHours?.open} - {parking.operationalHours?.close}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Availability */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Availability</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Cars</h3>
                  <CarIcon className="w-5 h-5 text-gray-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {parking.available?.car}/{parking.capacity?.car}
                </p>
                <p className="text-sm text-gray-600">Available slots</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Motorcycles</h3>
                  <div className="w-5 h-5 bg-gray-600 rounded-sm"></div>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {parking.available?.motorcycle}/{parking.capacity?.motorcycle}
                </p>
                <p className="text-sm text-gray-600">Available slots</p>
              </div>
            </div>
          </div>

          {/* Facilities */}
          {parking.facilities?.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Facilities</h2>
              <div className="flex flex-wrap gap-2">
                {parking.facilities.map((facility, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {facility}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Map placeholder */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Location</h2>
            <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Map will be displayed here</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Pricing</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Car (per hour)</span>
                <span className="font-medium">Rp {parking.rates?.car?.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Motorcycle (per hour)</span>
                <span className="font-medium">Rp {parking.rates?.motorcycle?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Book Now */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Book Now</h2>
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium">
              Book This Parking
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Secure booking with instant confirmation
            </p>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Need Help?</h2>
            <button className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50">
              Contact Owner
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkingDetail;