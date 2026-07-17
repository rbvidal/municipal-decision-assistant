import React from "react";
import styles from "./Footer.module.css";

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <span className={styles.copyright}>
        © 2024 Kommunale Entscheidungsplattform - Bundesrepublik Deutschland
      </span>
      <div className={styles.links}>
        <a href="#" className={styles.link}>
          Impressum
        </a>
        <a href="#" className={styles.link}>
          Datenschutz
        </a>
        <a href="#" className={styles.link}>
          Kontakt
        </a>
      </div>
    </footer>
  );
};
