import React from "react";
import { cn } from "../../../utils";
import styles from "./WorkspaceSection.module.css";

interface WorkspaceSectionProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export const WorkspaceSection: React.FC<WorkspaceSectionProps> = React.memo(
  ({ children, title, className }) => (
    <section className={cn(styles.section, className)}>
      {title && <h2 className={styles.title}>{title}</h2>}
      <div className={styles.content}>{children}</div>
    </section>
  ),
);

WorkspaceSection.displayName = "WorkspaceSection";
