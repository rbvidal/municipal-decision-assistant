import React, { useState } from 'react';
import { ChecklistItem } from '../types';

interface ChecklistCardProps {
  items: ChecklistItem[];
  onToggleItem: (id: string) => void;
  onAddItem: (title: string, description?: string) => void;
}

export const ChecklistCard: React.FC<ChecklistCardProps> = ({
  items,
  onToggleItem,
  onAddItem,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      onAddItem(newTitle.trim(), newDesc.trim() || undefined);
      setNewTitle('');
      setNewDesc('');
      setIsAdding(false);
    }
  };

  return (
    <div className="workspace-card" id="checklist-workspace-card">
      <div className="card-header" id="checklist-card-header">
        <h3 className="card-title">Prüfschritte</h3>
        {!isAdding ? (
          <button
            className="card-action-link"
            onClick={() => setIsAdding(true)}
            id="checklist-add-step-btn"
          >
            + Schritt hinzufügen
          </button>
        ) : (
          <button
            className="card-action-link"
            style={{ color: 'var(--color-outline)' }}
            onClick={() => setIsAdding(false)}
            id="checklist-cancel-step-btn"
          >
            Abbrechen
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} style={{ padding: '16px', borderBottom: '1px solid var(--color-border-default)' }} id="add-step-form">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input
              type="text"
              placeholder="Titel des Prüfschritts..."
              className="question-input"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
              id="new-step-title-input"
            />
            <input
              type="text"
              placeholder="Beschreibung (optional)..."
              className="question-input"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              id="new-step-desc-input"
            />
            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '4px 12px' }} id="new-step-submit-btn">
              Hinzufügen
            </button>
          </div>
        </form>
      )}

      <div className="checklist-items-list" id="checklist-items-container">
        {items.map((item) => (
          <div
            key={item.id}
            className="checklist-item"
            onClick={() => onToggleItem(item.id)}
            id={`checklist-item-${item.id}`}
          >
            <input
              type="checkbox"
              className="checklist-checkbox"
              checked={item.checked}
              onChange={() => {}} // toggled on div click
              id={`checkbox-input-${item.id}`}
            />
            <div className="checklist-item-body">
              <p className={`checklist-item-title ${item.checked ? 'checked' : ''}`}>
                {item.title}
              </p>
              <p className="checklist-item-desc">{item.description}</p>
            </div>
            {item.statusLabel && (
              <span className={`checklist-item-badge ${item.statusColor || ''}`}>
                {item.statusLabel}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
