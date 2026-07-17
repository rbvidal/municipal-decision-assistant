import React from "react";
import { cn } from "../../../utils";
import { Icon } from "../../common/Icon";
import styles from "./DocumentVersionHistory.module.css";

interface VersionItem {
  version: string;
  date: string;
  author: string;
  isCurrent: boolean;
}

interface DocumentVersionHistoryProps {
  versions: VersionItem[];
  className?: string;
}

export const DocumentVersionHistory: React.FC<DocumentVersionHistoryProps> = React.memo(
  ({ versions, className }) => {
    if (versions.length === 0) {
      return (
        <div className={cn(styles.container, className)}>
          <p className={styles.empty}>Keine Vorgängerversionen</p>
        </div>
      );
    }

    return (
      <div className={cn(styles.container, className)}>
        {versions.map((ver) => (
          <div
            key={ver.version}
            className={cn(styles.versionItem, ver.isCurrent && styles.current)}
          >
            <div className={styles.icon}>
              <Icon
                name={ver.isCurrent ? "check-circle" : "file-text"}
                size={16}
                className={ver.isCurrent ? styles.currentIcon : styles.normalIcon}
              />
            </div>
            <div className={styles.info}>
              <span className={styles.label}>
                {ver.version}
                {ver.isCurrent && <span className={styles.currentLabel}> (Aktuell)</span>}
              </span>
              <span className={styles.meta}>
                {ver.date} · {ver.author}
              </span>
            </div>
            {!ver.isCurrent && (
              <button type="button" className={styles.diffBtn}>
                Diff
              </button>
            )}
          </div>
        ))}
      </div>
    );
  },
);

DocumentVersionHistory.displayName = "DocumentVersionHistory";
