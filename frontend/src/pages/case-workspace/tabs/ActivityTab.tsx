import React from 'react';
import { Workspace } from '../../../components/layout';
import { Panel, ActivityTimeline, type TimelineEvent } from '../../../components/common';

interface ActivityTabProps {
  events: TimelineEvent[];
}

export const ActivityTab: React.FC<ActivityTabProps> = React.memo(({ events }) => (
  <Workspace>
    <Panel title="Aktivitätsverlauf">
      <ActivityTimeline events={events} />
    </Panel>
  </Workspace>
));

ActivityTab.displayName = 'ActivityTab';
