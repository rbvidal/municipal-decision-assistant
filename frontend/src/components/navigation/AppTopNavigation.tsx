import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth";
import { TopNavigation } from "./TopNavigation";
import type { NavModule } from "./TopNavigation";
import type { UserMenuAction } from "./UserMenu";

interface AppTopNavigationProps {
  modules: NavModule[];
  activeModule: string;
  onNavigate?: (href: string) => void;
}

/**
 * TopNavigation wired to auth state.
 * Handles user display, logout, and navigation via useAuth().
 */
export const AppTopNavigation: React.FC<AppTopNavigationProps> = React.memo(
  ({ modules, activeModule, onNavigate }) => {
    const { user, logout } = useAuth();
    const routerNavigate = useNavigate();

    const handleNavigate = onNavigate ?? ((href: string) => routerNavigate(href));
    const handleLogout = () => {
      logout();
      routerNavigate("/login", { replace: true });
    };

    if (!user) return null;

    const userActions: UserMenuAction[] = [
      { id: "profile", label: "Profil", onClick: () => routerNavigate("/profile") },
      { id: "logout", label: "Abmelden", onClick: handleLogout, variant: "danger" },
    ];

    return (
      <TopNavigation
        modules={modules}
        activeModule={activeModule}
        onNavigate={handleNavigate}
        userName={user.name}
        userEmail={user.email}
        userDepartment={user.department}
        userInitials={user.initials}
        userActions={userActions}
        notifications={[]}
        onNotificationClick={() => {}}
        onMarkAllNotificationsRead={() => {}}
        onViewAllNotifications={() => {}}
      />
    );
  },
);

AppTopNavigation.displayName = "AppTopNavigation";
