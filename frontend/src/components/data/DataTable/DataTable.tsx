import React, { useCallback } from 'react';
import { cn } from '../../../utils';
import { Skeleton } from '../../common/Skeleton';
import { EmptyState } from '../../common/EmptyState';
import styles from './DataTable.module.css';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'right' | 'center';
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  keyField: keyof T;
  emptyState?: string;
  isLoading?: boolean;
  onRowClick?: (item: T) => void;
  striped?: boolean;
  className?: string;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (selectedIds: Set<string>) => void;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyField,
  emptyState = 'Keine Einträge gefunden',
  isLoading = false,
  onRowClick,
  striped = true,
  className,
  selectable = false,
  selectedIds,
  onSelectionChange,
}: DataTableProps<T>) {
  const allSelected = selectable && selectedIds && data.length > 0 && data.every((item) => selectedIds.has(String(item[keyField])));
  const someSelected = selectable && selectedIds && data.some((item) => selectedIds.has(String(item[keyField])));

  const handleSelectAll = useCallback(() => {
    if (!onSelectionChange || !selectedIds) return;
    if (allSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(data.map((item) => String(item[keyField]))));
    }
  }, [allSelected, data, keyField, onSelectionChange, selectedIds]);

  const handleSelectRow = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (!onSelectionChange || !selectedIds) return;
      const next = new Set(selectedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      onSelectionChange(next);
    },
    [onSelectionChange, selectedIds],
  );

  if (isLoading) {
    return (
      <div className={cn(styles.container, className)}>
        <table className={styles.table} role="table">
          <thead>
            <tr>
              {selectable && <th className={styles.checkCell}><span className={styles.checkbox} /></th>}
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width, textAlign: col.align ?? 'left' }}
                  className={col.className}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
        </table>
        <div className={styles.loadingRows}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="table-row" />
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={cn(styles.container, className)}>
        <EmptyState title={emptyState} />
      </div>
    );
  }

  return (
    <div className={cn(styles.container, className)}>
      <table className={styles.table} role="table">
        <thead>
          <tr>
            {selectable && (
              <th className={styles.checkCell}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={allSelected ?? false}
                  ref={(el) => { if (el) el.indeterminate = (someSelected ?? false) && !(allSelected ?? false); }}
                  onChange={handleSelectAll}
                  aria-label="Alle auswählen"
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width, textAlign: col.align ?? 'left' }}
                className={cn(col.sortable && styles.sortable, col.className)}
                scope="col"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => {
            const key = String(item[keyField]);
            const isSelected = selectedIds?.has(key) ?? false;
            return (
              <tr
                key={key}
                className={cn(
                  striped && idx % 2 === 1 && styles.striped,
                  onRowClick && styles.clickableRow,
                  isSelected && styles.selectedRow,
                )}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={
                  onRowClick
                    ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRowClick(item); } }
                    : undefined
                }
                role={onRowClick ? 'button' : undefined}
                aria-label={onRowClick ? `Zeile ${key} öffnen` : undefined}
              >
                {selectable && (
                  <td className={styles.checkCell}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={isSelected}
                      onChange={() => {}}
                      onClick={(e) => handleSelectRow(e, key)}
                      aria-label={`${key} auswählen`}
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{ textAlign: col.align ?? 'left' }}
                    className={col.className}
                  >
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

DataTable.displayName = 'DataTable';
