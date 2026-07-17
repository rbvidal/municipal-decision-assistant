import React from "react";
import { AppShell } from "../AppShell";

interface AdminLayoutProps {
  children: React.ReactNode;
  topNavigation?: React.ReactNode;
  subNavigation?: React.ReactNode;
  breadcrumb?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = React.memo(
  ({ children, topNavigation, subNavigation, breadcrumb }) => (
    <AppShell topNavigation={topNavigation} subNavigation={subNavigation} breadcrumb={breadcrumb}>
      {children}
    </AppShell>
  ),
);

AdminLayout.displayName = "AdminLayout";
