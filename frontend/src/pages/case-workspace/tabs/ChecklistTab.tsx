import React, { useMemo } from "react";
import { Workspace } from "../../../components/layout";
import { ChecklistWidget } from "../../../components/workflow";
import { Badge } from "../../../components/common";
import type { ChecklistItemData } from "../../../mocks/case-workspace";

interface ChecklistTabProps {
  items: ChecklistItemData[];
  onToggleItem: (id: string) => void;
  onAddItem: (title: string, description?: string) => void;
}

export const ChecklistTab: React.FC<ChecklistTabProps> = React.memo(
  ({ items, onToggleItem, onAddItem }) => {
    const completed = useMemo(() => items.filter((i) => i.checked).length, [items]);
    const openCount = items.length - completed;

    return (
      <Workspace>
        <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
          <Badge status="info">{items.length} Gesamt</Badge>
          <Badge status="success">{completed} Erledigt</Badge>
          {openCount > 0 && <Badge status="warning">{openCount} Offen</Badge>}
        </div>
        <ChecklistWidget items={items} onToggleItem={onToggleItem} onAddItem={onAddItem} />
      </Workspace>
    );
  },
);

ChecklistTab.displayName = "ChecklistTab";
