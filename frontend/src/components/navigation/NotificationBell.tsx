import React, { useState, useRef, useEffect } from "react";
import { cn } from "../../utils";
import { IconButton } from "../common/IconButton";
import { Button } from "../common/Button";
import styles from "./NotificationBell.module.css";

export interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  action?: { label: string; onClick: () => void };
  type?: "approval" | "assignment" | "upload" | "deadline" | "info";
}

interface NotificationBellProps {
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onMarkAllRead: () => void;
  onViewAll: () => void;
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = React.memo(
  ({ notifications, onNotificationClick, onMarkAllRead, onViewAll, className }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const unread = notifications.filter((n) => !n.read).length;

    useEffect(() => {
      if (!open) return;
      const handler = (e: MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    useEffect(() => {
      if (!open) return;
      const handler = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
      };
      document.addEventListener("keydown", handler);
      return () => document.removeEventListener("keydown", handler);
    }, [open]);

    return (
      <div className={cn(styles.wrapper, className)} ref={ref}>
        <IconButton
          icon="🔔"
          ariaLabel={`Benachrichtigungen${unread > 0 ? `, ${unread} ungelesen` : ""}`}
          size="md"
          onClick={() => setOpen(!open)}
        />
        {unread > 0 && <span className={styles.badge}>{unread > 99 ? "99+" : unread}</span>}
        {open && (
          <div className={styles.dropdown} role="dialog" aria-label="Benachrichtigungen">
            <div className={styles.header}>
              <h4 className={styles.title}>Benachrichtigungen</h4>
              {unread > 0 && (
                <Button variant="ghost" size="sm" onClick={onMarkAllRead}>
                  Alle lesen
                </Button>
              )}
            </div>
            <div className={styles.list}>
              {notifications.length === 0 ? (
                <p className={styles.empty}>Keine Benachrichtigungen</p>
              ) : (
                notifications.slice(0, 10).map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    className={cn(styles.item, !n.read && styles.unread)}
                    onClick={() => {
                      onNotificationClick(n);
                      setOpen(false);
                    }}
                  >
                    <span className={cn(styles.dot, !n.read && styles.dotUnread)} />
                    <div className={styles.itemContent}>
                      <span className={styles.itemTitle}>{n.title}</span>
                      <span className={styles.itemDesc}>{n.description}</span>
                      {n.action && <span className={styles.itemAction}>{n.action.label}</span>}
                    </div>
                    <span className={styles.time}>{n.timestamp}</span>
                  </button>
                ))
              )}
            </div>
            <div className={styles.footer}>
              <Button variant="ghost" size="sm" onClick={onViewAll}>
                Alle Benachrichtigungen
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  },
);

NotificationBell.displayName = "NotificationBell";
