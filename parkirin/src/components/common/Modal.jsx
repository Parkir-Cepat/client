// src/components/common/Modal.jsx
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { classNames } from '../../utils/helpers';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  animation = 'fade',
  variant = 'default',
  className = ''
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const sizes = {
    xs: 'max-w-xs',
    small: 'max-w-md',
    medium: 'max-w-lg',
    large: 'max-w-2xl',
    xlarge: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };

  const variants = {
    default: 'bg-white',
    primary: 'bg-white border-t-4 border-orange-500',
    danger: 'bg-white border-t-4 border-red-500',
    success: 'bg-white border-t-4 border-green-500',
    warning: 'bg-white border-t-4 border-yellow-500',
    glass: 'bg-white/80 backdrop-blur-lg border border-white/20',
  };

  const animations = {
    fade: {
      enter: 'transition-opacity duration-300 ease-out',
      enterFrom: 'opacity-0',
      enterTo: 'opacity-100',
      leave: 'transition-opacity duration-200 ease-in',
      leaveFrom: 'opacity-100',
      leaveTo: 'opacity-0',
    },
    zoom: {
      enter: 'transition-all duration-300 ease-out',
      enterFrom: 'opacity-0 scale-95',
      enterTo: 'opacity-100 scale-100',
      leave: 'transition-all duration-200 ease-in',
      leaveFrom: 'opacity-100 scale-100',
      leaveTo: 'opacity-0 scale-95',
    },
    slide: {
      enter: 'transition-all duration-300 ease-out',
      enterFrom: 'opacity-0 translate-y-8',
      enterTo: 'opacity-100 translate-y-0',
      leave: 'transition-all duration-200 ease-in',
      leaveFrom: 'opacity-100 translate-y-0',
      leaveTo: 'opacity-0 translate-y-8',
    }
  };

  useEffect(() => {
    if (!closeOnEscape) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsAnimating(true);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen && !isAnimating) return null;

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0"
        onClick={handleOverlayClick}
      >
        {/* Overlay */}
        <div 
          className={classNames(
            "fixed inset-0 bg-black/50 backdrop-blur-sm",
            animations[animation].enter,
            isOpen ? animations[animation].enterTo : animations[animation].leaveTo
          )} 
        />
        
        {/* Modal panel */}
        <div 
          className={classNames(
            'relative transform overflow-hidden rounded-xl shadow-xl sm:my-8 w-full',
            sizes[size],
            variants[variant],
            animations[animation].enter,
            isOpen ? animations[animation].enterTo : animations[animation].leaveTo,
            className
          )}
          onTransitionEnd={() => {
            if (!isOpen) setIsAnimating(false);
          }}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">
                  {title}
                </h3>
              )}
              
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="rounded-full p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
          
          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

// Sub-components
Modal.Header = ({ children, className = '', ...props }) => (
  <div className={classNames('flex items-start justify-between mb-4', className)} {...props}>
    {children}
  </div>
);

Modal.Title = ({ children, className = '', ...props }) => (
  <h3 className={classNames('text-lg font-medium text-gray-900', className)} {...props}>
    {children}
  </h3>
);

Modal.Body = ({ children, className = '', ...props }) => (
  <div className={classNames('text-gray-600', className)} {...props}>
    {children}
  </div>
);

Modal.Footer = ({ children, className = '', ...props }) => (
  <div className={classNames('mt-6 flex flex-wrap justify-end gap-3', className)} {...props}>
    {children}
  </div>
);

Modal.CloseButton = ({ onClick, children = 'Cancel', className = '', ...props }) => (
  <button
    type="button"
    className={classNames('inline-flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2', className)}
    onClick={onClick}
    {...props}
  >
    {children}
  </button>
);

Modal.ConfirmButton = ({ onClick, children = 'Confirm', className = '', ...props }) => (
  <button
    type="button"
    className={classNames('inline-flex justify-center rounded-lg border border-transparent bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2', className)}
    onClick={onClick}
    {...props}
  >
    {children}
  </button>
);

export default Modal;
