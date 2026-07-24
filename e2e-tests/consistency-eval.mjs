// Product Consistency Evaluation — cross-module comparison
import { chromium } from "playwright";

const BASE = "http://localhost:5173";
const BACKEND = "http://localhost:8080";

const findings = [];

function note(module, severity, desc) {
  findings.push({ module, severity, desc });
  console.log(`  [${severity}] ${module}: ${desc}`);
}

async function login(page) {
  await page.goto(`${BASE}/login`);
  await page.fill("input[type=email], input[name=email]", "test@test.de");
  await page.fill("input[type=password], input[name=password]", "Test123!");
  await page.click('button[type=submit], button:has-text("Anmelden")');
  try { await page.waitForURL("**/home", { timeout: 10000 }); } catch {}
}

async function capture(page, label) {
  try {
    await page.screenshot({ path: `screenshots/${label.replace(/[^a-z0-9]/gi, "_")}.png`, fullPage: true });
  } catch {}
}

async function checkPage(page, path, label) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1500);
  await capture(page, label);
  return page;
}

async function main() {
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║  PRODUCT CONSISTENCY EVALUATION              ║");
  console.log("╚══════════════════════════════════════════════╝\n");

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await login(page);
  console.log("=== 1. NAVIGATION CONSISTENCY ===\n");

  // Navigate every module and check for consistent shell
  const modules = [
    ["/home", "Dashboard"],
    ["/work", "My Work"],
    ["/knowledge", "Knowledge"],
    ["/documents", "Documents"],
    ["/search", "Search"],
    ["/assistant", "AI Assistant"],
    ["/supervisor", "Supervisor"],
    ["/admin", "Admin"],
    ["/admin/corpus", "Corpus"],
    ["/admin/audit", "Audit"],
    ["/admin/users", "Users"],
  ];

  const shells = [];
  for (const [path, label] of modules) {
    await checkPage(page, path, label);
    // Check if top navigation is present
    const hasTopNav = await page.locator("header, nav, [class*=topNav], [class*=navigation], [class*=shell]").first().isVisible().catch(() => false);
    const hasHeading = await page.locator("h1, h2, h3").first().isVisible().catch(() => false);
    const hasContent = (await page.locator("body").textContent().catch(() => "")).length > 100;
    shells.push({ label, hasTopNav, hasHeading, hasContent });
    const status = hasTopNav && hasContent ? "OK" : hasTopNav ? "NO-CONTENT" : "NO-SHELL";
    if (!hasTopNav) note(label, "HIGH", "Missing navigation shell — page appears disconnected from app");
    if (!hasContent) note(label, "MEDIUM", "Page has minimal content — may appear empty");
    console.log(`  ${label.padEnd(20)} nav:${hasTopNav} heading:${hasHeading} content:${hasContent} → ${status}`);
  }

  console.log("\n=== 2. TERMINOLOGY CONSISTENCY ===\n");

  // Check same concepts across modules
  const terms = {
    "Vorgang": ["/work", "/documents"],
    "Dokumente": ["/knowledge", "/documents", "/work"],
    "Wissen": ["/knowledge"],
    "Entscheidungshilfe": ["/work"],
    "KI-Assistent": ["/assistant"],
  };

  for (const [term, paths] of Object.entries(terms)) {
    for (const p of paths) {
      await page.goto(`${BASE}${p}`, { waitUntil: "networkidle", timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(800);
      const body = await page.locator("body").textContent().catch(() => "");
      // Not a deep check — just observing
    }
  }

  // Check: are workspaces called "Vorgang" or "Workspace" or "Case"?
  await page.goto(`${BASE}/work`, { waitUntil: "networkidle", timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(1000);
  const workBody = await page.locator("body").textContent().catch(() => "");
  const hasVorgang = workBody.includes("Vorgang") || workBody.includes("vorgang");
  const hasWorkspace = workBody.includes("Workspace") || workBody.includes("workspace");
  const hasCase = workBody.includes("Case") || workBody.includes("case");
  console.log(`  My Work page terminology: Vorgang=${hasVorgang} Workspace=${hasWorkspace} Case=${hasCase}`);
  if (hasVorgang && hasWorkspace) note("My Work", "MEDIUM", "Mixed terminology: 'Vorgang' and 'Workspace' used interchangeably");
  if (!hasVorgang && !hasWorkspace && !hasCase) note("My Work", "HIGH", "No recognizable terminology for workspaces");

  // Check German consistency: is the app fully German?
  console.log("\n=== 3. LANGUAGE CONSISTENCY ===\n");
  const pages = [
    ["/home", "Dashboard"],
    ["/work", "My Work"],
    ["/knowledge", "Knowledge"],
    ["/documents", "Documents"],
    ["/admin/audit", "Audit"],
  ];
  for (const [p, label] of pages) {
    await checkPage(page, p, label);
    const text = await page.locator("body").textContent().catch(() => "");
    const englishWords = text.match(/\b(Search|Upload|Download|Settings|Profile|Logout|Home|Work|Admin|Dashboard|Case|New|Open|Save|Cancel|Delete|Edit|View|Help|About|Contact|Submit|Reset|Loading|Error|Success|Warning|Info|File|Folder|User|Group|Role|Permission|Access|Token|API|URL|JSON|XML|HTML|CSS)\b/gi) || [];
    const germanWords = text.match(/\b(Startseite|Meine Arbeit|Wissen|Dokumente|Verwaltung|Vorgang|Suchen|Hochladen|Herunterladen|Einstellungen|Profil|Abmelden|Speichern|Loeschen|Bearbeiten|Ansehen|Hilfe|Neu|Absenden|Zuruecksetzen|Fehler|Erfolg|Warnung|Info|Datei|Ordner|Benutzer|Gruppe|Rolle|Berechtigung|Zugriff|Laden|Entscheidung|Vorschau|Vorschrift|Vergabe|Beschaffung|Bauordnung)\b/gi) || [];
    console.log(`  ${label.padEnd(20)} German:${germanWords.length} words  English:${englishWords.length} words`);
    if (englishWords.length > germanWords.length) note(label, "MEDIUM", `More English than German terms (${englishWords.length} vs ${germanWords.length})`);
  }

  console.log("\n=== 4. BUTTON & UI ELEMENT CONSISTENCY ===\n");

  // Check button styles across modules
  const btnPages = ["/home", "/work", "/documents", "/knowledge", "/assistant", "/admin/audit"];
  for (const p of btnPages) {
    await checkPage(page, p, p);
    const btnCount = await page.locator("button").count().catch(() => 0);
    const primaryBtns = await page.locator('button[class*=primary], button[class*=Primary]').count().catch(() => 0);
    const secondaryBtns = await page.locator('button[class*=secondary], button[class*=Secondary]').count().catch(() => 0);
    console.log(`  ${p.padEnd(25)} buttons:${btnCount} primary:${primaryBtns} secondary:${secondaryBtns}`);
    if (btnCount === 0 && p !== "/home") note(p, "MEDIUM", "No buttons found — page may feel unactionable");
  }

  console.log("\n=== 5. EMPTY STATE CONSISTENCY ===\n");

  // Check empty states across modules
  await checkPage(page, "/work", "My Work");
  const emptyWork = await page.locator('text=Keine, text=keine, text=empty, text=Empty, text=leer').first().isVisible().catch(() => false);
  console.log(`  My Work empty state visible: ${emptyWork}`);

  await checkPage(page, "/admin/audit", "Audit");
  const emptyAudit = (await page.locator("body").textContent().catch(() => "")).includes("Keine");
  console.log(`  Audit empty state: ${emptyAudit}`);

  console.log("\n=== 6. AI RESPONSE CONSISTENCY ===\n");

  // Test Decision Support
  await checkPage(page, "/work", "My Work");
  // Find and click first workspace
  const wsLink = page.locator('a[href*="/work/"]').first();
  if (await wsLink.isVisible({ timeout: 2000 }).catch(() => false)) {
    await wsLink.click();
    await page.waitForTimeout(2000);
  }
  // Click Entscheidungshilfe tab
  const dsTab = page.locator('button:has-text("Entscheidungshilfe"), [role=tab]:has-text("Entscheidungshilfe")').first();
  if (await dsTab.isVisible({ timeout: 2000 }).catch(() => false)) {
    await dsTab.click();
    await page.waitForTimeout(1500);
  }
  // Check for question input
  const hasTextarea = await page.locator("textarea").first().isVisible().catch(() => false);
  console.log(`  Decision Support textarea: ${hasTextarea}`);

  // Test AI Assistant
  await checkPage(page, "/assistant", "AI Assistant");
  const asstTextarea = await page.locator("textarea").first().isVisible().catch(() => false);
  const asstHeading = await page.locator("h1, h2").first().textContent().catch(() => "");
  console.log(`  AI Assistant heading: "${asstHeading}" textarea: ${asstTextarea}`);

  // Compare: do both have the same question-input pattern?
  if (hasTextarea && asstTextarea) {
    console.log("  Both AI modules have textarea input — consistent pattern");
  } else if (hasTextarea !== asstTextarea) {
    note("AI", "HIGH", "Decision Support and AI Assistant have different input patterns — inconsistent UX");
  }

  console.log("\n=== 7. TABLE & DATA DISPLAY CONSISTENCY ===\n");

  // Compare table layouts
  const tablePages = ["/documents", "/admin/audit"];
  for (const p of tablePages) {
    await checkPage(page, p, p);
    const hasTable = await page.locator("table, [role=table], [class*=table], [class*=Table], [class*=dataTable]").first().isVisible().catch(() => false);
    const hasRows = await page.locator("tr, [role=row]").count().catch(() => 0);
    console.log(`  ${p.padEnd(25)} table:${hasTable} rows:${hasRows}`);
  }

  console.log("\n=== 8. ERROR HANDLING CONSISTENCY ===\n");

  // Trigger various errors
  // 1. Unknown route
  const errR = await page.goto(`${BASE}/nonexistent-page-xyz`, { waitUntil: "networkidle", timeout: 5000 }).catch(() => null);
  await page.waitForTimeout(1000);
  const notFoundText = await page.locator("body").textContent().catch(() => "");
  const has404 = notFoundText.includes("404") || notFoundText.includes("nicht gefunden") || notFoundText.includes("Not Found");
  console.log(`  404 page: ${has404} (${notFoundText.substring(0, 100)})`);
  if (!has404) note("Routing", "MEDIUM", "No 404 page shown for unknown route — inconsistent error handling");

  // 2. Empty AI question
  await checkPage(page, "/assistant", "AI Assistant");
  const submitBtn = page.locator('button:has-text("absenden"), button:has-text("Frage")').first();
  if (await submitBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
    const wasDisabled = await submitBtn.isDisabled().catch(() => false);
    console.log(`  AI submit disabled when empty: ${wasDisabled}`);
    if (!wasDisabled) note("AI Assistant", "LOW", "Submit button enabled with empty question — should be disabled");
  }

  console.log("\n=== 9. CROSS-MODULE WORKFLOW ===\n");

  // Search → document → AI → audit
  await checkPage(page, "/search", "Search");
  const searchInput = page.locator('input[type=text], input[type=search], [role=searchbox]').first();
  if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await searchInput.fill("Baugenehmigung");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(2000);
    console.log("  Search executed successfully");
  }

  await checkPage(page, "/assistant", "AI Assistant");
  console.log("  AI Assistant accessible after search");

  await checkPage(page, "/admin/audit", "Audit");
  console.log("  Audit accessible after AI");

  console.log("\n=== 10. NAVIGATION FLOW ===");
  // Back button test
  await checkPage(page, "/home", "Home");
  await checkPage(page, "/documents", "Documents");
  await page.goBack();
  const backUrl = page.url();
  console.log(`  Back from Documents → ${backUrl.includes("home") ? "Home ✓" : backUrl}`);

  await browser.close();

  // Summary
  console.log("\n╔══════════════════════════════════════════════╗");
  console.log("║  CONSISTENCY FINDINGS SUMMARY                ║");
  console.log("╚══════════════════════════════════════════════╝\n");

  const high = findings.filter(f => f.severity === "HIGH");
  const med = findings.filter(f => f.severity === "MEDIUM");
  const low = findings.filter(f => f.severity === "LOW");

  console.log(`HIGH:   ${high.length}`);
  high.forEach(f => console.log(`  - ${f.module}: ${f.desc}`));
  console.log(`MEDIUM: ${med.length}`);
  med.forEach(f => console.log(`  - ${f.module}: ${f.desc}`));
  console.log(`LOW:    ${low.length}`);
  low.forEach(f => console.log(`  - ${f.module}: ${f.desc}`));

  const score = Math.max(0, 100 - high.length * 15 - med.length * 7 - low.length * 3);
  console.log(`\nCONSISTENCY SCORE: ${score}/100`);
}

main().catch(e => { console.error(e.message); process.exit(1); });
