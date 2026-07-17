import React from "react";
import { Workspace } from "../../../components/layout";
import { Panel, EmptyState } from "../../../components/common";

export const DraftTab: React.FC = React.memo(() => (
  <Workspace>
    <Panel title="Entwurf">
      <EmptyState
        title="Bescheidentwurf"
        description="Der Bescheidentwurf wird basierend auf den Prüfergebnissen automatisch erstellt. Diese Funktion wird in einer späteren Phase implementiert."
      />
    </Panel>
  </Workspace>
));

DraftTab.displayName = "DraftTab";
