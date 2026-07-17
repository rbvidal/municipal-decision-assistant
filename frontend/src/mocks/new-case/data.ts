export interface CaseFormData {
  caseType: string;
  applicantName: string;
  applicantEmail: string;
  applicantAddress: string;
  documents: string[];
  department: string;
  priority: string;
  risk: string;
  description: string;
}

export const CASE_TYPES = ['Bauantrag', 'Bauvoranfrage', 'Nutzungsänderung', 'Abbruchgenehmigung', 'Vorbescheid', 'Sonstiges'] as const;

export const DEPARTMENTS = ['Bauaufsicht', 'Ordnungsamt', 'Umweltamt', 'Sozialamt'] as const;

export const DOCUMENT_OPTIONS = [
  'Lageplan M 1:500', 'Grundriss', 'Ansichten', 'Schnitt',
  'Baubeschreibung', 'Statik-Nachweis', 'Brandschutznachweis',
  'Energieausweis', 'Entwässerungsplan', 'Freiflächenplan',
] as const;

export const initialFormData: CaseFormData = {
  caseType: '',
  applicantName: '',
  applicantEmail: '',
  applicantAddress: '',
  documents: [],
  department: '',
  priority: '',
  risk: '',
  description: '',
};
