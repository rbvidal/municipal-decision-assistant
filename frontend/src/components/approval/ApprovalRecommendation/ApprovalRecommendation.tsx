import React from "react";
import { cn } from "../../../utils";
import { Icon } from "../../common/Icon";
import styles from "./ApprovalRecommendation.module.css";

interface ApprovalRecommendationProps {
  text: string;
  className?: string;
}

export const ApprovalRecommendation: React.FC<ApprovalRecommendationProps> = React.memo(
  ({ text, className }) => (
    <div className={cn(styles.card, className)}>
      <div className={styles.header}>
        <Icon name="check-circle" size={14} className={styles.icon} />
        <span className={styles.label}>Empfehlung</span>
      </div>
      <p className={styles.text}>{text}</p>
    </div>
  ),
);

ApprovalRecommendation.displayName = "ApprovalRecommendation";
