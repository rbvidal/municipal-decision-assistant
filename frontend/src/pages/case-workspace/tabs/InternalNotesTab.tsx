import React from "react";
import { Workspace } from "../../../components/layout";
import { NotesWidget } from "../../../components/workflow";
import type { CaseNoteData } from "../../../mocks/case-workspace";

interface InternalNotesTabProps {
  notes: CaseNoteData[];
  onAddNote: (content: string) => void;
}

/** Formats a timestamp string into a human-readable German date. */
function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export const InternalNotesTab: React.FC<InternalNotesTabProps> = React.memo(
  ({ notes, onAddNote }) => {
    const formattedNotes = notes.map((n) => ({
      ...n,
      time: n.time === "Jetzt" ? new Date().toLocaleString("de-DE") : formatTimestamp(n.time),
    }));

    return (
      <Workspace>
        <NotesWidget notes={formattedNotes} onAddNote={onAddNote} />
      </Workspace>
    );
  },
);

InternalNotesTab.displayName = "InternalNotesTab";
