import React, { useState, useCallback } from 'react';
import { cn } from '../../../utils';
import { Button } from '../../common/Button';
import { Icon } from '../../common/Icon';
import styles from './Wizard.module.css';

interface WizardStep {
  id: string;
  label: string;
  content: React.ReactNode;
  validate?: () => boolean;
}

interface WizardProps {
  steps: WizardStep[];
  onFinish: () => void;
  onCancel: () => void;
  finishLabel?: string;
  className?: string;
}

export const Wizard: React.FC<WizardProps> = React.memo(({
  steps, onFinish, onCancel, finishLabel = 'Abschließen', className,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const isFirst = currentIdx === 0;
  const isLast = currentIdx === steps.length - 1;

  const handleNext = useCallback(() => {
    const step = steps[currentIdx];
    if (step.validate && !step.validate()) return;
    if (!isLast) setCurrentIdx((i) => i + 1);
  }, [currentIdx, isLast, steps]);

  const handlePrev = useCallback(() => {
    if (!isFirst) setCurrentIdx((i) => i - 1);
  }, [isFirst]);

  const handleFinish = useCallback(() => {
    const step = steps[currentIdx];
    if (step.validate && !step.validate()) return;
    onFinish();
  }, [currentIdx, steps, onFinish]);

  return (
    <div className={cn(styles.wizard, className)}>
      <nav className={styles.stepper} aria-label="Schritt-für-Schritt">
        {steps.map((step, idx) => (
          <React.Fragment key={step.id}>
            {idx > 0 && <div className={styles.connector} aria-hidden="true" />}
            <div
              className={cn(
                styles.step,
                idx < currentIdx && styles.completed,
                idx === currentIdx && styles.active,
                idx > currentIdx && styles.inactive,
              )}
            >
              <div className={styles.node}>
                {idx < currentIdx ? <Icon name="check" size={12} /> : <span>{idx + 1}</span>}
              </div>
              <span className={styles.label}>{step.label}</span>
            </div>
          </React.Fragment>
        ))}
      </nav>

      <div className={styles.body}>
        {steps[currentIdx].content}
      </div>

      <div className={styles.footer}>
        <Button variant="ghost" size="sm" onClick={onCancel}>Abbrechen</Button>
        <div className={styles.navButtons}>
          {!isFirst && (
            <Button variant="secondary" size="sm" onClick={handlePrev}>Zurück</Button>
          )}
          {isLast ? (
            <Button variant="primary" size="sm" onClick={handleFinish}>{finishLabel}</Button>
          ) : (
            <Button variant="primary" size="sm" onClick={handleNext}>Weiter</Button>
          )}
        </div>
      </div>
    </div>
  );
});

Wizard.displayName = 'Wizard';
