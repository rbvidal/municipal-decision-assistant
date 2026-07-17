import React from "react";
import { Bell } from "lucide-react";
import styles from "./TopNavBar.module.css";

interface TopNavBarProps {
  userName?: string;
  userInitials?: string;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  userName = "S. Müller",
  userInitials = "SM",
}) => {
  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        <span className={styles.logo}>Kommunale Entscheidungsplattform</span>
        <nav className={styles.nav}>
          <a href="#" className={styles.navLink}>
            Startseite
          </a>
          <a href="#" className={styles.navLink}>
            Meine Arbeit
          </a>
          <a href="#" className={styles.navLink}>
            Wissen
          </a>
          <a href="#" className={`${styles.navLink} ${styles.activeNavLink}`}>
            Dokumente
          </a>
          <a href="#" className={styles.navLink}>
            Verhaltung
          </a>
        </nav>
      </div>
      <div className={styles.rightSection}>
        <div className={styles.notificationsContainer}>
          <Bell className={styles.bellIcon} />
          <span className={styles.notificationBadge}>3</span>
        </div>
        <div className={styles.userProfile}>
          <span className={styles.userName}>{userName}</span>
          <div className={styles.avatar}>{userInitials}</div>
        </div>
      </div>
    </header>
  );
};
