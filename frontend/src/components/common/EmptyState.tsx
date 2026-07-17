import React from 'react';
import type { EmptyStateProps } from '../../types';
import { cn } from '../../utils';
import { Button } from './Button';
import styles from './EmptyState.module.css';

export const EmptyState: React.FC<EmptyStateProps> = React.memo(({
  icon, title, description, action, className,
}) => (
  <div className={cn(styles.wrapper, className)}>
    {icon && <div className={styles.icon}>{icon}</div>}
    <h3 className={styles.title}>{title}</h3>
    {description && <p className={styles.description}>{description}</p>}
    {action && <Button variant="primary" onClick={action.onClick}>{action.label}</Button>}
  </div>
));

EmptyState.displayName = 'EmptyState';
