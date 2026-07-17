import React from 'react';
import { cn } from '../../../utils';
import { Badge } from '../Badge';
import { Button } from '../Button';
import styles from './SuggestionCard.module.css';

interface SuggestionCardProps {
  caseId: string;
  type: 'Vorschlag' | 'Zusammenfassung';
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const SuggestionCard: React.FC<SuggestionCardProps> = React.memo(({
  caseId,
  type,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => (
  <article className={cn(styles.card, className)}>
    <header className={styles.header}>
      <span className={styles.caseId}>{caseId}</span>
      <Badge
        status={type === 'Vorschlag' ? 'info' : 'neutral'}
        className={type === 'Zusammenfassung' ? styles.summaryBadge : undefined}
      >
        {type === 'Vorschlag' ? 'VORSCHLAG' : 'ZUSAMMENFASSUNG'}
      </Badge>
    </header>
    <h3 className={styles.title}>{title}</h3>
    <p className={styles.description}>{description}</p>
    {actionLabel && onAction && (
      <Button
        variant="secondary"
        size="sm"
        onClick={onAction}
        className={styles.action}
      >
        {actionLabel}
      </Button>
    )}
  </article>
));

SuggestionCard.displayName = 'SuggestionCard';
