import React, { useState, useCallback } from "react";
import { cn } from "../../../utils";
import { Icon } from "../../common/Icon";
import styles from "./FilterPanel.module.css";

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterGroupDef {
  id: string;
  label: string;
  options: FilterOption[];
}

interface FilterPanelProps {
  groups: FilterGroupDef[];
  activeFilters: Record<string, string>;
  onFilterChange: (groupId: string, value: string) => void;
  className?: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = React.memo(
  ({ groups, activeFilters, onFilterChange, className }) => {
    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

    const toggleGroup = useCallback((groupId: string) => {
      setCollapsedGroups((prev) => {
        const next = new Set(prev);
        if (next.has(groupId)) next.delete(groupId);
        else next.add(groupId);
        return next;
      });
    }, []);

    return (
      <aside className={cn(styles.panel, className)} aria-label="Filter">
        <div className={styles.header}>
          <Icon name="sliders" size={16} />
          <h3 className={styles.heading}>Filter</h3>
        </div>

        {groups.map((group) => {
          const isCollapsed = collapsedGroups.has(group.id);
          const activeValue = activeFilters[group.id] ?? "Alle";

          return (
            <div key={group.id} className={styles.group}>
              <button
                type="button"
                className={styles.groupHeader}
                onClick={() => toggleGroup(group.id)}
                aria-expanded={!isCollapsed}
              >
                <span className={styles.groupLabel}>{group.label}</span>
                <Icon
                  name={isCollapsed ? "chevron-right" : "chevron-down"}
                  size={14}
                  className={styles.chevron}
                />
              </button>

              {!isCollapsed && (
                <div className={styles.options} role="radiogroup" aria-label={group.label}>
                  {group.options.map((opt) => (
                    <label
                      key={opt.value}
                      className={cn(
                        styles.option,
                        activeValue === opt.value && styles.optionActive,
                      )}
                    >
                      <input
                        type="radio"
                        className={styles.radio}
                        name={group.id}
                        value={opt.value}
                        checked={activeValue === opt.value}
                        onChange={() => onFilterChange(group.id, opt.value)}
                      />
                      <span className={styles.optionLabel}>{opt.label}</span>
                      {opt.count !== undefined && (
                        <span className={styles.optionCount}>{opt.count}</span>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </aside>
    );
  },
);

FilterPanel.displayName = "FilterPanel";
