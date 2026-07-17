import React, { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../../utils";
import { Icon } from "../../common/Icon";
import styles from "./Drawer.module.css";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  side?: "left" | "right" | "bottom";
  width?: string;
  closeOnOverlay?: boolean;
}

export const Drawer: React.FC<DrawerProps> = React.memo(
  ({
    open,
    onClose,
    title,
    children,
    footer,
    side = "right",
    width = "420px",
    closeOnOverlay = true,
  }) => {
    const drawerRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
      if (open) {
        previousFocusRef.current = document.activeElement as HTMLElement;
        document.body.style.overflow = "hidden";
        requestAnimationFrame(() => {
          drawerRef.current?.querySelector<HTMLElement>("button, [href], input")?.focus();
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
        if (e.key === "Escape") onClose();
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

    const isHorizontal = side === "left" || side === "right";

    return createPortal(
      <div className={styles.overlay} onClick={handleOverlayClick} aria-hidden="true">
        <div
          ref={drawerRef}
          className={cn(styles.drawer, styles[side])}
          style={isHorizontal ? { width } : { maxHeight: "60vh" }}
          role="dialog"
          aria-modal="true"
          aria-label={title ?? "Panel"}
          onKeyDown={handleKeyDown}
        >
          <div className={styles.header}>
            {title && <h2 className={styles.title}>{title}</h2>}
            <button
              type="button"
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Schließen"
            >
              <Icon name="x" size={18} />
            </button>
          </div>
          <div className={styles.body}>{children}</div>
          {footer && <div className={styles.footer}>{footer}</div>}
        </div>
      </div>,
      document.body,
    );
  },
);

Drawer.displayName = "Drawer";
