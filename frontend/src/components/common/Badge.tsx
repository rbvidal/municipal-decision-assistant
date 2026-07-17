import React from 'react';
import type { BadgeProps } from '../../types';
import { cn } from '../../utils';
import styles from './Badge.module.css';

const statusMap = { success: styles.success, warning: styles.warning, error: styles.error, info: styles.info, neutral: styles.neutral };

export const Badge: React.FC<BadgeProps> = React.memo(({
  status = 'neutral',
  variant = 'pill',
  children,
  className,
  ariaLabel,
}) => {
  if (variant === 'dot') {
    return (
      <span
        className={cn(styles.dot, styles[`dot-${status}`], className)}
        aria-label={ariaLabel}
        role="status"
      />
    );
  }

  return (
    <span
      className={cn(styles.badge, statusMap[status], className)}
      aria-label={ariaLabel}
    >
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';
