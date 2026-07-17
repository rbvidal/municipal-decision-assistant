import React, { useState } from 'react';
import type { TextAreaProps } from '../../types';
import { cn, generateId } from '../../utils';
import styles from './TextArea.module.css';

export const TextArea: React.FC<TextAreaProps> = React.memo(({
  label, value, onChange, placeholder, error, helpText,
  required = false, disabled = false, readOnly = false,
  rows = 4, maxLength, resize = 'vertical',
  id, name, className, ariaDescribedby,
}) => {
  const [autoId] = useState(() => id ?? generateId('textarea'));
  const helpId = helpText ? `${autoId}-help` : undefined;
  const errorId = error ? `${autoId}-error` : undefined;
  const describedBy = ariaDescribedby ?? ([helpId, errorId].filter(Boolean).join(' ') || undefined);

  return (
    <div className={cn(styles.field, className)}>
      {label && <label htmlFor={autoId} className={cn('form-label', required && 'required')}>{label}</label>}
      <textarea
        id={autoId} name={name} value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} disabled={disabled} readOnly={readOnly}
        rows={rows} maxLength={maxLength}
        className={cn('form-input', 'form-textarea', error && 'error')}
        style={{ resize }}
        aria-invalid={!!error} aria-describedby={describedBy}
      />
      {helpText && !error && <p id={helpId} className="form-help">{helpText}</p>}
      {error && <p id={errorId} className="form-error" role="alert">{error}</p>}
    </div>
  );
});

TextArea.displayName = 'TextArea';
