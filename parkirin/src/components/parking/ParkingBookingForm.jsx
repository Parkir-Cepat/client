// src/components/parking/ParkingBookingForm.jsx
import React, { useState } from 'react';
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import Card from '../common/Card';
import Button from '../common/Button';

const ParkingBookingForm = ({ parking, onBook }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    duration: 1,
    vehicleType: 'car'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onBook) {
      onBook(formData);
    }
  };

  // Calculate the estimated cost
  const calculateCost = () => {
    const rate = formData.vehicleType === 'car' 
      ? parking?.rates?.car 
      : parking?.rates?.motorcycle;
    
    return rate * formData.duration;
  };

  return (
    <Card className="mb-6" rounded="xl" variant="primary">
      <Card.Header>
        <Card.Title>Book Now</Card.Title>
      </Card.Header>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-gray-700">Date</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
        </div>
        
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-gray-700">Start Time</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <ClockIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>
        </div>
        
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-gray-700">Duration (hours)</label>
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            min="1"
            max="24"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            required
          />
        </div>
        
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-gray-700">Vehicle Type</label>
          <div className="grid grid-cols-2 gap-3">
            <label className={`flex items-center justify-center p-3 rounded-lg border ${formData.vehicleType === 'car' ? 'border-orange-500 bg-orange-50' : 'border-gray-300'} cursor-pointer transition-all duration-200`}>
              <input
                type="radio"
                name="vehicleType"
                value="car"
                checked={formData.vehicleType === 'car'}
                onChange={handleChange}
                className="sr-only"
              />
              <span className="flex items-center">
                <TruckIcon className={`h-5 w-5 mr-2 ${formData.vehicleType === 'car' ? 'text-orange-500' : 'text-gray-400'}`} />
                <span className={`font-medium ${formData.vehicleType === 'car' ? 'text-orange-600' : 'text-gray-600'}`}>Car</span>
              </span>
            </label>
            <label className={`flex items-center justify-center p-3 rounded-lg border ${formData.vehicleType === 'motorcycle' ? 'border-orange-500 bg-orange-50' : 'border-gray-300'} cursor-pointer transition-all duration-200`}>
              <input
                type="radio"
                name="vehicleType"
                value="motorcycle"
                checked={formData.vehicleType === 'motorcycle'}
                onChange={handleChange}
                className="sr-only"
              />
              <span className="flex items-center">
                <MotorcycleIcon className={`h-5 w-5 mr-2 ${formData.vehicleType === 'motorcycle' ? 'text-orange-500' : 'text-gray-400'}`} />
                <span className={`font-medium ${formData.vehicleType === 'motorcycle' ? 'text-orange-600' : 'text-gray-600'}`}>Motorcycle</span>
              </span>
            </label>
          </div>
        </div>
        
        <div className="pt-3 border-t border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-700">Estimated Cost:</span>
            <span className="text-lg font-bold text-orange-600">Rp {calculateCost()?.toLocaleString() || '0'}</span>
          </div>
          <Button
            type="submit"
            variant="primary"
            size="large"
            fullWidth
            rounded="full"
          >
            Book This Parking
          </Button>
        </div>
      </form>
    </Card>
  );
};

// Simple icon components for vehicle types
const TruckIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const MotorcycleIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 16v1a2 2 0 0 0 2 2h2" />
    <path d="M16 16v1a2 2 0 0 0 2 2h2" />
    <path d="M12 18V2l-2 6h-4l5 8" />
    <path d="M9 14h7l2 4" />
    <circle cx="6" cy="16" r="2" />
    <circle cx="18" cy="16" r="2" />
  </svg>
);

export default ParkingBookingForm;
