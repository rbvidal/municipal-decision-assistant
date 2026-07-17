import React from "react";
import { cn } from "../../../utils";
import styles from "./SplitPane.module.css";

interface SplitPaneProps {
  children: [React.ReactNode, React.ReactNode];
  leftWidth?: string;
  rightWidth?: string;
  className?: string;
}

export const SplitPane: React.FC<SplitPaneProps> = React.memo(
  ({ children, leftWidth = "1fr", rightWidth = "1fr", className }) => (
    <div
      className={cn(styles.pane, className)}
      style={{ gridTemplateColumns: `${leftWidth} ${rightWidth}` }}
    >
      <div className={styles.left}>{children[0]}</div>
      <div className={styles.right}>{children[1]}</div>
    </div>
  ),
);

SplitPane.displayName = "SplitPane";
