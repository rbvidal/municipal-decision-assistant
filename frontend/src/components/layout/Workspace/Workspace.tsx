import React from "react";
import { cn } from "../../../utils";
import styles from "./Workspace.module.css";

interface WorkspaceProps {
  children: React.ReactNode;
  className?: string;
}

export const Workspace: React.FC<WorkspaceProps> = React.memo(({ children, className }) => (
  <div className={cn(styles.workspace, className)}>{children}</div>
));

Workspace.displayName = "Workspace";
