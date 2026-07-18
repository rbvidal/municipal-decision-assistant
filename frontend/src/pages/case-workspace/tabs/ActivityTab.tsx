import React, { useMemo } from "react";
import { Workspace, WorkspaceSection } from "../../../components/layout";
import { Panel, ActivityTimeline, type TimelineEvent } from "../../../components/common";

interface ActivityTabProps {
  events: TimelineEvent[];
}

interface DateGroup {
  label: string;
  events: TimelineEvent[];
}

function groupByDate(events: TimelineEvent[]): DateGroup[] {
  const groups = new Map<string, TimelineEvent[]>();
  const today = new Date().toLocaleDateString("de-DE");

  for (const event of events) {
    let key: string;
    if (event.time.startsWith("Heute")) {
      key = "Heute";
    } else if (event.time.startsWith("Gestern")) {
      key = "Gestern";
    } else {
      key = event.time.split(",")[0] ?? event.time;
    }
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(event);
  }

  return Array.from(groups.entries()).map(([label, evts]) => ({ label, events: evts }));
}

export const ActivityTab: React.FC<ActivityTabProps> = React.memo(({ events }) => {
  const dateGroups = useMemo(() => groupByDate(events), [events]);

  return (
    <Workspace>
      {dateGroups.map((group) => (
        <WorkspaceSection key={group.label} title={group.label}>
          <Panel>
            <ActivityTimeline events={group.events} />
          </Panel>
        </WorkspaceSection>
      ))}
      {events.length === 0 && (
        <Panel title="Aktivitätsverlauf">
          <p style={{ fontSize: "0.85rem", color: "var(--color-gray-500)" }}>
            Keine Aktivitäten vorhanden.
          </p>
        </Panel>
      )}
    </Workspace>
  );
});

ActivityTab.displayName = "ActivityTab";
