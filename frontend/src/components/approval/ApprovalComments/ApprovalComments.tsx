import React from "react";
import { cn } from "../../../utils";
import styles from "./ApprovalComments.module.css";

interface ApprovalCommentsProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export const ApprovalComments: React.FC<ApprovalCommentsProps> = React.memo(
  ({
    value,
    onChange,
    label = "Korrekturwünsche / Anmerkungen",
    placeholder = "Geben Sie hier Feedback ein, falls Sie den Vorgang zur Überarbeitung zurücksenden...",
    className,
  }) => (
    <div className={cn(styles.container, className)}>
      {label && <label className={styles.label}>{label}</label>}
      <textarea
        className={styles.textarea}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        aria-label={label}
      />
    </div>
  ),
);

ApprovalComments.displayName = "ApprovalComments";
