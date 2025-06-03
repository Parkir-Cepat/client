// src/components/common/Input.jsx
import React, { forwardRef, useState } from 'react';
import { classNames } from '../../utils/helpers';

const Input = forwardRef(({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  helperText,
  disabled = false,
  required = false,
  className = '',
  size = 'medium',
  variant = 'default',
  rounded = 'medium',
  startIcon,
  endIcon,
  showPasswordToggle = false,
  labelClassName = '',
  inputClassName = '',
  floatingLabel = false,
  ...props
}, ref) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const baseClasses = 'block w-full border shadow-sm transition-all duration-200 focus:outline-none focus:ring-2';
  
  const variants = {
    default: 'border-gray-300 focus:border-orange-500 focus:ring-orange-100',
    error: 'border-red-300 focus:border-red-500 focus:ring-red-100',
    success: 'border-green-300 focus:border-green-500 focus:ring-green-100',
    filled: 'bg-gray-100 border-gray-300 focus:bg-white focus:border-orange-500 focus:ring-orange-100',
    outlined: 'bg-transparent border-gray-300 focus:border-orange-500 focus:ring-orange-100',
    glass: 'bg-white/70 backdrop-blur-md border-white/20 focus:border-white/60 focus:ring-white/30',
  };
  
  const sizes = {
    xs: 'px-2 py-1 text-xs',
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-2.5 text-sm',
    large: 'px-4 py-3 text-base',
    xl: 'px-5 py-4 text-lg'
  };

  const roundedOptions = {
    none: 'rounded-none',
    small: 'rounded',
    medium: 'rounded-lg',
    large: 'rounded-xl',
    full: 'rounded-full',
  };

  const inputVariant = error ? 'error' : variant;

  // Special handling for floating label
  const floatingLabelClasses = floatingLabel
    ? 'pt-5 pb-2'
    : sizes[size];
  
  const inputClasses = classNames(
    baseClasses,
    variants[inputVariant],
    floatingLabel ? floatingLabelClasses : sizes[size],
    roundedOptions[rounded],
    {
      'pl-10': startIcon,
      'pr-10': endIcon || (type === 'password' && showPasswordToggle),
      'opacity-50 cursor-not-allowed': disabled,
      'bg-gray-50': disabled,
    },
    inputClassName
  );

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className={className}>
      {label && !floatingLabel && (
        <label className={classNames(
          "block text-sm font-medium mb-1 text-gray-700",
          labelClassName
        )}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {startIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className={classNames(
              "h-5 w-5",
              error ? 'text-red-400' : (isFocused ? 'text-orange-500' : 'text-gray-400')
            )}>
              {startIcon}
            </div>
          </div>
        )}
        
        <input
          ref={ref}
          type={showPasswordToggle && type === 'password' ? (passwordVisible ? 'text' : 'password') : type}
          value={value}
          onChange={onChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={floatingLabel ? ' ' : placeholder}
          disabled={disabled}
          required={required}
          className={inputClasses}
          {...props}
        />
        
        {/* Floating Label */}
        {floatingLabel && label && (
          <label 
            className={classNames(
              "absolute text-sm duration-200 transform -translate-y-4 top-1/2 z-10 origin-[0] pointer-events-none",
              (isFocused || value) ? "top-2 scale-75 text-orange-500" : "text-gray-500",
              startIcon ? "left-10" : "left-4"
            )}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        {/* Password Toggle */}
        {type === 'password' && showPasswordToggle && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
            onClick={togglePasswordVisibility}
          >
            {passwordVisible ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            )}
          </button>
        )}
        
        {/* End Icon (not for password fields with toggle) */}
        {endIcon && !(type === 'password' && showPasswordToggle) && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="h-5 w-5 text-gray-400">
              {endIcon}
            </div>
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <p className={classNames(
          'text-xs mt-1',
          error ? 'text-red-600' : 'text-gray-500'
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

// Variants for different input types
Input.Text = forwardRef((props, ref) => (
  <Input ref={ref} type="text" {...props} />
));

Input.Password = forwardRef((props, ref) => (
  <Input 
    ref={ref} 
    type="password" 
    showPasswordToggle={true}
    {...props} 
  />
));

Input.Email = forwardRef((props, ref) => (
  <Input 
    ref={ref} 
    type="email" 
    startIcon={
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
      </svg>
    }
    {...props} 
  />
));

Input.Search = forwardRef((props, ref) => (
  <Input 
    ref={ref} 
    type="search" 
    startIcon={
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    }
    {...props} 
  />
));

Input.displayName = 'Input';

export default Input;
