import React from "react";
import { cn } from "../../../utils";
import { Icon } from "../Icon";
import type { Priority, Risk } from "../../../types";
import styles from "./CaseHeader.module.css";

interface CaseHeaderProps {
  caseId: string;
  title: string;
  applicant: string;
  department: string;
  assignee: string;
  priority: Priority;
  risk: Risk;
  statusLabel: string;
  deadline: string;
  className?: string;
}

const priorityLabel: Record<Priority, string> = { high: "Hoch", medium: "Mittel", low: "Niedrig" };
const riskLabel: Record<Risk, string> = { gering: "Gering", mittel: "Mittel", hoch: "Hoch" };

export const CaseHeader: React.FC<CaseHeaderProps> = React.memo(
  ({
    caseId,
    title,
    applicant,
    department,
    assignee,
    priority,
    risk,
    statusLabel,
    deadline,
    className,
  }) => (
    <header className={cn(styles.header, className)} aria-label={`Vorgang ${caseId}`}>
      <div className={styles.identity}>
        <span className={styles.caseId}>{caseId}</span>
        <h1 className={styles.title}>{title}</h1>
      </div>

      <div className={styles.meta}>
        <div className={styles.metaRow}>
          <span className={styles.metaLabel}>Antragsteller:</span>
          <span className={styles.metaValue}>{applicant}</span>
        </div>
        <div className={styles.metaRow}>
          <span className={styles.metaLabel}>Abteilung:</span>
          <span className={styles.metaValue}>{department}</span>
        </div>
        <div className={styles.metaRow}>
          <span className={styles.metaLabel}>Bearbeiter:</span>
          <span className={styles.metaValueAssignee}>{assignee}</span>
        </div>
      </div>

      <div className={styles.pills}>
        <span className={cn(styles.pill, styles.pillDanger)}>
          <Icon name="alert-circle" size={14} />
          <span>Priorität: {priorityLabel[priority]}</span>
        </span>
        <span className={cn(styles.pill, styles.pillSuccess)}>
          <Icon name="shield" size={14} />
          <span>Risiko: {riskLabel[risk]}</span>
        </span>
        <span className={cn(styles.pill, styles.pillInfo)}>
          <Icon name="clock" size={14} />
          <span>Status: {statusLabel}</span>
        </span>
        <span className={cn(styles.pill, styles.pillDanger)}>
          <Icon name="calendar" size={14} />
          <span>Fällig: {deadline}</span>
        </span>
      </div>
    </header>
  ),
);

CaseHeader.displayName = "CaseHeader";
