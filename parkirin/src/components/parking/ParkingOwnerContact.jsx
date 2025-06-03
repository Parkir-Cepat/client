// src/components/parking/ParkingOwnerContact.jsx
import React from 'react';
import Card from '../common/Card';
import ContactOwnerButton from '../chat/ContactOwnerButton';

const ParkingOwnerContact = ({ parking }) => {
  if (!parking || !parking.owner) return null;

  return (
    <Card className="mb-6" rounded="xl">
      <Card.Header>
        <Card.Title>Contact Owner</Card.Title>
      </Card.Header>
      <div className="mb-4">
        <div className="flex items-center space-x-4 mb-4">
          {parking.owner?.avatar ? (
            <img
              src={parking.owner.avatar}
              alt={parking.owner.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-orange-200"
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-lg font-bold text-white">
                {parking.owner?.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900">{parking.owner?.name}</p>
            <p className="text-sm text-gray-500 flex items-center">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
              Parking Owner
            </p>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-4">
          <ContactOwnerButton 
            parking={parking}
            className="w-full"
            size="medium"
            rounded="full"
            variant="primary"
          />
        </div>
      </div>
    </Card>
  );
};

export default ParkingOwnerContact;
