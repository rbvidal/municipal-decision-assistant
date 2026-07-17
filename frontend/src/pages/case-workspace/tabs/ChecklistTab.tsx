import React from 'react';
import { Workspace } from '../../../components/layout';
import { ChecklistWidget } from '../../../components/workflow';
import type { ChecklistItemData } from '../../../mocks/case-workspace';

interface ChecklistTabProps {
  items: ChecklistItemData[];
  onToggleItem: (id: string) => void;
  onAddItem: (title: string, description?: string) => void;
}

export const ChecklistTab: React.FC<ChecklistTabProps> = React.memo(({ items, onToggleItem, onAddItem }) => (
  <Workspace>
    <ChecklistWidget
      items={items}
      onToggleItem={onToggleItem}
      onAddItem={onAddItem}
    />
  </Workspace>
));

ChecklistTab.displayName = 'ChecklistTab';
