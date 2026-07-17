import React, { useState, useCallback } from "react";
import { Panel } from "../../common/Panel";
import { Icon } from "../../common/Icon";
import styles from "./NotesWidget.module.css";

interface NoteItem {
  id: string;
  author: string;
  time: string;
  content: string;
}

interface NotesWidgetProps {
  title?: string;
  notes: NoteItem[];
  onAddNote: (content: string) => void;
  className?: string;
}

export const NotesWidget: React.FC<NotesWidgetProps> = React.memo(
  ({ title = "Interne Notizen", notes, onAddNote, className }) => {
    const [noteContent, setNoteContent] = useState("");

    const handleSubmit = useCallback(() => {
      if (noteContent.trim()) {
        onAddNote(noteContent.trim());
        setNoteContent("");
      }
    }, [noteContent, onAddNote]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          handleSubmit();
        }
      },
      [handleSubmit],
    );

    return (
      <Panel title={title} icon={<Icon name="sticky-note" size={16} />} className={className}>
        <div className={styles.list} role="list" aria-label={title}>
          {notes.map((note) => (
            <article key={note.id} className={styles.note} role="listitem">
              <header className={styles.noteHeader}>
                <span className={styles.author}>{note.author}</span>
                <span className={styles.time}>{note.time}</span>
              </header>
              <p className={styles.content}>{note.content}</p>
            </article>
          ))}
        </div>

        <div className={styles.addForm}>
          <input
            type="text"
            className={styles.input}
            placeholder="Interne Notiz hinzufügen..."
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Neue Notiz"
          />
          <button
            type="button"
            className={styles.submitBtn}
            onClick={handleSubmit}
            aria-label="Notiz senden"
            disabled={!noteContent.trim()}
          >
            <Icon name="send" size={16} />
          </button>
        </div>
      </Panel>
    );
  },
);

NotesWidget.displayName = "NotesWidget";
