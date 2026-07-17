import React from "react";
import styles from "./Logo.module.css";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = { sm: 24, md: 36, lg: 64 };

export const Logo: React.FC<LogoProps> = React.memo(({ size = "md", className }) => (
  <div
    className={`${styles.logo} ${className ?? ""}`}
    style={{ height: sizes[size] }}
    role="img"
    aria-label="Kommunale Entscheidungsplattform"
  >
    <svg height="100%" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="40" rx="6" fill="var(--color-primary-700)" />
      <text x="12" y="27" fontFamily="var(--font-sans)" fontSize="18" fontWeight="700" fill="white">
        Entscheidung
      </text>
    </svg>
  </div>
));

Logo.displayName = "Logo";
