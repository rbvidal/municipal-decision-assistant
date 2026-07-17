import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Status } from '../types';
import { Toast } from '../components/common/Toast';
import styles from './ToastProvider.module.css';

interface ToastItem {
  id: string;
  type: Status;
  message: string;
  action?: { label: string; onClick: () => void };
  duration?: number;
}

interface ToastContextValue {
  addToast: (type: Status, message: string, action?: { label: string; onClick: () => void }) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

let toastCounter = 0;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((type: Status, message: string, action?: { label: string; onClick: () => void }) => {
    const id = `toast-${++toastCounter}-${Date.now()}`;
    setToasts((prev) => [...prev, { id, type, message, action }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className={styles.container} aria-live="polite" aria-relevant="additions">
        {toasts.map((t) => (
          <Toast key={t.id} {...t} onDismiss={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
