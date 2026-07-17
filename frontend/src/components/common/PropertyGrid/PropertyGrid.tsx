import React from 'react';
import { cn } from '../../../utils';
import styles from './PropertyGrid.module.css';

interface PropertyItem {
  label: string;
  value: string;
  valueMono?: boolean;
  valueHighlight?: boolean;
}

interface PropertyGridProps {
  items: PropertyItem[];
  className?: string;
}

export const PropertyGrid: React.FC<PropertyGridProps> = React.memo(({ items, className }) => (
  <dl className={cn(styles.grid, className)}>
    {items.map((item) => (
      <div key={item.label} className={styles.row}>
        <dt className={styles.label}>{item.label}</dt>
        <dd
          className={cn(
            styles.value,
            item.valueMono && styles.valueMono,
            item.valueHighlight && styles.valueHighlight,
          )}
        >
          {item.value}
        </dd>
      </div>
    ))}
  </dl>
));

PropertyGrid.displayName = 'PropertyGrid';
