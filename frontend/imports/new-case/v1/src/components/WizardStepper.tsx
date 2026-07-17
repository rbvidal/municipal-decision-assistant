/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StepId } from '../types';

interface WizardStepperProps {
  currentStep: StepId;
  completedSteps: StepId[];
  onStepChange: (stepId: StepId) => void;
}

export default function WizardStepper({ currentStep, completedSteps, onStepChange }: WizardStepperProps) {
  const stepsList: { id: StepId; label: string; positionClass: string }[] = [
    { id: 1, label: 'Basisdaten', positionClass: 'step-item-start' },
    { id: 2, label: 'Antragsteller', positionClass: 'step-item-middle' },
    { id: 3, label: 'Unterlagen', positionClass: 'step-item-middle' },
    { id: 4, label: 'Prüfung & Abschluss', positionClass: 'step-item-end' }
  ];

  const getStepCircleClass = (stepId: StepId) => {
    if (currentStep === stepId) {
      return 'step-circle step-circle-active';
    }
    if (completedSteps.includes(stepId)) {
      return 'step-circle step-circle-completed';
    }
    return 'step-circle step-circle-inactive';
  };

  const getStepLabelClass = (stepId: StepId) => {
    if (currentStep === stepId) {
      return 'step-label step-label-active';
    }
    if (completedSteps.includes(stepId)) {
      return 'step-label step-label-completed';
    }
    return 'step-label step-label-inactive';
  };

  return (
    <nav className="stepper-nav" aria-label="Antragsfortschritt" id="wizard-stepper">
      <div className="stepper-line"></div>
      
      {stepsList.map((step) => (
        <div 
          key={step.id} 
          className={`step-item ${step.positionClass}`}
          onClick={() => onStepChange(step.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onStepChange(step.id); }}
          id={`step-indicator-${step.id}`}
        >
          <div className={getStepCircleClass(step.id)}>
            {step.id}
          </div>
          <span className={getStepLabelClass(step.id)}>{step.label}</span>
        </div>
      ))}
    </nav>
  );
}
