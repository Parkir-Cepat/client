// src/components/parking/ParkingPricing.jsx
import React from 'react';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';
import Card from '../common/Card';

const ParkingPricing = ({ rates }) => {
  if (!rates) return null;

  return (
    <Card className="mb-6" rounded="xl">
      <Card.Header>
        <Card.Title>Pricing</Card.Title>
      </Card.Header>
      <div className="space-y-4">
        <div className="flex items-center p-3 rounded-lg bg-orange-50/50 border border-orange-100">
          <div className="mr-4 p-3 bg-orange-100 rounded-full">
            <CurrencyDollarIcon className="h-5 w-5 text-orange-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-500">Car (per hour)</p>
            <p className="font-semibold text-orange-600 text-lg">Rp {rates?.car?.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex items-center p-3 rounded-lg bg-orange-50/50 border border-orange-100">
          <div className="mr-4 p-3 bg-orange-100 rounded-full">
            <CurrencyDollarIcon className="h-5 w-5 text-orange-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-500">Motorcycle (per hour)</p>
            <p className="font-semibold text-orange-600 text-lg">Rp {rates?.motorcycle?.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ParkingPricing;
