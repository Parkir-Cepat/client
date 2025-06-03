// src/components/parking/ParkingAvailability.jsx
import React from 'react';
import { TruckIcon } from '@heroicons/react/24/outline';
import Card from '../common/Card';

const ParkingAvailability = ({ parking }) => {
  if (!parking) return null;
  
  const carPercentage = (parking.available?.car / parking.capacity?.car) * 100;
  const motorcyclePercentage = (parking.available?.motorcycle / parking.capacity?.motorcycle) * 100;

  return (
    <Card className="mb-6" rounded="xl">
      <Card.Header>
        <Card.Title>Availability</Card.Title>
      </Card.Header>
      <div className="grid grid-cols-2 gap-6">
        <div className="border border-gray-100 rounded-xl p-6 hover:border-orange-200 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-orange-500">Cars</h3>
            <TruckIcon className="w-5 h-5 text-orange-500" />
          </div>
          <div className="relative pt-1 mb-3">
            <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-200">
              <div 
                style={{ width: `${carPercentage}%` }} 
                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${carPercentage > 70 ? 'bg-green-500' : carPercentage > 30 ? 'bg-orange-500' : 'bg-red-500'}`}
              ></div>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{parking.available?.car}/{parking.capacity?.car}</p>
          <p className="text-sm text-gray-600">Available slots</p>
        </div>
        <div className="border border-gray-100 rounded-xl p-6 hover:border-orange-200 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-orange-500">Motorcycles</h3>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M15 7a1 1 0 00-1-1h-3.6l-1.2-2.4A1 1 0 008.3 3H5a1 1 0 00-1 1v2a1 1 0 001 1h2.4l1.2 2.4A1 1 0 009.5 10H15a1 1 0 001-1V7z" />
              <path d="M2 12a2 2 0 012-2h1.4a2 2 0 012 2v1a1 1 0 001 1h2.6a2 2 0 11-1.8 3H6.8a4 4 0 01-3.2-1.6l-1.5-2A1 1 0 012 13v-1z" />
            </svg>
          </div>
          <div className="relative pt-1 mb-3">
            <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-200">
              <div 
                style={{ width: `${motorcyclePercentage}%` }} 
                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${motorcyclePercentage > 70 ? 'bg-green-500' : motorcyclePercentage > 30 ? 'bg-orange-500' : 'bg-red-500'}`}
              ></div>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{parking.available?.motorcycle}/{parking.capacity?.motorcycle}</p>
          <p className="text-sm text-gray-600">Available slots</p>
        </div>
      </div>
    </Card>
  );
};

export default ParkingAvailability;
