import React, { useCallback } from 'react';
import { cn } from '../../../utils';
import { Icon } from '../../common/Icon';
import type { Status } from '../../../types';
import styles from './ToastContainer.module.css';

interface Toast {
  id: string;
  type: Status;
  message: string;
}

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

const iconMap: Record<string, string> = {
  success: 'check-circle',
  warning: 'alert-triangle',
  error: 'alert-circle',
  info: 'info',
  neutral: 'info',
};

export const ToastContainer: React.FC<ToastContainerProps> = React.memo(({ toasts, onDismiss }) => {
  const handleDismiss = useCallback((id: string) => () => onDismiss(id), [onDismiss]);

  return (
    <div className={styles.container} aria-live="polite" aria-label="Benachrichtigungen">
      {toasts.map((toast) => (
        <div key={toast.id} className={cn(styles.toast, styles[toast.type])} role="alert">
          <Icon name={iconMap[toast.type] ?? 'info'} size={16} className={styles.icon} />
          <span className={styles.message}>{toast.message}</span>
          <button
            type="button"
            className={styles.dismissBtn}
            onClick={handleDismiss(toast.id)}
            aria-label="Benachrichtigung schließen"
          >
            <Icon name="x" size={14} />
          </button>
        </div>
      ))}
    </div>
  );
});

ToastContainer.displayName = 'ToastContainer';
