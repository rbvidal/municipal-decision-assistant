import React from 'react';
import { cn } from '../../../utils';
import styles from './SearchSummary.module.css';

interface SearchSummaryProps {
  total: number;
  filtered: number;
  query?: string;
  className?: string;
}

export const SearchSummary: React.FC<SearchSummaryProps> = React.memo(({
  total, filtered, query, className,
}) => (
  <p className={cn(styles.summary, className)}>
    {query ? (
      <>
        <span className={styles.count}>{filtered}</span> von{' '}
        <span className={styles.count}>{total}</span> Ergebnissen
        {' '}für &bdquo;<span className={styles.query}>{query}</span>&rdquo;
      </>
    ) : (
      <>
        <span className={styles.count}>{filtered}</span> von{' '}
        <span className={styles.count}>{total}</span> Ergebnissen
      </>
    )}
  </p>
));

SearchSummary.displayName = 'SearchSummary';
