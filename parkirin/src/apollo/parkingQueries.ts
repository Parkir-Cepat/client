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
