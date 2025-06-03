// src/components/common/LogoGroup.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { classNames } from '../../utils/helpers';

const LogoGroup = ({
  variant = 'default',
  size = 'medium',
  className = '',
  logoClassName = '',
  textClassName = '',
  withText = true,
  withTagline = false,
  asLink = true,
  linkTo = '/',
  onClick,
  animated = false,
  ...props
}) => {
  const sizes = {
    xs: 'w-6 h-6',
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    xs: 'text-sm',
    small: 'text-base',
    medium: 'text-xl',
    large: 'text-2xl',
    xl: 'text-3xl',
  };

  const variants = {
    default: 'bg-gradient-to-br from-orange-500 to-orange-600 text-white',
    outline: 'bg-white border-2 border-orange-500 text-orange-500',
    light: 'bg-white text-orange-500',
    dark: 'bg-gray-900 text-white',
    glass: 'bg-white/60 backdrop-blur-md text-orange-500 border border-white/20',
  };

  const logoClasses = classNames(
    'flex items-center justify-center rounded-lg shadow-orange',
    sizes[size],
    variants[variant],
    animated && 'animate-float',
    logoClassName
  );

  const logoIcon = (
    <div className={logoClasses}>
      <span className={classNames(
        'font-bold',
        {
          'text-sm': size === 'xs' || size === 'small',
          'text-lg': size === 'medium',
          'text-xl': size === 'large',
          'text-2xl': size === 'xl',
        }
      )}>
        P
      </span>
    </div>
  );

  const textElement = withText && (
    <div className="flex flex-col">
      <span className={classNames(
        'font-bold text-gray-900',
        textSizes[size],
        textClassName
      )}>
        Parkirin
      </span>
      {withTagline && (
        <span className="text-xs text-gray-500 -mt-1">
          Find parking, easily
        </span>
      )}
    </div>
  );

  const content = (
    <div 
      className={classNames(
        'flex items-center',
        withText ? 'space-x-2' : '',
        className
      )}
      {...props}
    >
      {logoIcon}
      {textElement}
    </div>
  );

  if (asLink) {
    return (
      <Link to={linkTo} className="flex items-center">
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button onClick={onClick} className="flex items-center">
        {content}
      </button>
    );
  }

  return content;
};

export default LogoGroup;
