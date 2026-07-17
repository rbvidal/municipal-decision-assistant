import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../layouts/AppShell';
import { EmptyState, Button } from '../../components/common';

export const NotFoundPage: React.FC = React.memo(() => {
  const navigate = useNavigate();
  return (
    <AppShell>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <EmptyState
          title="Seite nicht gefunden"
          description="Die angeforderte Seite existiert nicht oder wurde verschoben."
          action={{ label: 'Zur Startseite', onClick: () => navigate('/home') }}
        />
      </div>
    </AppShell>
  );
});

NotFoundPage.displayName = 'NotFoundPage';
