import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '../../../utils';
import styles from './Popover.module.css';

interface PopoverProps {
  trigger: React.ReactElement;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const Popover: React.FC<PopoverProps> = React.memo(({
  trigger, children, position = 'bottom', className,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false);
  }, []);

  const typedTrigger = trigger as React.ReactElement<Record<string, unknown>>;

  return (
    <div className={styles.wrapper} ref={ref}>
      {React.cloneElement(typedTrigger, {
        onClick: (e: React.MouseEvent) => {
          (trigger.props as Record<string, any>).onClick?.(e);
          setOpen((v) => !v);
        },
        'aria-expanded': open,
        'aria-haspopup': true,
      })}
      {open && (
        <div
          className={cn(styles.popover, styles[position], className)}
          role="dialog"
          onKeyDown={handleKeyDown}
        >
          {children}
        </div>
      )}
    </div>
  );
});

Popover.displayName = 'Popover';
