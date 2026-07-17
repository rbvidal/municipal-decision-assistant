import React from 'react';
import type { SpinnerProps } from '../../types';
import { cn } from '../../utils';
import styles from './Spinner.module.css';

export const Spinner: React.FC<SpinnerProps> = React.memo(({
  size = 'md',
  ariaLabel = 'Lädt...',
  className,
}) => (
  <div
    className={cn(styles.spinner, styles[size], className)}
    role="status"
    aria-label={ariaLabel}
  >
    <div className={styles.dot} />
  </div>
));

Spinner.displayName = 'Spinner';
