import React from 'react';
import PropTypes from 'prop-types';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'blue',
  text = '',
  fullScreen = false,
  className = '' 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    blue: 'border-blue-500',
    green: 'border-green-500',
    red: 'border-red-500',
    yellow: 'border-yellow-500',
    purple: 'border-purple-500',
    gray: 'border-gray-500',
    white: 'border-white'
  };

  const spinnerClasses = `
    ${sizeClasses[size]}
    ${colorClasses[color]}
    border-2 border-t-transparent rounded-full animate-spin
    ${className}
  `;

  const containerClasses = fullScreen 
    ? 'fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50'
    : 'flex flex-col items-center justify-center p-4';

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center space-y-2">
        <div className={spinnerClasses}></div>
        {text && (
          <p className={`text-sm ${color === 'white' ? 'text-white' : 'text-gray-600'}`}>
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large', 'xl']),
  color: PropTypes.oneOf(['blue', 'green', 'red', 'yellow', 'purple', 'gray', 'white']),
  text: PropTypes.string,
  fullScreen: PropTypes.bool,
  className: PropTypes.string
};

export default LoadingSpinner;
