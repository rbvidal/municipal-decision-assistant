import React from 'react';
import { cn } from '../../utils';
import { IconButton } from '../common/IconButton';
import styles from './Sidebar.module.css';

export type SidebarMode = 'favorites' | 'decision-support' | 'admin' | 'default';

interface SidebarProps {
  children: React.ReactNode;
  mode?: SidebarMode;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  width?: number;
  className?: string;
  title?: string;
}

export const Sidebar: React.FC<SidebarProps> = React.memo(({
  children, mode = 'default', collapsed = false, onToggleCollapse,
  width = 280, className, title,
}) => (
  <div
    className={cn(styles.sidebar, styles[mode], collapsed && styles.collapsed, className)}
    style={{ width: collapsed ? 0 : width }}
    role="complementary"
    aria-label={title ?? 'Seitenleiste'}
  >
    {!collapsed && (
      <>
        {title && (
          <div className={styles.header}>
            <h3 className={styles.title}>{title}</h3>
            {onToggleCollapse && (
              <IconButton icon="‹" ariaLabel="Seitenleiste einklappen" size="sm" onClick={onToggleCollapse} />
            )}
          </div>
        )}
        <div className={styles.content}>{children}</div>
      </>
    )}
  </div>
));

Sidebar.displayName = 'Sidebar';
