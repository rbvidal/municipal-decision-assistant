import React from 'react';
import { cn } from '../../../utils';
import { Badge } from '../../common/Badge';
import styles from './ChecklistItem.module.css';

interface ChecklistItemProps {
  id: string;
  title: string;
  description?: string;
  checked: boolean;
  statusLabel?: string;
  onToggle: (id: string) => void;
}

export const ChecklistItem: React.FC<ChecklistItemProps> = React.memo(({
  id, title, description, checked, statusLabel, onToggle,
}) => (
  <div className={cn(styles.item, checked && styles.checked)}>
    <label className={styles.label}>
      <input
        type="checkbox"
        className={styles.checkbox}
        checked={checked}
        onChange={() => onToggle(id)}
      />
      <span className={styles.checkmark} aria-hidden="true" />
      <div className={styles.textContent}>
        <span className={styles.title}>{title}</span>
        {description && <span className={styles.description}>{description}</span>}
      </div>
    </label>
    {statusLabel && (
      <Badge status="warning" variant="pill">{statusLabel}</Badge>
    )}
  </div>
));

ChecklistItem.displayName = 'ChecklistItem';
