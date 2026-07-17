import { DocumentItem, CategoryItem } from './types';

export const categories: CategoryItem[] = [
  { id: 'Vorschriften', label: 'Vorschriften', icon: 'gavel', count: 124 },
  { id: 'Verfahren', label: 'Verfahren', icon: 'account_tree' },
  { id: 'Vorlagen', label: 'Vorlagen', icon: 'description' },
  { id: 'Checklisten', label: 'Checklisten', icon: 'checklist' },
  { id: 'FAQs', label: 'FAQs', icon: 'help_center' },
  { id: 'Rundschreiben', label: 'Rundschreiben', icon: 'campaign' },
  { id: 'Formulare', label: 'Formulare', icon: 'list_alt' }
];

export const initialDocuments: DocumentItem[] = [
  {
    id: 'doc-1',
    title: '§ 65 BauO NRW – Bauantrag und Bauvorlagen',
    type: 'Vorschriften',
    relevance: 95,
    isFavorite: true,
    authority: 'Land NRW',
    date: 'Aktualisiert: 15.05.2024',
    legalArea: 'Bauordnungsrecht',
    snippet: '(1) Der Bauantrag ist schriftlich bei der Bauaufsichtsbehörde einzureichen. Er muss von der Bauherrin oder dem Bauherrn und der Entwurfsverfasserin oder dem Entwurfsverfasser unterschrieben sein...',
    fullText: '§ 65 regelt die formellen Anforderungen an einen Bauantrag in NRW. Wesentlich ist die Unterschrift beider Parteien (Bauherr & Entwurfsverfasser) sowie die Einreichung in Textform.',
    toc: [
      { id: 'toc-1', label: 'Abs. 1 - Schriftform' },
      { id: 'toc-2', label: 'Abs. 2 - Bauvorlagen' },
      { id: 'toc-3', label: 'Abs. 3 - Sonderregelung' },
      { id: 'toc-4', label: 'Abs. 4 - Elektronische Einreichung' }
    ],
    relatedProcedures: [
      { id: 'proc-1', name: 'Baugenehmigung (§ 64)', paragraph: '§ 64' },
      { id: 'proc-2', name: 'Bauvorbescheid (§ 77)', paragraph: '§ 77' }
    ],
    downloads: [
      { id: 'dl-1', filename: 'Antragsformular_v12.pdf', filetype: 'pdf', size: '1.2 MB' },
      { id: 'dl-2', filename: 'Checkliste_Bauvorlagen.docx', filetype: 'docx', size: '450 KB' }
    ],
    referencedLaws: ['BauGB § 29', 'BauO NRW § 7', 'BauPrüfVO'],
    fachbereich: 'Bauamt',
    bundesland: 'NRW',
    zeitraum: 'Aktuell'
  },
  {
    id: 'doc-2',
    title: '§ 64 BauO NRW – Vereinfachtes Baugenehmigungsverfahren',
    type: 'Vorschriften',
    relevance: 70,
    isFavorite: false,
    authority: 'Land NRW',
    date: 'Stand: 01.01.2024',
    legalArea: 'Bauordnungsrecht',
    snippet: 'Das vereinfachte Baugenehmigungsverfahren wird durchgeführt für die Errichtung, Änderung oder Nutzungsänderung von Anlagen, die keine Sonderbauten sind...',
    fullText: 'Das vereinfachte Baugenehmigungsverfahren nach § 64 regelt die Prüfung von Bauanträgen für reguläre Wohngebäude und kleinere Gewerbeobjekte. Der Prüfumfang der Behörde ist hierbei gesetzlich eingeschränkt, um das Verfahren zu beschleunigen.',
    toc: [
      { id: 'toc-2-1', label: 'Abs. 1 - Anwendungsbereich' },
      { id: 'toc-2-2', label: 'Abs. 2 - Prüfungsverzicht' },
      { id: 'toc-2-3', label: 'Abs. 3 - Fiktionsfristen' }
    ],
    relatedProcedures: [
      { id: 'proc-1', name: 'Baugenehmigung (§ 64)', paragraph: '§ 64' }
    ],
    downloads: [
      { id: 'dl-3', filename: 'Handreichung_Vereinfacht.pdf', filetype: 'pdf', size: '850 KB' }
    ],
    referencedLaws: ['BauO NRW § 65', 'BauGB § 34'],
    fachbereich: 'Bauamt',
    bundesland: 'NRW',
    zeitraum: 'Aktuell'
  },
  {
    id: 'doc-3',
    title: 'VV BauO NRW – Zu § 65 Bauantrag und Bauvorlagen',
    type: 'Vorschriften',
    relevance: 85,
    isFavorite: false,
    authority: 'Erlass',
    date: 'Ministerium',
    legalArea: 'Bauordnungsrecht',
    snippet: 'Verwaltungsvorschrift zur Ausführung der Bauordnung. Erläuterungen zur formellen Vollständigkeit des Bauantrags und der erforderlichen Pläne...',
    fullText: 'Diese Verwaltungsvorschrift (VV) konkretisiert die gesetzlichen Bestimmungen der Bauordnung NRW bezüglich des Bauantrags und der beizufügenden Bauvorlagen (Pläne, Berechnungen, Nachweise). Sie dient als Richtlinie für Sachbearbeiter in den Bauämtern.',
    toc: [
      { id: 'toc-3-1', label: 'Ziff. 65.1 - Formularvorgaben' },
      { id: 'toc-3-2', label: 'Ziff. 65.2 - Plangrundlagen' },
      { id: 'toc-3-3', label: 'Ziff. 65.3 - Ausnahmen und Befreiungen' }
    ],
    relatedProcedures: [
      { id: 'proc-1', name: 'Baugenehmigung (§ 64)', paragraph: '§ 64' }
    ],
    downloads: [
      { id: 'dl-4', filename: 'VV_BauO_NRW_Erlass.pdf', filetype: 'pdf', size: '2.4 MB' }
    ],
    referencedLaws: ['BauO NRW § 65', 'BauO NRW § 64', 'BauPrüfVO'],
    fachbereich: 'Bauamt',
    bundesland: 'NRW',
    zeitraum: 'Aktuell'
  },
  {
    id: 'doc-4',
    title: 'Art. 64 BayBO – Bauantrag und Bauvorlagen in Bayern',
    type: 'Vorschriften',
    relevance: 90,
    isFavorite: false,
    authority: 'Freistaat Bayern',
    date: 'Aktualisiert: 01.03.2024',
    legalArea: 'Bauordnungsrecht (Bayern)',
    snippet: '(1) Der Bauantrag ist bei der Gemeinde einzureichen. Die Gemeinde legt den Bauantrag mit ihrer Stellungnahme innerhalb von zwei Wochen der Bauaufsichtsbehörde vor...',
    fullText: 'Art. 64 der Bayerischen Bauordnung (BayBO) regelt das formelle Verfahren zur Einreichung des Bauantrags im Freistaat Bayern. Anders als in NRW erfolgt die Einreichung primär bei der Gemeinde, die den Antrag weiterleitet.',
    toc: [
      { id: 'toc-4-1', label: 'Abs. 1 - Einreichung Gemeinde' },
      { id: 'toc-4-2', label: 'Abs. 2 - Unterschriftenregelung' },
      { id: 'toc-4-3', label: 'Abs. 3 - Elektronisches Verfahren' }
    ],
    relatedProcedures: [
      { id: 'proc-3', name: 'Vereinfachtes Verfahren (Art. 59)', paragraph: 'Art. 59' }
    ],
    downloads: [
      { id: 'dl-5', filename: 'Bay_Bauantrag_Formular.pdf', filetype: 'pdf', size: '1.5 MB' }
    ],
    referencedLaws: ['BayBO Art. 59', 'BauGB § 29'],
    fachbereich: 'Bauamt',
    bundesland: 'Bayern',
    zeitraum: 'Aktuell'
  },
  {
    id: 'doc-5',
    title: 'Verfahrensrichtlinie für Lärmschutz im Bauaufsichtsverfahren',
    type: 'Verfahren',
    relevance: 65,
    isFavorite: false,
    authority: 'Umweltministerium',
    date: 'Stand: 15.09.2023',
    legalArea: 'Immissionsschutzrecht',
    snippet: 'Richtlinie zur Bewertung von gewerblichem und privatem Lärm im Rahmen von Baugenehmigungen. Festlegung der zulässigen Dezibelwerte in Wohngebieten...',
    fullText: 'Diese Richtlinie koordiniert das Zusammenspiel zwischen Bauamt und Umweltamt bei der Prüfung von Lärmemissionen. Sie gibt standardisierte Berechnungswege und Abwägungsprozesse für Sachbearbeiter vor.',
    toc: [
      { id: 'toc-5-1', label: '1. Einleitung & Zielsetzung' },
      { id: 'toc-5-2', label: '2. Schalltechnische Nachweise' },
      { id: 'toc-5-3', label: '3. Grenzwerte nach TA Lärm' }
    ],
    relatedProcedures: [
      { id: 'proc-1', name: 'Baugenehmigung (§ 64)', paragraph: '§ 64' }
    ],
    downloads: [
      { id: 'dl-6', filename: 'Laermschutz_Richtlinie_2023.pdf', filetype: 'pdf', size: '1.8 MB' }
    ],
    referencedLaws: ['BImSchG § 22', 'TA Lärm', 'BauO NRW § 15'],
    fachbereich: 'Umweltamt',
    bundesland: 'Hessen',
    zeitraum: 'Aktuell'
  },
  {
    id: 'doc-6',
    title: 'Muster-Stellplatzsatzung für Kommunen',
    type: 'Vorlagen',
    relevance: 80,
    isFavorite: false,
    authority: 'Städtetag',
    date: 'Stand: 10.12.2023',
    legalArea: 'Kommunalrecht',
    snippet: 'Musterformulierung für eine kommunale Satzung über die Herstellung, Ablösung und Gestaltung von notwendigen Stellplätzen für Kraftfahrzeuge und Fahrräder...',
    fullText: 'Diese Mustervorlage erleichtert Städten und Gemeinden den Erlass einer eigenen Stellplatzsatzung. Sie enthält rechtssichere Klauseln für Stellplatzschlüssel, Ablösebeträge und Fahrradabstellplätze.',
    toc: [
      { id: 'toc-6-1', label: '§ 1 Geltungsbereich' },
      { id: 'toc-6-2', label: '§ 2 Anzahl notwendiger Stellplätze' },
      { id: 'toc-6-3', label: '§ 3 Ablösungsbetrag' }
    ],
    relatedProcedures: [],
    downloads: [
      { id: 'dl-7', filename: 'Muster_Stellplatzsatzung.docx', filetype: 'docx', size: '320 KB' }
    ],
    referencedLaws: ['BauO NRW § 48', 'GO NRW § 7'],
    fachbereich: 'Bauamt',
    bundesland: 'NRW',
    zeitraum: 'Aktuell'
  },
  {
    id: 'doc-7',
    title: 'FAQ zur Genehmigungsfreiheit von Carports',
    type: 'FAQs',
    relevance: 55,
    isFavorite: false,
    authority: 'Bauaufsicht',
    date: 'Gestern',
    legalArea: 'Bauordnungsrecht',
    snippet: 'Häufig gestellte Fragen zu Grenzbebauung, maximalen Abmessungen und Höhen von Carports und Garagen, die ohne formelles Baugenehmigungsverfahren errichtet werden dürfen...',
    fullText: 'Diese Übersicht beantwortet Bürger- und Architektenfragen bezüglich verfahrensfreier Bauvorhaben nach § 62 BauO NRW. Behandelt werden Abstandsflächen, Nutzungsänderungen und Brandwände.',
    toc: [
      { id: 'toc-7-1', label: 'Frage 1: Wann ist ein Carport genehmigungsfrei?' },
      { id: 'toc-7-2', label: 'Frage 2: Welche Grenzabstände gelten?' },
      { id: 'toc-7-3', label: 'Frage 3: Wie wird die mittlere Wandhöhe berechnet?' }
    ],
    relatedProcedures: [],
    downloads: [
      { id: 'dl-8', filename: 'FAQ_Carports_Flyer.pdf', filetype: 'pdf', size: '600 KB' }
    ],
    referencedLaws: ['BauO NRW § 62', 'BauO NRW § 6'],
    fachbereich: 'Bauamt',
    bundesland: 'NRW',
    zeitraum: 'Aktuell'
  }
];

export const mockHistory = [
  { id: 'hist-1', name: 'Baugenehmigung-Vorgang-02', time: 'Vor 20 Min.' },
  { id: 'hist-2', name: 'VStättVO NRW', time: 'Gestern' },
  { id: 'hist-3', name: 'Abbruchgenehmigung Muster', time: 'Letzte Woche' }
];
