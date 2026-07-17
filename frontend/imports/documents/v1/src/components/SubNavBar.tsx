import React from "react";
import styles from "./SubNavBar.module.css";

interface SubNavBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const SubNavBar: React.FC<SubNavBarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs = [
    { id: "all", label: "Alle Dokumente" },
    { id: "upload", label: "Hochladen" },
    { id: "index_status", label: "Index-Status" },
  ];

  return (
    <div className={styles.subNavBar}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`${styles.tabButton} ${
            activeTab === tab.id ? styles.activeTabButton : ""
          }`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
