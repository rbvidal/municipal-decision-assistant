export interface User {
  id: string;
  name: string;
  email: string;
  department: string; // e.g., 'Bauamt', 'IT-Abteilung', 'Ordnungsamt', 'Personalwesen'
  role: string;       // e.g., 'Sachbearbeiterin', 'Administrator', 'Amtsleitung', 'Sachbearbeiter'
  status: 'AKTIV' | 'INAKTIV' | 'GESPERRT';
  lastLogin: string;
  initials: string;
}

export interface UserFilter {
  search: string;
  department: string;
  role: string;
}

export type ActiveTab = 'Übersicht' | 'Benutzer' | 'Korpus' | 'Hintergrundjobs' | 'Benchmarks' | 'Audit';
export type SidebarItem = 'Dashboard' | 'Analysen' | 'Risiken' | 'Protokolle' | 'Einstellungen';
