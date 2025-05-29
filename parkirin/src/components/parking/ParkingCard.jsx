// src/components/parking/ParkingCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Badge, Button } from '../common';
import { formatCurrency, formatDistance } from '../../utils/formatters';
import { classNames } from '../../utils/helpers';

const ParkingCard = ({
  parking,
  userLocation,
  onFavorite,
  onBook,
  isFavorite = false,
  showActions = true,
  className = ''
}) => {
  const {
    id,
    name,
    address,
    pricePerHour,
    images,
    rating,
    totalReviews,
    availableSpaces,
    totalSpaces,
    facilities,
    location: parkingLocation,
    operationalHours,
    vehicleTypes
  } = parking;

  const distance = userLocation && parkingLocation
    ? formatDistance(userLocation, parkingLocation)
    : null;

  const isOpen = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    if (!operationalHours || operationalHours.length === 0) return true;
    
    const todaySchedule = operationalHours.find(schedule => 
      schedule.dayOfWeek === currentDay
    );
    
    if (!todaySchedule) return false;
    
    const openHour = parseInt(todaySchedule.openTime.split(':')[0]);
    const closeHour = parseInt(todaySchedule.closeTime.split(':')[0]);
    
    return currentHour >= openHour && currentHour < closeHour;
  };

  const getAvailabilityStatus = () => {
    const ratio = availableSpaces / totalSpaces;
    if (ratio > 0.5) return { status: 'available', color: 'success' };
    if (ratio > 0.2) return { status: 'limited', color: 'warning' };
    return { status: 'full', color: 'danger' };
  };

  const availability = getAvailabilityStatus();

  return (
    <Card
      className={classNames('overflow-hidden hover:shadow-lg transition-shadow duration-200', className)}
      padding="none"
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-200">
        {images && images.length > 0 ? (
          <img
            src={images[0]}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <Badge
            variant={isOpen() ? 'success' : 'danger'}
            size="small"
          >
            {isOpen() ? 'Open' : 'Closed'}
          </Badge>
        </div>
        
        {/* Favorite Button */}
        {showActions && (
          <button
            onClick={() => onFavorite?.(id)}
            className="absolute top-3 right-3 p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <svg
              className={classNames(
                'h-5 w-5',
                isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'
              )}
              fill={isFavorite ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <Link
              to={`/parking/${id}`}
              className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200"
            >
              {name}
            </Link>
            <p className="text-sm text-gray-600 mt-1">{address}</p>
          </div>
          <div className="text-right ml-4">
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(pricePerHour)}
            </p>
            <p className="text-xs text-gray-500">per hour</p>
          </div>
        </div>

        {/* Rating & Distance */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {rating && (
              <div className="flex items-center">
                <svg className="h-4 w-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="text-sm font-medium text-gray-900 ml-1">
                  {rating.toFixed(1)}
                </span>
                {totalReviews > 0 && (
                  <span className="text-sm text-gray-500 ml-1">
                    ({totalReviews})
                  </span>
                )}
              </div>
            )}
            {distance && (
              <span className="text-sm text-gray-500">{distance}</span>
            )}
          </div>
          
          <Badge variant={availability.color} size="small">
            {availableSpaces}/{totalSpaces} available
          </Badge>
        </div>

        {/* Vehicle Types */}
        {vehicleTypes && vehicleTypes.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {vehicleTypes.slice(0, 3).map((type) => (
              <Badge key={type} variant="secondary" size="small">
                {type.toLowerCase()}
              </Badge>
            ))}
            {vehicleTypes.length > 3 && (
              <Badge variant="secondary" size="small">
                +{vehicleTypes.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Facilities */}
        {facilities && facilities.length > 0 && (
          <div className="flex items-center space-x-3 mb-4 text-sm text-gray-600">
            {facilities.slice(0, 4).map((facility) => (
              <div key={facility} className="flex items-center">
                <span className="text-xs">
                  {facility === 'CCTV' && '📹'}
                  {facility === 'SECURITY' && '🛡️'}
                  {facility === 'COVERED' && '🏠'}
                  {facility === 'WASHROOM' && '🚻'}
                  {facility === 'ELECTRIC_CHARGING' && '🔌'}
                  {facility === 'VALET' && '🤵'}
                </span>
                <span className="ml-1 capitalize">
                  {facility.toLowerCase().replace('_', ' ')}
                </span>
              </div>
            ))}
            {facilities.length > 4 && (
              <span className="text-xs text-gray-500">
                +{facilities.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex space-x-2">
            <Link to={`/parking/${id}`} className="flex-1">
              <Button
                variant="outline"
                size="small"
                className="w-full"
              >
                View Details
              </Button>
            </Link>
            <Button
              variant="primary"
              size="small"
              className="flex-1"
              onClick={() => onBook?.(parking)}
              disabled={availableSpaces === 0 || !isOpen()}
            >
              {availableSpaces === 0 ? 'Full' : 'Book Now'}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ParkingCard;