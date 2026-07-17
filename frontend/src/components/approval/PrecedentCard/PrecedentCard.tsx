import React from "react";
import { cn } from "../../../utils";
import { Badge } from "../../common";
import styles from "./PrecedentCard.module.css";

interface PrecedentCardProps {
  caseId: string;
  date: string;
  title: string;
  description: string;
  relevance: string;
  onClick?: (caseId: string) => void;
  className?: string;
}

export const PrecedentCard: React.FC<PrecedentCardProps> = React.memo(
  ({ caseId, date, title, description, relevance, onClick, className }) => {
    const handleClick = onClick ? () => onClick(caseId) : undefined;
    const Tag = onClick ? "button" : "div";

    return (
      <Tag
        className={cn(styles.card, onClick && styles.clickable, className)}
        onClick={handleClick}
        type={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
      >
        <div className={styles.header}>
          <span className={styles.caseId}>{caseId}</span>
          <span className={styles.date}>{date}</span>
        </div>
        <span className={styles.title}>{title}</span>
        <p className={styles.description}>{description}</p>
        <div className={styles.relevance}>
          <Badge status="info" variant="pill">
            {relevance}
          </Badge>
        </div>
      </Tag>
    );
  },
);

PrecedentCard.displayName = "PrecedentCard";
