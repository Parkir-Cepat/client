import { gql } from '@apollo/client';

export const SEARCH_PARKING_LOTS = gql`
  query SearchParkingLots(
    $latitude: Float!
    $longitude: Float!
    $maxDistance: Float
    $vehicleType: String
    $minPrice: Float
    $maxPrice: Float
    $sortBy: String
  ) {
    searchParkingLots(
      input: {
        latitude: $latitude
        longitude: $longitude
        maxDistance: $maxDistance
        vehicleType: $vehicleType
        minPrice: $minPrice
        maxPrice: $maxPrice
        sortBy: $sortBy
      }
    ) {
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
      photos
      facilities
      status
      rating
      reviewCount
      distance
      createdAt
      updatedAt
    }
  }
`;
