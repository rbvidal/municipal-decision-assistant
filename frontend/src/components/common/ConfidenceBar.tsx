import React from 'react';
import type { ConfidenceBarProps } from '../../types';
import { cn } from '../../utils';
import styles from './ConfidenceBar.module.css';

export const ConfidenceBar: React.FC<ConfidenceBarProps> = React.memo(({
  value, max = 100, ariaLabel, className,
}) => {
  const pct = Math.round((value / max) * 100);
  const level = pct >= 80 ? 'high' : pct >= 50 ? 'medium' : 'low';
  const label = ariaLabel ?? `Verlässlichkeit: ${pct} Prozent`;

  return (
    <div className={cn(styles.bar, className)} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={label}>
      <div className={cn(styles.fill, styles[level])} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  );
});

ConfidenceBar.displayName = 'ConfidenceBar';
