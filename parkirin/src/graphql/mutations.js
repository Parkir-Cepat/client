// src/graphql/mutations.js
import { gql } from '@apollo/client';

// Auth Mutations
export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        _id
        email
        name
        role
        saldo
        created_at
      }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        _id
        email
        name
        role
        saldo
        created_at
      }
    }
  }
`;

export const GOOGLE_AUTH = gql`
  mutation GoogleAuth($token: String!) {
    googleAuth(token: $token) {
      token
      user {
        _id
        email
        name
        role
        saldo
        created_at
      }
    }
  }
`;

// User Mutations
export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($name: String!) {
    updateProfile(name: $name) {
      _id
      name
      email
      avatar
    }
  }
`;

export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($oldPassword: String!, $newPassword: String!) {
    changePassword(oldPassword: $oldPassword, newPassword: $newPassword)
  }
`;

// Parking Mutations
export const CREATE_PARKING = gql`
  mutation CreateParking($input: CreateParkingInput!) {
    createParking(input: $input) {
      _id
      name
      address
      location {
        coordinates
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
      images
      status
    }
  }
`;

export const UPDATE_PARKING = gql`
  mutation UpdateParking($id: ID!, $input: UpdateParkingInput!) {
    updateParking(id: $id, input: $input) {
      _id
      name
      address
      rates {
        car
        motorcycle
      }
      operational_hours {
        open
        close
      }
      facilities
      images
      status
    }
  }
`;

export const DELETE_PARKING = gql`
  mutation DeleteParking($id: ID!) {
    deleteParking(id: $id)
  }
`;

// Booking Mutations
export const CREATE_BOOKING = gql`
  mutation CreateBooking($input: CreateBookingInput!) {
    createBooking(input: $input) {
      _id
      user {
        _id
        name
      }
      parking {
        _id
        name
        address
      }
      vehicleType
      licensePlate
      startTime
      endTime
      duration
      cost
      status
      createdAt
    }
  }
`;

export const CANCEL_BOOKING = gql`
  mutation CancelBooking($id: ID!) {
    cancelBooking(id: $id) {
      _id
      status
      cancelledAt
    }
  }
`;

export const CONFIRM_BOOKING = gql`
  mutation ConfirmBooking($id: ID!) {
    confirmBooking(id: $id) {
      _id
      status
      confirmedAt
    }
  }
`;

export const EXTEND_BOOKING = gql`
  mutation ExtendBooking($id: ID!, $additionalDuration: Int!) {
    extendBooking(id: $id, additionalDuration: $additionalDuration) {
      _id
      duration
      cost
      endTime
      updatedAt
    }
  }
`;

export const GENERATE_BOOKING_QR = gql`
  mutation GenerateBookingQR($bookingId: ID!) {
    generateBookingQR(bookingId: $bookingId) {
      _id
      qr_code
    }
  }
`;

export const GENERATE_PARKING_ACCESS_QR = gql`
  mutation GenerateParkingAccessQR($bookingId: ID!, $type: String!) {
    generateParkingAccessQR(bookingId: $bookingId, type: $type)
  }
`;

// Payment Mutations
export const CREATE_PAYMENT = gql`
  mutation CreatePayment($input: CreatePaymentInput!) {
    createPayment(input: $input) {
      _id
      transactionId
      paymentMethod
      amount
      status
      qrCodeUrl
      createdAt
    }
  }
`;

export const TOP_UP_SALDO = gql`
  mutation TopUpSaldo($input: TopUpInput!) {
    topUpSaldo(input: $input) {
      _id
      type
      amount
      paymentMethod
      status
      transactionId
      qrCodeUrl
      createdAt
    }
  }
`;

export const CONFIRM_PAYMENT = gql`
  mutation ConfirmPayment($transactionId: String!) {
    confirmPayment(transactionId: $transactionId) {
      _id
      status
      updated_at
    }
  }
`;

// Notification Mutations
export const MARK_NOTIFICATION_AS_READ = gql`
  mutation MarkNotificationAsRead($id: ID!) {
    markNotificationAsRead(id: $id)
  }
`;

export const MARK_ALL_NOTIFICATIONS_AS_READ = gql`
  mutation MarkAllNotificationsAsRead {
    markAllNotificationsAsRead
  }
`;

export const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification($notificationId: ID!) {
    deleteNotification(notificationId: $notificationId) {
      success
      message
    }
  }
`;

// Payment Mutations
export const ADD_PAYMENT_METHOD = gql`
  mutation AddPaymentMethod($input: PaymentMethodInput!) {
    addPaymentMethod(input: $input) {
      id
      name
      type
      lastFour
      isDefault
    }
  }
`;

export const DELETE_PAYMENT_METHOD = gql`
  mutation DeletePaymentMethod($paymentMethodId: ID!) {
    deletePaymentMethod(paymentMethodId: $paymentMethodId) {
      success
      message
    }
  }
`;

export const TOP_UP_WALLET = gql`
  mutation TopUpWallet($amount: Float!) {
    topUpWallet(amount: $amount) {
      transactionId
      status
      amount
      newBalance
    }
  }
`;
