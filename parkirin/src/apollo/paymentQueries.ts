import { gql } from '@apollo/client';

export const GET_BOOKING_PAYMENT = gql`
  query GetBookingPayment($bookingId: ID!) {
    getBookingPayment(bookingId: $bookingId) {
      _id
      booking {
        _id
        parkingLot {
          name
          address
        }
        vehicleType
        duration
        cost
      }
      paymentMethod
      amount
      status
      qrCodeUrl
      transactionId
      createdAt
    }
  }
`;

export const CREATE_PAYMENT = gql`
  mutation CreatePayment($input: CreatePaymentInput!) {
    createPayment(input: $input) {
      _id
      paymentMethod
      amount
      status
      qrCodeUrl
      transactionId
      createdAt
    }
  }
`;

export const GET_MY_PAYMENT_HISTORY = gql`
  query GetMyPaymentHistory {
    getMyPaymentHistory {
      _id
      booking {
        _id
        parkingLot {
          name
        }
        duration
        cost
      }
      paymentMethod
      amount
      status
      createdAt
    }
  }
`;

export const GET_MY_SALDO_TRANSACTIONS = gql`
  query GetMySaldoTransactions {
    getMySaldoTransactions {
      _id
      userId
      user {
        name
        email
      }
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

export const TOP_UP_SALDO = gql`
  mutation TopUpSaldo($input: TopUpInput!) {
    topUpSaldo(input: $input) {
      _id
      amount
      paymentMethod
      status
      qrCodeUrl
      transactionId
    }
  }
`;
