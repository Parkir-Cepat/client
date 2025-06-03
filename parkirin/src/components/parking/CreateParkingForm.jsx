import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { XMarkIcon, PlusIcon, TrashIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { CREATE_PARKING } from '../../graphql/mutations';
import { GET_MY_PARKINGS } from '../../graphql/queries';
import LocationPicker from './LocationPicker.jsx';

const CreateParkingForm = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [createParking] = useMutation(CREATE_PARKING);
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    location: {
      coordinates: [0, 0] // [longitude, latitude]
    },
    capacity: {
      car: 10,
      motorcycle: 20
    },
    rates: {
      car: 5000,
      motorcycle: 2000
    },
    operational_hours: {
      open: '06:00',
      close: '22:00'
    },
    facilities: [],
    images: []
  });
  const [newFacility, setNewFacility] = useState('');
  const [newImage, setNewImage] = useState('');
  const [errors, setErrors] = useState({});
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const facilityOptions = [
    'CCTV Security',
    '24/7 Security',
    'Car Wash',
    'Toilet',
    'ATM',
    'Food Court',
    'WiFi',
    'Electric Charging',
    'Covered Parking',
    'Valet Service'
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Nama parking lot wajib diisi';
    if (!formData.address.trim()) newErrors.address = 'Alamat wajib diisi';
    if (formData.location.coordinates[0] === 0 || formData.location.coordinates[1] === 0) {
      newErrors.location = 'Koordinat lokasi wajib diisi';
    }
    if (formData.capacity.car < 1) newErrors.carCapacity = 'Kapasitas mobil minimal 1';
    if (formData.capacity.motorcycle < 1) newErrors.motorcycleCapacity = 'Kapasitas motor minimal 1';
    if (formData.rates.car < 1000) newErrors.carRate = 'Tarif mobil minimal Rp 1.000';
    if (formData.rates.motorcycle < 500) newErrors.motorcycleRate = 'Tarif motor minimal Rp 500';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const { data } = await createParking({
        variables: {
          input: {
            ...formData,
            location: {
              coordinates: formData.location.coordinates.map(coord => parseFloat(coord))
            },
            capacity: {
              car: parseInt(formData.capacity.car),
              motorcycle: parseInt(formData.capacity.motorcycle)
            },
            rates: {
              car: parseFloat(formData.rates.car),
              motorcycle: parseFloat(formData.rates.motorcycle)
            }
          }
        },
        refetchQueries: [{ query: GET_MY_PARKINGS }]
      });

      if (data?.createParking) {
        onSuccess && onSuccess(data.createParking);
        onClose();
      }
    } catch (error) {
      console.error('Error creating parking:', error);
      setErrors({ submit: error.message || 'Gagal membuat parking lot' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        };
      }
      return {
        ...prev,
        [field]: value
      };
    });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const addFacility = () => {
    if (newFacility.trim() && !formData.facilities.includes(newFacility.trim())) {
      setFormData(prev => ({
        ...prev,
        facilities: [...prev.facilities, newFacility.trim()]
      }));
      setNewFacility('');
    }
  };

  const removeFacility = (index) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.filter((_, i) => i !== index)
    }));
  };

  const addImage = () => {
    if (newImage.trim() && !formData.images.includes(newImage.trim())) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImage.trim()]
      }));
      setNewImage('');
    }
  };
  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleLocationSelect = (locationData) => {
    setFormData(prev => ({
      ...prev,
      location: {
        coordinates: locationData.coordinates
      },
      address: locationData.address || prev.address // Update address if provided
    }));
    setShowLocationPicker(false);
    
    // Clear location error if exists
    if (errors.location) {
      setErrors(prev => ({ ...prev, location: null }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Buat Parking Lot Baru</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Parking Lot *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Contoh: Parkiran Mall Central"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alamat Lengkap *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.address ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Jl. Sudirman No. 123, Jakarta Pusat"
              />
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
            </div>
          </div>          {/* Location Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lokasi Parkir *
            </label>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setShowLocationPicker(true)}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg transition-colors ${
                  formData.location.coordinates[0] === 0 && formData.location.coordinates[1] === 0
                    ? 'border-gray-300 hover:border-orange-400 text-gray-600'
                    : 'border-green-300 bg-green-50 text-green-700'
                } ${errors.location ? 'border-red-300' : ''}`}
              >
                <MapPinIcon className="w-5 h-5" />
                {formData.location.coordinates[0] === 0 && formData.location.coordinates[1] === 0
                  ? 'Pilih Lokasi di Peta'
                  : `Lokasi Dipilih: ${formData.location.coordinates[1].toFixed(6)}, ${formData.location.coordinates[0].toFixed(6)}`
                }
              </button>
              
              {formData.location.coordinates[0] !== 0 && formData.location.coordinates[1] !== 0 && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-600">
                    <div>Latitude: {formData.location.coordinates[1].toFixed(6)}</div>
                    <div>Longitude: {formData.location.coordinates[0].toFixed(6)}</div>
                  </div>
                </div>
              )}
            </div>
            {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
            <p className="text-xs text-gray-500 mt-1">
              Klik tombol di atas untuk memilih lokasi menggunakan peta interaktif
            </p>
          </div>

          {/* Capacity */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Kapasitas Parkir</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kapasitas Mobil *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.capacity.car}
                  onChange={(e) => handleInputChange('capacity.car', parseInt(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.carCapacity ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.carCapacity && <p className="text-red-500 text-xs mt-1">{errors.carCapacity}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kapasitas Motor *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.capacity.motorcycle}
                  onChange={(e) => handleInputChange('capacity.motorcycle', parseInt(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.motorcycleCapacity ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.motorcycleCapacity && <p className="text-red-500 text-xs mt-1">{errors.motorcycleCapacity}</p>}
              </div>
            </div>
          </div>

          {/* Rates */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tarif Parkir (per jam)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tarif Mobil (Rp) *
                </label>
                <input
                  type="number"
                  min="1000"
                  step="500"
                  value={formData.rates.car}
                  onChange={(e) => handleInputChange('rates.car', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.carRate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.carRate && <p className="text-red-500 text-xs mt-1">{errors.carRate}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tarif Motor (Rp) *
                </label>
                <input
                  type="number"
                  min="500"
                  step="500"
                  value={formData.rates.motorcycle}
                  onChange={(e) => handleInputChange('rates.motorcycle', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.motorcycleRate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.motorcycleRate && <p className="text-red-500 text-xs mt-1">{errors.motorcycleRate}</p>}
              </div>
            </div>
          </div>

          {/* Operational Hours */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Jam Operasional</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jam Buka
                </label>
                <input
                  type="time"
                  value={formData.operational_hours.open}
                  onChange={(e) => handleInputChange('operational_hours.open', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jam Tutup
                </label>
                <input
                  type="time"
                  value={formData.operational_hours.close}
                  onChange={(e) => handleInputChange('operational_hours.close', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Facilities */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Fasilitas</h3>
            <div className="flex gap-2 mb-3">
              <select
                value={newFacility}
                onChange={(e) => setNewFacility(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Pilih fasilitas...</option>
                {facilityOptions.filter(f => !formData.facilities.includes(f)).map(facility => (
                  <option key={facility} value={facility}>{facility}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={addFacility}
                disabled={!newFacility}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.facilities.map((facility, index) => (
                <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  {facility}
                  <button
                    type="button"
                    onClick={() => removeFacility(index)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Images */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Gambar</h3>
            <div className="flex gap-2 mb-3">
              <input
                type="url"
                value={newImage}
                onChange={(e) => setNewImage(e.target.value)}
                placeholder="URL gambar (https://...)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <button
                type="button"
                onClick={addImage}
                disabled={!newImage}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150x150?text=Invalid+Image';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <TrashIcon className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Membuat...
                </>
              ) : (
                'Buat Parking Lot'
              )}
            </button>          </div>
        </form>
      </div>

      {/* Location Picker Modal */}
      {showLocationPicker && (
        <LocationPicker
          onLocationSelect={handleLocationSelect}
          onClose={() => setShowLocationPicker(false)}
          initialLocation={
            formData.location.coordinates[0] !== 0 && formData.location.coordinates[1] !== 0
              ? {
                  lat: formData.location.coordinates[1],
                  lng: formData.location.coordinates[0]
                }
              : null
          }
        />
      )}
    </div>
  );
};

export default CreateParkingForm; 