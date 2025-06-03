import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ParkingDetailHeader from '../../components/parking/ParkingDetailHeader';
import ParkingAvailability from '../../components/parking/ParkingAvailability';
import ParkingFacilities from '../../components/parking/ParkingFacilities';
import ParkingPricing from '../../components/parking/ParkingPricing';
import ParkingOwnerContact from '../../components/parking/ParkingOwnerContact';
import ParkingBookingForm from '../../components/parking/ParkingBookingForm';

const GET_PARKING_LOT = gql`
  query GetParkingLot($id: ID!) {
    getParkingLot(id: $id) {
      _id
      name
      address
      description
      images
      owner {
        _id
        name
        email
        avatar
      }
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
      operational_hours {
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
  if (loading) return <LoadingSpinner size="large" variant="primary" />;

  if (error) return (
    <div className="text-red-600 p-4 bg-red-50 border border-red-100 rounded-lg shadow-sm">
      Error: {error.message}
    </div>
  );

  const parking = data?.getParkingLot;

  if (!parking) return (
    <div className="text-center p-8 bg-orange-50 rounded-lg shadow-sm">
      <p className="text-gray-500">Parking lot not found</p>
    </div>
  );
  return (
    <div className="w-full py-6 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Header */}
      <ParkingDetailHeader parking={parking} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Availability */}
          <ParkingAvailability parking={parking} />
          
          {/* Facilities */}
          <ParkingFacilities facilities={parking.facilities} />
          
          {/* Map placeholder */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-lg font-bold text-orange-500 mb-4">Location</h2>
            <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center overflow-hidden">
              <p className="text-gray-500">Map will be displayed here</p>
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing */}
          <ParkingPricing rates={parking.rates} />

          {/* Contact Owner */}
          <ParkingOwnerContact parking={parking} />

          {/* Book Now */}
          <ParkingBookingForm 
            parking={parking} 
            onBook={(bookingData) => {
              console.log('Booking:', bookingData);
              // Implement booking logic here
            }} 
          />
        </div>
      </div>
    </div>
  );
};

export default ParkingDetail;