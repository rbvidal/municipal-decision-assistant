import React, { useMemo } from "react";
import { Workspace, WorkspaceSection } from "../../../components/layout";
import { Panel, ActivityTimeline, type TimelineEvent } from "../../../components/common";

interface ActivityTabProps {
  events: RawTimelineEvent[];
}

/** The shape that actually arrives from useCaseWorkspace / API / demo data. */
interface RawTimelineEvent {
  id: string;
  timestamp?: string;
  actor?: string;
  action?: string;
  description?: string;
  type?: string;
  time?: string;
  author?: string;
  content?: string;
}

interface DateGroup {
  label: string;
  events: TimelineEvent[];
}

/** Normalise any incoming event shape into the TimelineEvent the component expects. */
function normalise(raw: RawTimelineEvent): TimelineEvent {
  const time = raw.time ?? raw.timestamp ?? "";
  return {
    id: raw.id,
    author: raw.author ?? raw.actor ?? "System",
    time,
    content: raw.content ?? raw.description ?? raw.action ?? "",
    type: (raw.type === "edit" || raw.type === "system" ? raw.type : "edit") as "edit" | "system",
  };
}

function groupByDate(events: RawTimelineEvent[]): DateGroup[] {
  const groups = new Map<string, TimelineEvent[]>();

  for (const raw of events) {
    const event = normalise(raw);
    let key: string;
    if (event.time.startsWith("Heute")) {
      key = "Heute";
    } else if (event.time.startsWith("Gestern")) {
      key = "Gestern";
    } else {
      key = event.time.split(",")[0] || event.time || "Unbekannt";
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
