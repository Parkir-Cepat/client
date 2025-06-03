// src/components/booking/BookingHistoryTable.jsx
import React from 'react';
import { 
  CalendarIcon, 
  ClockIcon, 
  CurrencyDollarIcon, 
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';

const BookingHistoryTable = ({ bookings = [] }) => {
  if (!bookings || bookings.length === 0) {
    return (
      <Card className="text-center py-16" rounded="xl">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mb-4">
            <CalendarIcon className="w-10 h-10 text-orange-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
          <p className="text-gray-500 mb-6">You haven't made any parking bookings yet.</p>
          <Button variant="primary" rounded="full" size="medium">Find Parking</Button>
        </div>
      </Card>
    );
  }

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ExclamationCircleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  return (
    <Card className="overflow-hidden" rounded="xl" padding="none">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-orange-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-orange-600 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-orange-600 uppercase tracking-wider">Duration</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-orange-600 uppercase tracking-wider">Cost</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-orange-600 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-orange-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {bookings.map((booking) => (
              <tr key={booking._id} className="hover:bg-orange-50/50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 text-orange-400 mr-2" />
                    <span className="text-sm text-gray-900">{new Date(parseInt(booking.start_time)).toLocaleDateString()}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 text-orange-400 mr-2" />
                    <span className="text-sm text-gray-900">{booking.duration} hours</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-5 w-5 text-orange-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">Rp {booking.cost.toLocaleString()}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Badge variant={getStatusBadgeVariant(booking.status)} icon={getStatusIcon(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <Button variant="ghost" size="xs">Details</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default BookingHistoryTable;
