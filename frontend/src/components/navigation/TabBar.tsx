import React from 'react';
import { cn } from '../../utils';
import { Badge } from '../common/Badge';
import styles from './TabBar.module.css';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface TabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const TabBar: React.FC<TabBarProps> = React.memo(({ tabs, activeTab, onTabChange, className }) => (
  <nav className={cn(styles.bar, className)} role="tablist" aria-label="Bereichsnavigation">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        type="button"
        role="tab"
        aria-selected={tab.id === activeTab}
        disabled={tab.disabled}
        className={cn(styles.tab, tab.id === activeTab && styles.active)}
        onClick={() => onTabChange(tab.id)}
      >
        {tab.icon}
        <span>{tab.label}</span>
        {tab.count !== undefined && (
          <Badge status={tab.count > 0 ? 'info' : 'neutral'} variant="pill">{tab.count}</Badge>
        )}
      </button>
    ))}
  </nav>
));

TabBar.displayName = 'TabBar';
