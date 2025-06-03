// src/components/common/Button.jsx
import React from 'react';
import { classNames } from '../../utils/helpers';

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  rounded = 'default',
  icon = null,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  onClick,
  type = 'button',
  ...otherProps
}) => {
  // Filter out jsx prop to prevent it from being passed to DOM element
  // eslint-disable-next-line no-unused-vars
  const { jsx, ...props } = otherProps;
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none relative overflow-hidden';
  
  const variants = {
    primary: 'bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white shadow-orange hover:shadow-orange-lg focus:ring-2 focus:ring-orange-500 focus:ring-offset-2',
    secondary: 'bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-900 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
    success: 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
    danger: 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
    warning: 'bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-white focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2',
    outline: 'border-2 border-orange-500 bg-white hover:bg-orange-50 active:bg-orange-100 text-orange-500 hover:text-orange-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2',
    ghost: 'text-orange-500 hover:bg-orange-50 active:bg-orange-100 hover:text-orange-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2',
    link: 'text-orange-500 hover:text-orange-600 underline-offset-2 hover:underline p-0 focus:ring-0',
    glass: 'bg-white/70 backdrop-blur-md border border-white/20 hover:bg-white/90 text-gray-800 shadow-sm'
  };
  
  const sizes = {
    xs: 'px-2 py-1 text-xs',
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-2.5 text-sm',
    large: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };

  const roundedOptions = {
    none: 'rounded-none',
    default: 'rounded-lg',
    full: 'rounded-full',
    pill: 'rounded-full px-6'
  };

  const buttonClasses = classNames(
    baseClasses,
    variants[variant],
    sizes[size],
    roundedOptions[rounded],
    {
      'w-full': fullWidth,
      'transform active:scale-95': !disabled
    },
    className
  );

  // Ripple effect
  const createRipple = (event) => {
    if (disabled || loading || variant === 'link') return;
    
    const button = event.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    const rect = button.getBoundingClientRect();
    
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - rect.left - radius}px`;
    circle.style.top = `${event.clientY - rect.top - radius}px`;
    circle.classList.add('absolute', 'rounded-full', 'bg-white', 'opacity-30', 'pointer-events-none');
    circle.style.transform = 'scale(0)';
    circle.style.animation = 'ripple 600ms linear';

    const ripple = button.getElementsByClassName('ripple')[0];
    if (ripple) {
      ripple.remove();
    }

    circle.classList.add('ripple');
    button.appendChild(circle);

    setTimeout(() => {
      if (circle) {
        circle.remove();
      }
    }, 600);
  };

  const handleClick = (event) => {
    createRipple(event);
    if (onClick) onClick(event);
  };

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin mr-2 h-4 w-4"
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
      )}

      {icon && iconPosition === 'left' && !loading && (
        <span className="mr-2">{icon}</span>
      )}
      
      {children}
      
      {icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}

      <style jsx>{`
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `}</style>
    </button>
  );
};

export default Button;
