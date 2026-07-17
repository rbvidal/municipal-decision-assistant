import { CaseDocument } from './types';

export const mockCases: CaseDocument[] = [
  {
    caseId: 'BAU-2026-0147',
    statusLabel: 'Prüfung',
    title: 'Neubau MFH "Am Stadtpark"',
    submittedAt: '14. Okt 2024, 09:42 Uhr',
    submittedBy: 'Sabine Müller',
    protocolSteps: [
      {
        id: 'step-1',
        title: 'Formelle Prüfung',
        description: 'Abgeschlossen durch S. Müller',
        status: 'completed',
      },
      {
        id: 'step-2',
        title: 'Fachliche Stellungnahme',
        description: 'Umweltamt eingetroffen',
        status: 'completed',
      },
      {
        id: 'step-3',
        title: 'Vorgesetzten-Freigabe',
        description: 'Aktueller Schritt',
        status: 'pending',
      },
    ],
    attachments: [
      {
        id: 'attach-1',
        name: 'Bauplan_V3.pdf',
        size: '4.2 MB',
      }
    ],
    draftTitle: 'Bescheid über die Baugenehmigung',
    draftVersion: 'v2.1',
    draftContentHtml: `
      <p class="mb-4">Dem Antrag der <strong>Invest Bau GmbH</strong> vom 12.08.2024 auf Erteilung einer Baugenehmigung für die Errichtung eines Mehrfamilienwohnhauses mit Tiefgarage auf dem Grundstück Gemarkung Mitte, Flur 4, Flurstück 892/12 (Am Stadtpark 14) wird unter folgenden Auflagen stattgegeben:</p>
      
      <ol class="list-decimal pl-6 space-y-3 mb-6">
        <li>Die Stellplatzverpflichtung gemäß § 12 BauO NRW wird durch Ablösevereinbarung erfüllt.</li>
        <li>Die Dachbegrünung ist gemäß dem vorgelegten Freiflächengestaltungsplan auszuführen.</li>
        <li>Die Lärmschutzvorgaben des Gutachtens vom 01.09.2024 sind bindend.</li>
      </ol>
      
      <p class="mb-4"><strong>Begründung:</strong> Das Vorhaben entspricht den Festsetzungen des Bebauungsplans Nr. 45 "Stadtpark West". Die bauordnungsrechtlichen Anforderungen werden gewahrt...</p>
    `,
    verifications: [
      {
        id: 'ver-1',
        title: 'Gebührenprüfung erfolgreich',
        description: 'Die berechnete Gebühr von 4.280,00 € entspricht der Verwaltungsgebührenordnung (Tarifstelle 4.1.2).',
        status: 'success',
      },
      {
        id: 'ver-2',
        title: 'Fristen gewahrt',
        description: 'Bearbeitungszeitraum: 62 Tage. Gesetzliche Frist von 90 Tagen eingehalten.',
        status: 'success',
      },
      {
        id: 'ver-3',
        title: 'Zitierweise geprüft',
        description: 'Alle gesetzlichen Bezüge (§ 34 BauGB, § 12 BauO) sind korrekt referenziert und aktuell.',
        status: 'success',
      },
    ],
    riskRating: 'GERING',
    riskTitle: 'Widerspruchspotenzial',
    riskDescription: 'Keine Nachbareinwendungen im Vorfeld bekannt. Das Projekt entspricht dem Bebauungsplan zu 100%.',
    precedents: [
      {
        caseId: 'BAU-2023-0912',
        date: 'Sep 2023',
        title: 'Wohnanlage "Grüner Bogen"',
        description: 'Ähnliche Auflagen zur Stellplatzablöse und Lärmschutz.',
        relevance: '92% Übereinstimmung',
      },
      {
        caseId: 'BAU-2024-0015',
        date: 'Jan 2024',
        title: 'MFH Schillerstraße',
        description: 'Referenzfall für Dachbegrünungsvorgaben in Mischgebieten.',
        relevance: '85% Übereinstimmung',
      },
    ],
    recommendation: 'Auf Basis der formellen Korrektheit und der Deckungsgleichheit mit den Präzedenzfällen BAU-2023-0912 wird die Genehmigung ohne weitere Rücksprache empfohlen.',
  },
  {
    caseId: 'BAU-2026-0158',
    statusLabel: 'Prüfung',
    title: 'Anbau Wintergarten Müller',
    submittedAt: '12. Nov 2024, 14:15 Uhr',
    submittedBy: 'Sabine Müller',
    protocolSteps: [
      {
        id: 'step-1',
        title: 'Formelle Prüfung',
        description: 'Abgeschlossen durch S. Müller',
        status: 'completed',
      },
      {
        id: 'step-2',
        title: 'Fachliche Stellungnahme',
        description: 'Beteiligung Nachbarn läuft',
        status: 'pending',
      },
      {
        id: 'step-3',
        title: 'Vorgesetzten-Freigabe',
        description: 'Ausstehend',
        status: 'pending',
      },
    ],
    attachments: [
      {
        id: 'attach-2',
        name: 'Wintergarten_Skizze_V1.pdf',
        size: '1.8 MB',
      }
    ],
    draftTitle: 'Bescheid über die Baugenehmigung (Entwurf)',
    draftVersion: 'v1.0',
    draftContentHtml: `
      <p class="mb-4">Dem Antrag von <strong>Dr. Hans-Werner Müller</strong> vom 01.11.2024 auf Erteilung einer Baugenehmigung für den Anbau eines beheizten Wintergartens an das bestehende Wohnhaus auf dem Grundstück Flurstück 104/5, Am Waldhang 12 wird unter folgenden Auflagen stattgegeben:</p>
      
      <ol class="list-decimal pl-6 space-y-3 mb-6">
        <li>Die Grenzabstände gemäß § 6 BauO NRW sind zwingend einzuhalten.</li>
        <li>Die Entwässerung des Glasdachs hat über das hauseigene Kanalnetz zu erfolgen.</li>
      </ol>
      
      <p class="mb-4"><strong>Begründung:</strong> Es handelt sich um ein untergeordnetes Bauteil. Eine Beeinträchtigung nachbarlicher Belange ist bei Einhaltung der Abstandsflächen nicht zu besorgen...</p>
    `,
    verifications: [
      {
        id: 'ver-1',
        title: 'Gebührenprüfung erfolgreich',
        description: 'Mindestgebühr von 150,00 € veranschlagt.',
        status: 'success',
      },
      {
        id: 'ver-2',
        title: 'Fristen gewahrt',
        description: 'Bearbeitungszeitraum: 14 Tage.',
        status: 'success',
      },
      {
        id: 'ver-3',
        title: 'Grenzabstand-Warnung',
        description: 'Grenzabstand ist mit 3,02m sehr nah an der gesetzlichen Mindestgrenze von 3,00m.',
        status: 'warning',
      },
    ],
    riskRating: 'MITTEL',
    riskTitle: 'Grenznähe & Beschattung',
    riskDescription: 'Potenzielle Beschwerde des Nachbarn wg. Lichtentzug möglich, da der Wintergarten nah an der Nordgrenze liegt.',
    precedents: [
      {
        caseId: 'BAU-2022-1104',
        date: 'Nov 2022',
        title: 'Wintergarten-Anbau Dahlienweg',
        description: 'Nachbarwiderspruch wegen Grenzabstand abgewiesen, da 3m eingehalten wurden.',
        relevance: '95% Übereinstimmung',
      }
    ],
    recommendation: 'Aufgrund der knappen Einhaltung des Grenzabstands wird empfohlen, vor endgültiger Freigabe die schriftliche Zustimmung des Nachbarn abzufragen.',
  },
  {
    caseId: 'BAU-2026-0099',
    statusLabel: 'Wiedervorlage',
    title: 'Sanierung Gewerbehalle West',
    submittedAt: '05. Aug 2024, 11:30 Uhr',
    submittedBy: 'Sabine Müller',
    protocolSteps: [
      {
        id: 'step-1',
        title: 'Formelle Prüfung',
        description: 'Abgeschlossen durch S. Müller',
        status: 'completed',
      },
      {
        id: 'step-2',
        title: 'Fachliche Stellungnahme',
        description: 'Brandschutzgutachten mangelhaft',
        status: 'failed',
      },
      {
        id: 'step-3',
        title: 'Vorgesetzten-Freigabe',
        description: 'Aktueller Schritt',
        status: 'pending',
      },
    ],
    attachments: [
      {
        id: 'attach-3',
        name: 'Brandschutz_Konz_V2.pdf',
        size: '8.4 MB',
      }
    ],
    draftTitle: 'Versagung der Baugenehmigung',
    draftVersion: 'v3.2',
    draftContentHtml: `
      <p class="mb-4">Der Antrag der <strong>Logistik GmbH West</strong> vom 15.06.2024 auf Erteilung einer Baugenehmigung zur Sanierung und Nutzungsänderung der Gewerbehalle wird <strong>abgelehnt</strong>.</p>
      
      <p class="mb-4"><strong>Begründung:</strong> Das Vorhaben widerspricht den Brandschutzanforderungen der BauO NRW. Rettungswege sind im aktuellen Planentwurf nicht ausreichend dimensioniert. Das Brandschutzkonzept wurde vom Sachverständigen beanstandet.</p>
    `,
    verifications: [
      {
        id: 'ver-1',
        title: 'Gebührenprüfung offen',
        description: 'Festsetzung erfolgt nach Abschluss des Versagungsverfahrens.',
        status: 'warning',
      },
      {
        id: 'ver-2',
        title: 'Fristen gewahrt',
        description: 'Bearbeitungszeitraum: 41 Tage.',
        status: 'success',
      },
      {
        id: 'ver-3',
        title: 'Feuerlöschzonen fehlen',
        description: 'Zufahrten für Rettungskräfte entsprechen nicht den Vorgaben nach DIN 14090.',
        status: 'error',
      },
    ],
    riskRating: 'HOCH',
    riskTitle: 'Brandschutz & Haftung',
    riskDescription: 'Die Versagung ist rechtlich geboten. Ein positiver Bescheid würde ein unkalkulierbares Haftungsrisiko bedeuten.',
    precedents: [
      {
        caseId: 'BAU-2021-0402',
        date: 'Apr 2021',
        title: 'Hallenumbau Industriestraße',
        description: 'Versagung rechtskräftig bestätigt wegen unzureichendem ersten Rettungsweg.',
        relevance: '98% Übereinstimmung',
      }
    ],
    recommendation: 'Es wird dringend empfohlen, den Versagungsbescheid zu erlassen oder das Verfahren zwecks Nachbesserung des Brandschutzkonzepts ruhen zu lassen.',
  }
];
