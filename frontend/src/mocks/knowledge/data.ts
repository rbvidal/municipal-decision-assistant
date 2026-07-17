export type DocType =
  | "Vorschriften"
  | "Verfahren"
  | "Vorlagen"
  | "Checklisten"
  | "FAQs"
  | "Rundschreiben"
  | "Formulare";

export type Fachbereich = "Bauamt" | "Ordnungsamt" | "Umweltamt" | "Sozialamt";
export type Bundesland = "NRW" | "Bayern" | "Hessen" | "BW" | "Alle";
export type Zeitraum = "Aktuell" | "Archiv" | "Alle";

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
  filetype: "pdf" | "docx" | "xlsx" | "zip";
  size: string;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  type: DocType;
  relevance: number;
  isFavorite: boolean;
  authority: string;
  date: string;
  legalArea: string;
  snippet: string;
  fullText: string;
  toc: TocItem[];
  relatedProcedures: RelatedProcedure[];
  downloads: DownloadItem[];
  referencedLaws: string[];
  fachbereich: Fachbereich;
  bundesland: Bundesland;
  zeitraum: Zeitraum;
}

export interface CategoryItem {
  id: DocType | "Alle";
  label: string;
  icon: string;
  count?: number;
}

export interface FilterState {
  searchQuery: string;
  fachbereich: Fachbereich | "Alle";
  type: DocType | "Alle";
  bundesland: Bundesland | "Alle";
  zeitraum: Zeitraum;
}

export const DOC_TYPE_LABELS: Record<DocType, string> = {
  Vorschriften: "Vorschriften",
  Verfahren: "Verfahren",
  Vorlagen: "Vorlagen",
  Checklisten: "Checklisten",
  FAQs: "FAQs",
  Rundschreiben: "Rundschreiben",
  Formulare: "Formulare",
};

export const categories: CategoryItem[] = [
  { id: "Alle", label: "Alle", icon: "layers", count: 245 },
  { id: "Vorschriften", label: "Vorschriften", icon: "scale", count: 124 },
  { id: "Verfahren", label: "Verfahren", icon: "workflow", count: 38 },
  { id: "Vorlagen", label: "Vorlagen", icon: "file-text", count: 27 },
  { id: "Checklisten", label: "Checklisten", icon: "check-square", count: 19 },
  { id: "FAQs", label: "FAQs", icon: "help-circle", count: 22 },
  { id: "Rundschreiben", label: "Rundschreiben", icon: "mail", count: 8 },
  { id: "Formulare", label: "Formulare", icon: "clipboard", count: 7 },
];

export const fachbereichOptions: { value: Fachbereich | "Alle"; label: string }[] = [
  { value: "Alle", label: "Alle Fachbereiche" },
  { value: "Bauamt", label: "Bauamt" },
  { value: "Ordnungsamt", label: "Ordnungsamt" },
  { value: "Umweltamt", label: "Umweltamt" },
  { value: "Sozialamt", label: "Sozialamt" },
];

export const bundeslandOptions: { value: Bundesland | "Alle"; label: string }[] = [
  { value: "Alle", label: "Alle Bundesländer" },
  { value: "NRW", label: "Nordrhein-Westfalen" },
  { value: "Bayern", label: "Bayern" },
  { value: "Hessen", label: "Hessen" },
  { value: "BW", label: "Baden-Württemberg" },
];

export const initialDocuments: KnowledgeDocument[] = [
  {
    id: "doc-1",
    title: "§ 65 BauO NRW — Bauantrag und Bauvorlagen",
    type: "Vorschriften",
    relevance: 95,
    isFavorite: true,
    authority: "Land NRW",
    date: "15.05.2024",
    legalArea: "Bauordnungsrecht",
    snippet:
      "Der Bauantrag ist bei der unteren Bauaufsichtsbehörde einzureichen. Ihm sind alle für die Beurteilung des Vorhabens erforderlichen Bauvorlagen beizufügen.",
    fullText:
      "§ 65 BauO NRW — Bauantrag und Bauvorlagen\n\n(1) Der Bauantrag ist bei der unteren Bauaufsichtsbehörde schriftlich einzureichen. Ihm sind alle für die Beurteilung des Vorhabens und die Bearbeitung des Bauantrags erforderlichen Bauvorlagen beizufügen.\n\n(2) Die Bauvorlagen müssen von einer bauvorlageberechtigten Person unterschrieben sein. Bauvorlageberechtigt ist, wer die Berufsbezeichnung Architekt oder Ingenieur führen darf.\n\n(3) Die untere Bauaufsichtsbehörde kann im Einzelfall weitere Unterlagen verlangen, soweit dies zur Beurteilung des Vorhabens erforderlich ist.",
    toc: [
      { id: "t1-1", label: "Abs. 1 — Schriftform und Bauvorlagen" },
      { id: "t1-2", label: "Abs. 2 — Bauvorlageberechtigung" },
      { id: "t1-3", label: "Abs. 3 — Weitere Unterlagen" },
    ],
    relatedProcedures: [
      { id: "rp-1", name: "§ 64 BauO NRW", paragraph: "Vereinfachtes Baugenehmigungsverfahren" },
    ],
    downloads: [
      { id: "dl-1", filename: "BauO_NRW_2024.pdf", filetype: "pdf", size: "2.4 MB" },
      { id: "dl-2", filename: "Anlage_Bauvorlagen.docx", filetype: "docx", size: "145 KB" },
    ],
    referencedLaws: ["BauGB § 29", "BauO NRW § 64", "BauNVO § 12"],
    fachbereich: "Bauamt",
    bundesland: "NRW",
    zeitraum: "Aktuell",
  },
  {
    id: "doc-2",
    title: "§ 64 BauO NRW — Vereinfachtes Baugenehmigungsverfahren",
    type: "Vorschriften",
    relevance: 70,
    isFavorite: false,
    authority: "Land NRW",
    date: "01.03.2024",
    legalArea: "Bauordnungsrecht",
    snippet:
      "Für bestimmte Wohngebäude und Nebengebäude kann ein vereinfachtes Genehmigungsverfahren ohne Prüfung bautechnischer Nachweise durchgeführt werden.",
    fullText:
      "§ 64 BauO NRW — Vereinfachtes Baugenehmigungsverfahren\n\n(1) Für Wohngebäude geringer Höhe sowie für eingeschossige gewerblich genutzte Gebäude bis 300 m² Grundfläche kann ein vereinfachtes Genehmigungsverfahren beantragt werden.\n\n(2) Im vereinfachten Verfahren prüft die Bauaufsichtsbehörde nur die planungsrechtliche Zulässigkeit sowie Abweichungen und Befreiungen.",
    toc: [
      { id: "t2-1", label: "Abs. 1 — Anwendungsbereich" },
      { id: "t2-2", label: "Abs. 2 — Prüfungsumfang" },
    ],
    relatedProcedures: [
      { id: "rp-2", name: "§ 65 BauO NRW", paragraph: "Bauantrag und Bauvorlagen" },
      { id: "rp-3", name: "Art. 64 BayBO", paragraph: "Vereinfachtes Verfahren Bayern" },
    ],
    downloads: [
      { id: "dl-3", filename: "BauO_NRW_64_Merkblatt.pdf", filetype: "pdf", size: "890 KB" },
    ],
    referencedLaws: ["BauGB § 29", "BauO NRW § 65"],
    fachbereich: "Bauamt",
    bundesland: "NRW",
    zeitraum: "Aktuell",
  },
  {
    id: "doc-3",
    title: "VV BauO NRW — Zu § 65 Bauantrag und Bauvorlagen",
    type: "Vorschriften",
    relevance: 85,
    isFavorite: false,
    authority: "Erlass",
    date: "12.12.2023",
    legalArea: "Bauordnungsrecht",
    snippet:
      "Verwaltungsvorschrift zur Auslegung und Anwendung des § 65 BauO NRW. Enthält detaillierte Anforderungen an Bauvorlagen und Prüfverfahren.",
    fullText:
      "VV BauO NRW — Zu § 65 Bauantrag und Bauvorlagen\n\nDie Verwaltungsvorschrift konkretisiert die Anforderungen des § 65 BauO NRW. Sie regelt insbesondere die erforderlichen Bauvorlagen für verschiedene Gebäudeklassen und schafft einheitliche Standards für die Prüfung von Bauanträgen.",
    toc: [
      { id: "t3-1", label: "1. Allgemeine Grundsätze" },
      { id: "t3-2", label: "2. Bauvorlagen nach Gebäudeklasse" },
      { id: "t3-3", label: "3. Prüfverfahren" },
      { id: "t3-4", label: "4. Sonderfälle" },
    ],
    relatedProcedures: [],
    downloads: [{ id: "dl-4", filename: "VV_BauO_NRW_65.pdf", filetype: "pdf", size: "1.8 MB" }],
    referencedLaws: ["BauO NRW § 65", "BauO NRW § 64"],
    fachbereich: "Bauamt",
    bundesland: "NRW",
    zeitraum: "Aktuell",
  },
  {
    id: "doc-4",
    title: "Art. 64 BayBO — Bauantrag und Bauvorlagen in Bayern",
    type: "Vorschriften",
    relevance: 90,
    isFavorite: false,
    authority: "Freistaat Bayern",
    date: "Stand: 01.01.2024",
    legalArea: "Bauordnungsrecht",
    snippet:
      "Das bayerische Pendant zu § 65 BauO NRW. Der Bauantrag ist bei der Gemeinde einzureichen und wird an die Genehmigungsbehörde weitergeleitet.",
    fullText:
      "Art. 64 BayBO — Bauantrag und Bauvorlagen\n\n(1) Der Bauantrag ist bei der Gemeinde schriftlich einzureichen. Die Gemeinde legt den Bauantrag mit ihrer Stellungnahme der unteren Bauaufsichtsbehörde vor.\n\n(2) Für Bauvorlagen gelten die Bestimmungen des Bauvorlagenverordnung (BauVorlV).",
    toc: [
      { id: "t4-1", label: "Abs. 1 — Einreichung bei Gemeinde" },
      { id: "t4-2", label: "Abs. 2 — Bauvorlagenverordnung" },
      { id: "t4-3", label: "Abs. 3 — Fristen" },
    ],
    relatedProcedures: [
      { id: "rp-4", name: "Art. 63 BayBO", paragraph: "Genehmigungsfreistellung" },
    ],
    downloads: [
      { id: "dl-5", filename: "BayBO_2024.pdf", filetype: "pdf", size: "3.1 MB" },
      { id: "dl-6", filename: "BauVorlV_Bayern.xlsx", filetype: "xlsx", size: "89 KB" },
    ],
    referencedLaws: ["BayBO Art. 63", "BauGB § 29", "BauVorlV"],
    fachbereich: "Bauamt",
    bundesland: "Bayern",
    zeitraum: "Aktuell",
  },
  {
    id: "doc-5",
    title: "Verfahrensrichtlinie für Lärmschutz im Bauaufsichtsverfahren",
    type: "Verfahren",
    relevance: 65,
    isFavorite: false,
    authority: "Umweltministerium",
    date: "03.08.2023",
    legalArea: "Immissionsschutzrecht",
    snippet:
      "Diese Richtlinie beschreibt das Verfahren zur Prüfung von Lärmschutzanforderungen im Rahmen der Baugenehmigung und verweist auf die TA-Lärm.",
    fullText:
      "Verfahrensrichtlinie für Lärmschutz im Bauaufsichtsverfahren\n\nBei Bauvorhaben mit zu erwartenden Lärmimmissionen ist eine schalltechnische Untersuchung nach TA-Lärm durchzuführen. Die Ergebnisse sind dem Bauantrag beizufügen.",
    toc: [
      { id: "t5-1", label: "1. Anwendungsbereich" },
      { id: "t5-2", label: "2. Schalltechnische Untersuchung" },
      { id: "t5-3", label: "3. Grenzwerte" },
    ],
    relatedProcedures: [],
    downloads: [
      { id: "dl-7", filename: "Laermschutz_Richtlinie_2023.pdf", filetype: "pdf", size: "1.2 MB" },
    ],
    referencedLaws: ["TA-Lärm", "BImSchG § 41"],
    fachbereich: "Umweltamt",
    bundesland: "Hessen",
    zeitraum: "Aktuell",
  },
  {
    id: "doc-6",
    title: "Muster-Stellplatzsatzung für Kommunen",
    type: "Vorlagen",
    relevance: 80,
    isFavorite: false,
    authority: "Städtetag",
    date: "10.11.2023",
    legalArea: "Bauplanungsrecht",
    snippet:
      "Mustervorlage für eine kommunale Stellplatzsatzung nach § 48 BauO NRW. Enthält Richtwerte für notwendige Stellplätze nach Nutzungsart.",
    fullText:
      "Muster-Stellplatzsatzung für Kommunen\n\nDiese Mustersatzung dient als Vorlage für Kommunen zur Regelung der Stellplatzpflicht nach § 48 BauO NRW.",
    toc: [
      { id: "t6-1", label: "§ 1 Geltungsbereich" },
      { id: "t6-2", label: "§ 2 Anzahl der Stellplätze" },
      { id: "t6-3", label: "§ 3 Ablösung" },
    ],
    relatedProcedures: [],
    downloads: [
      { id: "dl-8", filename: "Stellplatzsatzung_Muster.docx", filetype: "docx", size: "230 KB" },
    ],
    referencedLaws: ["BauO NRW § 48", "BauGB § 29"],
    fachbereich: "Bauamt",
    bundesland: "NRW",
    zeitraum: "Aktuell",
  },
  {
    id: "doc-7",
    title: "FAQ zur Genehmigungsfreiheit von Carports",
    type: "FAQs",
    relevance: 55,
    isFavorite: false,
    authority: "Bauaufsicht",
    date: "Gestern",
    legalArea: "Bauordnungsrecht",
    snippet:
      "Häufig gestellte Fragen zur Genehmigungsfreiheit von Carports nach § 65 BauO NRW. Behandelt Grenzbebauung, Größenbeschränkungen und baurechtliche Voraussetzungen.",
    fullText:
      "FAQ zur Genehmigungsfreiheit von Carports\n\nF: Ist ein Carport genehmigungsfrei?\nA: Ja, unter bestimmten Voraussetzungen. § 65 BauO NRW regelt die Verfahrensfreiheit für Carports bis 30 m² Grundfläche und 3 m Höhe.\n\nF: Darf ein Carport an die Grundstücksgrenze gebaut werden?\nA: Nein, auch genehmigungsfreie Vorhaben müssen die Abstandsflächen nach § 6 BauO NRW einhalten.",
    toc: [
      { id: "t7-1", label: "Genehmigungsfreiheit" },
      { id: "t7-2", label: "Grenzbebauung" },
      { id: "t7-3", label: "Größenbeschränkungen" },
    ],
    relatedProcedures: [
      { id: "rp-5", name: "§ 65 BauO NRW", paragraph: "Bauantrag und Bauvorlagen" },
    ],
    downloads: [],
    referencedLaws: ["BauO NRW § 65", "BauO NRW § 6"],
    fachbereich: "Bauamt",
    bundesland: "NRW",
    zeitraum: "Aktuell",
  },
];
