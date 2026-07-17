/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { InputHTMLAttributes, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  rightLabelAction?: React.ReactNode;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  rightLabelAction,
  type = 'text',
  className = '',
  id,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordType = type === 'password';
  const resolvedType = isPasswordType && showPassword ? 'text' : type;

  return (
    <div className="space-y-xs">
      <div className="flex justify-between items-center">
        <label className="font-label-sm text-label-sm text-on-surface-variant select-none" htmlFor={id}>
          {label}
        </label>
        {rightLabelAction}
      </div>
      <div className="relative group">
        <input
          id={id}
          type={resolvedType}
          className={`w-full h-row-height px-md border border-border-default rounded font-body-md text-body-md admin-focus transition-colors bg-white text-on-surface focus:outline-none focus:border-primary pr-12 ${className}`}
          {...props}
        />
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-0 top-0 h-row-height w-10 flex items-center justify-center text-outline hover:text-on-surface transition-colors cursor-pointer focus:outline-none"
            aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
          >
            {showPassword ? (
              <EyeOff size={20} className="stroke-[1.5]" />
            ) : (
              <Eye size={20} className="stroke-[1.5]" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};
