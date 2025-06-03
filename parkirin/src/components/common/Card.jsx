// src/components/common/Card.jsx
import React from 'react';
import { classNames } from '../../utils/helpers';

const Card = ({
  children,
  className = '',
  padding = 'medium',
  shadow = 'medium',
  rounded = 'medium',
  border = false,
  hover = false,
  animate = false,
  variant = 'default',
  onClick,
  ...props
}) => {
  const baseClasses = 'bg-white transition-all duration-300';
  
  const paddings = {
    none: '',
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8'
  };
  
  const shadows = {
    none: '',
    small: 'shadow-sm',
    medium: 'shadow-md',
    large: 'shadow-lg',
    xlarge: 'shadow-xl'
  };
  
  const roundeds = {
    none: '',
    small: 'rounded',
    medium: 'rounded-lg',
    large: 'rounded-xl',
    xl: 'rounded-2xl',
    full: 'rounded-3xl'
  };

  const variants = {
    default: 'bg-white',
    primary: 'bg-orange-50 border-orange-200',
    orange: 'bg-gradient-to-br from-orange-500 to-orange-600 text-white',
    glass: 'bg-white/70 backdrop-blur-md border-white/20',
    subtle: 'bg-gray-50',
  };

  const cardClasses = classNames(
    baseClasses,
    paddings[padding],
    shadows[shadow],
    roundeds[rounded],
    variants[variant],
    {
      'border border-gray-200': border && variant === 'default',
      'border': border && variant !== 'default',
      'hover:shadow-lg hover:-translate-y-1': hover,
      'animate-float': animate,
      'cursor-pointer': onClick
    },
    className
  );

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      className={cardClasses}
      onClick={onClick}
      {...props}
    >
      {children}
    </Component>
  );
};

// Card sub-components
Card.Header = ({ children, className = '', ...props }) => (
  <div className={classNames('mb-4', className)} {...props}>
    {children}
  </div>
);

Card.Title = ({ children, className = '', variant = 'default', ...props }) => {
  const titleClasses = classNames(
    'text-lg font-bold',
    {
      'text-orange-600': variant === 'default',
      'text-white': variant === 'orange',
      'text-gray-900': variant === 'subtle',
    },
    className
  );
  
  return (
    <h3 className={titleClasses} {...props}>
      {children}
    </h3>
  );
};

Card.Subtitle = ({ children, className = '', variant = 'default', ...props }) => {
  const subtitleClasses = classNames(
    'text-sm',
    {
      'text-gray-600': variant === 'default',
      'text-white/80': variant === 'orange',
      'text-gray-500': variant === 'subtle',
    },
    className
  );
  
  return (
    <p className={subtitleClasses} {...props}>
      {children}
    </p>
  );
};

Card.Content = ({ children, className = '', ...props }) => (
  <div className={classNames('text-gray-700', className)} {...props}>
    {children}
  </div>
);

Card.Footer = ({ children, className = '', bordered = true, ...props }) => (
  <div 
    className={classNames(
      'mt-4 pt-4',
      { 'border-t border-gray-200': bordered },
      className
    )} 
    {...props}
  >
    {children}
  </div>
);

Card.Badge = ({ children, className = '', color = 'orange', ...props }) => {
  const colorClasses = {
    orange: 'bg-orange-100 text-orange-800',
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    purple: 'bg-purple-100 text-purple-800',
    gray: 'bg-gray-100 text-gray-800',
  };
  
  return (
    <span 
      className={classNames(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        colorClasses[color],
        className
      )} 
      {...props}
    >
      {children}
    </span>
  );
};

Card.Divider = ({ className = '', ...props }) => (
  <hr className={classNames('my-4 border-gray-200', className)} {...props} />
);

Card.Icon = ({ icon, className = '', size = 'medium', color = 'orange', ...props }) => {
  const sizeClasses = {
    small: 'w-8 h-8 p-1.5',
    medium: 'w-10 h-10 p-2',
    large: 'w-12 h-12 p-2.5',
  };
  
  const colorClasses = {
    orange: 'bg-orange-100 text-orange-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600',
    gray: 'bg-gray-100 text-gray-600',
  };
  
  return (
    <div 
      className={classNames(
        'rounded-full flex items-center justify-center',
        sizeClasses[size],
        colorClasses[color],
        className
      )} 
      {...props}
    >
      {icon}
    </div>
  );
};

export default Card;
