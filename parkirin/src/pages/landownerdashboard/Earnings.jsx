import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_MY_PARKINGS, GET_PARKING_BOOKINGS } from '../../graphql/queries';

const Earnings = () => {
  const { data: parkingsData, loading: parkingsLoading } = useQuery(GET_MY_PARKINGS);

  if (parkingsLoading) return <div className="p-8 text-center">Loading...</div>;
  const parkings = parkingsData?.getMyParkings || [];

  // Dummy: total earning per parking, normally should be fetched with aggregation from backend
  // For demo, sum all completed bookings' payment.amount per parking
  // In real app, use a custom query for efficiency

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-[#f16634] mb-6">Earnings & Revenue</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {parkings.map(parking => (
          <ParkingEarningCard key={parking._id} parking={parking} />
        ))}
      </div>
    </div>
  );
};

const ParkingEarningCard = ({ parking }) => {
  const { data: bookingsData, loading } = useQuery(GET_PARKING_BOOKINGS, { variables: { parking_id: parking._id } });
  if (loading) return <div className="bg-white rounded-xl shadow p-6">Loading...</div>;
  const bookings = bookingsData?.getParkingBookings || [];
  const totalEarning = bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.payment?.amount || 0), 0);
  const completedCount = bookings.filter(b => b.status === 'completed').length;
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-bold text-[#f16634] mb-2">{parking.name}</h2>
      <div className="text-gray-600 mb-2">{parking.address}</div>
      <div className="mb-2">Total Earning: <span className="font-bold text-green-600">Rp {totalEarning.toLocaleString()}</span></div>
      <div className="mb-2">Completed Bookings: <span className="font-bold">{completedCount}</span></div>
    </div>
  );
};

export default Earnings; 