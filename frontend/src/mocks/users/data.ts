export type UserRole =
  | "Systemadministrator"
  | "Korpus-Manager"
  | "Fachbereichsleiter"
  | "Sachbearbeiter"
  | "Lesezugriff";
export type UserStatus = "Aktiv" | "Inaktiv" | "Gesperrt";

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: UserStatus;
  lastAccess: string;
  createdAt: string;
  cases: number;
}

export const ROLE_COLORS: Record<UserRole, "info" | "success" | "warning" | "neutral"> = {
  Systemadministrator: "info",
  "Korpus-Manager": "success",
  Fachbereichsleiter: "warning",
  Sachbearbeiter: "neutral",
  Lesezugriff: "neutral",
};

export const STATUS_COLORS: Record<UserStatus, "success" | "neutral" | "error"> = {
  Aktiv: "success",
  Inaktiv: "neutral",
  Gesperrt: "error",
};

export const mockUsers: UserItem[] = [
  {
    id: "u1",
    name: "Joachim Dehmel",
    email: "j.dehmel@verwaltung.de",
    role: "Systemadministrator",
    department: "Amt für Digitalisierung",
    status: "Aktiv",
    lastAccess: "Heute, 09:42",
    createdAt: "01.03.2023",
    cases: 0,
  },
  {
    id: "u2",
    name: "Sabine Müller",
    email: "s.mueller@verwaltung.de",
    role: "Sachbearbeiter",
    department: "Bauaufsicht",
    status: "Aktiv",
    lastAccess: "Heute, 09:30",
    createdAt: "15.01.2023",
    cases: 48,
  },
  {
    id: "u3",
    name: "Sarah Lindner",
    email: "s.lindner@verwaltung.de",
    role: "Korpus-Manager",
    department: "Bauaufsicht",
    status: "Aktiv",
    lastAccess: "Gestern, 17:15",
    createdAt: "12.04.2023",
    cases: 12,
  },
  {
    id: "u4",
    name: "Dr. Michael Schmitt",
    email: "m.schmitt@verwaltung.de",
    role: "Fachbereichsleiter",
    department: "Rechtsamt",
    status: "Aktiv",
    lastAccess: "Heute, 08:05",
    createdAt: "01.02.2023",
    cases: 3,
  },
  {
    id: "u5",
    name: "Elena Rostova",
    email: "e.rostova@verwaltung.de",
    role: "Systemadministrator",
    department: "Amt für Digitalisierung",
    status: "Aktiv",
    lastAccess: "Vor 2 Tagen",
    createdAt: "01.06.2024",
    cases: 0,
  },
  {
    id: "u6",
    name: "Thomas Weber",
    email: "t.weber@verwaltung.de",
    role: "Sachbearbeiter",
    department: "Ordnungsamt",
    status: "Inaktiv",
    lastAccess: "Vor 3 Wochen",
    createdAt: "01.09.2023",
    cases: 24,
  },
  {
    id: "u7",
    name: "Klaus Hartmann",
    email: "k.hartmann@verwaltung.de",
    role: "Lesezugriff",
    department: "Umweltamt",
    status: "Gesperrt",
    lastAccess: "Vor 2 Monaten",
    createdAt: "15.05.2023",
    cases: 0,
  },
];
