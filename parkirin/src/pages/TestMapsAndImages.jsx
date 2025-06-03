import React, { useState, useEffect } from 'react';
import { ParkingMap } from '../components/parking';
import { Card } from '../components/common';

const TestMapsAndImages = () => {
  const [sampleParkingLots] = useState([
    {
      _id: '1',
      name: 'Central Park Jakarta',
      address: 'Jl. Sudirman No. 1, Jakarta',
      location: {
        coordinates: [106.8208, -6.2086] // [longitude, latitude] - Jakarta coordinates
      },
      images: [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&auto=format'
      ],
      capacity: { car: 50, motorcycle: 100 },
      availableSpots: 25,
      price: 5000,
      facilities: ['CCTV Security', '24/7 Security', 'Toilet'],
      rating: 4.5
    },
    {
      _id: '2', 
      name: 'Mall Taman Anggrek Parking',
      address: 'Jl. Letjen S. Parman No. 21, Jakarta',
      location: {
        coordinates: [106.7922, -6.1783] // Mall Taman Anggrek coordinates
      },
      images: [
        'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop&auto=format'
      ],
      capacity: { car: 80, motorcycle: 150 },
      availableSpots: 45,
      price: 3000,
      facilities: ['Car Wash', 'Food Court', 'WiFi', 'ATM'],
      rating: 4.2
    },
    {
      _id: '3',
      name: 'Kemang Village Parking',
      address: 'Jl. Kemang Raya No. 8, Jakarta Selatan',
      location: {
        coordinates: [106.8192, -6.2615] // Kemang coordinates
      },
      images: [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&auto=format'
      ],
      capacity: { car: 30, motorcycle: 60 },
      availableSpots: 15,
      price: 4000,
      facilities: ['Covered Parking', 'Electric Charging', 'Security'],
      rating: 4.0
    }
  ]);

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Maps & Images</h1>
        <p className="text-gray-600">Testing Google Maps integration and image display functionality</p>
      </div>

      {/* Maps Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Google Maps Integration</h2>
        <div className="h-96 w-full border rounded-lg overflow-hidden">
          <ParkingMap 
            parkingLots={sampleParkingLots}
            center={{ lat: -6.2088, lng: 106.8456 }} // Jakarta center
            zoom={12}
            onMarkerClick={(parking) => console.log('Clicked parking:', parking)}
          />
        </div>
      </Card>

      {/* Images Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Image Display Test</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleParkingLots.map((lot) => (
            <Card key={lot._id} className="overflow-hidden">
              {/* Image */}
              <div className="relative">
                <img
                  src={lot.images[0]}
                  alt={lot.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&auto=format';
                  }}
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm font-medium">
                  ⭐ {lot.rating}
                </div>
              </div>
              
              {/* Content */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{lot.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{lot.address}</p>
                
                <div className="flex justify-between items-center mb-3">
                  <span className="text-lg font-bold text-orange-600">
                    Rp {lot.price.toLocaleString('id-ID')}
                    <span className="text-xs text-gray-500">/jam</span>
                  </span>
                  <span className="text-sm text-green-600">
                    {lot.availableSpots} tersedia
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {lot.facilities.slice(0, 3).map((facility, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-100 text-xs rounded-full">
                      {facility}
                    </span>
                  ))}
                  {lot.facilities.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-xs rounded-full">
                      +{lot.facilities.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Image Gallery */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Image Gallery</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sampleParkingLots.flatMap(lot => lot.images).map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`Parking ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg transition-transform group-hover:scale-105"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&auto=format';
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg"></div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default TestMapsAndImages;
