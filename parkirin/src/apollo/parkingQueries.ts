import { gql } from '@apollo/client';

export const SEARCH_PARKING_LOTS = gql`
  query SearchParkingLots($query: String!) {
    searchParkingLots(query: $query) {
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
      facilities
      status
      rating
      reviewCount
      createdAt
      updatedAt
    }
  }
`;

export const GET_PARKING_LOT = gql`
  query GetParkingLot($id: ID!) {
    getParking(id: $id) {
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
        avatar
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
      rating
      review_count
      status
      created_at
    }
  }
`;
