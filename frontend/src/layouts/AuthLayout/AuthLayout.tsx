import React from 'react';
import { Logo } from '../../components/common/Logo';
import styles from './AuthLayout.module.css';

interface AuthLayoutProps {
  children: React.ReactNode;
  showLogo?: boolean;
}

export const AuthLayout: React.FC<AuthLayoutProps> = React.memo(({ children, showLogo = true }) => (
  <div className={styles.wrapper}>
    <main className={styles.card}>
      {showLogo && (
        <div className={styles.logo}>
          <Logo size="lg" />
        </div>
      )}
      <h1 className={styles.title}>Kommunale Entscheidungsplattform</h1>
      {children}
    </main>
    <footer className={styles.footer}>
      <span>DE | English</span>
      <span>Version 2.4.1</span>
    </footer>
  </div>
));

AuthLayout.displayName = 'AuthLayout';
