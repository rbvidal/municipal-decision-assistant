import React from "react";
import { AppShell } from "../AppShell";
import styles from "./CaseWorkspaceLayout.module.css";

interface CaseWorkspaceLayoutProps {
  children: React.ReactNode;
  topNavigation?: React.ReactNode;
  breadcrumb?: React.ReactNode;
  caseHeader?: React.ReactNode;
  tabBar?: React.ReactNode;
  sidebar?: React.ReactNode;
  sidebarCollapsed?: boolean;
}

export const CaseWorkspaceLayout: React.FC<CaseWorkspaceLayoutProps> = React.memo(
  ({
    children,
    topNavigation,
    breadcrumb,
    caseHeader,
    tabBar,
    sidebar,
    sidebarCollapsed = false,
  }) => (
    <AppShell
      topNavigation={topNavigation}
      breadcrumb={breadcrumb}
      sidebar={sidebar}
      sidebarCollapsed={sidebarCollapsed}
      sidebarWidth={320}
    >
      <div className={styles.workspace}>
        {caseHeader && <div className={styles.caseHeader}>{caseHeader}</div>}
        {tabBar && <nav className={styles.tabBar}>{tabBar}</nav>}
        <div className={styles.content}>{children}</div>
      </div>
    </AppShell>
  ),
);

CaseWorkspaceLayout.displayName = "CaseWorkspaceLayout";
