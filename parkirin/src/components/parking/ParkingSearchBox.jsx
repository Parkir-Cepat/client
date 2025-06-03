import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, Input, Button, Badge } from '../common';

const ParkingSearchBox = ({ 
  onSearch, 
  recentSearches = [], 
  popularLocations = [], 
  loading = false,
  className = '' 
}) => {
  const [location, setLocation] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ location });
  };

  const handleRecentSearchClick = (search) => {
    setLocation(search.location);
    onSearch(search);
  };

  const handlePopularLocationClick = (locationName) => {
    setLocation(locationName);
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
        <h2 className="text-xl font-bold mb-2">Find Parking Near You</h2>
        <p className="text-white/80 text-sm">Search for available parking spaces at your destination</p>
      </div>
      
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Location"
            placeholder="Enter address, landmark or area"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            fullWidth
            icon={
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />
  
          
          <Button
            type="submit"
            variant="primary"
            size="large"
            fullWidth
            loading={loading}
            icon={
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          >
            Search Parking
          </Button>
        </form>
        
        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Recent Searches</h3>
            <div className="flex flex-wrap gap-2">
              {recentSearches.slice(0, 3).map((search, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  size="medium"
                  className="cursor-pointer hover:border-orange-500 hover:text-orange-500"
                  onClick={() => handleRecentSearchClick(search)}
                >
                  {search.location}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Popular Locations */}
        {popularLocations.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Popular Locations</h3>
            <div className="flex flex-wrap gap-2">
              {popularLocations.map((loc, index) => (
                <Badge
                  key={index}
                  variant="light"
                  size="medium"
                  className="cursor-pointer"
                  onClick={() => handlePopularLocationClick(loc.name)}
                >
                  {loc.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

ParkingSearchBox.propTypes = {
  onSearch: PropTypes.func.isRequired,  recentSearches: PropTypes.arrayOf(
    PropTypes.shape({
      location: PropTypes.string.isRequired
    })
  ),
  popularLocations: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      count: PropTypes.number
    })
  ),
  loading: PropTypes.bool,
  className: PropTypes.string
};

export default ParkingSearchBox;
