import React, { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../../utils";
import { Icon } from "../../common/Icon";
import styles from "./Dialog.module.css";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "fullscreen";
  closeOnOverlay?: boolean;
  ariaLabel?: string;
}

export const Dialog: React.FC<DialogProps> = React.memo(
  ({
    open,
    onClose,
    title,
    description,
    children,
    footer,
    size = "md",
    closeOnOverlay = true,
    ariaLabel,
  }) => {
    const dialogRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
      if (open) {
        previousFocusRef.current = document.activeElement as HTMLElement;
        document.body.style.overflow = "hidden";

        requestAnimationFrame(() => {
          const first = dialogRef.current?.querySelector<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          );
          first?.focus();
        });
      } else {
        document.body.style.overflow = "";
        previousFocusRef.current?.focus();
        previousFocusRef.current = null;
      }
      return () => {
        document.body.style.overflow = "";
      };
    }, [open]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
          return;
        }
        if (e.key !== "Tab" || !dialogRef.current) return;

        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      },
      [onClose],
    );

    const handleOverlayClick = useCallback(
      (e: React.MouseEvent) => {
        if (closeOnOverlay && e.target === e.currentTarget) onClose();
      },
      [closeOnOverlay, onClose],
    );

    if (!open) return null;

    return createPortal(
      <div className={styles.overlay} onClick={handleOverlayClick} aria-hidden="true">
        <div
          ref={dialogRef}
          className={cn(styles.dialog, styles[size])}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel ?? title ?? "Dialog"}
          aria-describedby={description ? "dialog-desc" : undefined}
          onKeyDown={handleKeyDown}
        >
          <div className={styles.header}>
            <div className={styles.headerText}>
              {title && <h2 className={styles.title}>{title}</h2>}
              {description && (
                <p id="dialog-desc" className={styles.description}>
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Dialog schließen"
            >
              <Icon name="x" size={18} />
            </button>
          </div>

          {children && <div className={styles.body}>{children}</div>}

          {footer && <div className={styles.footer}>{footer}</div>}
        </div>
      </div>,
      document.body,
    );
  },
);

Dialog.displayName = "Dialog";
