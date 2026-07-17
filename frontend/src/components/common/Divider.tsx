import React from 'react';
import type { DividerProps } from '../../types';
import { cn } from '../../utils';
import styles from './Divider.module.css';

export const Divider: React.FC<DividerProps> = React.memo(({
  orientation = 'horizontal',
  label,
  className,
}) => (
  <div
    className={cn(styles.divider, styles[orientation], className)}
    role="separator"
    aria-orientation={orientation}
  >
    {label && <span className={styles.label}>{label}</span>}
  </div>
));

Divider.displayName = 'Divider';
