import { gql } from '@apollo/client';

export const GET_PARKING_LOT = gql`
  query GetParkingLot($id: ID!) {
    getParkingLot(id: $id) {
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
      status
      rating
      reviewCount
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_BOOKING = gql`
  mutation CreateBooking($input: CreateBookingInput!) {
    createBooking(input: $input) {
      _id
      vehicleType
      startTime
      duration
      cost
      status
    }
  }
`;

export const CREATE_PAYMENT = gql`
  mutation CreatePayment($input: CreatePaymentInput!) {
    createPayment(input: $input) {
      _id
      status
      paymentMethod
      paymentToken
      paymentUrl
    }
  }
`;
