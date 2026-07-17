import React from "react";
import {
  FileText,
  FolderOpen,
  Inbox,
  Send,
  Copy,
  FileCheck,
  Archive,
  CloudUpload,
  Star,
  RefreshCw,
} from "lucide-react";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeCategory,
  onCategoryChange,
}) => {
  const items = [
    { id: "meine_dokumente", label: "Meine Dokumente", icon: FileText, count: 12 },
    { id: "vorgangsdokumente", label: "Vorgangsdokumente", icon: FolderOpen, count: 45, fillIcon: true },
    { id: "eingehende_dokumente", label: "Eingehende Dokumente", icon: Inbox, count: 8 },
    { id: "ausgehende_dokumente", label: "Ausgehende Dokumente", icon: Send, count: 15 },
  ];

  const secondaryItems = [
    { id: "vorlagen", label: "Vorlagen", icon: Copy, count: 24 },
    { id: "formulare", label: "Formulare", icon: FileCheck, count: 10 },
    { id: "archiv", label: "Archiv", icon: Archive },
    { id: "uploads", label: "Uploads", icon: CloudUpload, count: 2, specialBadge: true },
    { id: "favoriten", label: "Favoriten", icon: Star },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.navGroup}>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`${styles.navButton} ${
                activeCategory === item.id ? styles.activeNavButton : ""
              }`}
              onClick={() => onCategoryChange(item.id)}
            >
              <div className={styles.labelWrapper}>
                <span className={styles.icon}>
                  <Icon size={20} />
                </span>
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && (
                <span className={styles.badge}>{item.count}</span>
              )}
            </button>
          );
        })}

        <hr className={styles.separator} />

        {secondaryItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`${styles.navButton} ${
                activeCategory === item.id ? styles.activeNavButton : ""
              }`}
              onClick={() => onCategoryChange(item.id)}
            >
              <div className={styles.labelWrapper}>
                <span className={styles.icon}>
                  <Icon size={20} className={item.specialBadge ? "text-secondary" : ""} />
                </span>
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && (
                <span
                  className={item.specialBadge ? styles.badgeSpecial : styles.badge}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className={styles.uploadCard}>
        <div className={styles.cardHeader}>
          <RefreshCw className={styles.syncIcon} />
          <span className={styles.cardTitle}>Aktiver Upload (85%)</span>
        </div>
        <div className={styles.progressBarContainer}>
          <div className={styles.progressBar} style={{ width: "85%" }}></div>
        </div>
        <div className={styles.cardDetails}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Virenscan:</span>
            <span className={styles.successVal}>Erfolgreich</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>OCR-Indexierung:</span>
            <span className={styles.warningVal}>Läuft...</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
