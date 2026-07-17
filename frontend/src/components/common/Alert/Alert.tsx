import React from 'react';
import { cn } from '../../../utils';
import { Button } from '../Button';
import { Icon } from '../Icon';
import type { Status } from '../../../types';
import styles from './Alert.module.css';

interface AlertProps {
  type?: Status;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const iconName: Record<string, string> = {
  warning: 'alert-triangle',
  error: 'alert-circle',
  info: 'info',
  success: 'check-circle',
};

export const Alert: React.FC<AlertProps> = React.memo(({
  type = 'warning',
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => (
  <div
    className={cn(styles.alert, styles[type], className)}
    role="alert"
  >
    <div className={styles.icon}>
      <Icon name={iconName[type] ?? 'info'} size={20} />
    </div>
    <div className={styles.content}>
      <p className={styles.title}>{title}</p>
      {description && <p className={styles.description}>{description}</p>}
    </div>
    {actionLabel && onAction && (
      <Button variant="secondary" size="sm" onClick={onAction}>
        {actionLabel}
      </Button>
    )}
  </div>
));

Alert.displayName = 'Alert';
