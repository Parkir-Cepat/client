// src/components/common/Badge.jsx
import React from 'react';
import { classNames } from '../../utils/helpers';

const Badge = ({
  children,
  variant = 'default',
  size = 'medium',
  rounded = true,
  animated = false,
  dot = false,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center font-medium transition-all duration-200';
  
  const variants = {
    default: 'bg-orange-100 text-orange-800',
    primary: 'bg-orange-500 text-white',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    outline: 'bg-white border border-orange-500 text-orange-600',
    subtle: 'bg-orange-50 text-orange-700',
    glass: 'bg-white/70 backdrop-blur-sm text-gray-800 border border-white/20'
  };
  
  const sizes = {
    xs: 'px-1.5 py-0.5 text-xs',
    small: 'px-2 py-1 text-xs',
    medium: 'px-2.5 py-0.5 text-sm',
    large: 'px-3 py-1 text-sm'
  };

  const badgeClasses = classNames(
    baseClasses,
    variants[variant],
    sizes[size],
    {
      'rounded-full': rounded,
      'rounded': !rounded,
      'animate-pulse': animated
    },
    className
  );

  return (
    <span className={badgeClasses} {...props}>
      {dot && (
        <span className={classNames(
          'inline-block w-2 h-2 rounded-full mr-1.5',
          {
            'bg-orange-500': variant === 'default' || variant === 'outline' || variant === 'subtle' || variant === 'glass',
            'bg-white': variant === 'primary',
            'bg-green-500': variant === 'success',
            'bg-yellow-500': variant === 'warning',
            'bg-red-500': variant === 'danger',
            'bg-blue-500': variant === 'info',
            'bg-gray-500': variant === 'secondary'
          }
        )}></span>
      )}
      {children}
    </span>
  );
};

// Badge with counter animation
Badge.Counter = ({ count, max = 99, ...props }) => {
  const displayCount = count > max ? `${max}+` : count;
  
  return (
    <Badge 
      variant="primary" 
      size="xs" 
      className="font-bold min-w-5 h-5 justify-center" 
      {...props}
    >
      {displayCount}
    </Badge>
  );
};

// Badge with status indicator
Badge.Status = ({ status, ...props }) => {
  const statusMap = {
    online: { variant: 'success', label: 'Online' },
    offline: { variant: 'secondary', label: 'Offline' },
    away: { variant: 'warning', label: 'Away' },
    busy: { variant: 'danger', label: 'Busy' },
    active: { variant: 'success', label: 'Active' },
    inactive: { variant: 'secondary', label: 'Inactive' },
    pending: { variant: 'warning', label: 'Pending' },
    completed: { variant: 'success', label: 'Completed' },
    cancelled: { variant: 'danger', label: 'Cancelled' }
  };
  
  const { variant, label } = statusMap[status] || { variant: 'secondary', label: status };
  
  return (
    <Badge 
      variant={variant} 
      dot={true} 
      {...props}
    >
      {label}
    </Badge>
  );
};

export default Badge;
