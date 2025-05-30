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
        type
        coordinates
      }
      capacity {
        car
        motorcycle
      }
      available {
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
      rating
      review_count
      created_at
    }
  }
`;

export const UPDATE_PARKING = gql`
  mutation UpdateParking($input: UpdateParkingInput!) {
    updateParking(input: $input) {
      _id
      name
      description
      address
      location {
        type
        coordinates
      }
      total_slots
      available_slots
      tariff
      vehicle_types
      amenities
      images
      opening_hour
      closing_hour
      status
      updated_at
    }
  }
`;

export const DELETE_PARKING = gql`
  mutation DeleteParking($id: ID!) {
    deleteParking(id: $id)
  }
`;

// Room Mutations
export const CREATE_ROOM = gql`
  mutation CreateRoom($input: CreateRoomInput!) {
    createRoom(input: $input) {
      _id
      name
      type
      privacy
      creator_id
      max_participants
      is_full
      created_at
    }
  }
`;

export const UPDATE_ROOM = gql`
  mutation UpdateRoom($id: ID!, $input: UpdateRoomInput!) {
    updateRoom(id: $id, input: $input) {
      _id
      nameRoom
      updated_at
    }
  }
`;

export const ADD_PARTICIPANTS = gql`
  mutation AddParticipants($room_id: ID!, $participant_ids: [ID!]!) {
    addParticipants(room_id: $room_id, participant_ids: $participant_ids)
  }
`;

export const CREATE_PRIVATE_ROOM = gql`
  mutation CreatePrivateRoom($input: CreatePrivateRoomInput!) {
    createPrivateRoom(input: $input) {
      _id
      name
      type
      privacy
      creator_id
      participants {
        _id
        name
        avatar
      }
      participant_count
      created_at
    }
  }
`;

export const JOIN_ROOM = gql`
  mutation JoinRoom($input: JoinRoomInput!) {
    joinRoom(input: $input) {
      _id
      name
      type
      privacy
      participant_count
      is_full
    }
  }
`;

export const LEAVE_ROOM = gql`
  mutation LeaveRoom($roomId: ID!) {
    leaveRoom(room_id: $roomId)
  }
`;

// Booking Mutations
export const CREATE_BOOKING = gql`  mutation CreateBooking($input: CreateBookingInput!) {
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
      vehicle_type
      start_time
      duration
      cost
      status
      created_at
    }
  }
`;

export const CANCEL_BOOKING = gql`
  mutation CancelBooking($id: ID!) {
    cancelBooking(id: $id) {
      _id
      status
      updated_at
    }
  }
`;

export const CONFIRM_BOOKING = gql`
  mutation ConfirmBooking($id: ID!) {
    confirmBooking(id: $id) {
      _id
      status
      updated_at
    }
  }
`;

export const EXTEND_BOOKING = gql`
  mutation ExtendBooking($id: ID!, $additionalDuration: Int!) {
    extendBooking(id: $id, additionalDuration: $additionalDuration) {
      _id
      duration
      cost
      status
      duration
      price
      updated_at
    }
  }
`;

export const GENERATE_BOOKING_QR = gql`
  mutation GenerateBookingQR($bookingId: ID!) {
    generateBookingQR(bookingId: $bookingId)
  }
`;

export const GENERATE_PARKING_ACCESS_QR = gql`
  mutation GenerateParkingAccessQR($bookingId: ID!, $type: String!) {
    generateParkingAccessQR(bookingId: $bookingId, type: $type)
  }
`;

export const VERIFY_QR_CODE = gql`
  mutation VerifyQRCode($qrToken: String!) {
    verifyQRCode(qrToken: $qrToken) {
      isValid
      message
      booking {
        _id
        status
        user {
          name
        }
        parking {
          name
        }
      }
    }
  }
`;

// Transaction Mutations
export const CONFIRM_PAYMENT = gql`
  mutation ConfirmPayment($transaction_id: String!) {
    confirmPayment(transaction_id: $transaction_id) {
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
      _id
      name
      type
      last_four
      is_default
      created_at
    }
  }
`;

export const DELETE_PAYMENT_METHOD = gql`
  mutation DeletePaymentMethod($paymentMethodId: ID!) {
    deletePaymentMethod(payment_method_id: $paymentMethodId) {
      success
      message
    }
  }
`;

export const CREATE_PAYMENT = gql`
  mutation CreatePayment($input: CreatePaymentInput!) {
    createPayment(input: $input) {
      transaction {
        _id
        amount
        transaction_id
        status
      }
      payment_url
      qr_code
    }
  }
`;

export const TOP_UP_WALLET = gql`
  mutation TopUpWallet($input: TopUpInput!) {
    topUpSaldo(input: $input) {
      transaction {
        _id
        amount
        transaction_id
        status
      }
      payment_url
      qr_code
    }
  }
`;
