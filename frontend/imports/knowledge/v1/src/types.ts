export type DocType =
  | 'Vorschriften'
  | 'Verfahren'
  | 'Vorlagen'
  | 'Checklisten'
  | 'FAQs'
  | 'Rundschreiben'
  | 'Formulare';

export interface TocItem {
  id: string;
  label: string;
}

export interface RelatedProcedure {
  id: string;
  name: string;
  paragraph: string;
}

export interface DownloadItem {
  id: string;
  filename: string;
  filetype: 'pdf' | 'docx' | 'xlsx' | 'zip';
  size: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  type: DocType;
  relevance: number; // Percentage (e.g., 95, 70, 85)
  isFavorite: boolean;
  authority: string; // e.g. "Land NRW"
  date: string; // e.g. "15.05.2024" or "Stand: 01.01.2024"
  legalArea: string; // e.g. "Bauordnungsrecht"
  snippet: string;
  fullText: string;
  toc: TocItem[];
  relatedProcedures: RelatedProcedure[];
  downloads: DownloadItem[];
  referencedLaws: string[];
  fachbereich: 'Bauamt' | 'Ordnungsamt' | 'Umweltamt' | 'Sozialamt';
  bundesland: 'NRW' | 'Bayern' | 'Hessen' | 'BW';
  zeitraum: 'Aktuell' | 'Archiv';
}

export interface FilterState {
  searchQuery: string;
  fachbereich: string;
  type: string;
  bundesland: string;
  zeitraum: string;
}

export interface CategoryItem {
  id: DocType;
  label: string;
  icon: string;
  count?: number;
}
