// src/components/forms/FormField.jsx
import React from 'react';
import { Input } from '../common';
import { classNames } from '../../utils/helpers';

const FormField = ({
  name,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  touched,
  required = false,
  disabled = false,
  placeholder,
  helperText,
  className = '',
  startIcon,
  endIcon,
  children,
  ...props
}) => {
  const showError = error && touched;

  return (
    <div className={classNames('space-y-1', className)}>
      {children ? (
        <div>
          {label && (
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          {children}
          {(showError || helperText) && (
            <p className={classNames(
              'text-sm mt-1',
              showError ? 'text-red-600' : 'text-gray-500'
            )}>
              {showError ? error : helperText}
            </p>
          )}
        </div>
      ) : (
        <Input
          name={name}
          label={label}
          type={type}        value={value}
        onChange={onChange}
        onBlur={onBlur}
        error={showError ? error : undefined}
        helperText={!showError ? helperText : undefined}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        startIcon={startIcon}
        endIcon={endIcon}
        {...props}
      />
      )}
    </div>  );
};

export default FormField;
