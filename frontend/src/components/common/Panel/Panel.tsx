import React from "react";
import { cn } from "../../../utils";
import styles from "./Panel.module.css";

interface PanelProps {
  children: React.ReactNode;
  title?: string;
  icon?: React.ReactNode;
  headerAction?: React.ReactNode;
  variant?: "default" | "subtle";
  className?: string;
  id?: string;
}

export const Panel: React.FC<PanelProps> = React.memo(
  ({ children, title, icon, headerAction, variant = "default", className, id }) => {
    const hasHeader = title || icon || headerAction;

    return (
      <section id={id} className={cn(styles.panel, styles[variant], className)}>
        {hasHeader && (
          <header className={styles.header}>
            <div className={styles.headerLeft}>
              {icon && <span className={styles.icon}>{icon}</span>}
              {title && <h2 className={styles.title}>{title}</h2>}
            </div>
            {headerAction && <div className={styles.headerAction}>{headerAction}</div>}
          </header>
        )}
        <div className={styles.body}>{children}</div>
      </section>
    );
  },
);

Panel.displayName = "Panel";
