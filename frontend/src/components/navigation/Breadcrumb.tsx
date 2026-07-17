import React from 'react';
import { cn } from '../../utils';
import styles from './Breadcrumb.module.css';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  onNavigate?: (href: string) => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = React.memo(({ items, className, onNavigate }) => (
  <nav aria-label="Breadcrumb" className={cn(styles.breadcrumb, className)}>
    <ol className={styles.list}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <li key={i} className={styles.item}>
            {i > 0 && <span className={styles.separator} aria-hidden="true">›</span>}
            {item.href && !isLast ? (
              <a
                href={item.href}
                className={styles.link}
                onClick={(e) => { e.preventDefault(); onNavigate?.(item.href!); }}
              >
                {item.icon}{item.label}
              </a>
            ) : (
              <span className={cn(styles.current, isLast && styles.last)} aria-current={isLast ? 'page' : undefined}>
                {item.icon}{item.label}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  </nav>
));

Breadcrumb.displayName = 'Breadcrumb';
