/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Header from './components/Header';
import Breadcrumb from './components/Breadcrumb';
import WizardStepper from './components/WizardStepper';
import DocumentForm from './components/DocumentForm';
import SidebarHelp from './components/SidebarHelp';
import Footer from './components/Footer';
import { FormState, StepId } from './types';
import { Check, Plus, ClipboardList, RefreshCw } from 'lucide-react';

export default function App() {
  const [currentStep, setCurrentStep] = useState<StepId>(1);
  const [completedSteps, setCompletedSteps] = useState<StepId[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [formState, setFormState] = useState<FormState>({
    aktenzeichen: 'BAU-2026-X942',
    fachbereich: '',
    vorgangsart: '',
    betreff: '',
    priority: 'medium',
    beschreibung: '',
    antragstellerName: 'J. Schmidt',
    antragstellerEmail: 'j.schmidt@stadt-essen.de',
    antragstellerAbteilung: 'Baurecht West',
    uploadedFiles: []
  });

  // Show temporary toast message
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleNextStep = () => {
    const nextStep = (currentStep + 1) as StepId;
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    setCurrentStep(nextStep);
    showToast(`Schritt ${currentStep} erfolgreich abgeschlossen.`);
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as StepId);
    }
  };

  const handleStepChange = (stepId: StepId) => {
    // Only allow navigating to steps that are already completed, or the next available step
    const maxAllowedStep = completedSteps.length + 1;
    if (stepId <= maxAllowedStep) {
      setCurrentStep(stepId);
    } else {
      showToast('Bitte füllen Sie zuerst die vorherigen Schritte aus.');
    }
  };

  const handleCancel = () => {
    if (window.confirm('Möchten Sie die Eingabe wirklich abbrechen? Alle ungespeicherten Daten gehen verloren.')) {
      resetForm();
      showToast('Vorgang zurückgesetzt.');
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    showToast('Vorgang erfolgreich übermittelt!');
  };

  const resetForm = () => {
    setCurrentStep(1);
    setCompletedSteps([]);
    setIsSubmitted(false);
    setFormState({
      aktenzeichen: 'BAU-2026-X942',
      fachbereich: '',
      vorgangsart: '',
      betreff: '',
      priority: 'medium',
      beschreibung: '',
      antragstellerName: 'J. Schmidt',
      antragstellerEmail: 'j.schmidt@stadt-essen.de',
      antragstellerAbteilung: 'Baurecht West',
      uploadedFiles: []
    });
  };

  const getStepLabel = (step: StepId) => {
    switch (step) {
      case 1: return 'Basisdaten';
      case 2: return 'Antragsteller';
      case 3: return 'Unterlagen';
      case 4: return 'Prüfung & Abschluss';
      default: return '';
    }
  };

  return (
    <div className="app-container" id="app-root-container">
      {/* Universal Top Header */}
      <Header onShowNotification={showToast} />

      {/* Subnav & Breadcrumb */}
      <Breadcrumb 
        currentStepLabel={isSubmitted ? 'Vorgang abgeschlossen' : getStepLabel(currentStep)} 
        onNavigateHome={resetForm}
      />

      {/* Main Content Layout */}
      <main className="main-workspace" id="main-workspace-frame">
        
        {/* Left/Center Workspace: Form / Success content */}
        <div className="center-content" id="form-workspace-content">
          {isSubmitted ? (
            /* Submission Success Screen */
            <div className="step-success-screen" id="success-screen">
              <div className="success-icon-wrap">
                <Check size={36} />
              </div>
              <h1 className="page-title">Vorgang erfolgreich angelegt!</h1>
              <p className="page-subtitle" style={{ marginBottom: '24px' }}>
                Der Vorgang wurde unter dem Aktenzeichen <strong style={{ fontFamily: 'var(--font-mono)' }}>{formState.aktenzeichen}</strong> registriert und zur weiteren Bearbeitung an das zuständige Team weitergeleitet.
              </p>

              <div className="review-grid" style={{ width: '100%', textAlign: 'left', marginBottom: '24px' }}>
                <div className="review-item">
                  <span className="review-label">Aktenzeichen:</span>
                  <span className="review-value" style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formState.aktenzeichen}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Betreff:</span>
                  <span className="review-value">{formState.betreff}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Priorität:</span>
                  <span className="review-value" style={{ textTransform: 'capitalize', fontWeight: 500 }}>
                    {formState.priority === 'high' ? '🚨 Hoch' : formState.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-primary" onClick={resetForm} id="btn-create-new">
                  <Plus size={16} />
                  Neuen Vorgang anlegen
                </button>
                <button className="btn btn-neutral" onClick={() => showToast('Entwurf gespeichert.')} id="btn-save-draft">
                  <ClipboardList size={16} />
                  Als Entwurf speichern
                </button>
              </div>
            </div>
          ) : (
            /* Normal Wizard Forms */
            <>
              {/* Page Title Header */}
              <div className="page-title-section" id="page-header-title">
                <h1 className="page-title">Neuanlage eines Vorgangs</h1>
                <p className="page-subtitle">Erfassen Sie die Basisdaten für den neuen Verwaltungsvorgang.</p>
              </div>

              {/* Multi-step Navigation Stepper */}
              <WizardStepper 
                currentStep={currentStep} 
                completedSteps={completedSteps} 
                onStepChange={handleStepChange} 
              />

              {/* Wizard Form */}
              <DocumentForm 
                currentStep={currentStep}
                formState={formState}
                setFormState={setFormState}
                onNextStep={handleNextStep}
                onPrevStep={handlePrevStep}
                onCancel={handleCancel}
                onSubmit={handleSubmit}
              />
            </>
          )}
        </div>

        {/* Right Sidebar: Dynamic Decision Support */}
        <SidebarHelp formState={formState} />

      </main>

      {/* Universal Footer */}
      <Footer />

      {/* Notification Toast Alert */}
      {toastMessage && (
        <div className="toast-alert" id="toast-notification-banner">
          <span style={{ display: 'inline-flex', padding: '4px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)' }}>
            <Check size={14} />
          </span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
