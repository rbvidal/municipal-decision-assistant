import React from 'react';
import type { ProgressIndicatorProps } from '../../types';
import { cn } from '../../utils';
import styles from './ProgressIndicator.module.css';

const statusColors: Record<string, string> = { success: styles.success, warning: styles.warning, error: styles.error, info: '', neutral: '' };

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = React.memo(({
  value, max = 100, label, showPercentage = true, size = 'md', status, className, ariaLabel,
}) => {
  const pct = Math.round((value / max) * 100);
  return (
    <div className={cn(styles.wrapper, className)} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={ariaLabel ?? label}>
      {(label || showPercentage) && (
        <div className={styles.header}>
          {label && <span className={styles.label}>{label}</span>}
          {showPercentage && <span className={styles.pct}>{pct}%</span>}
        </div>
      )}
      <div className={cn(styles.track, styles[size])}>
        <div className={cn(styles.fill, status && statusColors[status])} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    </div>
  );
});

ProgressIndicator.displayName = 'ProgressIndicator';
