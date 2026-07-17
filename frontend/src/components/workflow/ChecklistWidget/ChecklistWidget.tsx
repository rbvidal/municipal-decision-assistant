import React, { useState, useCallback } from "react";
import { Panel } from "../../common/Panel";
import { Button } from "../../common/Button";
import { Icon } from "../../common/Icon";
import { ChecklistItem } from "../ChecklistItem";
import styles from "./ChecklistWidget.module.css";

interface ChecklistWidgetItem {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  statusLabel?: string;
}

interface ChecklistWidgetProps {
  title?: string;
  items: ChecklistWidgetItem[];
  onToggleItem: (id: string) => void;
  onAddItem: (title: string, description?: string) => void;
  className?: string;
}

export const ChecklistWidget: React.FC<ChecklistWidgetProps> = React.memo(
  ({ title = "Prüfschritte", items, onToggleItem, onAddItem, className }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newDesc, setNewDesc] = useState("");

    const handleAdd = useCallback(() => {
      if (newTitle.trim()) {
        onAddItem(newTitle.trim(), newDesc.trim() || undefined);
        setNewTitle("");
        setNewDesc("");
        setIsAdding(false);
      }
    }, [newTitle, newDesc, onAddItem]);

    const handleCancel = useCallback(() => {
      setIsAdding(false);
      setNewTitle("");
      setNewDesc("");
    }, []);

    const headerAction = (
      <button
        type="button"
        className={styles.addLink}
        onClick={isAdding ? handleCancel : () => setIsAdding(true)}
      >
        {isAdding ? "Abbrechen" : "+ Schritt hinzufügen"}
      </button>
    );

    return (
      <Panel
        title={title}
        icon={<Icon name="check-square" size={16} />}
        headerAction={headerAction}
        className={className}
      >
        {isAdding && (
          <div className={styles.addForm}>
            <input
              type="text"
              className={styles.input}
              placeholder="Titel des Prüfschritts..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              aria-label="Titel des neuen Prüfschritts"
            />
            <input
              type="text"
              className={styles.input}
              placeholder="Beschreibung (optional)..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              aria-label="Beschreibung des neuen Prüfschritts"
            />
            <Button variant="primary" size="sm" onClick={handleAdd}>
              Hinzufügen
            </Button>
          </div>
        )}

        <div className={styles.list} role="list" aria-label={title}>
          {items.map((item) => (
            <ChecklistItem
              key={item.id}
              id={item.id}
              title={item.title}
              description={item.description}
              checked={item.checked}
              statusLabel={item.statusLabel}
              onToggle={onToggleItem}
            />
          ))}
        </div>

        {items.length > 0 && (
          <div className={styles.progress}>
            <span className={styles.progressText}>
              {items.filter((i) => i.checked).length} / {items.length} erledigt
            </span>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{
                  width: `${(items.filter((i) => i.checked).length / items.length) * 100}%`,
                }}
                role="progressbar"
                aria-valuenow={items.filter((i) => i.checked).length}
                aria-valuemin={0}
                aria-valuemax={items.length}
              />
            </div>
          </div>
        )}
      </Panel>
    );
  },
);

ChecklistWidget.displayName = "ChecklistWidget";
