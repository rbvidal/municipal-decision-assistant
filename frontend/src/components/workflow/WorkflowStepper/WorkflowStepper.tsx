import React from "react";
import { cn } from "../../../utils";
import { Icon } from "../../common/Icon";
import styles from "./WorkflowStepper.module.css";

interface WorkflowStepData {
  id: string;
  label: string;
  state: "completed" | "active" | "inactive";
}

interface WorkflowStepperProps {
  steps: WorkflowStepData[];
  className?: string;
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = React.memo(
  ({ steps, className }) => (
    <nav className={cn(styles.stepper, className)} aria-label="Workflow-Phasen">
      {steps.map((step, idx) => (
        <React.Fragment key={step.id}>
          {idx > 0 && <div className={styles.connector} aria-hidden="true" />}
          <div
            className={cn(styles.step, styles[`step-${step.state}`])}
            aria-current={step.state === "active" ? "step" : undefined}
          >
            <div className={styles.node}>
              {step.state === "completed" ? (
                <Icon name="check" size={14} />
              ) : (
                <span className={styles.nodeText}>{idx + 1}</span>
              )}
            </div>
            <span className={styles.label}>{step.label}</span>
          </div>
        </React.Fragment>
      ))}
    </nav>
  ),
);

WorkflowStepper.displayName = "WorkflowStepper";
