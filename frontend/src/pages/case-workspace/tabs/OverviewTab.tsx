import React from "react";
import { Workspace, WorkspaceSection } from "../../../components/layout";
import { Panel, Alert, PropertyGrid } from "../../../components/common";
import { WorkflowStepper } from "../../../components/workflow";
import type { CaseDetails, WorkflowStep } from "../../../types/domain";

interface OverviewTabProps {
  caseData: CaseDetails;
  workflowSteps: WorkflowStep[];
}

export const OverviewTab: React.FC<OverviewTabProps> = React.memo(({ caseData, workflowSteps }) => (
  <Workspace>
    <WorkflowStepper
      steps={workflowSteps.map((s) => ({
        id: s.id,
        label: s.label,
        state: s.state ?? (s.completed ? "completed" as const : s.current ? "active" as const : "inactive" as const),
      }))}
    />

    <Alert
      type="warning"
      title="Fehlende Informationen festgestellt"
      description="Ein Brandschutznachweis wurde für dieses Vorhaben noch nicht eingereicht."
      actionLabel="Anfordern"
    />

    <WorkspaceSection title="Vorgangsdetails">
      <Panel>
        <PropertyGrid
          items={[
            { label: "Aktenzeichen", value: caseData.id, valueMono: true },
            { label: "Status", value: caseData.status ?? "-" },
            { label: "Antragsteller", value: caseData.applicant ?? "-" },
            { label: "Abteilung", value: caseData.department ?? "-" },
            { label: "Bearbeiter", value: caseData.assignee ?? "-", valueHighlight: true },
            {
              label: "Priorität",
              value:
                caseData.priority === "high"
                  ? "Hoch"
                  : caseData.priority === "medium"
                    ? "Mittel"
                    : caseData.priority === "low"
                      ? "Niedrig"
                      : caseData.priority ?? "-",
            },
            {
              label: "Risiko",
              value:
                caseData.risk === "gering"
                  ? "Gering"
                  : caseData.risk === "mittel"
                    ? "Mittel"
                    : caseData.risk === "hoch"
                      ? "Hoch"
                      : caseData.risk ?? "-",
            },
            { label: "Fälligkeit", value: caseData.deadline ?? "-" },
          ]}
        />
      </Panel>
    </WorkspaceSection>
  </Workspace>
));

OverviewTab.displayName = "OverviewTab";
