import React from 'react';
import PropTypes from 'prop-types';
import { Card, Button, Badge } from '../common';

const BookingConfirmation = ({
  parkingLot,
  bookingDetails,
  user,
  onConfirm,
  onCancel,
  onChangeDetails,
  loading = false,
  className = ''
}) => {
  if (!parkingLot || !bookingDetails) {
    return null;
  }

  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateEndTime = (startTime, durationHours) => {
    const start = new Date(startTime);
    const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);
    return end;
  };

  const formatPrice = (price) => {
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  const totalPrice = parkingLot.price * bookingDetails.duration;
  const endTime = calculateEndTime(bookingDetails.startTime, bookingDetails.duration);
  const isWalletSufficient = user?.saldo >= totalPrice;

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
        <h2 className="text-xl font-bold mb-1">Booking Confirmation</h2>
        <p className="text-white/80 text-sm">Review your parking details before confirming</p>
      </div>
      
      <div className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <div 
            className="w-16 h-16 bg-cover bg-center rounded-lg flex-shrink-0"
            style={{ backgroundImage: `url(${parkingLot.images?.[0] || '/default-parking.jpg'})` }}
          ></div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{parkingLot.name}</h3>
            <p className="text-sm text-gray-600">{parkingLot.address}</p>
            
            <div className="flex flex-wrap gap-1.5 mt-2">
              {parkingLot.facilities?.slice(0, 3).map((facility, i) => (
                <Badge key={i} variant="light" size="small">{facility}</Badge>
              ))}
            </div>
          </div>
        </div>
        
        <div className="space-y-4 mb-6">
          <div className="flex justify-between pb-2 border-b border-gray-100">
            <span className="text-gray-600">Vehicle Type</span>
            <span className="font-medium text-gray-900">
              {bookingDetails.vehicleType === 'car' ? '🚗 Car' : '🏍️ Motorcycle'}
            </span>
          </div>
          
          <div className="flex justify-between pb-2 border-b border-gray-100">
            <span className="text-gray-600">Start Time</span>
            <span className="font-medium text-gray-900">{formatDateTime(bookingDetails.startTime)}</span>
          </div>
          
          <div className="flex justify-between pb-2 border-b border-gray-100">
            <span className="text-gray-600">End Time</span>
            <span className="font-medium text-gray-900">{formatDateTime(endTime)}</span>
          </div>
          
          <div className="flex justify-between pb-2 border-b border-gray-100">
            <span className="text-gray-600">Duration</span>
            <span className="font-medium text-gray-900">{bookingDetails.duration} hours</span>
          </div>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Hourly Rate</span>
            <span className="font-medium text-gray-900">{formatPrice(parkingLot.price)}</span>
          </div>
          
          <div className="flex justify-between items-center mt-1">
            <span className="text-gray-700">Duration</span>
            <span className="font-medium text-gray-900">× {bookingDetails.duration} hours</span>
          </div>
          
          <div className="border-t border-orange-200 my-2"></div>
          
          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-900">Total</span>
            <span className="font-bold text-orange-600 text-lg">{formatPrice(totalPrice)}</span>
          </div>
        </div>
        
        <div className="space-y-2 mb-6">
          <h4 className="font-medium text-gray-900">Payment Method</h4>
          
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <div>
                <div className="font-medium">Wallet Balance</div>
                <div className="text-sm text-gray-500">Primary payment method</div>
              </div>
            </div>
            
            <div className={`font-bold ${isWalletSufficient ? 'text-green-600' : 'text-red-600'}`}>
              {formatPrice(user?.saldo || 0)}
            </div>
          </div>
          
          {!isWalletSufficient && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">Insufficient wallet balance. Please top up your wallet.</p>
                  <div className="mt-2">
                    <Button variant="outline" size="small" onClick={() => window.location.href = '/wallet'}>
                      Top Up Now
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            size="large" 
            onClick={onCancel} 
            disabled={loading} 
            className="flex-1"
          >
            Cancel
          </Button>
          
          <Button 
            variant="primary" 
            size="large" 
            onClick={onConfirm} 
            disabled={loading || !isWalletSufficient} 
            loading={loading}
            className="flex-1"
          >
            Confirm Booking
          </Button>
        </div>
        
        <button
          className="w-full text-center text-sm text-orange-600 hover:text-orange-700 mt-4"
          onClick={onChangeDetails}
        >
          Change Booking Details
        </button>
      </div>
    </Card>
  );
};

BookingConfirmation.propTypes = {
  parkingLot: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    images: PropTypes.arrayOf(PropTypes.string),
    facilities: PropTypes.arrayOf(PropTypes.string)
  }),
  bookingDetails: PropTypes.shape({
    vehicleType: PropTypes.oneOf(['car', 'motorcycle']).isRequired,
    startTime: PropTypes.string.isRequired,
    duration: PropTypes.number.isRequired
  }),
  user: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    saldo: PropTypes.number.isRequired
  }),
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onChangeDetails: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  className: PropTypes.string
};

export default BookingConfirmation;
