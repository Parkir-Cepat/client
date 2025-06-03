import React from 'react';
import PropTypes from 'prop-types';
import { Card } from '../common';

const StatCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'positive',
  icon: Icon,
  color = 'orange',
  loading = false,
  className = ''
}) => {
  const colorClasses = {
    orange: {
      bg: 'bg-orange-500',
      light: 'bg-orange-50',
      text: 'text-orange-600',
      icon: 'text-orange-500'
    },
    blue: {
      bg: 'bg-blue-500',
      light: 'bg-blue-50',
      text: 'text-blue-600',
      icon: 'text-blue-500'
    },
    green: {
      bg: 'bg-green-500',
      light: 'bg-green-50',
      text: 'text-green-600',
      icon: 'text-green-500'
    },
    yellow: {
      bg: 'bg-yellow-500',
      light: 'bg-yellow-50',
      text: 'text-yellow-600',
      icon: 'text-yellow-500'
    },
    red: {
      bg: 'bg-red-500',
      light: 'bg-red-50',
      text: 'text-red-600',
      icon: 'text-red-500'
    },
    purple: {
      bg: 'bg-purple-500',
      light: 'bg-purple-50',
      text: 'text-purple-600',
      icon: 'text-purple-500'
    }
  };

  const changeTypeClasses = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-500'
  };

  const changeIcons = {
    positive: (
      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    ),
    negative: (
      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    ),
    neutral: (
      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
      </svg>
    )
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <div className={`p-2 rounded-lg ${colorClasses[color].light}`}>
            <div className={colorClasses[color].icon}>
              {Icon && <Icon />}
            </div>
          </div>
        </div>
        
        <div className="mb-2">
          <div className={`text-2xl font-bold ${loading ? 'animate-pulse bg-gray-200 h-8 w-3/4 rounded' : ''}`}>
            {!loading && value}
          </div>
        </div>
        
        {change !== null && !loading && (
          <div className="flex items-center">
            <div className={`flex items-center text-xs font-medium ${changeTypeClasses[changeType]}`}>
              {changeIcons[changeType]}
              {change > 0 && '+'}{change}%
            </div>
            <span className="text-xs text-gray-500 ml-2">from previous period</span>
          </div>
        )}
      </div>
    </Card>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  change: PropTypes.number,
  changeType: PropTypes.oneOf(['positive', 'negative', 'neutral']),
  icon: PropTypes.func,
  color: PropTypes.oneOf(['orange', 'blue', 'green', 'yellow', 'red', 'purple']),
  loading: PropTypes.bool,
  className: PropTypes.string
};

export default StatCard;