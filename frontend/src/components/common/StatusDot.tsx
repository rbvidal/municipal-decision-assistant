import React from 'react';
import type { StatusDotProps } from '../../types';
import { cn } from '../../utils';
import styles from './StatusDot.module.css';

const labelMap: Record<string, string> = {
  success: 'Aktiv',
  warning: 'Warnung',
  error: 'Fehler',
  info: 'Information',
  neutral: 'Inaktiv',
};

export const StatusDot: React.FC<StatusDotProps> = React.memo(({
  status,
  size = 'md',
  ariaLabel,
  className,
}) => (
  <span
    className={cn(styles.dot, styles[status], styles[size], className)}
    role="status"
    aria-label={ariaLabel ?? labelMap[status]}
  />
));

StatusDot.displayName = 'StatusDot';
