import React from 'react';
import { cn } from '../../../utils';
import { Panel, Badge, Icon } from '../../common';
import { TagList } from '../TagList';
import { ReferenceList } from '../ReferenceList';
import { HighlightedText } from '../HighlightedText';
import styles from './PreviewPane.module.css';
import type { TocItem, RelatedProcedure, DownloadItem } from '../../../mocks/knowledge';

interface PreviewPaneProps {
  title: string;
  type: string;
  authority: string;
  date: string;
  legalArea: string;
  fachbereich: string;
  bundesland: string;
  fullText: string;
  toc: TocItem[];
  relatedProcedures: RelatedProcedure[];
  downloads: DownloadItem[];
  referencedLaws: string[];
  isFavorite: boolean;
  searchQuery: string;
  onToggleFavorite: () => void;
  onClose: () => void;
  className?: string;
}

const filetypeIcon: Record<string, string> = {
  pdf: 'file-text',
  docx: 'file-text',
  xlsx: 'table',
  zip: 'archive',
};

export const PreviewPane: React.FC<PreviewPaneProps> = React.memo(({
  title, type, authority, date, legalArea, fachbereich, bundesland,
  fullText, toc, relatedProcedures, downloads, referencedLaws, isFavorite,
  searchQuery, onToggleFavorite, onClose, className,
}) => (
  <aside className={cn(styles.pane, className)} aria-label="Dokumentvorschau">
    <div className={styles.toolbar}>
      <button
        type="button"
        className={styles.toolbarBtn}
        onClick={onToggleFavorite}
        aria-label={isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
      >
        <Icon name="star" size={16} className={isFavorite ? styles.favoriteActive : undefined} />
      </button>
      <button
        type="button"
        className={styles.toolbarBtn}
        onClick={onClose}
        aria-label="Vorschau schließen"
      >
        <Icon name="x" size={16} />
      </button>
    </div>

    <div className={styles.content}>
      <div className={styles.metaHeader}>
        <Badge status="info" variant="pill">{type}</Badge>
        <span className={styles.metaText}>{authority} · {date}</span>
      </div>

      <h2 className={styles.title}>
        <HighlightedText text={title} query={searchQuery} />
      </h2>

      <div className={styles.metaGrid}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Rechtsgebiet</span>
          <span className={styles.metaValue}>{legalArea}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Fachbereich</span>
          <span className={styles.metaValue}>{fachbereich}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Bundesland</span>
          <span className={styles.metaValue}>{bundesland}</span>
        </div>
      </div>

      {toc.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Inhaltsverzeichnis</h3>
          <nav aria-label="Inhaltsverzeichnis">
            {toc.map((item) => (
              <div key={item.id} className={styles.tocItem}>
                <Icon name="chevron-right" size={12} className={styles.tocIcon} />
                <span>{item.label}</span>
              </div>
            ))}
          </nav>
        </div>
      )}

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Volltext</h3>
        <div className={styles.fullText}>
          <HighlightedText text={fullText} query={searchQuery} />
        </div>
      </div>

      {relatedProcedures.length > 0 && (
        <div className={styles.section}>
          <ReferenceList
            title="Verwandte Verfahren"
            items={relatedProcedures.map((rp) => ({
              id: rp.id,
              title: rp.name,
              description: rp.paragraph,
            }))}
          />
        </div>
      )}

      {referencedLaws.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Referenzierte Vorschriften</h3>
          <TagList tags={referencedLaws} />
        </div>
      )}

      {downloads.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Downloads</h3>
          <div className={styles.downloadList}>
            {downloads.map((dl) => (
              <div key={dl.id} className={styles.downloadItem}>
                <Icon name={filetypeIcon[dl.filetype] ?? 'file'} size={16} className={styles.downloadIcon} />
                <div className={styles.downloadInfo}>
                  <span className={styles.downloadName}>{dl.filename}</span>
                  <span className={styles.downloadSize}>{dl.filetype.toUpperCase()} · {dl.size}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </aside>
));

PreviewPane.displayName = 'PreviewPane';
