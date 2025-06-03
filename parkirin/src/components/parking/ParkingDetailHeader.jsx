// src/components/parking/ParkingDetailHeader.jsx
import React from 'react';
import { StarIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import Card from '../common/Card';

const ParkingDetailHeader = ({ parking }) => {
  if (!parking) return null;

  return (
    <Card 
      className="overflow-hidden mb-8 border-none transform transition-all duration-300"
      shadow="lg"
      padding="none"
      rounded="xl"
      hover={false}
    >
      {parking.images?.length > 0 && (
        <div className="relative h-64 bg-gray-200 overflow-hidden">
          <img
            src={parking.images[0]}
            alt={parking.name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      )}
      <div className="p-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-orange-500">{parking.name}</h1>
            <div className="flex items-center text-gray-600 mt-1">
              <MapPinIcon className="w-4 h-4 mr-1 text-orange-500" />
              <span>{parking.address}</span>
            </div>
          </div>
          <div className="flex items-center bg-orange-50 px-3 py-1 rounded-full">
            <StarIconSolid className="w-5 h-5 text-yellow-400" />
            <span className="ml-1 text-orange-500 font-bold text-lg">{parking.rating || 0}</span>
          </div>
        </div>
        {parking.description && (
          <p className="text-gray-600 mb-4">{parking.description}</p>
        )}
        {/* Status */}
        <div className="flex flex-wrap items-center gap-4">
          <span className={`px-3 py-1 rounded-full text-sm font-bold shadow-sm ${
            parking.status === 'active' 
              ? 'bg-orange-100 text-orange-600 border border-orange-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {parking.status === 'active' ? 'Open' : 'Closed'}
          </span>
          <div className="flex items-center text-gray-600">
            <ClockIcon className="w-4 h-4 mr-1 text-orange-500" />
            <span>{parking.operational_hours?.open} - {parking.operational_hours?.close}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ParkingDetailHeader;
