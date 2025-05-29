// src/graphql/subscriptions.js
import { gql } from '@apollo/client';

// Booking Subscriptions
export const BOOKING_STATUS_CHANGED = gql`
  subscription BookingStatusChanged($parkingId: ID!) {
    bookingStatusChanged(parking_id: $parkingId) {
      _id
      status
      updated_at
    }
  }
`;

// Payment Subscriptions
export const PAYMENT_STATUS_CHANGED = gql`
  subscription PaymentStatusChanged($bookingId: ID!) {
    paymentStatusChanged(bookingId: $bookingId) {
      _id
      status
      updated_at
    }
  }
`;

export const SALDO_UPDATED = gql`
  subscription SaldoUpdated($userId: ID!) {
    saldoUpdated(userId: $userId) {
      _id
      type
      amount
      status
      created_at
    }
  }
`;

// Chat Subscriptions
export const MESSAGE_SENT = gql`
  subscription MessageSent($roomId: ID!) {
    messageSent(room_id: $roomId) {
      _id
      sender {
        _id
        name
        avatar
      }
      message
      message_type
      created_at
    }
  }
`;

export const MESSAGE_STATUS_UPDATED = gql`
  subscription MessageStatusUpdated($roomId: ID!) {
    messageStatusUpdated(room_id: $roomId) {
      message_id
      read_by
      delivered_to
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
      is_read
      created_at
    }
  }
`;

// Parking Subscriptions
export const PARKING_AVAILABILITY_CHANGED = gql`
  subscription ParkingAvailabilityChanged($parkingId: ID!) {
    parkingAvailabilityChanged(parkingId: $parkingId) {
      _id
      available {
        car
        motorcycle
      }
      updated_at
    }
  }
`;
