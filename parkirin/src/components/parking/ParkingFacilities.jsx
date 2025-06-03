// src/components/parking/ParkingFacilities.jsx
import React from 'react';
import Card from '../common/Card';

const ParkingFacilities = ({ facilities }) => {
  if (!facilities || facilities.length === 0) return null;

  // Map of facility names to icons/emojis
  const facilityIcons = {
    "CCTV": "🎥",
    "Security": "👮",
    "Valet": "🔑",
    "Elevator": "🛗",
    "EV Charging": "🔌",
    "Covered": "🏢",
    "24/7": "⏰",
    "Reserved Spaces": "⭐",
    "Disabled Access": "♿",
    "Pay on Exit": "💳",
    "Restroom": "🚻",
    "Lighting": "💡"
  };

  return (
    <Card className="mb-6" rounded="xl">
      <Card.Header>
        <Card.Title>Facilities</Card.Title>
      </Card.Header>
      <div className="flex flex-wrap gap-3">
        {facilities.map((facility, index) => (
          <div
            key={index}
            className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-full text-sm font-medium shadow-sm border border-orange-100 transition-all duration-300 hover:bg-orange-100"
          >
            <span>{facilityIcons[facility] || "✓"}</span>
            <span>{facility}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ParkingFacilities;
