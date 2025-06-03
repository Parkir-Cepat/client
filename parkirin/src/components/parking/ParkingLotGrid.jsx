import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Card, Badge, Button } from '../common';

const ParkingLotGrid = ({ 
  parkingLots = [], 
  loading = false, 
  viewMode = 'grid',
  onViewModeChange,
  onFavoriteToggle,
  className = '' 
}) => {
  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              <div className="h-8 bg-gray-200 rounded w-full mt-4"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (parkingLots.length === 0) {
    return (
      <Card className={`p-8 text-center ${className}`}>
        <div className="text-5xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-900">No parking lots found</h3>
        <p className="text-gray-600 mt-2">Try adjusting your search criteria or explore a different location</p>
      </Card>
    );
  }

  const ListViewItem = ({ lot }) => (
    <Card className="flex overflow-hidden hover:shadow-lg transition-shadow group">
      <div 
        className="w-1/3 h-auto bg-cover bg-center"
        style={{ backgroundImage: `url(${lot.images?.[0] || '/default-parking.jpg'})` }}
      ></div>
      <div className="p-4 flex-1">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
              {lot.name}
            </h3>
            <p className="text-sm text-gray-600 mb-2">{lot.address}</p>
          </div>
          <button 
            onClick={(e) => {
              e.preventDefault();
              onFavoriteToggle(lot._id);
            }}
            className="text-gray-400 hover:text-orange-500"
          >
            {lot.isFavorite ? (
              <svg className="w-5 h-5 text-orange-500 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            )}
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2 my-2">
          {lot.facilities?.map((facility, i) => (
            <Badge key={i} variant="light" size="small">{facility}</Badge>
          ))}
          {lot.availableSpots > 0 ? (
            <Badge variant="success" size="small">{lot.availableSpots} spots left</Badge>
          ) : (
            <Badge variant="danger" size="small">Full</Badge>
          )}
        </div>
        
        <div className="flex justify-between items-center mt-3">
          <div>
            <span className="text-lg font-bold text-orange-600">Rp {lot.price?.toLocaleString('id-ID')}</span>
            <span className="text-xs text-gray-500">/hour</span>
          </div>
          <Link to={`/parking/${lot._id}`}>
            <Button variant="primary" size="small">
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );

  const GridViewItem = ({ lot }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="relative">
        <div 
          className="h-48 bg-cover bg-center"
          style={{ backgroundImage: `url(${lot.images?.[0] || '/default-parking.jpg'})` }}
        ></div>
        <button 
          onClick={(e) => {
            e.preventDefault();
            onFavoriteToggle(lot._id);
          }}
          className="absolute top-3 right-3 bg-white/70 backdrop-blur-sm p-1.5 rounded-full shadow-sm hover:bg-white"
        >
          {lot.isFavorite ? (
            <svg className="w-5 h-5 text-orange-500 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          )}
        </button>
      </div>
      
      <div className="p-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">
            {lot.name}
          </h3>
          <p className="text-sm text-gray-600 mb-2 line-clamp-1">{lot.address}</p>
        </div>
        
        <div className="flex flex-wrap gap-1.5 my-2">
          {lot.facilities?.slice(0, 3).map((facility, i) => (
            <Badge key={i} variant="light" size="small">{facility}</Badge>
          ))}
          {lot.facilities?.length > 3 && (
            <Badge variant="light" size="small">+{lot.facilities.length - 3}</Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Open 24/7
          
          {lot.availableSpots > 0 ? (
            <Badge variant="success" size="small" className="ml-auto">
              {lot.availableSpots} spots left
            </Badge>
          ) : (
            <Badge variant="danger" size="small" className="ml-auto">
              Full
            </Badge>
          )}
        </div>
        
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <div>
            <span className="text-lg font-bold text-orange-600">Rp {lot.price?.toLocaleString('id-ID')}</span>
            <span className="text-xs text-gray-500">/hour</span>
          </div>
          <Link to={`/parking/${lot._id}`}>
            <Button variant="primary" size="small">
              Details
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );

  return (
    <div className={className}>
      {/* View Mode Toggle */}
      {onViewModeChange && (
        <div className="flex justify-end mb-4">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              className={`px-3 py-2 text-sm font-medium rounded-l-lg focus:z-10 focus:outline-none ${
                viewMode === 'grid'
                  ? 'bg-orange-50 text-orange-600 border border-orange-300'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => onViewModeChange('grid')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              type="button"
              className={`px-3 py-2 text-sm font-medium rounded-r-lg focus:z-10 focus:outline-none ${
                viewMode === 'list'
                  ? 'bg-orange-50 text-orange-600 border border-orange-300'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => onViewModeChange('list')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      {/* Parking Lots */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parkingLots.map((lot) => (
            <GridViewItem key={lot._id} lot={lot} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {parkingLots.map((lot) => (
            <ListViewItem key={lot._id} lot={lot} />
          ))}
        </div>
      )}
    </div>
  );
};

ParkingLotGrid.propTypes = {
  parkingLots: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      address: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      images: PropTypes.arrayOf(PropTypes.string),
      facilities: PropTypes.arrayOf(PropTypes.string),
      availableSpots: PropTypes.number,
      isFavorite: PropTypes.bool
    })
  ),
  loading: PropTypes.bool,
  viewMode: PropTypes.oneOf(['grid', 'list']),
  onViewModeChange: PropTypes.func,
  onFavoriteToggle: PropTypes.func,
  className: PropTypes.string
};

export default ParkingLotGrid;
