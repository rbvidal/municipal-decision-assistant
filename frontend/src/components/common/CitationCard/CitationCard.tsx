import React from 'react';
import { cn } from '../../../utils';
import styles from './CitationCard.module.css';

interface CitationCardProps {
  code: string;
  title: string;
  onClick?: () => void;
  className?: string;
}

export const CitationCard: React.FC<CitationCardProps> = React.memo(({
  code, title, onClick, className,
}) => {
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      className={cn(styles.card, onClick && styles.clickable, className)}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <span className={styles.code}>{code}</span>
      <span className={styles.title}>{title}</span>
    </Tag>
  );
});

CitationCard.displayName = 'CitationCard';
