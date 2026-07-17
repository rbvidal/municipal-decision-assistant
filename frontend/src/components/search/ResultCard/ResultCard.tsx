import React from 'react';
import { cn } from '../../../utils';
import { Badge } from '../../common/Badge';
import { Icon } from '../../common/Icon';
import { HighlightedText } from '../HighlightedText';
import styles from './ResultCard.module.css';

interface ResultCardProps {
  id: string;
  title: string;
  type: string;
  typeIcon?: string;
  relevance: number;
  isFavorite: boolean;
  authority: string;
  date: string;
  legalArea: string;
  snippet: string;
  searchQuery: string;
  isSelected: boolean;
  onClick: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const ResultCard: React.FC<ResultCardProps> = React.memo(({
  id, title, type, typeIcon, relevance, isFavorite, authority, date, legalArea, snippet,
  searchQuery, isSelected, onClick, onToggleFavorite,
}) => {
  const handleClick = () => onClick(id);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(id); }
  };
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(id);
  };

  return (
    <article
      className={cn(styles.card, isSelected && styles.selected)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${title} — ${type}`}
      aria-current={isSelected ? 'true' : undefined}
    >
      <div className={styles.header}>
        <div className={styles.titleRow}>
          {typeIcon && <Icon name={typeIcon} size={16} className={styles.typeIcon} />}
          <h3 className={styles.title}>
            <HighlightedText text={title} query={searchQuery} />
          </h3>
        </div>
        <button
          type="button"
          className={cn(styles.favoriteBtn, isFavorite && styles.favoriteActive)}
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
        >
          <Icon name={isFavorite ? 'star' : 'star'} size={14} />
        </button>
      </div>

      <div className={styles.meta}>
        <Badge status="info" variant="pill">{type}</Badge>
        <span className={styles.relevance}>{relevance} % Relevanz</span>
        <span className={styles.authority}>{authority}</span>
        <span className={styles.date}>{date}</span>
        <span className={styles.legalArea}>{legalArea}</span>
      </div>

      <p className={styles.snippet}>
        <HighlightedText text={snippet} query={searchQuery} />
      </p>
    </article>
  );
});

ResultCard.displayName = 'ResultCard';
