import React from "react";
import { cn } from "../../utils";
import { TabBar, type TabItem } from "./TabBar";
import styles from "./SubNavigation.module.css";

interface SubNavigationProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const SubNavigation: React.FC<SubNavigationProps> = React.memo(
  ({ tabs, activeTab, onTabChange, className }) => (
    <div className={cn(styles.subNav, className)}>
      <TabBar tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  ),
);

SubNavigation.displayName = "SubNavigation";
