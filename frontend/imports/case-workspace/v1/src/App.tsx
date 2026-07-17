import { useState } from 'react';
import { Header } from './components/Header';
import { SubNav } from './components/SubNav';
import { MetadataSidebar } from './components/MetadataSidebar';
import { PhaseStepper } from './components/PhaseStepper';
import { WarningBanner } from './components/WarningBanner';
import { ChecklistCard } from './components/ChecklistCard';
import { DocumentsCard } from './components/DocumentsCard';
import { TimelineNotesCard } from './components/TimelineNotesCard';
import { DecisionSupport } from './components/DecisionSupport';
import { Footer } from './components/Footer';

import { 
  initialChecklist, 
  initialDocuments, 
  initialTimeline 
} from './mockData';
import { ChecklistItem, DocumentItem, TimelineEvent } from './types';

export default function App() {
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(initialChecklist);
  const [documentItems, setDocumentItems] = useState<DocumentItem[]>(initialDocuments);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(initialTimeline);
  const [nextActionCompleted, setNextActionCompleted] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Calculate dynamic progress percent for the checklist
  const totalChecklistCount = checklistItems.length;
  const completedChecklistCount = checklistItems.filter(item => item.checked).length;
  const checklistProgress = totalChecklistCount > 0 
    ? Math.round((completedChecklistCount / totalChecklistCount) * 100) 
    : 0;

  // Toggle a checklist item
  const handleToggleChecklist = (id: string) => {
    setChecklistItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  // Add custom checklist item
  const handleAddChecklistItem = (title: string, description?: string) => {
    const newItem: ChecklistItem = {
      id: `custom-step-${Date.now()}`,
      title,
      description: description || 'Manuell hinzugefügter Schritt',
      checked: false,
    };
    setChecklistItems(prev => [...prev, newItem]);
    showToast(`Schritt "${title}" zur Checkliste hinzugefügt.`);
  };

  // Add proposal from sidebar to main checklist
  const handleAddChecklistProposal = (text: string) => {
    // Check if it already exists
    if (checklistItems.some(item => item.title === text)) {
      showToast('Dieser Schritt ist bereits in der Checkliste enthalten.');
      return;
    }
    const newItem: ChecklistItem = {
      id: `proposal-step-${Date.now()}`,
      title: text,
      description: 'Vorgeschlagener Schritt aus den Regelungen',
      checked: false,
    };
    setChecklistItems(prev => [...prev, newItem]);
    showToast(`"${text}" zur Checkliste hinzugefügt.`);
  };

  // Add custom timeline note
  const handleAddTimelineNote = (content: string) => {
    const newEvent: TimelineEvent = {
      id: `custom-evt-${Date.now()}`,
      author: 'Sabine Müller',
      time: 'Heute, gerade eben',
      content,
      type: 'edit',
    };
    setTimelineEvents(prev => [newEvent, ...prev]);
    showToast('Notiz erfolgreich im Aktivitätsverlauf gespeichert.');
  };

  // Handle mock document upload
  const handleUploadDocument = (name: string, type: string) => {
    const newDoc: DocumentItem = {
      id: `custom-doc-${Date.now()}`,
      name,
      type,
      date: new Date().toLocaleDateString('de-DE'),
      status: 'Geprüft',
    };
    setDocumentItems(prev => [...prev, newDoc]);
    showToast(`Dokument "${name}" erfolgreich hochgeladen.`);
  };

  // Execute recommended next action
  const handleExecuteNextAction = () => {
    if (nextActionCompleted) return;

    setNextActionCompleted(true);
    
    // Add official communication log to the timeline
    const systemEvent: TimelineEvent = {
      id: `next-action-system-evt-${Date.now()}`,
      author: 'System',
      time: 'Heute, gerade eben',
      content: 'Offizielle Anforderung des Brandschutznachweises (§65 BauO NRW) an Thomas Becker übermittelt.',
      type: 'system',
    };
    
    setTimelineEvents(prev => [systemEvent, ...prev]);

    // Append requested draft document placeholder to the documents list
    const requestedDoc: DocumentItem = {
      id: `requested-doc-${Date.now()}`,
      name: 'Brandschutznachweis_Anforderung.pdf',
      type: 'Brandschutznachweis',
      date: new Date().toLocaleDateString('de-DE'),
      status: 'Offen',
    };
    setDocumentItems(prev => [...prev, requestedDoc]);

    showToast('Aktion ausgeführt: Anforderung Brandschutznachweis versendet.');
  };

  // Save changes action
  const handleSaveAll = () => {
    showToast('Sämtliche Änderungen wurden erfolgreich in der Datenbank gespeichert.');
  };

  // Share action
  const handleShareAll = () => {
    showToast('Vorgangs-Link in die Zwischenablage kopiert.');
  };

  // Helper to show temporary toasts
  const showToast = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  return (
    <div className="app-layout" id="main-app-layout">
      {/* Toast Notification */}
      {notification && (
        <div 
          style={{
            position: 'fixed',
            bottom: '50px',
            right: '24px',
            backgroundColor: 'var(--color-on-primary-container)',
            color: 'var(--color-primary-container)',
            padding: '10px 16px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid var(--color-primary)'
          }}
          id="global-status-toast"
        >
          <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--color-status-dot-green)', borderRadius: '50%' }}></span>
          {notification}
        </div>
      )}

      {/* Header Bar */}
      <Header />

      {/* Subnav & Tabs */}
      <SubNav onSave={handleSaveAll} onShare={handleShareAll} />

      {/* Main Grid Split */}
      <div className="main-content-area" id="main-content-area">
        
        {/* Left Sidebar (20%) */}
        <MetadataSidebar 
          documentCount={documentItems.length}
          noteCount={timelineEvents.filter(e => e.type === 'edit').length}
          checklistProgress={checklistProgress}
        />

        {/* Center Workspace (55%) */}
        <section className="center-workspace" id="case-center-workspace">
          {/* Stepper tracker */}
          <PhaseStepper />

          {/* Scrolling card content */}
          <div className="workspace-content" id="workspace-scrolling-content">
            {/* Warning missing information */}
            {!nextActionCompleted && (
              <WarningBanner onRequest={handleExecuteNextAction} />
            )}

            {/* Main Checklist Card */}
            <ChecklistCard 
              items={checklistItems}
              onToggleItem={handleToggleChecklist}
              onAddItem={handleAddChecklistItem}
            />

            {/* Documents Table Card */}
            <DocumentsCard 
              documents={documentItems}
              onUploadDocument={handleUploadDocument}
            />

            {/* Timeline Notes Card */}
            <TimelineNotesCard 
              events={timelineEvents}
              onAddNote={handleAddTimelineNote}
            />
          </div>
        </section>

        {/* Right Sidebar (25%) */}
        <DecisionSupport 
          onAddChecklistProposal={handleAddChecklistProposal}
          onExecuteNextAction={handleExecuteNextAction}
          nextActionCompleted={nextActionCompleted}
        />

      </div>

      {/* Footer Bar */}
      <Footer />
    </div>
  );
}
