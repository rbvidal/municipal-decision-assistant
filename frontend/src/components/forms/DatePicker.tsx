import React, { useState } from 'react';
import type { DatePickerProps } from '../../types';
import { cn, generateId } from '../../utils';

export const DatePicker: React.FC<DatePickerProps> = React.memo(({
  label, value, onChange, min, max, error, helpText,
  required = false, disabled = false, id, name, className,
}) => {
  const [autoId] = useState(() => id ?? generateId('date'));
  const helpId = helpText ? `${autoId}-help` : undefined;
  const errorId = error ? `${autoId}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('form-field', className)}>
      {label && <label htmlFor={autoId} className={cn('form-label', required && 'required')}>{label}</label>}
      <input
        id={autoId} name={name} type="date"
        value={value} onChange={(e) => onChange(e.target.value)}
        min={min} max={max} disabled={disabled}
        className={cn('form-input', error && 'error')}
        aria-invalid={!!error} aria-describedby={describedBy}
      />
      {helpText && !error && <p id={helpId} className="form-help">{helpText}</p>}
      {error && <p id={errorId} className="form-error" role="alert">{error}</p>}
    </div>
  );
});

DatePicker.displayName = 'DatePicker';
