import React from 'react';
import { Workspace } from '../../../components/layout';
import { NotesWidget } from '../../../components/workflow';
import type { CaseNoteData } from '../../../mocks/case-workspace';

interface InternalNotesTabProps {
  notes: CaseNoteData[];
  onAddNote: (content: string) => void;
}

export const InternalNotesTab: React.FC<InternalNotesTabProps> = React.memo(({ notes, onAddNote }) => (
  <Workspace>
    <NotesWidget
      notes={notes}
      onAddNote={onAddNote}
    />
  </Workspace>
));

InternalNotesTab.displayName = 'InternalNotesTab';
