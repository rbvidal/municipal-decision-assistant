import React from "react";
import { cn } from "../../../utils";
import type { Status } from "../../../types";
import styles from "./StatCard.module.css";

const STATUS_COLORS: Record<Status, string> = {
  info: styles.info,
  warning: styles.warning,
  error: styles.error,
  success: styles.success,
  neutral: styles.neutral,
};

interface StatCardProps {
  label: string;
  value: number | string;
  status?: Status;
  percentage?: number;
  icon?: React.ReactNode;
  onClick?: () => void;
  ariaLabel?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = React.memo(
  ({ label, value, status = "neutral", percentage, icon, onClick, ariaLabel, className }) => {
    const Tag = onClick ? "button" : "div";

    return (
      <Tag
        className={cn(styles.card, STATUS_COLORS[status], onClick && styles.clickable, className)}
        onClick={onClick}
        type={onClick ? "button" : undefined}
        aria-label={ariaLabel ?? `${label}: ${value}`}
        tabIndex={onClick ? 0 : undefined}
      >
        <div className={styles.content}>
          <div className={styles.labelRow}>
            {icon && <span className={styles.icon}>{icon}</span>}
            <span className={styles.label}>{label}</span>
          </div>
          <span className={styles.value}>{value}</span>
        </div>
        {percentage !== undefined && (
          <div className={styles.barTrack}>
            <div
              className={cn(styles.barFill, STATUS_COLORS[status])}
              style={{ width: `${percentage}%` }}
              role="progressbar"
              aria-valuenow={percentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${label} ${percentage}%`}
            />
          </div>
        )}
      </Tag>
    );
  },
);

StatCard.displayName = "StatCard";
