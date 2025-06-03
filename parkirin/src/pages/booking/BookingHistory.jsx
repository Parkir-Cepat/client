import { useQuery, gql } from '@apollo/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import BookingHistoryTable from '../../components/booking/BookingHistoryTable';
import Card from '../../components/common/Card';

const GET_BOOKING_HISTORY = gql`  
  query GetMyBookingHistory {
    getMyBookingHistory {
      _id
      start_time
      duration
      cost
      status
    }
  }
`;

const BookingHistory = () => {
  const { loading, error, data } = useQuery(GET_BOOKING_HISTORY);

  if (loading) return <LoadingSpinner size="large" variant="primary" />;
  
  if (error) return (
    <div className="w-full py-6 px-4 sm:px-6 max-w-7xl mx-auto">
      <Card className="bg-red-50 border border-red-100" padding="medium" rounded="xl">
        <p className="text-red-600">Error loading booking history: {error.message}</p>
      </Card>
    </div>
  );

  const bookings = data?.getMyBookingHistory || [];

  return (
    <div className="w-full py-6 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-orange-500">Booking History</h2>
        <div className="flex space-x-2">
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
            <option value="all">All Bookings</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      
      <BookingHistoryTable bookings={bookings} />
    </div>
  );
};

export default BookingHistory;
