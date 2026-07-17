import React, { forwardRef } from 'react';
import type { ButtonProps } from '../../types';
import { cn } from '../../utils';
import { Spinner } from './Spinner';
import styles from './Button.module.css';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  type = 'button',
  onClick,
  children,
  className,
  id,
  ariaLabel,
  ariaDescribedby,
  tabIndex,
}, ref) => (
  <button
    ref={ref}
    type={type}
    className={cn(
      styles.btn,
      styles[variant],
      styles[size],
      fullWidth && styles.fullWidth,
      loading && styles.loading,
      className,
    )}
    disabled={disabled || loading}
    onClick={onClick}
    id={id}
    aria-label={ariaLabel}
    aria-describedby={ariaDescribedby}
    aria-busy={loading}
    tabIndex={tabIndex}
  >
    {loading && <Spinner size="sm" />}
    <span className={loading ? styles.loadingText : undefined}>{children}</span>
  </button>
));

Button.displayName = 'Button';
