import { gql } from '@apollo/client';

// Booking Subscriptions
export const BOOKING_STATUS_CHANGED = gql`
  subscription BookingStatusChanged($parkingLotId: ID!) {
    bookingStatusChanged(parkingLotId: $parkingLotId) {
      _id
      parkingLotId
      vehicleType
      startTime
      duration
      cost
      status
      createdAt
      payment {
        status
        paymentMethod
      }
    }
  }
`;

export const PARKING_LOT_AVAILABILITY_CHANGED = gql`
  subscription ParkingLotAvailabilityChanged($parkingLotId: ID!) {
    parkingLotAvailabilityChanged(parkingLotId: $parkingLotId) {
      _id
      availableSlots
      totalSlots
      updatedAt
    }
  }
`;

// Chat Subscriptions
export const CHAT_RECEIVED = gql`
  subscription ChatReceived($bookingId: ID!) {
    chatReceived(bookingId: $bookingId) {
      _id
      message
      sender {
        _id
        name
        avatar
      }
      receiver {
        _id
        name
        avatar
      }
      createdAt
    }
  }
`;

export const CHAT_STATUS_UPDATED = gql`
  subscription ChatStatusUpdated($userId: ID!) {
    chatStatusUpdated(userId: $userId) {
      _id
      isRead
      updatedAt
    }
  }
`;

// Payment Subscriptions
export const PAYMENT_STATUS_UPDATED = gql`
  subscription PaymentStatusUpdated($paymentId: ID!) {
    paymentStatusUpdated(paymentId: $paymentId) {
      _id
      status
      transactionId
      midtransTransactionId
      updatedAt
    }
  }
`;

// Notification Subscriptions
export const NOTIFICATION_RECEIVED = gql`
  subscription NotificationReceived {
    notificationReceived {
      _id
      type
      title
      message
      data
      isRead
      createdAt
    }
  }
`;

// Saldo Subscriptions
export const SALDO_UPDATED = gql`
  subscription SaldoUpdated($userId: ID!) {
    saldoUpdated(userId: $userId) {
      _id
      userId
      type
      amount
      status
      transactionId
      createdAt
    }
  }
`;

// Location-based Subscriptions
export const NEARBY_BOOKINGS_UPDATED = gql`
  subscription NearbyBookingsUpdated($lat: Float!, $lng: Float!, $radius: Float!) {
    nearbyBookingsUpdated(lat: $lat, lng: $lng, radius: $radius) {
      _id
      parkingLot {
        _id
        name
        availableSlots
        location {
          coordinates
        }
      }
      status
      updatedAt
    }
  }
`;
