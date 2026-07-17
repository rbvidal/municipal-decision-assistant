import React, { useState, useMemo, useCallback } from 'react';
import { AppShell } from '../../layouts/AppShell';
import { TopNavigation, type NavModule } from '../../components/navigation';
import { DataTable, type DataTableColumn } from '../../components/data';
import { SearchBar } from '../../components/search';
import { Panel, Badge, Button, PropertyGrid, EmptyState } from '../../components/common';
import { Drawer, ConfirmDialog } from '../../components/interaction';
import { mockUsers, ROLE_COLORS, STATUS_COLORS } from '../../mocks/users';
import type { UserItem } from '../../mocks/users';
import styles from './UsersPage.module.css';

const NAV_MODULES: NavModule[] = [
  { id: 'home', label: 'Startseite', href: '/home' },
  { id: 'work', label: 'Meine Arbeit', href: '/work' },
  { id: 'knowledge', label: 'Wissen', href: '/knowledge' },
  { id: 'documents', label: 'Dokumente', href: '/documents' },
  { id: 'admin', label: 'Verwaltung', href: '/admin', active: true },
];

export const UsersPage: React.FC = React.memo(() => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [confirmToggle, setConfirmToggle] = useState<UserItem | null>(null);
  const [users, setUsers] = useState(mockUsers);

  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return users;
    return users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.department.toLowerCase().includes(q));
  }, [users, searchQuery]);

  const handleToggleStatus = useCallback((user: UserItem) => {
    setConfirmToggle(user);
  }, []);

  const confirmStatusToggle = useCallback(() => {
    if (!confirmToggle) return;
    setUsers((prev) => prev.map((u) => {
      if (u.id !== confirmToggle.id) return u;
      const next: typeof u.status = u.status === 'Aktiv' ? 'Inaktiv' : 'Aktiv';
      return { ...u, status: next };
    }));
    setConfirmToggle(null);
  }, [confirmToggle]);

  const columns: DataTableColumn<UserItem>[] = useMemo(() => [
    { key: 'name', header: 'Name / E-Mail', render: (u) => (
      <div>
        <div className={styles.userName} onClick={() => setSelectedUser(u)}>{u.name}</div>
        <div className={styles.monoCell}>{u.email}</div>
      </div>
    )},
    { key: 'role', header: 'Rolle', render: (u) => <Badge status={ROLE_COLORS[u.role] ?? 'neutral'}>{u.role}</Badge> },
    { key: 'department', header: 'Dezernat', render: (u) => <span className={styles.monoCell}>{u.department}</span> },
    { key: 'status', header: 'Status', render: (u) => <Badge status={STATUS_COLORS[u.status] ?? 'neutral'}>{u.status}</Badge> },
    { key: 'lastAccess', header: 'Letzter Zugriff', render: (u) => <span className={styles.monoCell}>{u.lastAccess}</span> },
    { key: 'actions', header: '', render: (u) => (
      <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(u)}>
        {u.status === 'Aktiv' ? 'Deaktivieren' : 'Aktivieren'}
      </Button>
    )},
  ], [handleToggleStatus]);

  return (
    <AppShell
      topNavigation={
        <TopNavigation modules={NAV_MODULES} activeModule="admin" onNavigate={() => {}}
          userName="Joachim Dehmel" userEmail="j.dehmel@verwaltung.de" userDepartment="Amt für Digitalisierung" userInitials="JD"
          userActions={[{ id: 'profile', label: 'Profil', onClick: () => {} }, { id: 'logout', label: 'Abmelden', onClick: () => {} }]}
          notifications={[]} onNotificationClick={() => {}} onMarkAllNotificationsRead={() => {}} onViewAllNotifications={() => {}} />
      }>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.headerTitle}>Benutzerverwaltung</h1>
          <Button variant="primary" size="sm">+ Benutzer anlegen</Button>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Benutzer durchsuchen..." />
          </div>
        </div>

        <div className={styles.layout}>
          <div className={styles.mainCol}>
            <Panel title={`Benutzer (${filteredUsers.length})`}>
              {filteredUsers.length === 0 ? (
                <EmptyState title="Keine Benutzer gefunden" />
              ) : (
                <DataTable columns={columns} data={filteredUsers} keyField="id" />
              )}
            </Panel>
          </div>

          {selectedUser && (
            <div className={styles.sideCol}>
              <Panel title="Benutzerdetails">
                <PropertyGrid items={[
                  { label: 'Name', value: selectedUser.name },
                  { label: 'E-Mail', value: selectedUser.email, valueMono: true },
                  { label: 'Rolle', value: selectedUser.role },
                  { label: 'Dezernat', value: selectedUser.department },
                  { label: 'Status', value: selectedUser.status },
                  { label: 'Letzter Zugriff', value: selectedUser.lastAccess },
                  { label: 'Erstellt am', value: selectedUser.createdAt },
                  { label: 'Vorgänge', value: String(selectedUser.cases) },
                ]} />
              </Panel>
            </div>
          )}
        </div>
      </div>

      <Drawer open={!!selectedUser} onClose={() => setSelectedUser(null)} title="Benutzerdetails" width="400px">
        {selectedUser && (
          <PropertyGrid items={[
            { label: 'Name', value: selectedUser.name },
            { label: 'E-Mail', value: selectedUser.email, valueMono: true },
            { label: 'Rolle', value: selectedUser.role },
            { label: 'Dezernat', value: selectedUser.department },
            { label: 'Status', value: selectedUser.status },
            { label: 'Letzter Zugriff', value: selectedUser.lastAccess },
            { label: 'Registriert', value: selectedUser.createdAt },
            { label: 'Aktive Vorgänge', value: String(selectedUser.cases) },
          ]} />
        )}
      </Drawer>

      <ConfirmDialog
        open={!!confirmToggle}
        onClose={() => setConfirmToggle(null)}
        onConfirm={confirmStatusToggle}
        title={confirmToggle?.status === 'Aktiv' ? 'Benutzer deaktivieren' : 'Benutzer aktivieren'}
        description={confirmToggle ? `${confirmToggle.name} (${confirmToggle.email}) wird ${confirmToggle.status === 'Aktiv' ? 'deaktiviert' : 'aktiviert'}.` : ''}
        confirmLabel={confirmToggle?.status === 'Aktiv' ? 'Deaktivieren' : 'Aktivieren'}
        mode={confirmToggle?.status === 'Aktiv' ? 'warning' : 'info'}
      />
    </AppShell>
  );
});

UsersPage.displayName = 'UsersPage';
