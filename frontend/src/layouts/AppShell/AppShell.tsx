import React from "react";
import { AppProviders } from "../../providers";
import styles from "./AppShell.module.css";

interface AppShellProps {
  children: React.ReactNode;
  topNavigation?: React.ReactNode;
  subNavigation?: React.ReactNode;
  breadcrumb?: React.ReactNode;
  sidebar?: React.ReactNode;
  sidebarCollapsed?: boolean;
  sidebarWidth?: number;
}

export const AppShell: React.FC<AppShellProps> = React.memo(
  ({
    children,
    topNavigation,
    subNavigation,
    breadcrumb,
    sidebar,
    sidebarCollapsed = false,
    sidebarWidth = 280,
  }) => (
    <AppProviders>
      <div className={styles.shell}>
        {topNavigation && <header className={styles.topBar}>{topNavigation}</header>}
        {subNavigation && <nav className={styles.subNav}>{subNavigation}</nav>}
        {breadcrumb && <div className={styles.breadcrumb}>{breadcrumb}</div>}
        <div className={styles.contentArea}>
          <main className={styles.mainContent}>{children}</main>
          {sidebar && (
            <aside
              className={`${styles.sidebar} ${sidebarCollapsed ? styles.sidebarCollapsed : ""}`}
              style={{ width: sidebarCollapsed ? 0 : sidebarWidth }}
            >
              {sidebar}
            </aside>
          )}
        </div>
      </div>
    </AppProviders>
  ),
);

AppShell.displayName = "AppShell";
