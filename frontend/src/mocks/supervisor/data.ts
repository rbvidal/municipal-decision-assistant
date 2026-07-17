export type RiskRating = 'GERING' | 'MITTEL' | 'HOCH';

export interface ProtocolStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface AttachmentItem {
  id: string;
  name: string;
  size?: string;
}

export interface VerificationItem {
  id: string;
  title: string;
  description: string;
  status: 'success' | 'warning' | 'error';
}

export interface PrecedentCase {
  caseId: string;
  date: string;
  title: string;
  description: string;
  relevance: string;
}

export interface SupervisorCase {
  caseId: string;
  statusLabel: string;
  title: string;
  submittedAt: string;
  submittedBy: string;
  protocolSteps: ProtocolStep[];
  attachments: AttachmentItem[];
  draftTitle: string;
  draftVersion: string;
  draftConditions: string[];
  verifications: VerificationItem[];
  riskRating: RiskRating;
  riskTitle: string;
  riskDescription: string;
  precedents: PrecedentCase[];
  recommendation: string;
}

export const supervisorCases: SupervisorCase[] = [
  {
    caseId: 'BAU-2026-0147',
    statusLabel: 'Prüfung',
    title: 'Neubau MFH „Am Stadtpark"',
    submittedAt: '14. Okt 2024',
    submittedBy: 'Sabine Müller',
    protocolSteps: [
      { id: 'ps1', title: 'Formelle Prüfung', description: 'Vollständigkeit der Bauvorlagen bestätigt.', status: 'completed' },
      { id: 'ps2', title: 'Fachliche Stellungnahme', description: 'Übereinstimmung mit B-Plan Nr. 345 geprüft.', status: 'completed' },
      { id: 'ps3', title: 'Vorgesetzten-Freigabe', description: 'Warten auf Genehmigung durch Vorgesetzten.', status: 'pending' },
    ],
    attachments: [
      { id: 'a1', name: 'Bauplan_V3.pdf', size: '4.2 MB' },
      { id: 'a2', name: 'B-Plan_Auszug.pdf', size: '1.8 MB' },
    ],
    draftTitle: 'Bescheid über die Baugenehmigung',
    draftVersion: 'v2.1',
    draftConditions: [
      'Die Stellplatzsatzung der Gemeinde ist einzuhalten. Es sind mindestens 12 Stellplätze nachzuweisen.',
      'Für die Dachflächen ist ein Gründach mit mindestens 10 cm Substrathöhe vorzusehen.',
      'Die Schallschutzanforderungen nach DIN 4109 sind einzuhalten. Ein entsprechender Nachweis ist vor Baubeginn vorzulegen.',
    ],
    verifications: [
      { id: 'v1', title: 'Gebührenprüfung erfolgreich', description: 'Gebühren in Höhe von 4.280,00 EUR wurden berechnet und zugewiesen.', status: 'success' },
      { id: 'v2', title: 'Fristenprüfung bestanden', description: 'Bearbeitungsfrist von 62 von 90 Tagen. 28 Tage verbleibend.', status: 'success' },
      { id: 'v3', title: 'Zitate und Verweise geprüft', description: 'Alle referenzierten Vorschriften sind aktuell und anwendbar.', status: 'success' },
    ],
    riskRating: 'GERING',
    riskTitle: 'Widerspruchspotenzial',
    riskDescription: 'Keine Nachbareinwendungen dokumentiert. 100% Übereinstimmung mit B-Plan. Geringe Wahrscheinlichkeit eines erfolgreichen Widerspruchs.',
    precedents: [
      { caseId: 'BAU-2023-0912', date: '12.03.2023', title: 'Neubau MFH Goethestraße', description: 'Ähnliches Mehrfamilienhaus mit vergleichbarer Geschossfläche und Stellplatznachweis.', relevance: '92% Übereinstimmung' },
      { caseId: 'BAU-2024-0015', date: '05.01.2024', title: 'Neubau MFH Schillerweg', description: 'Genehmigt nach Einspruch wegen Gründach-Auflage. Einspruch wurde abgewiesen.', relevance: '85% Übereinstimmung' },
    ],
    recommendation: 'Genehmigung ohne weitere Rücksprache erteilen. Alle Auflagen wurden geprüft und sind rechtmäßig.',
  },
  {
    caseId: 'BAU-2026-0158',
    statusLabel: 'Prüfung',
    title: 'Anbau Wintergarten Müller',
    submittedAt: '12. Nov 2024',
    submittedBy: 'Sabine Müller',
    protocolSteps: [
      { id: 'ps1', title: 'Formelle Prüfung', description: 'Bauvorlagen vollständig eingereicht.', status: 'completed' },
      { id: 'ps2', title: 'Fachliche Stellungnahme', description: 'Grenzabstandsprüfung erforderlich.', status: 'pending' },
      { id: 'ps3', title: 'Vorgesetzten-Freigabe', description: 'Noch nicht begonnen.', status: 'pending' },
    ],
    attachments: [
      { id: 'a1', name: 'Wintergarten_Skizze_V1.pdf', size: '1.8 MB' },
    ],
    draftTitle: 'Bescheid über die Baugenehmigung (Entwurf)',
    draftVersion: 'v1.0',
    draftConditions: [
      'Der Wintergarten muss einen Mindestabstand von 3,00 m zur Grundstücksgrenze einhalten.',
      'Die Entwässerung ist an das bestehende Regenwassersystem anzuschließen.',
    ],
    verifications: [
      { id: 'v1', title: 'Gebührenprüfung erfolgreich', description: 'Gebühren in Höhe von 1.850,00 EUR berechnet.', status: 'success' },
      { id: 'v2', title: 'Fristenprüfung bestanden', description: 'Bearbeitungsfrist von 42 von 90 Tagen.', status: 'success' },
      { id: 'v3', title: 'Grenzabstand-Warnung', description: 'Abstand 3,02 m gemessen. Erforderlich: 3,00 m. Grenzwert knapp eingehalten.', status: 'warning' },
    ],
    riskRating: 'MITTEL',
    riskTitle: 'Grenznähe & Beschattung',
    riskDescription: 'Grenznahe Bebauung könnte zu Nachbareinwänden führen. Beschattung des Nachbargrundstücks im Winterhalbjahr möglich.',
    precedents: [
      { caseId: 'BAU-2022-1104', date: '18.07.2022', title: 'Wintergarten Schmidt', description: 'Ähnlicher Anbau mit Grenzbebauung. Genehmigt nach schriftlicher Nachbarzustimmung.', relevance: '95% Übereinstimmung' },
    ],
    recommendation: 'Schriftliche Nachbarzustimmung vor endgültiger Genehmigung einholen. Alternativ Auflage zur Grenzabstandswahrung verschärfen.',
  },
  {
    caseId: 'BAU-2026-0099',
    statusLabel: 'Wiedervorlage',
    title: 'Sanierung Gewerbehalle West',
    submittedAt: '05. Aug 2024',
    submittedBy: 'Sabine Müller',
    protocolSteps: [
      { id: 'ps1', title: 'Formelle Prüfung', description: 'Bauvorlagen unvollständig — Brandschutznachweis fehlt.', status: 'completed' },
      { id: 'ps2', title: 'Fachliche Stellungnahme', description: 'Brandschutz Mängel festgestellt. Feuerwehrzufahrt nicht gesichert.', status: 'failed' },
      { id: 'ps3', title: 'Vorgesetzten-Freigabe', description: 'Blockiert durch fachliche Mängel.', status: 'pending' },
    ],
    attachments: [
      { id: 'a1', name: 'Brandschutz_Konz_V2.pdf', size: '8.4 MB' },
      { id: 'a2', name: 'Grundriss_Halle.pdf', size: '3.1 MB' },
    ],
    draftTitle: 'Versagung der Baugenehmigung',
    draftVersion: 'v3.2',
    draftConditions: [
      'Der Brandschutznachweis entspricht nicht den Anforderungen der BauO NRW § 65.',
      'Die Feuerwehrzufahrt gemäß DIN 14090 ist nicht nachgewiesen.',
    ],
    verifications: [
      { id: 'v1', title: 'Gebühren prüfen', description: 'Gebührenrechnung noch nicht erstellt.', status: 'warning' },
      { id: 'v2', title: 'Fristenprüfung', description: 'Frist überschritten: 112 von 90 Tagen.', status: 'success' },
      { id: 'v3', title: 'Brandschutzprüfung fehlgeschlagen', description: 'Feuerwehrzufahrt gemäß DIN 14090 nicht vorhanden. Flächen für die Feuerwehr fehlen.', status: 'error' },
    ],
    riskRating: 'HOCH',
    riskTitle: 'Brandschutz & Haftung',
    riskDescription: 'Schwerwiegende Brandschutzmängel machen eine Versagung rechtlich erforderlich. Bei Genehmigung drohen Haftungsrisiken für die Behörde.',
    precedents: [
      { caseId: 'BAU-2021-0402', date: '22.11.2021', title: 'Gewerbehalle Nord — Versagung', description: 'Baulich identische Situation mit unzureichendem Brandschutzkonzept. Versagung wurde gerichtlich bestätigt.', relevance: '98% Übereinstimmung' },
    ],
    recommendation: 'Versagung aussprechen. Dem Antragsteller die Möglichkeit zur Nachbesserung des Brandschutzkonzepts einräumen und Wiedervorlage nach 4 Wochen.',
  },
];
