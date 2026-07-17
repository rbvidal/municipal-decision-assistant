import React from 'react';
import { cn } from '../../../utils';
import { Icon, Badge } from '../../common';
import type { RiskRating } from '../../../mocks/supervisor';
import styles from './ApprovalRiskCard.module.css';

interface ApprovalRiskCardProps {
  riskRating: RiskRating;
  title: string;
  description: string;
  className?: string;
}

const config: Record<RiskRating, { label: string; className: string }> = {
  GERING: { label: 'GERING', className: styles.low },
  MITTEL: { label: 'MITTEL', className: styles.medium },
  HOCH: { label: 'HOCH', className: styles.high },
};

export const ApprovalRiskCard: React.FC<ApprovalRiskCardProps> = React.memo(({
  riskRating, title, description, className,
}) => {
  const cfg = config[riskRating];

  return (
    <div className={cn(styles.card, className)}>
      <div className={styles.header}>
        <span className={styles.label}>Risikobewertung</span>
        <Badge status={riskRating === 'GERING' ? 'success' : riskRating === 'MITTEL' ? 'warning' : 'error'}>
          {cfg.label}
        </Badge>
      </div>
      <div className={cn(styles.body, cfg.className)}>
        <Icon name="shield" size={16} className={styles.shieldIcon} />
        <span className={styles.riskTitle}>{title}</span>
        <p className={styles.riskDesc}>{description}</p>
      </div>
    </div>
  );
});

ApprovalRiskCard.displayName = 'ApprovalRiskCard';
