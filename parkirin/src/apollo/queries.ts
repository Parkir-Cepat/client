import { gql } from '@apollo/client';

// Authentication Queries & Mutations
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
        avatar
        isEmailVerified
        createdAt
      }
    }
  }
`;

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
        avatar
        isEmailVerified
        createdAt
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
        name
        email
        role
        saldo
        avatar
        isEmailVerified
        createdAt
      }
    }
  }
`;

export const ME = gql`
  query Me {
    me {
      _id
      email
      name
      role
      saldo
      avatar
      isEmailVerified
      createdAt
    }
  }
`;

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      _id
      name
      email
      avatar
    }
  }
`;

// User Queries
export const GET_USER_BY_ID = gql`
  query GetUser($userId: ID!) {
    getUserById(userId: $userId) {
      _id
      name
      email
      role
      avatar
      createdAt
    }
  }
`;

export const GET_SALDO_HISTORY = gql`
  query GetSaldoHistory($limit: Int, $offset: Int) {
    getSaldoHistory(limit: $limit, offset: $offset) {
      _id
      amount
      type
      description
      balanceBefore
      balanceAfter
      createdAt
    }
  }
`;

// Search parking lots query moved to parkingQueries.ts

export const GET_PARKING_LOT = gql`
  query GetParkingLot($id: ID!) {
    getParkingLot(id: $id) {
      _id
      name
      address
      description
      photos
      location {
        coordinates
      }
      owner {
        _id
        name
        avatar
      }
      availableSlots
      totalSlots
      vehicleTypes
      tariff
      operationalHours {
        open
        close
      }
      facilities
      rating
      reviews {
        _id
        user {
          name
          avatar
        }
        rating
        comment
        createdAt
      }
      isActive
      createdAt
    }
  }
`;

export const CREATE_PARKING_LOT = gql`
  mutation CreateParkingLot($input: CreateParkingLotInput!) {
    createParkingLot(input: $input) {
      _id
      name
      address
      photos
      location {
        coordinates
      }
      totalSlots
      tariff
      isActive
    }
  }
`;

export const UPDATE_PARKING_LOT = gql`
  mutation UpdateParkingLot($input: UpdateParkingLotInput!) {
    updateParkingLot(input: $input) {
      _id
      name
      address
      photos
      availableSlots
      totalSlots
      tariff
      updatedAt
    }
  }
`;

export const DELETE_PARKING_LOT = gql`
  mutation DeleteParkingLot($id: ID!) {
    deleteParkingLot(id: $id) {
      _id
      name
    }
  }
`;

export const GET_MY_PARKING_LOTS = gql`
  query GetMyParkingLots {
    getMyParkingLots {
      _id
      name
      address
      photos
      availableSlots
      totalSlots
      tariff
      rating
      isActive
      createdAt
    }
  }
`;

export const GET_PARKING_LOT_DETAILS = gql`
  query GetParkingLotDetails($id: ID!) {
    getParkingLot(id: $id) {
      _id
      name
      address
      location {
        coordinates
      }
      owner {
        _id
        name
        email
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
      operationalHours {
        open
        close
      }
      facilities
      images
      rating
      reviewCount
      status
    }
  }
`;

// Booking Queries & Mutations
export const CREATE_BOOKING = gql`
  mutation CreateBooking($input: CreateBookingInput!) {
    createBooking(input: $input) {
      _id
      parkingLot {
        _id
        name
        address
      }
      vehicleType
      startTime
      duration
      cost
      status
    }
  }
`;

export const GET_MY_ACTIVE_BOOKINGS = gql`
  query GetMyActiveBookings {
    getMyActiveBookings {
      _id
      parkingLot {
        _id
        name
        address
        photos
      }
      vehicleType
      startTime
      duration
      cost
      status
      qrCode
      entryQR
      exitQR
      payment {
        status
        paymentMethod
      }
      createdAt
    }
  }
`;

export const GET_MY_BOOKING_HISTORY = gql`
  query GetMyBookingHistory($limit: Int, $offset: Int) {
    getMyBookingHistory(limit: $limit, offset: $offset) {
      _id
      parkingLot {
        _id
        name
        address
        photos
      }
      vehicleType
      startTime
      duration
      cost
      status
      payment {
        status
        paymentMethod
      }
      createdAt
    }
  }
`;

export const EXTEND_BOOKING = gql`
  mutation ExtendBooking($input: ExtendBookingInput!) {
    extendBooking(input: $input) {
      _id
      duration
      extendedDuration
      cost
      updatedAt
    }
  }
`;

export const CANCEL_BOOKING = gql`
  mutation CancelBooking($bookingId: ID!) {
    cancelBooking(bookingId: $bookingId) {
      _id
      status
      updatedAt
    }
  }
`;

export const GENERATE_BOOKING_QR = gql`
  mutation GenerateBookingQR($bookingId: ID!) {
    generateBookingQR(bookingId: $bookingId) {
      _id
      qrCode
      entryQR
      exitQR
    }
  }
`;

// Payment Queries & Mutations
export const CREATE_PAYMENT = gql`
  mutation CreatePayment($input: CreatePaymentInput!) {
    createPayment(input: $input) {
      _id
      amount
      paymentMethod
      status
      paymentUrl
      paymentToken
    }
  }
`;

export const TOP_UP_SALDO = gql`
  mutation TopUpSaldo($input: TopUpInput!) {
    topUpSaldo(input: $input) {
      _id
      amount
      paymentUrl
      paymentToken
    }
  }
`;

export const GET_PAYMENT_HISTORY = gql`
  query GetPaymentHistory($limit: Int, $offset: Int) {
    getPaymentHistory(limit: $limit, offset: $offset) {
      _id
      amount
      paymentMethod
      status
      type
      createdAt
      booking {
        _id
        parkingLot {
          name
        }
      }
    }
  }
`;

// Review Queries & Mutations
export const CREATE_REVIEW = gql`
  mutation CreateReview($input: CreateReviewInput!) {
    createReview(input: $input) {
      _id
      rating
      comment
      createdAt
      user {
        name
        avatar
      }
    }
  }
`;

// Chat Queries & Mutations
export const SEND_CHAT = gql`
  mutation SendChat($input: SendChatInput!) {
    sendChat(input: $input) {
      _id
      message
      sender {
        _id
        name
        avatar
      }
      createdAt
    }
  }
`;

export const GET_CHAT_HISTORY = gql`
  query GetChatHistory($bookingId: ID!, $limit: Int, $offset: Int) {
    getChatHistory(bookingId: $bookingId, limit: $limit, offset: $offset) {
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
      isRead
      createdAt
    }
  }
`;

export const MARK_CHAT_AS_READ = gql`
  mutation MarkChatAsRead($chatId: ID!) {
    markChatAsRead(chatId: $chatId) {
      _id
      isRead
    }
  }
`;

// Notification Queries & Mutations
export const GET_NOTIFICATIONS = gql`
  query GetNotifications($limit: Int, $offset: Int) {
    getNotifications(limit: $limit, offset: $offset) {
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

export const MARK_NOTIFICATION_AS_READ = gql`
  mutation MarkNotificationAsRead($notificationId: ID!) {
    markNotificationAsRead(notificationId: $notificationId) {
      _id
      isRead
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_AS_READ = gql`
  mutation MarkAllNotificationsAsRead {
    markAllNotificationsAsRead {
      modifiedCount
    }
  }
`;

// Email Verification Mutations
export const VERIFY_EMAIL = gql`
  mutation VerifyEmail($token: String!) {
    verifyEmail(token: $token) {
      success
      message
    }
  }
`;

export const RESEND_VERIFICATION = gql`
  mutation ResendVerification($email: String!) {
    resendVerification(email: $email) {
      success
      message
    }
  }
`;

// Password Reset Mutations
export const FORGOT_PASSWORD = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email) {
      success
      message
    }
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input) {
      success
      message
    }
  }
`;

export const GET_PARKING_LOT_BOOKINGS = gql`
  query GetParkingLotBookings($parkingLotId: ID!) {
    getParkingLotBookings(parkingLotId: $parkingLotId) {
      _id
      user {
        _id
        name
        email
        avatar
      }
      vehicleType
      startTime
      duration
      cost
      status
      payment {
        status
        paymentMethod
      }
      createdAt
    }
  }
`;
