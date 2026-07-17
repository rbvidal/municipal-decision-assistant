import React from "react";
import { cn } from "../../../utils";
import { Button } from "../Button";
import type { Variant } from "../../../types";
import styles from "./ActionToolbar.module.css";

interface ActionToolbarAction {
  id: string;
  label: string;
  onClick: () => void;
  variant?: Variant;
  icon?: React.ReactNode;
}

interface ActionToolbarProps {
  actions: ActionToolbarAction[];
  className?: string;
}

export const ActionToolbar: React.FC<ActionToolbarProps> = React.memo(({ actions, className }) => (
  <div className={cn(styles.toolbar, className)} role="toolbar" aria-label="Aktionen">
    {actions.map((action) => (
      <Button
        key={action.id}
        variant={action.variant ?? "primary"}
        size="sm"
        onClick={action.onClick}
      >
        {action.icon}
        {action.label}
      </Button>
    ))}
  </div>
));

ActionToolbar.displayName = "ActionToolbar";
