import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '../../../utils';
import { Icon } from '../../common/Icon';
import styles from './DropdownMenu.module.css';

interface DropdownItem {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  disabled?: boolean;
  danger?: boolean;
  onClick: () => void;
}

interface DropdownGroup {
  id: string;
  label?: string;
  items: DropdownItem[];
}

interface DropdownMenuProps {
  trigger: React.ReactElement;
  items: (DropdownItem | DropdownGroup)[];
  className?: string;
}

function isGroup(item: DropdownItem | DropdownGroup): item is DropdownGroup {
  return 'items' in item;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = React.memo(({
  trigger, items, className,
}) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleItemClick = useCallback((item: DropdownItem) => {
    if (!item.disabled) { item.onClick(); setOpen(false); }
  }, []);

  const renderItem = (item: DropdownItem) => (
    <button
      key={item.id}
      type="button"
      className={cn(styles.item, item.danger && styles.danger, item.disabled && styles.disabled)}
      onClick={() => handleItemClick(item)}
      disabled={item.disabled}
      role="menuitem"
    >
      {item.icon && <Icon name={item.icon} size={14} className={styles.itemIcon} />}
      <span className={styles.itemLabel}>{item.label}</span>
      {item.shortcut && <span className={styles.shortcut}>{item.shortcut}</span>}
    </button>
  );

  return (
    <div className={styles.wrapper} ref={menuRef}>
      {React.cloneElement(trigger as React.ReactElement<Record<string, unknown>>, {
        onClick: (e: React.MouseEvent) => {
          (trigger.props as Record<string, any>).onClick?.(e);
          setOpen((v) => !v);
        },
        'aria-expanded': open,
        'aria-haspopup': 'menu',
      })}
      {open && (
        <div className={cn(styles.menu, className)} role="menu">
          {items.map((entry) =>
            isGroup(entry) ? (
              <div key={entry.id} className={styles.group}>
                {entry.label && <span className={styles.groupLabel}>{entry.label}</span>}
                {entry.items.map(renderItem)}
              </div>
            ) : (
              renderItem(entry)
            ),
          )}
        </div>
      )}
    </div>
  );
});

DropdownMenu.displayName = 'DropdownMenu';
