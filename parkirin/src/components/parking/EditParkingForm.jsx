import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { XMarkIcon, PlusIcon, TrashIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { UPDATE_PARKING } from '../../graphql/mutations';
import { GET_MY_PARKINGS } from '../../graphql/queries';
import LocationPicker from './LocationPicker.jsx';
import ParkingMap from './ParkingMap.jsx';

const EditParkingForm = ({ parking, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [updateParking] = useMutation(UPDATE_PARKING);
  
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
  // Initialize form data with existing parking data
  useEffect(() => {
    if (parking) {
      console.log('Initializing form data with parking:', parking);
      setFormData({
        name: parking.name || '',
        address: parking.address || '',
        location: {
          coordinates: parking.location?.coordinates || [0, 0]
        },
        capacity: {
          car: parking.capacity?.car || 10,
          motorcycle: parking.capacity?.motorcycle || 20
        },
        rates: {
          car: parking.rates?.car || 5000,
          motorcycle: parking.rates?.motorcycle || 2000
        },
        operational_hours: {
          open: parking.operational_hours?.open || '06:00',
          close: parking.operational_hours?.close || '22:00'
        },
        facilities: parking.facilities || [],
        images: parking.images || []
      });
      console.log('Location coordinates set to:', parking.location?.coordinates);
    }
  }, [parking]);  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Nama parking lot wajib diisi';
    if (!formData.address.trim()) newErrors.address = 'Alamat wajib diisi';
    if (formData.rates.car < 1000) newErrors.carRate = 'Tarif mobil minimal Rp 1.000';
    if (formData.rates.motorcycle < 500) newErrors.motorcycleRate = 'Tarif motor minimal Rp 500';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // Only send the fields that the server accepts for UpdateParkingInput
      // According to server schema: name, address, rates, operational_hours, facilities, images, status
      const updateInput = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        rates: {
          car: parseFloat(formData.rates.car),
          motorcycle: parseFloat(formData.rates.motorcycle)
        },
        operational_hours: {
          open: formData.operational_hours.open,
          close: formData.operational_hours.close
        },
        facilities: formData.facilities,
        images: formData.images
      };
      
      console.log('Updating parking with data:', updateInput);
      
      const { data } = await updateParking({
        variables: {
          id: parking._id,
          input: updateInput
        },
        refetchQueries: [{ query: GET_MY_PARKINGS }]
      });

      if (data?.updateParking) {
        console.log('Parking updated successfully:', data.updateParking);
        onSuccess && onSuccess(data.updateParking);
        onClose();
      }
    } catch (error) {
      console.error('Update parking error:', error);
      setErrors({ submit: error.message || 'Gagal mengupdate parking lot' });
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

  if (!parking) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Edit Parking Lot: {parking.name}</h2>
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
          </div>          {/* Location - Read Only */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lokasi Parkir
            </label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                  Info
                </span>
                Lokasi parkir tidak dapat diubah setelah parking lot dibuat
              </p>
            </div>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  console.log('View Lokasi di Peta clicked, current coordinates:', formData.location.coordinates);
                  setShowLocationPicker(true);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 bg-gray-50 rounded-lg text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <MapPinIcon className="w-5 h-5" />
                {formData.location.coordinates[0] === 0 && formData.location.coordinates[1] === 0
                  ? 'Lokasi Belum Diset'
                  : `Lihat Lokasi: (${formData.location.coordinates[1].toFixed(6)}, ${formData.location.coordinates[0].toFixed(6)})`
                }
              </button>
                
              {formData.location.coordinates[0] !== 0 && formData.location.coordinates[1] !== 0 && (
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm text-gray-600">
                      <div>Latitude: {formData.location.coordinates[1].toFixed(6)}</div>
                      <div>Longitude: {formData.location.coordinates[0].toFixed(6)}</div>
                    </div>
                  </div>
                  
                  {/* Map preview */}
                  <div className="h-48 rounded-lg overflow-hidden border border-gray-200">
                    <ParkingMap
                      parkingLots={[{
                        _id: 'preview',
                        name: formData.name,
                        location: {
                          coordinates: formData.location.coordinates
                        }
                      }]}
                      center={formData.location.coordinates}
                      zoom={15}
                      height="100%"
                      showUserLocation={false}
                      showNavigationControls={false}
                      fitBounds={false}
                    />
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Klik tombol di atas untuk melihat lokasi pada peta
            </p>
          </div>{/* Capacity - Read Only */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Kapasitas Parkir</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-3">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                  Info
                </span>
                Kapasitas parkir tidak dapat diubah setelah parking lot dibuat
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kapasitas Mobil
                </label>
                <input
                  type="number"
                  value={formData.capacity.car}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kapasitas Motor
                </label>
                <input
                  type="number"
                  value={formData.capacity.motorcycle}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                />
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
                  Mengupdate...
                </>
              ) : (
                'Update Parking Lot'
              )}
            </button>
          </div>
        </form>
      </div>      {/* Location Picker Modal - For Viewing Only */}
      {showLocationPicker && (
        <LocationPicker
          isOpen={showLocationPicker}
          onLocationSelect={(locationData) => {
            // Don't update location, just close modal
            console.log('Location viewed:', locationData);
            setShowLocationPicker(false);
          }}
          onClose={() => setShowLocationPicker(false)}
          initialLocation={
            formData.location.coordinates[0] !== 0 && formData.location.coordinates[1] !== 0
              ? {
                  lat: formData.location.coordinates[1],
                  lng: formData.location.coordinates[0]
                }
              : null
          }
          initialAddress={formData.address}
        />
      )}
    </div>
  );
};

export default EditParkingForm;