import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const GET_MY_PARKING_LOTS = gql`
  query GetMyParkingLots {
    getMyParkingLots {
      _id
      name
      address
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
      status
      rating
      images
    }
  }
`;

const DELETE_PARKING_LOT = gql`
  mutation DeleteParkingLot($id: ID!) {
    deleteParkingLot(id: $id)
  }
`;

const ManageParking = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { data, loading, error, refetch } = useQuery(GET_MY_PARKING_LOTS);
  const [deleteParkingLot] = useMutation(DELETE_PARKING_LOT);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this parking lot?')) {
      try {
        await deleteParkingLot({
          variables: { id }
        });
        refetch();
      } catch (error) {
        console.error('Error deleting parking lot:', error);
      }
    }
  };

  if (loading) return (
    <div className="flex justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (error) return (
    <div className="text-red-600 p-4">Error: {error.message}</div>
  );

  return (
    <div className="w-full p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage My Parking Lots</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add New Parking Lot
        </button>
      </div>

      {data?.getMyParkingLots?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No parking lots found</p>
          <p className="text-gray-400">Create your first parking lot to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.getMyParkingLots?.map((parking) => (
            <div key={parking._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              {parking.images?.[0] && (
                <img
                  src={parking.images[0]}
                  alt={parking.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{parking.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    parking.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {parking.status}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">{parking.address}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Car Slots</p>
                    <p className="font-medium">{parking.available.car}/{parking.capacity.car}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Motorcycle Slots</p>
                    <p className="font-medium">{parking.available.motorcycle}/{parking.capacity.motorcycle}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Car Rate</p>
                    <p className="font-medium">Rp {parking.rates.car.toLocaleString()}/hour</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Motorcycle Rate</p>
                    <p className="font-medium">Rp {parking.rates.motorcycle.toLocaleString()}/hour</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-yellow-400">★</span>
                    <span className="text-sm text-gray-600 ml-1">{parking.rating || 0}</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(parking._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateForm && (
        <CreateParkingForm 
          onClose={() => setShowCreateForm(false)}
        />
      )}
    </div>
  );
};

// Simple create form component (you can expand this)
const CreateParkingForm = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Create New Parking Lot</h2>
        <p className="text-gray-600 mb-4">
          This feature is coming soon. You can create parking lots through the API for now.
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageParking;
