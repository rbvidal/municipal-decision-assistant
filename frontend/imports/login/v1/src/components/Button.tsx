/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'h-[44px] font-label-sm text-label-sm rounded-lg transition-all flex items-center justify-center space-x-sm admin-focus font-semibold cursor-pointer';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-opacity-50 disabled:cursor-not-allowed',
    secondary: 'bg-secondary text-white hover:bg-opacity-90 active:bg-opacity-85 disabled:bg-opacity-50 disabled:cursor-not-allowed',
    outline: 'border border-border-default text-on-surface-variant hover:bg-surface-container-low transition-colors disabled:bg-opacity-50 disabled:cursor-not-allowed',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : null}
      
      {!isLoading && children}
      {!isLoading && icon && <span className="flex items-center">{icon}</span>}
    </button>
  );
};
