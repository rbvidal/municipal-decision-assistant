import React from "react";
import { cn } from "../../utils";
import { Logo } from "../common/Logo";
import { NotificationBell, type Notification } from "./NotificationBell";
import { UserMenu, type UserMenuAction } from "./UserMenu";
import styles from "./TopNavigation.module.css";

export interface NavModule {
  id: string;
  label: string;
  href: string;
  active?: boolean;
  visible?: boolean;
  icon?: React.ReactNode;
}

interface TopNavigationProps {
  modules: NavModule[];
  activeModule: string;
  onNavigate: (href: string) => void;
  userName: string;
  userEmail: string;
  userDepartment?: string;
  userInitials: string;
  userActions: UserMenuAction[];
  notifications: Notification[];
  onNotificationClick: (n: Notification) => void;
  onMarkAllNotificationsRead: () => void;
  onViewAllNotifications: () => void;
  className?: string;
}

export const TopNavigation: React.FC<TopNavigationProps> = React.memo(
  ({
    modules,
    activeModule,
    onNavigate,
    userName,
    userEmail,
    userDepartment,
    userInitials,
    userActions,
    notifications,
    onNotificationClick,
    onMarkAllNotificationsRead,
    onViewAllNotifications,
    className,
  }) => (
    <div className={cn(styles.bar, className)}>
      <div className={styles.left}>
        <button
          type="button"
          className={styles.logoBtn}
          onClick={() => onNavigate("/home")}
          aria-label="Zur Startseite"
        >
          <Logo size="sm" />
        </button>
        <nav className={styles.nav} aria-label="Hauptnavigation">
          {modules
            .filter((m) => m.visible !== false)
            .map((mod) => (
              <button
                key={mod.id}
                type="button"
                className={cn(styles.navItem, mod.id === activeModule && styles.active)}
                onClick={() => onNavigate(mod.href)}
                aria-current={mod.id === activeModule ? "page" : undefined}
              >
                {mod.icon}
                <span>{mod.label}</span>
              </button>
            ))}
        </nav>
      </div>
      <div className={styles.right}>
        <NotificationBell
          notifications={notifications}
          onNotificationClick={onNotificationClick}
          onMarkAllRead={onMarkAllNotificationsRead}
          onViewAll={onViewAllNotifications}
        />
        <UserMenu
          userName={userName}
          userEmail={userEmail}
          userDepartment={userDepartment}
          userInitials={userInitials}
          actions={userActions}
        />
      </div>
    </div>
  ),
);

TopNavigation.displayName = "TopNavigation";
