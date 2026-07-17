import React from 'react';
import { Workspace } from '../../../components/layout';
import { Panel, EmptyState } from '../../../components/common';

export const SendTab: React.FC = React.memo(() => (
  <Workspace>
    <Panel title="Versand">
      <EmptyState
        title="Versand vorbereiten"
        description="Der Versand des Bescheids wird nach der Genehmigung vorbereitet. Diese Funktion wird in einer späteren Phase implementiert."
      />
    </Panel>
  </Workspace>
));

SendTab.displayName = 'SendTab';
