/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lock, ArrowRight, ArrowLeft, Upload, Trash2, CheckCircle } from 'lucide-react';
import { FormState, StepId } from '../types';

interface DocumentFormProps {
  currentStep: StepId;
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  onNextStep: () => void;
  onPrevStep: () => void;
  onCancel: () => void;
  onSubmit: () => void;
}

export default function DocumentForm({
  currentStep,
  formState,
  setFormState,
  onNextStep,
  onPrevStep,
  onCancel,
  onSubmit,
}: DocumentFormProps) {
  // Field validation states for Step 1 and 2
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [dragOver, setDragOver] = useState(false);

  // Validation function
  const validateStep = (step: StepId): boolean => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};

    if (step === 1) {
      if (!formState.fachbereich) {
        newErrors.fachbereich = 'Bitte wählen Sie einen Fachbereich aus.';
      }
      if (!formState.vorgangsart) {
        newErrors.vorgangsart = 'Bitte wählen Sie eine Vorgangsart aus.';
      }
      if (!formState.betreff.trim()) {
        newErrors.betreff = 'Betreff ist ein Pflichtfeld.';
      }
    } else if (step === 2) {
      if (!formState.antragstellerName.trim()) {
        newErrors.antragstellerName = 'Name des Antragstellers ist erforderlich.';
      }
      if (!formState.antragstellerEmail.trim()) {
        newErrors.antragstellerEmail = 'E-Mail-Adresse ist erforderlich.';
      } else if (!/\S+@\S+\.\S+/.test(formState.antragstellerEmail)) {
        newErrors.antragstellerEmail = 'Geben Sie eine gültige E-Mail-Adresse ein.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      onNextStep();
    }
  };

  const handleInputChange = (key: keyof FormState, value: any) => {
    setFormState((prev) => ({
      ...prev,
      [key]: value,
    }));
    // Clear error for this key
    if (errors[key]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  // Drag and Drop files simulation
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files).map((f: File) => ({
        name: f.name,
        size: (f.size / 1024).toFixed(1) + ' KB',
      }));
      setFormState((prev) => ({
        ...prev,
        uploadedFiles: [...prev.uploadedFiles, ...filesArray],
      }));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files).map((f: File) => ({
        name: f.name,
        size: (f.size / 1024).toFixed(1) + ' KB',
      }));
      setFormState((prev) => ({
        ...prev,
        uploadedFiles: [...prev.uploadedFiles, ...filesArray],
      }));
    }
  };

  const removeFile = (index: number) => {
    setFormState((prev) => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter((_, i) => i !== index),
    }));
  };

  // Render Step 1 Form
  if (currentStep === 1) {
    return (
      <form onSubmit={handleNext} className="wizard-form" id="wizard-form-step-1">
        <div className="form-grid">
          {/* Aktenzeichen */}
          <div className="form-group">
            <label className="form-label">
              Aktenzeichen <span className="required-asterisk">*</span>
            </label>
            <div className="input-container">
              <input
                type="text"
                className="input-field input-field-disabled"
                disabled
                value={formState.aktenzeichen}
                id="input-aktenzeichen"
              />
              <span className="input-lock-icon">
                <Lock size={16} />
              </span>
            </div>
            <p className="form-subtext">Automatisch generiertes System-Aktenzeichen.</p>
          </div>

          {/* Fachbereich */}
          <div className="form-group">
            <label className="form-label" htmlFor="fachbereich-select">
              Fachbereich <span className="required-asterisk">*</span>
            </label>
            <select
              id="fachbereich-select"
              className={`select-field ${errors.fachbereich ? 'input-error' : ''}`}
              value={formState.fachbereich}
              onChange={(e) => handleInputChange('fachbereich', e.target.value)}
            >
              <option value="">Bitte wählen...</option>
              <option value="bauamt">Bauamt</option>
              <option value="vergabestelle">Vergabestelle</option>
              <option value="personal">Personal</option>
              <option value="buergeramt">Bürgeramt</option>
            </select>
            {errors.fachbereich && <p className="form-error-msg">{errors.fachbereich}</p>}
          </div>
        </div>

        {/* Vorgangsart */}
        <div className="form-group">
          <label className="form-label" htmlFor="vorgangsart-select">
            Vorgangsart <span className="required-asterisk">*</span>
          </label>
          <select
            id="vorgangsart-select"
            className={`select-field ${errors.vorgangsart ? 'input-error' : ''}`}
            value={formState.vorgangsart}
            onChange={(e) => handleInputChange('vorgangsart', e.target.value)}
          >
            <option value="">Wählen Sie eine Kategorie...</option>
            <option value="carport">Bauantrag Carport</option>
            <option value="garage">Bauantrag Garage</option>
            <option value="it">IT-Hardware</option>
            <option value="reise">Reisekosten</option>
          </select>
          {errors.vorgangsart && <p className="form-error-msg">{errors.vorgangsart}</p>}
        </div>

        {/* Betreff */}
        <div className="form-group">
          <label className="form-label" htmlFor="betreff-input">
            Betreff <span className="required-asterisk">*</span>
          </label>
          <input
            type="text"
            id="betreff-input"
            className={`input-field ${errors.betreff ? 'input-error' : ''}`}
            placeholder="Kurze Zusammenfassung des Vorgangs"
            value={formState.betreff}
            onChange={(e) => handleInputChange('betreff', e.target.value)}
          />
          {errors.betreff && <p className="form-error-msg">{errors.betreff}</p>}
        </div>

        {/* Priorität */}
        <div className="form-group">
          <label className="form-label">
            Priorität <span className="required-asterisk">*</span>
          </label>
          <div className="priority-options-container" id="priority-container">
            <label className="radio-option-label" id="prio-low-label">
              <input
                type="radio"
                name="priority"
                className="radio-input"
                value="low"
                checked={formState.priority === 'low'}
                onChange={() => handleInputChange('priority', 'low')}
              />
              <span>Niedrig</span>
            </label>

            <label className="radio-option-label" id="prio-medium-label">
              <input
                type="radio"
                name="priority"
                className="radio-input"
                value="medium"
                checked={formState.priority === 'medium'}
                onChange={() => handleInputChange('priority', 'medium')}
              />
              <span>Mittel</span>
            </label>

            <label className="radio-option-label" id="prio-high-label">
              <input
                type="radio"
                name="priority"
                className="radio-input"
                value="high"
                checked={formState.priority === 'high'}
                onChange={() => handleInputChange('priority', 'high')}
              />
              <span className="priority-high-text">Hoch</span>
            </label>
          </div>
        </div>

        {/* Beschreibung / Notizen */}
        <div className="form-group">
          <label className="form-label" htmlFor="beschreibung-textarea">
            Beschreibung / Notizen
          </label>
          <textarea
            id="beschreibung-textarea"
            className="textarea-field"
            placeholder="Detaillierte Erläuterung zum Sachverhalt..."
            rows={5}
            value={formState.beschreibung}
            onChange={(e) => handleInputChange('beschreibung', e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="form-actions-divider">
          <button type="button" className="btn btn-neutral" onClick={onCancel} id="btn-cancel">
            Abbrechen
          </button>
          <button type="submit" className="btn btn-primary" id="btn-next-step-1">
            Weiter zu Schritt 2
            <ArrowRight size={18} />
          </button>
        </div>
      </form>
    );
  }

  // Render Step 2 Form (Antragsteller)
  if (currentStep === 2) {
    return (
      <form onSubmit={handleNext} className="wizard-form" id="wizard-form-step-2">
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-primary)' }}>Antragsteller Informationen</h2>
          <p className="form-subtext">Hinterlegen Sie die Kontaktdaten der antragstellenden Person.</p>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="applicant-name">
            Vollständiger Name <span className="required-asterisk">*</span>
          </label>
          <input
            type="text"
            id="applicant-name"
            className={`input-field ${errors.antragstellerName ? 'input-error' : ''}`}
            placeholder="z.B. J. Schmidt"
            value={formState.antragstellerName}
            onChange={(e) => handleInputChange('antragstellerName', e.target.value)}
          />
          {errors.antragstellerName && <p className="form-error-msg">{errors.antragstellerName}</p>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="applicant-email">
            E-Mail-Adresse <span className="required-asterisk">*</span>
          </label>
          <input
            type="email"
            id="applicant-email"
            className={`input-field ${errors.antragstellerEmail ? 'input-error' : ''}`}
            placeholder="z.B. j.schmidt@stadt-essen.de"
            value={formState.antragstellerEmail}
            onChange={(e) => handleInputChange('antragstellerEmail', e.target.value)}
          />
          {errors.antragstellerEmail && <p className="form-error-msg">{errors.antragstellerEmail}</p>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="applicant-dept">
            Abteilung / Referat
          </label>
          <input
            type="text"
            id="applicant-dept"
            className="input-field"
            placeholder="z.B. Baurecht West"
            value={formState.antragstellerAbteilung}
            onChange={(e) => handleInputChange('antragstellerAbteilung', e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="form-actions-divider">
          <button type="button" className="btn btn-neutral" onClick={onPrevStep} id="btn-prev-2">
            <ArrowLeft size={18} />
            Zurück
          </button>
          <button type="submit" className="btn btn-primary" id="btn-next-step-2">
            Weiter zu Schritt 3
            <ArrowRight size={18} />
          </button>
        </div>
      </form>
    );
  }

  // Render Step 3 Form (Unterlagen)
  if (currentStep === 3) {
    return (
      <div className="wizard-form" id="wizard-form-step-3">
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-primary)' }}>Unterlagen & Nachweise hochladen</h2>
          <p className="form-subtext">Laden Sie alle relevanten Dokumente und Skizzen für diesen Vorgang hoch.</p>
        </div>

        {/* Drag and Drop Zone */}
        <div
          className={`drag-drop-zone ${dragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-selector')?.click()}
          id="upload-drag-zone"
        >
          <Upload size={32} style={{ color: 'var(--color-primary)', marginBottom: '8px' }} />
          <p className="drag-drop-title">Dateien per Drag & Drop hier ablegen</p>
          <p className="drag-drop-subtitle">oder klicken Sie, um Ihren Explorer zu öffnen</p>
          <input
            type="file"
            id="file-selector"
            style={{ display: 'none' }}
            multiple
            onChange={handleFileSelect}
          />
        </div>

        {/* List of uploaded files */}
        <div className="uploaded-files-section">
          <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
            Hochgeladene Dateien ({formState.uploadedFiles.length})
          </h4>
          
          {formState.uploadedFiles.length === 0 ? (
            <p className="form-subtext" style={{ fontStyle: 'italic', padding: '12px', border: '1px dashed var(--color-standard)', borderRadius: '4px', textAlign: 'center' }}>
              Keine Dateien ausgewählt.
            </p>
          ) : (
            <div className="uploaded-files-list">
              {formState.uploadedFiles.map((file, index) => (
                <div key={index} className="uploaded-file-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 500 }}>{file.name}</span>
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '11px' }}>({file.size})</span>
                  </div>
                  <button
                    type="button"
                    className="remove-file-btn"
                    onClick={() => removeFile(index)}
                  >
                    <Trash2 size={14} style={{ marginRight: '4px' }} />
                    Löschen
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="form-actions-divider">
          <button type="button" className="btn btn-neutral" onClick={onPrevStep} id="btn-prev-3">
            <ArrowLeft size={18} />
            Zurück
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onNextStep}
            id="btn-next-step-3"
          >
            Weiter zu Schritt 4
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  // Render Step 4 Form (Review & Submit)
  return (
    <div className="wizard-form" id="wizard-form-step-4">
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-primary)' }}>Prüfung & Abschluss</h2>
        <p className="form-subtext">Bitte prüfen Sie Ihre Eingaben ein letztes Mal, bevor Sie den Vorgang abschließen.</p>
      </div>

      <div className="review-grid">
        <div className="review-item">
          <span className="review-label">Aktenzeichen</span>
          <span className="review-value" style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
            {formState.aktenzeichen}
          </span>
        </div>
        
        <div className="review-item">
          <span className="review-label">Fachbereich</span>
          <span className="review-value" style={{ textTransform: 'capitalize' }}>
            {formState.fachbereich || 'Nicht angegeben'}
          </span>
        </div>

        <div className="review-item">
          <span className="review-label">Vorgangsart</span>
          <span className="review-value">
            {formState.vorgangsart === 'carport' && 'Bauantrag Carport'}
            {formState.vorgangsart === 'garage' && 'Bauantrag Garage'}
            {formState.vorgangsart === 'it' && 'IT-Hardware'}
            {formState.vorgangsart === 'reise' && 'Reisekosten'}
            {!formState.vorgangsart && 'Nicht angegeben'}
          </span>
        </div>

        <div className="review-item">
          <span className="review-label">Betreff</span>
          <span className="review-value">{formState.betreff}</span>
        </div>

        <div className="review-item">
          <span className="review-label">Priorität</span>
          <span className={`review-value ${formState.priority === 'high' ? 'priority-high-text' : ''}`} style={{ textTransform: 'capitalize' }}>
            {formState.priority === 'low' && 'Niedrig'}
            {formState.priority === 'medium' && 'Mittel'}
            {formState.priority === 'high' && 'Hoch'}
          </span>
        </div>

        <div className="review-item">
          <span className="review-label">Beschreibung</span>
          <span className="review-value" style={{ whiteSpace: 'pre-wrap' }}>
            {formState.beschreibung || 'Keine Notizen erfasst.'}
          </span>
        </div>

        <div className="review-item">
          <span className="review-label">Antragsteller</span>
          <span className="review-value">
            {formState.antragstellerName || 'J. Schmidt'} ({formState.antragstellerEmail || 'j.schmidt@stadt-essen.de'})
            {formState.antragstellerAbteilung ? `, Abt: ${formState.antragstellerAbteilung}` : ''}
          </span>
        </div>

        <div className="review-item">
          <span className="review-label">Anhänge</span>
          <span className="review-value">
            {formState.uploadedFiles.length === 0 ? (
              <span style={{ fontStyle: 'italic', color: 'var(--color-text-secondary)' }}>Keine Dateien hochgeladen</span>
            ) : (
              formState.uploadedFiles.map((file) => file.name).join(', ')
            )}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="form-actions-divider">
        <button type="button" className="btn btn-neutral" onClick={onPrevStep} id="btn-prev-4">
          <ArrowLeft size={18} />
          Zurück
        </button>
        <button type="button" className="btn btn-success" onClick={onSubmit} id="btn-submit-form">
          <CheckCircle size={18} />
          Vorgang abschließen
        </button>
      </div>
    </div>
  );
}
