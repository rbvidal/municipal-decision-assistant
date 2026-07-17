import React from 'react';
import { ThemeProvider } from './ThemeProvider';
import { ToastProvider } from './ToastProvider';
import { ModalProvider } from './ModalProvider';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    <ToastProvider>
      <ModalProvider>
        {children}
      </ModalProvider>
    </ToastProvider>
  </ThemeProvider>
);
