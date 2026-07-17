import { Document, DocumentStatus } from "./types";

export const mockDocuments: Document[] = [
  {
    id: "doc-1",
    name: "Bauantrag_Carport.pdf",
    vorgangId: "BAU-2026-0147",
    buerger: "Thomas Becker",
    typ: "Antrag",
    version: "v1.0",
    status: DocumentStatus.Aktiv,
    geaendert: "Heute 10:45",
    dokumentId: "DOC-9921-A",
    detailedTyp: "Digitaler Antrag",
    dateigroesse: "1.2 MB",
    hochgeladenAm: "Heute, 10:45 Uhr",
    versions: [
      { version: "v1.1 (Aktuell)", date: "Heute, 10:45", author: "S. Müller", isCurrent: true },
      { version: "v1.0", date: "14. Okt, 09:12", author: "T. Becker", isCurrent: false },
    ],
    references: [
      { id: "ref-1", title: "§65 BauO NRW (Genehmigungsfrei)", type: "gavel" },
      { id: "ref-2", title: "Standard-Vorlage Carport v2.0", type: "article" },
    ],
    history: [
      { id: "h1", title: "Freigabe durch Fachbereich", timestamp: "Heute, 11:20", author: "S. Müller", status: "completed" },
      { id: "h2", title: "OCR erfolgreich abgeschlossen", timestamp: "Heute, 10:47", author: "System", status: "system" },
      { id: "h3", title: "Hochgeladen", timestamp: "Heute, 10:45", author: "Portal", status: "info" },
    ],
    ocrStatus: "COMPLETED",
    vektorisierung: "SUCCESS",
    chunkCount: 42,
    vectorId: "vtx_8812_099x_abc",
  },
  {
    id: "doc-2",
    name: "Lageplan_V2.pdf",
    vorgangId: "BAU-2026-0147",
    buerger: "Thomas Becker",
    typ: "Lageplan",
    version: "v2.1",
    status: DocumentStatus.InPruefung,
    geaendert: "Gestern 16:20",
    dokumentId: "DOC-9921-B",
    detailedTyp: "Digitaler Lageplan",
    dateigroesse: "4.5 MB",
    hochgeladenAm: "Gestern, 16:20 Uhr",
    versions: [
      { version: "v2.1 (Aktuell)", date: "Gestern, 16:20", author: "T. Becker", isCurrent: true },
      { version: "v2.0", date: "10. Okt, 14:15", author: "T. Becker", isCurrent: false },
    ],
    references: [
      { id: "ref-1", title: "§65 BauO NRW (Genehmigungsfrei)", type: "gavel" },
    ],
    history: [
      { id: "h-l1", title: "In Prüfung genommen", timestamp: "Gestern, 16:25", author: "S. Müller", status: "completed" },
      { id: "h-l2", title: "Hochgeladen", timestamp: "Gestern, 16:20", author: "Portal", status: "info" },
    ],
    ocrStatus: "COMPLETED",
    vektorisierung: "SUCCESS",
    chunkCount: 18,
    vectorId: "vtx_8812_099x_def",
  },
  {
    id: "doc-3",
    name: "Brandschutznachweis.pdf",
    vorgangId: "BAU-2026-0147",
    buerger: "Thomas Becker",
    typ: "Nachweis",
    version: "v1.0",
    status: DocumentStatus.Fehlend,
    geaendert: "-",
    dokumentId: "DOC-9921-C",
    detailedTyp: "Brandschutznachweis",
    dateigroesse: "-",
    hochgeladenAm: "-",
    versions: [],
    references: [],
    history: [
      { id: "h-b1", title: "Nachforderung erstellt", timestamp: "Vor 2 Tagen", author: "System", status: "system" },
    ],
    ocrStatus: "PENDING",
    vektorisierung: "PENDING",
    chunkCount: 0,
    vectorId: "-",
  }
];

// Dynamically generate the remaining "Anlage_X_Statik.pdf" documents to match the HTML layout and density
for (let i = 0; i < 15; i++) {
  const indexStr = (148 + i).toString();
  const indexNum = 4 + i;
  mockDocuments.push({
    id: `doc-statik-${indexNum}`,
    name: `Anlage_${indexNum}_Statik.pdf`,
    vorgangId: `BAU-2026-0${indexStr}`,
    buerger: `Bürger ${i + 1}`,
    typ: "Beilage",
    version: "v1.0",
    status: DocumentStatus.Archiviert,
    geaendert: "12. Okt 2023",
    dokumentId: `DOC-8822-${indexNum}`,
    detailedTyp: "Technische Statik-Beilage",
    dateigroesse: "3.1 MB",
    hochgeladenAm: "12. Okt 2023, 11:15 Uhr",
    versions: [
      { version: "v1.0 (Aktuell)", date: "12. Okt 2023, 11:15", author: `Bürger ${i + 1}`, isCurrent: true }
    ],
    references: [
      { id: "ref-s1", title: "DIN EN 1991 (Eurocode 1)", type: "gavel" }
    ],
    history: [
      { id: "h-s1", title: "Archiviert", timestamp: "12. Okt 2023, 11:30", author: "System", status: "system" }
    ],
    ocrStatus: "COMPLETED",
    vektorisierung: "SUCCESS",
    chunkCount: 55,
    vectorId: `vtx_8812_099x_stat_${indexNum}`,
  });
}
