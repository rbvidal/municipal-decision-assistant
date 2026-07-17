import React, { useEffect } from 'react';
import type { ToastProps } from '../../types';
import { cn } from '../../utils';
import { IconButton } from './IconButton';
import styles from './Toast.module.css';

const typeStyles: Record<string, string> = { success: styles.success, warning: styles.warning, error: styles.error, info: styles.info, neutral: '' };

export const Toast: React.FC<ToastProps> = React.memo(({
  id, type, message, action, duration = type === 'error' || type === 'warning' ? 10000 : 5000, onDismiss,
}) => {
  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(() => onDismiss(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  return (
    <div className={cn(styles.toast, typeStyles[type])} role="alert" aria-live="polite">
      <span className={styles.message}>{message}</span>
      {action && (
        <button type="button" className={styles.action} onClick={action.onClick}>{action.label}</button>
      )}
      <IconButton icon="✕" ariaLabel="Schließen" size="sm" onClick={() => onDismiss(id)} />
    </div>
  );
});

Toast.displayName = 'Toast';
