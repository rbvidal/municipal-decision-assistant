import React, { useState, useRef, useEffect } from "react";
import { cn } from "../../utils";
import styles from "./UserMenu.module.css";

export interface UserMenuAction {
  id: string;
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
}

interface UserMenuProps {
  userName: string;
  userEmail: string;
  userDepartment?: string;
  userInitials: string;
  actions: UserMenuAction[];
  className?: string;
}

export const UserMenu: React.FC<UserMenuProps> = React.memo(
  ({ userName, userEmail, userDepartment, userInitials, actions, className }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

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
        <button
          type="button"
          className={styles.trigger}
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-haspopup="true"
          aria-label={`Benutzermenü, ${userName}`}
        >
          <span className={styles.avatar} aria-hidden="true">
            {userInitials}
          </span>
          <span className={styles.name}>{userName}</span>
        </button>
        {open && (
          <div className={styles.dropdown} role="menu">
            <div className={styles.userInfo}>
              <span className={styles.avatarLarge}>{userInitials}</span>
              <div>
                <div className={styles.userName}>{userName}</div>
                <div className={styles.userEmail}>{userEmail}</div>
                {userDepartment && <div className={styles.userDept}>{userDepartment}</div>}
              </div>
            </div>
            <div className={styles.divider} />
            {actions.map((action) => (
              <button
                key={action.id}
                type="button"
                role="menuitem"
                className={cn(styles.menuItem, action.variant === "danger" && styles.danger)}
                onClick={() => {
                  action.onClick();
                  setOpen(false);
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  },
);

UserMenu.displayName = "UserMenu";
