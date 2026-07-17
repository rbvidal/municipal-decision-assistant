import React from 'react';
import { cn } from '../../../utils';
import { Icon } from '../../common/Icon';
import styles from './ApprovalTimeline.module.css';

interface ApprovalStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'pending' | 'failed';
}

interface ApprovalTimelineProps {
  steps: ApprovalStep[];
  title?: string;
  className?: string;
}

const stepConfig = {
  completed: { icon: 'check-circle', className: styles.completed },
  pending: { icon: 'clock', className: styles.pending },
  failed: { icon: 'alert-circle', className: styles.failed },
};

export const ApprovalTimeline: React.FC<ApprovalTimelineProps> = React.memo(({
  steps, title = 'Prüfprotokoll', className,
}) => (
  <div className={cn(styles.container, className)}>
    {title && <h3 className={styles.heading}>{title}</h3>}
    <div className={styles.list} role="list" aria-label={title}>
      {steps.map((step, idx) => {
        const cfg = stepConfig[step.status];
        return (
          <div key={step.id} className={styles.step} role="listitem">
            {idx > 0 && <div className={styles.connector} aria-hidden="true" />}
            <div className={cn(styles.icon, cfg.className)}>
              <Icon name={cfg.icon} size={14} />
            </div>
            <div className={styles.content}>
              <span className={cn(styles.stepTitle, cfg.className)}>{step.title}</span>
              <span className={styles.stepDesc}>{step.description}</span>
            </div>
          </div>
        );
      })}
    </div>
  </div>
));

ApprovalTimeline.displayName = 'ApprovalTimeline';
