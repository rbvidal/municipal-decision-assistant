import React from 'react';
import { Check } from 'lucide-react';

export const PhaseStepper: React.FC = () => {
  return (
    <div className="phase-stepper-container" id="case-processing-stepper">
      <div className="phase-stepper">
        {/* Step 1: Completed */}
        <div className="step-node completed" id="stepper-step-1">
          <div className="step-circle completed">
            <Check size={12} strokeWidth={3} />
          </div>
          <span className="step-label inactive">Posteingang</span>
        </div>

        <div className="step-divider" id="stepper-divider-1-2"></div>

        {/* Step 2: Active */}
        <div className="step-node active" id="stepper-step-2">
          <div className="step-circle active">2</div>
          <span className="step-label active">PRÜFUNG</span>
        </div>

        <div className="step-divider" id="stepper-divider-2-3"></div>

        {/* Step 3: Inactive */}
        <div className="step-node inactive" id="stepper-step-3">
          <div className="step-circle inactive">3</div>
          <span className="step-label inactive">Entscheidung</span>
        </div>

        <div className="step-divider" id="stepper-divider-3-4"></div>

        {/* Step 4: Inactive */}
        <div className="step-node inactive" id="stepper-step-4">
          <div className="step-circle inactive">4</div>
          <span className="step-label inactive">Entwurf</span>
        </div>

        <div className="step-divider" id="stepper-divider-4-5"></div>

        {/* Step 5: Inactive */}
        <div className="step-node inactive" id="stepper-step-5">
          <div className="step-circle inactive">5</div>
          <span className="step-label inactive">Versand</span>
        </div>
      </div>
    </div>
  );
};
