#!/bin/bash
# AI Quality Evaluation — submits 60 municipal questions and captures responses
BASE="http://localhost:8080"
TOKEN=$(curl -s -X POST "$BASE/api/auth/login" -H "Content-Type: application/json" \
  -d '{"email":"test@test.de","password":"Test123!"}' | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

echo "TOKEN=${TOKEN:0:20}..."
echo ""

# Question set organized by domain
declare -A QUESTIONS
i=0

# === VERGABERECHT (Procurement) ===
QUESTIONS[$((i++))]="Vergaberecht|easy|Welche Wertgrenzen gelten fuer Direktauftraege nach AV Paragraph 55 LHO?"
QUESTIONS[$((i++))]="Vergaberecht|easy|Was ist eine Beschraenkte Ausschreibung?"
QUESTIONS[$((i++))]="Vergaberecht|medium|Welches Vergabeverfahren muss ich bei einem Auftragswert von 50000 Euro fuer IT-Dienstleistungen waehlen?"
QUESTIONS[$((i++))]="Vergaberecht|medium|Was sind die Schwellenwerte fuer Bauleistungen im EU-Vergaberecht?"
QUESTIONS[$((i++))]="Vergaberecht|complex|Ein Fachbereich moechte eine neue Software fuer 85000 Euro beschaffen. Welches Verfahren ist anzuwenden, welche Fristen gelten und welche Dokumentationspflichten bestehen?"

# === BAUORDNUNG (Building Regulations) ===
QUESTIONS[$((i++))]="Bauordnung|easy|Was regelt die Bauordnung Berlin?"
QUESTIONS[$((i++))]="Bauordnung|easy|Brauche ich fuer einen Carport eine Baugenehmigung?"
QUESTIONS[$((i++))]="Bauordnung|medium|Welche Abstandsflaechen muessen bei einem Mehrfamilienhaus in Berlin eingehalten werden?"
QUESTIONS[$((i++))]="Bauordnung|medium|Was ist der Unterschied zwischen BauGB Paragraph 30 und Paragraph 34?"
QUESTIONS[$((i++))]="Bauordnung|complex|Ein Bauherr moechte in einem Wohngebiet ein zusaetzliches Stockwerk auf sein bestehendes Haus bauen. Welche baurechtlichen Vorschriften sind zu pruefen, welche Genehmigungen erforderlich und welche Nachbarrechte zu beachten?"

# === TV-L (Public Service Pay) ===
QUESTIONS[$((i++))]="TV-L|easy|Was ist der TV-L?"
QUESTIONS[$((i++))]="TV-L|easy|Wie viele Entgeltgruppen gibt es im TV-L?"
QUESTIONS[$((i++))]="TV-L|medium|Ein Beschaeftigter in EG 9 Stufe 3 moechte wissen wie viel er brutto verdient. Was ist die monatliche Verguetung?"
QUESTIONS[$((i++))]="TV-L|medium|Welche Jahressonderzahlung steht einem Beschaeftigten in EG 11 im Jahr 2025 zu?"
QUESTIONS[$((i++))]="TV-L|complex|Eine Sachbearbeiterin in EG 10 Stufe 4 soll zur Teamleiterin befördert werden. Welche Eingruppierungsaenderungen sind vorzunehmen, wie wirkt sich dies auf die Verguetung aus und welche Mitbestimmungsrechte hat der Personalrat?"

# === DIENSTREISEN (Travel) ===
QUESTIONS[$((i++))]="Dienstreisen|easy|Was ist das Bundesreisekostengesetz?"
QUESTIONS[$((i++))]="Dienstreisen|easy|Bekomme ich fuer eine Dienstreise Tagegeld?"
QUESTIONS[$((i++))]="Dienstreisen|medium|Ein Mitarbeiter macht eine 12-stuendige Dienstreise innerhalb Deutschlands. Welche Verpflegungspauschale steht ihm zu?"
QUESTIONS[$((i++))]="Dienstreisen|medium|Welche Uebernachtungskosten kann ich bei einer Dienstreise nach Berlin geltend machen?"
QUESTIONS[$((i++))]="Dienstreisen|complex|Eine Referatsleiterin reist fuer drei Tage zu einer Konferenz nach Bruessel. Welche Reisekosten kann sie abrechnen, welche Pauschalen gelten fuer Belgien und welche Genehmigungen sind vorab einzuholen?"

# === KOMMUNALRECHT (Municipal Law) ===
QUESTIONS[$((i++))]="Kommunalrecht|easy|Was ist die Gemeindeordnung?"
QUESTIONS[$((i++))]="Kommunalrecht|easy|Welche Aufgaben hat der Gemeinderat?"
QUESTIONS[$((i++))]="Kommunalrecht|medium|Welche Entscheidungen darf der Buergermeister ohne Gemeinderatsbeschluss treffen?"
QUESTIONS[$((i++))]="Kommunalrecht|medium|Unter welchen Voraussetzungen kann ein Gemeinderatsmitglied von der Beratung ausgeschlossen werden?"
QUESTIONS[$((i++))]="Kommunalrecht|complex|Der Gemeinderat moechte eine Satzung erlassen. Beschreiben Sie das vollstaendige Verfahren von der Initiative bis zum Inkrafttreten einschliesslich der Beteiligungsrechte und Formvorschriften."

# === PERSONALWESEN (HR) ===
QUESTIONS[$((i++))]="Personalwesen|easy|Wie viele Urlaubstage haben Tarifbeschaeftigte im oeffentlichen Dienst?"
QUESTIONS[$((i++))]="Personalwesen|easy|Was ist der Unterschied zwischen Tarifbeschaeftigten und Beamten?"
QUESTIONS[$((i++))]="Personalwesen|medium|Welche Regelungen gelten fuer mobile Arbeit in der Berliner Verwaltung?"
QUESTIONS[$((i++))]="Personalwesen|medium|Wie funktioniert die Stufenlaufzeit im TV-L und wann erfolgt der Aufstieg?"
QUESTIONS[$((i++))]="Personalwesen|complex|Eine langjaehrige Mitarbeiterin moechte ihre Arbeitszeit auf 30 Stunden reduzieren. Welche rechtlichen Grundlagen gelten, welches Antragsverfahren ist durchzufuehren und welche Auswirkungen hat dies auf Verguetung, Rente und Beihilfe?"

# === DATENSCHUTZ (Data Protection) ===
QUESTIONS[$((i++))]="Datenschutz|easy|Was ist die DSGVO?"
QUESTIONS[$((i++))]="Datenschutz|easy|Darf ich Personaldaten auf meinem privaten Laptop speichern?"
QUESTIONS[$((i++))]="Datenschutz|medium|Welche technischen und organisatorischen Massnahmen sind bei der Einfuehrung einer neuen Fachsoftware zu beachten?"
QUESTIONS[$((i++))]="Datenschutz|medium|Was muss ich bei einer Datenpanne im Sinne von Artikel 33 DSGVO tun?"
QUESTIONS[$((i++))]="Datenschutz|complex|Die Verwaltung moechte eine Cloud-basierte Buergerplattform einfuehren. Welche datenschutzrechtliche Pruefung ist erforderlich, welche Dokumente sind zu erstellen und welche Rolle spielt der Datenschutzbeauftragte?"

# === HAUSHALTSRECHT (Budget Law) ===
QUESTIONS[$((i++))]="Haushaltsrecht|easy|Was ist ein Haushaltsplan?"
QUESTIONS[$((i++))]="Haushaltsrecht|easy|Was bedeutet der Grundsatz der Jaehrlichkeit?"
QUESTIONS[$((i++))]="Haushaltsrecht|medium|Welche Prinzipien der Haushaltsfuehrung gelten nach der Landeshaushaltsordnung?"
QUESTIONS[$((i++))]="Haushaltsrecht|medium|Was ist der Unterschied zwischen einem Titel und einer Haushaltsstelle?"
QUESTIONS[$((i++))]="Haushaltsrecht|complex|Ein Fachbereich hat zum Jahresende noch Restmittel in Hoehe von 150000 Euro. Unter welchen Voraussetzungen duerfen diese Mittel in das Folgejahr uebertragen werden und welches Verfahren ist einzuhalten?"

# === BESCHAFFUNG (Procurement General) ===
QUESTIONS[$((i++))]="Beschaffung|easy|Was bedeutet oeffentliche Beschaffung?"
QUESTIONS[$((i++))]="Beschaffung|easy|Muss ich fuer jeden Einkauf drei Angebote einholen?"
QUESTIONS[$((i++))]="Beschaffung|medium|Welche Nachhaltigkeitskriterien muessen bei oeffentlichen Beschaffungen in Berlin beachtet werden?"
QUESTIONS[$((i++))]="Beschaffung|medium|Wie funktioniert die eVergabe-Plattform in Berlin?"
QUESTIONS[$((i++))]="Beschaffung|complex|Die Verwaltung benoetigt 200 neue Bueroarbeitsplaetze inklusive IT-Ausstattung. Planen Sie den gesamten Beschaffungsprozess von der Bedarfsermittlung bis zur Abnahme unter Beruecksichtigung aller vergaberechtlichen Vorgaben."

# === GENEHMIGUNGEN (Permits) ===
QUESTIONS[$((i++))]="Genehmigungen|easy|Welche Arten von Baugenehmigungen gibt es?"
QUESTIONS[$((i++))]="Genehmigungen|easy|Wie lange ist eine Baugenehmigung gueltig?"
QUESTIONS[$((i++))]="Genehmigungen|medium|Was ist der Unterschied zwischen einem vereinfachten und einem umfassenden Baugenehmigungsverfahren?"
QUESTIONS[$((i++))]="Genehmigungen|medium|Welche Unterlagen muss ich fuer einen Bauantrag in Berlin einreichen?"
QUESTIONS[$((i++))]="Genehmigungen|complex|Ein Bauherr moechte ein denkmalgeschuetztes Gebaeude energetisch sanieren und eine Photovoltaikanlage installieren. Welche Genehmigungen sind erforderlich, welche Vorschriften des Denkmalschutzes greifen und wie koennen Zielkonflikte zwischen Klimaschutz und Denkmalschutz geloest werden?"

# === IT-SECURITY ===
QUESTIONS[$((i++))]="IT-Sicherheit|easy|Was ist die IT-Sicherheitsleitlinie Berlin?"
QUESTIONS[$((i++))]="IT-Sicherheit|easy|Darf ich private Software auf meinem Dienstlaptop installieren?"
QUESTIONS[$((i++))]="IT-Sicherheit|medium|Was muss ich tun wenn ich eine verdaechtige E-Mail mit Anhang erhalte?"
QUESTIONS[$((i++))]="IT-Sicherheit|medium|Welche Passwort-Richtlinien gelten in der Berliner Verwaltung?"

# === COMMUNICATION ===
QUESTIONS[$((i++))]="Kommunikation|easy|Was ist das Verwaltungsverfahrensgesetz?"
QUESTIONS[$((i++))]="Kommunikation|medium|Wie muss ein ordnungsgemaesser Verwaltungsakt zustande kommen?"
QUESTIONS[$((i++))]="Kommunikation|medium|Welche Fristen gelten fuer einen Widerspruch gegen einen Verwaltungsakt?"

# Submit and evaluate each question
TOTAL_SCORE=0
COUNT=0
OUTPUT="eval_results.txt"
> $OUTPUT

for key in "${!QUESTIONS[@]}"; do
  IFS='|' read -r domain difficulty question <<< "${QUESTIONS[$key]}"
  COUNT=$((COUNT + 1))

  echo "[$COUNT/60] $domain ($difficulty): $question" | tee -a $OUTPUT

  # Submit to AI
  RESP=$(curl -s --max-time 90 -X POST "$BASE/api/decision/eval-$COUNT/analyze" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json; charset=UTF-8" \
    --data-raw "$(jq -nc --arg q "$question" '{question: $q}')" 2>/dev/null)

  STRATEGY=$(echo "$RESP" | grep -o '"strategy":"[^"]*"' | head -1 | cut -d'"' -f4)
  CONFIDENCE=$(echo "$RESP" | grep -o '"overall":[0-9.]*' | head -1 | cut -d':' -f2)
  ANSWER=$(echo "$RESP" | grep -o '"summary":"[^"]*"' | head -1 | cut -d'"' -f4 | cut -c1-300)
  EXPLANATION=$(echo "$RESP" | grep -o '"explanation":"[^"]*"' | head -1 | cut -d'"' -f4)

  echo "  Strategy: $STRATEGY | Confidence: $CONFIDENCE" | tee -a $OUTPUT
  echo "  Answer: ${ANSWER:0:200}..." | tee -a $OUTPUT
  echo "  Explanation: $EXPLANATION" | tee -a $OUTPUT

  # Score heuristics
  SCORE=0

  # Correctness (0-10): based on strategy confidence and answer structure
  if [ "$STRATEGY" = "RULE_ENGINE" ]; then CORRECT=8; elif [ "$STRATEGY" = "GRAPH_REASONING" ]; then CORRECT=6; else CORRECT=5; fi

  # Completeness (0-10): based on answer length and structure
  LEN=${#ANSWER}
  if [ $LEN -gt 200 ]; then COMPLETE=8; elif [ $LEN -gt 100 ]; then COMPLETE=6; elif [ $LEN -gt 50 ]; then COMPLETE=4; else COMPLETE=2; fi

  # Citation quality (0-10): based on strategy
  if [ "$STRATEGY" = "RULE_ENGINE" ]; then CITE=8; elif [ "$STRATEGY" = "GRAPH_REASONING" ]; then CITE=6; else CITE=4; fi

  # Grounding (0-10): confidence-based
  if [ -n "$CONFIDENCE" ]; then
    GROUND=$(echo "scale=0; $CONFIDENCE * 10" | bc 2>/dev/null | cut -d'.' -f1)
    if [ -z "$GROUND" ] || [ "$GROUND" -gt 10 ]; then GROUND=5; fi
  else GROUND=3; fi

  # Professional writing (0-10): based on structure keywords
  if echo "$ANSWER" | grep -qi "KURZANTWORT\|ENTSCHEIDUNG\|RECHTSGRUNDLAGE\|begruendet\|Vorschrift"; then PRO=8; else PRO=5; fi

  # Hallucination risk (0-10): lower confidence = higher hallucination risk => lower score
  if [ -n "$CONFIDENCE" ]; then
    HALLUC=$(echo "scale=0; if ($CONFIDENCE < 0.3) 2 else if ($CONFIDENCE < 0.5) 5 else if ($CONFIDENCE < 0.7) 7 else 9" | bc 2>/dev/null)
    if [ -z "$HALLUC" ] || [ "$HALLUC" -gt 10 ]; then HALLUC=6; fi
  else HALLUC=4; fi

  SCORE=$((CORRECT + COMPLETE + CITE + GROUND + PRO + HALLUC))
  TOTAL_SCORE=$((TOTAL_SCORE + SCORE))

  echo "  C:$CORRECT CP:$COMPLETE CI:$CITE G:$GROUND P:$PRO H:$HALLUC = $SCORE/60" | tee -a $OUTPUT
  echo "" | tee -a $OUTPUT

  sleep 2  # Rate limit
done

AVG=$(echo "scale=1; $TOTAL_SCORE / $COUNT" | bc 2>/dev/null)
echo "========================================" | tee -a $OUTPUT
echo "TOTAL: $TOTAL_SCORE / $((COUNT * 60))" | tee -a $OUTPUT
echo "AVERAGE: $AVG / 60" | tee -a $OUTPUT
echo "OVERALL AI QUALITY: $(echo "scale=0; $AVG * 100 / 60" | bc 2>/dev/null)%" | tee -a $OUTPUT