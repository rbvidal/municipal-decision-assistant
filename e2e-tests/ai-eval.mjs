// AI Quality Evaluation — 60 municipal questions
const BASE = "http://localhost:8080";

async function login() {
  const r = await fetch(`${BASE}/api/auth/login`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "test@test.de", password: "Test123!" }),
  });
  const d = await r.json();
  return d.accessToken;
}

const QUESTIONS = [
  // === VERGABERECHT (Procurement) ===
  ["Vergaberecht","easy","Welche Wertgrenzen gelten fuer Direktauftraege nach AV Paragraph 55 LHO?"],
  ["Vergaberecht","easy","Was ist eine Beschraenkte Ausschreibung?"],
  ["Vergaberecht","medium","Welches Vergabeverfahren brauche ich bei 50000 Euro fuer IT-Dienstleistungen?"],
  ["Vergaberecht","medium","Was sind die EU-Schwellenwerte fuer Bauleistungen?"],
  ["Vergaberecht","complex","Ein Fachbereich will Software fuer 85000 Euro beschaffen. Welches Verfahren, Fristen und Dokumentationspflichten gelten?"],

  // === BAUORDNUNG (Building) ===
  ["Bauordnung","easy","Was regelt die Bauordnung Berlin?"],
  ["Bauordnung","easy","Brauche ich fuer einen Carport eine Baugenehmigung?"],
  ["Bauordnung","medium","Welche Abstandsflaechen muss ein Mehrfamilienhaus in Berlin einhalten?"],
  ["Bauordnung","medium","Was ist der Unterschied zwischen BauGB Paragraph 30 und Paragraph 34?"],
  ["Bauordnung","complex","Ein Bauherr will ein zusaetzliches Stockwerk auf ein bestehendes Haus bauen. Welche Vorschriften, Genehmigungen und Nachbarrechte sind zu beachten?"],

  // === TV-L (Public Pay) ===
  ["TV-L","easy","Was ist der TV-L?"],
  ["TV-L","easy","Wie viele Entgeltgruppen gibt es im TV-L?"],
  ["TV-L","medium","Was verdient ein Beschaeftigter in EG 9 Stufe 3 brutto monatlich?"],
  ["TV-L","medium","Welche Jahressonderzahlung steht einem Beschaeftigten in EG 11 im Jahr 2025 zu?"],
  ["TV-L","complex","Eine Sachbearbeiterin in EG 10 Stufe 4 soll Teamleiterin werden. Welche Eingruppierungsaenderungen, Verguetungsaenderungen und Mitbestimmungsrechte des Personalrats sind relevant?"],

  // === DIENSTREISEN (Travel) ===
  ["Dienstreisen","easy","Was ist das Bundesreisekostengesetz (BRKG)?"],
  ["Dienstreisen","easy","Steht mir fuer eine Dienstreise Tagegeld zu?"],
  ["Dienstreisen","medium","Welche Verpflegungspauschale gilt bei 12-stuendiger Dienstreise in Deutschland?"],
  ["Dienstreisen","medium","Welche Uebernachtungskosten kann ich bei Dienstreise nach Berlin abrechnen?"],
  ["Dienstreisen","complex","Eine Referatsleiterin reist drei Tage zu einer Konferenz nach Bruessel. Welche Reisekosten, Auslandspauschalen fuer Belgien und Genehmigungen sind erforderlich?"],

  // === KOMMUNALRECHT (Municipal Law) ===
  ["Kommunalrecht","easy","Was ist die Gemeindeordnung?"],
  ["Kommunalrecht","easy","Welche Aufgaben hat der Gemeinderat?"],
  ["Kommunalrecht","medium","Welche Entscheidungen darf der Buergermeister ohne Gemeinderat treffen?"],
  ["Kommunalrecht","medium","Wann kann ein Gemeinderatsmitglied von der Beratung ausgeschlossen werden?"],
  ["Kommunalrecht","complex","Ein Gemeinderat moechte eine Satzung erlassen. Beschreiben Sie das vollstaendige Verfahren von der Initiative bis zum Inkrafttreten."],

  // === PERSONALWESEN (HR) ===
  ["Personalwesen","easy","Wie viele Urlaubstage haben Tarifbeschaeftigte?"],
  ["Personalwesen","easy","Was unterscheidet Tarifbeschaeftigte von Beamten?"],
  ["Personalwesen","medium","Welche Regelungen gelten fuer mobile Arbeit in der Berliner Verwaltung?"],
  ["Personalwesen","medium","Wie funktionieren Stufenlaufzeiten und Stufenaufstieg im TV-L?"],
  ["Personalwesen","complex","Eine Mitarbeiterin will ihre Arbeitszeit auf 30 Stunden reduzieren. Welche Rechtsgrundlagen, welches Antragsverfahren und welche Auswirkungen auf Verguetung, Rente und Beihilfe gibt es?"],

  // === DATENSCHUTZ (Data Protection) ===
  ["Datenschutz","easy","Was ist die DSGVO?"],
  ["Datenschutz","easy","Darf ich Personaldaten auf meinem privaten Laptop speichern?"],
  ["Datenschutz","medium","Welche technischen und organisatorischen Massnahmen sind bei Einfuehrung einer neuen Fachsoftware zu beachten?"],
  ["Datenschutz","medium","Was muss ich bei einer Datenpanne nach Artikel 33 DSGVO tun?"],
  ["Datenschutz","complex","Die Verwaltung will eine Cloud-basierte Buergerplattform einfuehren. Welche datenschutzrechtliche Pruefung, Dokumentation und Rolle des Datenschutzbeauftragten sind erforderlich?"],

  // === HAUSHALTSRECHT (Budget) ===
  ["Haushaltsrecht","easy","Was ist ein Haushaltsplan?"],
  ["Haushaltsrecht","easy","Was bedeutet der Grundsatz der Jaehrlichkeit?"],
  ["Haushaltsrecht","medium","Welche Haushaltsgrundsaetze gelten nach der Landeshaushaltsordnung?"],
  ["Haushaltsrecht","medium","Was ist der Unterschied zwischen einem Titel und einer Haushaltsstelle?"],
  ["Haushaltsrecht","complex","Ein Fachbereich hat zum Jahresende Restmittel von 150000 Euro. Unter welchen Voraussetzungen duerfen diese ins Folgejahr uebertragen werden und welches Verfahren gilt?"],

  // === BESCHAFFUNG (Procurement General) ===
  ["Beschaffung","easy","Was bedeutet oeffentliche Beschaffung?"],
  ["Beschaffung","easy","Muss ich fuer jeden Einkauf drei Angebote einholen?"],
  ["Beschaffung","medium","Welche Nachhaltigkeitskriterien gelten bei oeffentlichen Beschaffungen in Berlin?"],
  ["Beschaffung","medium","Wie funktioniert die eVergabe-Plattform in Berlin?"],
  ["Beschaffung","complex","Die Verwaltung braucht 200 neue Bueroarbeitsplaetze mit IT. Planen Sie den gesamten Beschaffungsprozess von der Bedarfsermittlung bis zur Abnahme."],

  // === GENEHMIGUNGEN (Permits) ===
  ["Genehmigungen","easy","Welche Arten von Baugenehmigungen gibt es?"],
  ["Genehmigungen","easy","Wie lange ist eine Baugenehmigung gueltig?"],
  ["Genehmigungen","medium","Unterschied zwischen vereinfachtem und umfassendem Baugenehmigungsverfahren?"],
  ["Genehmigungen","medium","Welche Unterlagen brauche ich fuer einen Bauantrag in Berlin?"],
  ["Genehmigungen","complex","Ein denkmalgeschuetztes Gebaeude soll energetisch saniert werden und eine Photovoltaikanlage erhalten. Welche Genehmigungen, Denkmalschutzvorschriften und Konfliktloesungen zwischen Klimaschutz und Denkmalschutz gibt es?"],

  // === IT-SICHERHEIT (IT Security) ===
  ["IT-Sicherheit","easy","Was ist die IT-Sicherheitsleitlinie Berlin?"],
  ["IT-Sicherheit","easy","Darf ich private Software auf meinem Dienstlaptop installieren?"],
  ["IT-Sicherheit","medium","Was tun bei einer verdaechtigen E-Mail mit Anhang?"],
  ["IT-Sicherheit","medium","Welche Passwort-Richtlinien gelten in der Berliner Verwaltung?"],

  // === VERWALTUNGSVERFAHREN (Administrative Procedure) ===
  ["Verwaltungsverfahren","easy","Was ist das Verwaltungsverfahrensgesetz?"],
  ["Verwaltungsverfahren","medium","Wie kommt ein ordnungsgemaesser Verwaltungsakt zustande?"],
  ["Verwaltungsverfahren","medium","Welche Fristen gelten fuer einen Widerspruch gegen einen Verwaltungsakt?"],
];

function scoreAnswer(domain, difficulty, strategy, confidence, answer, explanation) {
  // Correctness: RULE_ENGINE = high trust, GRAPH_REASONING = medium
  let correctness = strategy === "RULE_ENGINE" ? 8 : strategy === "GRAPH_REASONING" ? 6 : 5;
  if (confidence > 0.9) correctness = Math.min(10, correctness + 1);
  if (confidence < 0.3) correctness = Math.max(1, correctness - 3);

  // Completeness: answer length and structure
  const len = (answer || "").length;
  let completeness = len > 300 ? 8 : len > 150 ? 6 : len > 50 ? 4 : 2;
  if (answer && /KURZANTWORT|ENTSCHEIDUNG|RECHTSGRUNDLAGE/i.test(answer)) completeness = Math.min(10, completeness + 1);

  // Citation quality
  let citation = strategy === "RULE_ENGINE" ? 8 : strategy === "GRAPH_REASONING" ? 6 : 4;
  if (answer && /Paragraph|Art\.|§|Vorschrift|Gesetz/i.test(answer)) citation = Math.min(10, citation + 1);

  // Grounding: confidence-based
  let grounding = confidence ? Math.round(Math.min(10, confidence * 10)) : 3;
  if (grounding < 1) grounding = 1;

  // Professional writing
  let professional = 5;
  if (answer && /KURZANTWORT|ENTSCHEIDUNG|RECHTSGRUNDLAGE|VERFAHREN|begruendet/i.test(answer)) professional = 8;
  if (answer && /Zusammenfassung|Empfehlung|Hinweis|Vorschrift/i.test(answer)) professional = Math.min(10, professional + 1);
  // Penalize diagnostic/debug output
  if (answer && /Index Inspection|Provider error|Model.*not found|Pull the model/i.test(answer)) professional = Math.max(1, professional - 5);

  // Hallucination risk
  let hallucination = 6;
  if (confidence > 0.9) hallucination = 9;
  else if (confidence > 0.7) hallucination = 7;
  else if (confidence > 0.5) hallucination = 5;
  else if (confidence > 0.3) hallucination = 4;
  else hallucination = 2;
  // If answer explicitly states evidence is insufficient, that's GOOD (no hallucination)
  if (answer && /keine.*Information|keine.*ausreichend|keine spezifisch|nicht.*enthalten|liegen nicht vor/i.test(answer)) hallucination = Math.min(10, hallucination + 3);

  return {
    correctness, completeness, citation, grounding, professional, hallucination,
    total: correctness + completeness + citation + grounding + professional + hallucination,
  };
}

async function main() {
  const token = await login();
  console.log(`Token: ${token.substring(0, 20)}...\n`);

  const results = [];
  let qNum = 0;

  for (const [domain, difficulty, question] of QUESTIONS) {
    qNum++;
    process.stdout.write(`[${qNum}/${QUESTIONS.length}] ${domain} (${difficulty}): `);

    try {
      const r = await fetch(`${BASE}/api/decision/eval-${qNum}/analyze`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({ question }),
        signal: AbortSignal.timeout(90000),
      });
      const data = await r.json();
      const strategy = data.strategy || "UNKNOWN";
      const confidence = data.confidence?.overall ?? 0;
      const answer = data.summary || data.answer || "";
      const explanation = data.explanation || "";

      const scores = scoreAnswer(domain, difficulty, strategy, confidence, answer, explanation);
      results.push({ domain, difficulty, question, strategy, confidence, answer, explanation, ...scores });

      console.log(`S:${strategy.substring(0, 12)} C:${confidence.toFixed(2)} = ${scores.total}/60`);
    } catch (e) {
      console.log(`FAILED: ${e.message}`);
      results.push({ domain, difficulty, question, strategy: "ERROR", confidence: 0, answer: "", explanation: e.message, correctness: 0, completeness: 0, citation: 0, grounding: 0, professional: 0, hallucination: 0, total: 0 });
    }

    // Small delay between requests
    await new Promise(r => setTimeout(r, 1500));
  }

  // Analysis
  console.log("\n========================================");
  console.log("EVALUATION SUMMARY");
  console.log("========================================\n");

  const total = results.reduce((s, r) => s + r.total, 0);
  const avg = total / results.length;
  console.log(`Questions evaluated: ${results.length}`);
  console.log(`Average score: ${avg.toFixed(1)} / 60`);
  console.log(`Overall AI Quality: ${Math.round(avg * 100 / 60)}%\n`);

  // By domain
  const domains = {};
  for (const r of results) {
    if (!domains[r.domain]) domains[r.domain] = { scores: [], total: 0, count: 0 };
    domains[r.domain].scores.push(r.total);
    domains[r.domain].total += r.total;
    domains[r.domain].count++;
  }
  console.log("BY DOMAIN:");
  for (const [d, v] of Object.entries(domains).sort((a, b) => (b[1].total / b[1].count) - (a[1].total / a[1].count))) {
    const a = v.total / v.count;
    console.log(`  ${d.padEnd(20)} ${a.toFixed(1)}/60 (${Math.round(a * 100 / 60)}%)`);
  }

  // By difficulty
  console.log("\nBY DIFFICULTY:");
  for (const diff of ["easy", "medium", "complex"]) {
    const dResults = results.filter(r => r.difficulty === diff);
    if (!dResults.length) continue;
    const a = dResults.reduce((s, r) => s + r.total, 0) / dResults.length;
    console.log(`  ${diff.padEnd(10)} ${a.toFixed(1)}/60 (${Math.round(a * 100 / 60)}%) — ${dResults.length} questions`);
  }

  // By strategy
  console.log("\nBY STRATEGY:");
  const strategies = {};
  for (const r of results) {
    if (!strategies[r.strategy]) strategies[r.strategy] = { scores: [], total: 0, count: 0 };
    strategies[r.strategy].scores.push(r.total);
    strategies[r.strategy].total += r.total;
    strategies[r.strategy].count++;
  }
  for (const [s, v] of Object.entries(strategies)) {
    const a = v.total / v.count;
    console.log(`  ${s.padEnd(18)} ${a.toFixed(1)}/60 (${Math.round(a * 100 / 60)}%) — ${v.count} questions`);
  }

  // Best and worst
  const sorted = [...results].sort((a, b) => b.total - a.total);
  console.log("\nBEST 5:");
  sorted.slice(0, 5).forEach((r, i) => {
    console.log(`  ${i + 1}. [${r.total}/60] ${r.domain} (${r.difficulty}): ${r.question.substring(0, 80)}...`);
    console.log(`     Strategy: ${r.strategy} | C:${r.confidence.toFixed(2)} | Answer: ${(r.answer || "").substring(0, 100)}...`);
  });

  console.log("\nWORST 5:");
  sorted.slice(-5).reverse().forEach((r, i) => {
    console.log(`  ${i + 1}. [${r.total}/60] ${r.domain} (${r.difficulty}): ${r.question.substring(0, 80)}...`);
    console.log(`     Strategy: ${r.strategy} | C:${r.confidence.toFixed(2)} | Answer: ${(r.answer || "").substring(0, 100)}...`);
  });

  // Failure modes
  console.log("\nFAILURE MODE ANALYSIS:");
  let lowCorrectness = results.filter(r => r.correctness < 4).length;
  let lowCompleteness = results.filter(r => r.completeness < 4).length;
  let lowCitation = results.filter(r => r.citation < 4).length;
  let lowGrounding = results.filter(r => r.grounding < 4).length;
  let lowProfessional = results.filter(r => r.professional < 4).length;
  let highHallucination = results.filter(r => r.hallucination < 4).length;
  console.log(`  Low correctness (<4):   ${lowCorrectness}/${results.length}`);
  console.log(`  Low completeness (<4):  ${lowCompleteness}/${results.length}`);
  console.log(`  Low citation (<4):      ${lowCitation}/${results.length}`);
  console.log(`  Low grounding (<4):     ${lowGrounding}/${results.length}`);
  console.log(`  Low professional (<4):  ${lowProfessional}/${results.length}`);
  console.log(`  High halluc risk (<4):  ${highHallucination}/${results.length}`);

  // Dimension averages
  console.log("\nDIMENSION AVERAGES:");
  const dims = ["correctness", "completeness", "citation", "grounding", "professional", "hallucination"];
  for (const dim of dims) {
    const a = results.reduce((s, r) => s + r[dim], 0) / results.length;
    console.log(`  ${dim.padEnd(16)} ${a.toFixed(1)} / 10`);
  }
}

main().catch(e => { console.error(e.message); process.exit(1); });
