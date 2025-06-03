import React from 'react';
import PropTypes from 'prop-types';
import { classNames } from '../../utils/helpers';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'orange',
  text = '',
  variant = 'spinner',
  fullScreen = false,
  className = '',
  backdrop = true
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    small: 'w-5 h-5',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20'
  };

  const colorClasses = {
    orange: 'border-orange-500 text-orange-500',
    blue: 'border-blue-500 text-blue-500',
    green: 'border-green-500 text-green-500',
    red: 'border-red-500 text-red-500',
    yellow: 'border-yellow-500 text-yellow-500',
    purple: 'border-purple-500 text-purple-500',
    gray: 'border-gray-500 text-gray-500',
    white: 'border-white text-white'
  };

  const variants = {
    spinner: (
      <div 
        className={classNames(
          sizeClasses[size],
          'border-2 border-t-transparent rounded-full animate-spin',
          colorClasses[color].split(' ')[0],
          className
        )}
      ></div>
    ),
    dots: (
      <div className="flex space-x-2">
        {[0, 1, 2].map((i) => (
          <div 
            key={i}
            className={classNames(
              'rounded-full',
              sizeClasses[size].split(' ')[0],
              colorClasses[color].split(' ')[1],
              'animate-pulse',
              className
            )}
            style={{ animationDelay: `${i * 0.15}s` }}
          ></div>
        ))}
      </div>
    ),
    pulse: (
      <div 
        className={classNames(
          sizeClasses[size],
          'rounded-full animate-pulse',
          colorClasses[color].split(' ')[1],
          'bg-current opacity-75',
          className
        )}
      ></div>
    ),
    bars: (
      <div className="flex items-end space-x-1 h-8">
        {[0, 1, 2, 3].map((i) => (
          <div 
            key={i}
            className={classNames(
              'w-1.5 bg-current rounded-t',
              colorClasses[color].split(' ')[1],
              className
            )}
            style={{ 
              height: `${Math.max(30, Math.random() * 100)}%`,
              animationDelay: `${i * 0.1}s`,
              animation: 'loading-bars 1s ease-in-out infinite alternate'
            }}
          ></div>
        ))}
      </div>
    ),
    circular: (
      <svg 
        className={classNames(
          sizeClasses[size],
          'animate-spin',
          colorClasses[color].split(' ')[1],
          className
        )}
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        ></circle>
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    ),
    logo: (
      <div className="relative">
        <div 
          className={classNames(
            sizeClasses[size],
            'rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 animate-pulse flex items-center justify-center shadow-orange',
            className
          )}
        >
          <span className="text-white font-bold text-lg">P</span>
        </div>
        <div className="absolute -bottom-1 -right-1">
          <div 
            className={classNames(
              'w-3 h-3 rounded-full animate-spin border-2 border-t-transparent',
              colorClasses[color].split(' ')[0],
            )}
          ></div>
        </div>
      </div>
    )
  };

  const containerClasses = fullScreen 
    ? classNames(
        'fixed inset-0 flex items-center justify-center z-50',
        backdrop ? 'bg-white/80 backdrop-blur-sm' : '',
      )
    : 'flex flex-col items-center justify-center p-4';

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center space-y-3">
        {variants[variant]}
        {text && (
          <p className={classNames(
            'text-sm font-medium',
            color === 'white' ? 'text-white' : colorClasses[color].split(' ')[1]
          )}>
            {text}
          </p>        )}      </div>
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['xs', 'small', 'medium', 'large', 'xl', '2xl']),
  color: PropTypes.oneOf(['orange', 'blue', 'green', 'red', 'yellow', 'purple', 'gray', 'white']),
  text: PropTypes.string,
  variant: PropTypes.oneOf(['spinner', 'dots', 'pulse', 'bars', 'circular', 'logo']),
  fullScreen: PropTypes.bool,
  className: PropTypes.string,
  backdrop: PropTypes.bool
};

export default LoadingSpinner;
