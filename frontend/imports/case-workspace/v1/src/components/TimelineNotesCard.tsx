import React, { useState } from 'react';
import { Edit2, Settings, MessageSquare, Send } from 'lucide-react';
import { TimelineEvent } from '../types';

interface TimelineNotesCardProps {
  events: TimelineEvent[];
  onAddNote?: (content: string) => void;
}

export const TimelineNotesCard: React.FC<TimelineNotesCardProps> = ({
  events,
  onAddNote,
}) => {
  const [noteContent, setNoteContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (noteContent.trim() && onAddNote) {
      onAddNote(noteContent.trim());
      setNoteContent('');
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'edit':
        return <Edit2 size={11} />;
      case 'system':
        return <Settings size={11} />;
      default:
        return <MessageSquare size={11} />;
    }
  };

  return (
    <div className="workspace-card timeline-card" id="timeline-workspace-card">
      <h3 className="card-title" style={{ marginBottom: '16px' }}>Aktivitätsverlauf & Notizen</h3>
      
      {/* Timeline List */}
      <div className="timeline-container" id="timeline-items-container">
        <div className="timeline-line"></div>
        
        {events.map((evt) => (
          <div key={evt.id} className="timeline-item" id={`timeline-item-${evt.id}`}>
            <div className={`timeline-node ${evt.type === 'edit' ? 'edit-type' : 'system-type'}`}>
              <span className="timeline-node-icon">
                {getEventIcon(evt.type)}
              </span>
            </div>
            
            <div className={`timeline-content-box ${evt.type === 'system' ? 'transparent' : ''}`}>
              <div className="timeline-meta">
                <span className="timeline-author">{evt.author}</span>
                <span className="timeline-time">{evt.time}</span>
              </div>
              <p className={evt.type === 'system' ? 'timeline-body-text text-on-surface-variant' : 'timeline-body-text'}>
                {evt.content}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Add note inline form */}
      {onAddNote && (
        <form 
          onSubmit={handleSubmit} 
          style={{ 
            marginTop: '20px', 
            borderTop: '1px solid var(--color-border-default)', 
            paddingTop: '16px' 
          }}
          id="timeline-note-addition-form"
        >
          <div className="question-input-wrapper">
            <input
              type="text"
              placeholder="Interne Notiz hinzufügen..."
              className="question-input"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              id="timeline-note-content-input"
            />
            <button type="submit" className="question-submit-btn" title="Notiz speichern" id="timeline-note-submit-btn">
              <Send size={16} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
