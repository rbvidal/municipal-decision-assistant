import React, { forwardRef, useState } from 'react';
import type { TextInputProps } from '../../types';
import { cn, generateId } from '../../utils';
import styles from './TextInput.module.css';

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  error,
  helpText,
  required = false,
  disabled = false,
  readOnly = false,
  maxLength,
  autoComplete,
  id,
  name,
  className,
  inputClassName,
  ariaDescribedby,
  onBlur,
  onFocus,
}, ref) => {
  const [autoId] = useState(() => id ?? generateId('input'));
  const helpId = helpText ? `${autoId}-help` : undefined;
  const errorId = error ? `${autoId}-error` : undefined;
  const describedBy = ariaDescribedby ?? ([helpId, errorId].filter(Boolean).join(' ') || undefined);

  return (
    <div className={cn(styles.field, className)}>
      {label && (
        <label htmlFor={autoId} className={cn('form-label', required && 'required')}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={autoId}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        maxLength={maxLength}
        autoComplete={autoComplete}
        className={cn('form-input', error && 'error', inputClassName)}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        onBlur={onBlur}
        onFocus={onFocus}
      />
      {helpText && !error && <p id={helpId} className="form-help">{helpText}</p>}
      {error && <p id={errorId} className="form-error" role="alert">{error}</p>}
    </div>
  );
});

TextInput.displayName = 'TextInput';
