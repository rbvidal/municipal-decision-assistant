import React from 'react';
import { cn } from '../../utils';
import { Button } from '../common/Button';
import styles from './PageTitleBar.module.css';

interface PageTitleBarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  backAction?: { label: string; onClick: () => void };
  className?: string;
}

export const PageTitleBar: React.FC<PageTitleBarProps> = React.memo(({
  title, subtitle, actions, backAction, className,
}) => (
  <div className={cn(styles.bar, className)}>
    <div className={styles.left}>
      {backAction && (
        <Button variant="ghost" size="sm" onClick={backAction.onClick}>
          ← {backAction.label}
        </Button>
      )}
      <div>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
    </div>
    {actions && <div className={styles.actions}>{actions}</div>}
  </div>
));

PageTitleBar.displayName = 'PageTitleBar';
