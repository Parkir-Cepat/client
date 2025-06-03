import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormField, Select, Textarea } from '../forms';
import { Button } from '../common';
import MapPicker from '../common/MapPicker';

const ParkingForm = ({
  initialData = {},
  onSubmit,
  isLoading,
  submitLabel = 'Save',
  mode = 'create'
}) => {  // Convert location coordinates to lat/lng for MapPicker if present
  const initialLocation = initialData?.location?.coordinates ? {
    lat: initialData.location.coordinates[1],
    lng: initialData.location.coordinates[0]
  } : { lat: -6.2088, lng: 106.8456 }; // Default to Jakarta
  
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
    // Clean and transform initial data to match form structure
  const cleanInitialData = {
    name: initialData.name || '',
    address: initialData.address || '',
    capacity: {
      car: initialData.capacity?.car || 0,
      motorcycle: initialData.capacity?.motorcycle || 0
    },    price: {
      car: {
        hourly: initialData.rates?.car || 0
      },
      motorcycle: {
        hourly: initialData.rates?.motorcycle || 0
      }
    },
    features: initialData.facilities || initialData.features || [],
    images: initialData.images || [],
    operational_hours: initialData.operational_hours || { open: '06:00', close: '22:00' },
    status: initialData.status || 'active'
  };
  
  const [formData, setFormData] = useState(cleanInitialData);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };  const handlePriceChange = (vehicleType, value) => {
    setFormData(prev => ({
      ...prev,
      price: {
        ...prev.price,
        [vehicleType]: {
          ...prev.price[vehicleType],
          hourly: Number(value)
        }
      }
    }));
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    
    // Update form data with the new location
    setFormData(prev => ({
      ...prev,
      location: {
        type: "Point",
        coordinates: [location.lng, location.lat] // GeoJSON format: [longitude, latitude]
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Ensure location is included in the submitted data
    const dataToSubmit = {
      ...formData,
      location: {
        type: "Point",
        coordinates: [selectedLocation.lng, selectedLocation.lat]
      }
    };
    
    onSubmit(dataToSubmit);
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
        
        <div className="space-y-4">
          <FormField
            label="Parking Name"
            required
          >
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="form-input"
              required
            />
          </FormField>

          <FormField
            label="Address"
            required
          >
            <Textarea
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              required
            />
          </FormField>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Capacity & Pricing</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-base font-medium text-gray-800 mb-4">Capacity</h3>
            <div className="space-y-4">
              <FormField label="Car Spaces">
                <input
                  type="number"
                  min="0"
                  value={formData.capacity.car}
                  onChange={(e) => handleNestedChange('capacity', 'car', Number(e.target.value))}
                  className="form-input"
                />
              </FormField>

              <FormField label="Motorcycle Spaces">
                <input
                  type="number"
                  min="0"
                  value={formData.capacity.motorcycle}
                  onChange={(e) => handleNestedChange('capacity', 'motorcycle', Number(e.target.value))}
                  className="form-input"
                />
              </FormField>
            </div>
          </div>

          <div>
            <h3 className="text-base font-medium text-gray-800 mb-4">Pricing</h3>
            <div className="space-y-6">              <div>
                <h4 className="font-medium text-gray-700 mb-3">Car Pricing</h4>
                <FormField label="Hourly Rate (Rp)">
                  <input
                    type="number"
                    min="0"
                    value={formData.price.car.hourly}
                    onChange={(e) => handlePriceChange('car', e.target.value)}
                    className="form-input"
                    placeholder="e.g. 5000"
                  />
                </FormField>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-3">Motorcycle Pricing</h4>
                <FormField label="Hourly Rate (Rp)">
                  <input
                    type="number"
                    min="0"
                    value={formData.price.motorcycle.hourly}
                    onChange={(e) => handlePriceChange('motorcycle', e.target.value)}
                    className="form-input"
                    placeholder="e.g. 2000"
                  />
                </FormField>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Features & Facilities</h2>
        
        <FormField label="Features">
          <Select
            multiple
            value={formData.features}
            onChange={(e) => handleChange('features', e.target.value)}
            options={[
              { value: 'cctv', label: 'CCTV' },
              { value: 'security', label: '24/7 Security' },
              { value: 'covered', label: 'Covered Parking' },
              { value: 'valet', label: 'Valet Service' },
              { value: 'ev_charging', label: 'EV Charging' }
            ]}
          />
        </FormField>
      </div>

      {/* Images section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Images & URLs</h2>
        <div className="space-y-4">
          {formData.images.map((url, index) => (
            <div key={index} className="flex items-center space-x-4">
              <input
                type="url"
                value={url}
                onChange={e => {
                  const newImages = [...formData.images];
                  newImages[index] = e.target.value;
                  setFormData(prev => ({ ...prev, images: newImages }));
                }}
                placeholder="Image URL"
                className="form-input flex-1"
              />
              <button
                type="button"
                onClick={() => {
                  const newImages = formData.images.filter((_, i) => i !== index);
                  setFormData(prev => ({ ...prev, images: newImages }));
                }}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, images: [...prev.images, ''] }))}
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm"
          >
            + Add Image URL
          </button>
        </div>
        {formData.images.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {formData.images.map((url, index) => url && (
              <img key={index} src={url} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover rounded-md border" />
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
        <p className="text-sm text-gray-600 mb-4">
          Select the exact location of your parking lot on the map. You can search for an address or drag the marker to adjust the position.
        </p>
        <MapPicker
          center={selectedLocation}
          onSelect={handleLocationSelect}
          height="400px"
          showSearchBox={true}
          className="mb-4"
        />
      </div>

      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          className="px-8 py-3"
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

ParkingForm.propTypes = {
  initialData: PropTypes.shape({
    name: PropTypes.string,
    address: PropTypes.string,
    description: PropTypes.string,
    capacity: PropTypes.shape({
      car: PropTypes.number,
      motorcycle: PropTypes.number
    }),
    price: PropTypes.shape({
      car: PropTypes.shape({
        hourly: PropTypes.number,
        daily: PropTypes.number
      }),
      motorcycle: PropTypes.shape({
        hourly: PropTypes.number,
        daily: PropTypes.number
      })
    }),
    features: PropTypes.arrayOf(PropTypes.string)
  }),
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  submitLabel: PropTypes.string,
  mode: PropTypes.oneOf(['create', 'edit'])
};

export default ParkingForm;