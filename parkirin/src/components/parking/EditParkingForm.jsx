import React from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@apollo/client';
import { UPDATE_PARKING } from '../../graphql/mutations';
import ParkingForm from './ParkingForm';
import { toast } from 'react-hot-toast';

const EditParkingForm = ({ parkingId, initialData, onSuccess }) => {
  const [updateParking, { loading }] = useMutation(UPDATE_PARKING);  const handleSubmit = async (formData) => {
    try {
      // Only extract the fields allowed by UpdateParkingInput schema
      // Note: location is NOT allowed in UpdateParkingInput per GraphQL schema
      const allowedFields = {
        name: formData.name,
        address: formData.address,
        // Transform price structure to rates structure for GraphQL schema
        rates: formData.price ? {
          car: formData.price.car?.hourly || 0,
          motorcycle: formData.price.motorcycle?.hourly || 0
        } : (formData.rates || undefined),
        operational_hours: formData.operational_hours,
        facilities: formData.facilities || formData.features,
        images: formData.images,
        status: formData.status
        // location field removed - not allowed in UpdateParkingInput
        // daily rates removed - not supported by GraphQL schema (only hourly rates)
      };

      // Remove undefined fields and GraphQL metadata to avoid sending null values
      const validFormData = Object.entries(allowedFields)
        .filter(([, value]) => value !== undefined && value !== null)
        .reduce((acc, [key, value]) => {
          // Remove GraphQL metadata from nested objects
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            const cleanValue = { ...value };
            delete cleanValue.__typename;
            acc[key] = cleanValue;
          } else {
            acc[key] = value;
          }
          return acc;
        }, {});

      console.log('Submitting filtered data:', validFormData);
      
      const { data } = await updateParking({
        variables: {
          id: parkingId,
          input: validFormData
        }
      });

      if (data?.updateParking) {
        toast.success('Parking lot updated successfully');
        if (onSuccess) {
          onSuccess(data.updateParking);
        }
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.message || 'Failed to update parking lot');
    }
  };

  return (
    <ParkingForm
      initialData={initialData}
      onSubmit={handleSubmit}
      isLoading={loading}
      submitLabel="Update Parking Lot"
      mode="edit"
    />
  );
};

EditParkingForm.propTypes = {
  parkingId: PropTypes.string.isRequired,
  initialData: PropTypes.object.isRequired,
  onSuccess: PropTypes.func
};

export default EditParkingForm;
