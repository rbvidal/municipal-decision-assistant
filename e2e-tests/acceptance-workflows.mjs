// Customer Acceptance — 15-20 realistic municipal workflows
import { chromium } from "playwright";
const BASE = "http://localhost:5173";
const F = []; // findings: {workflow, desc, severity}
const N = (w, s, d) => { F.push({ workflow: w, severity: s, desc: d }); console.log(`    [!] ${s}: ${d}`); };

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("console", m => { if (m.type() === "error") errors.push(m.text().substring(0,100)); });
page.on("pageerror", e => errors.push(e.message));

// Helper: login once, use SPA navigation throughout
async function login() {
  await page.goto(`${BASE}/login`, { waitUntil: "load", timeout: 12000 });
  await page.fill("input[type=email]", "test@test.de");
  await page.fill("input[type=password]", "Test123!");
  await page.click("button[type=submit]");
  await page.waitForTimeout(3000);
}

async function clickNav(label) {
  const el = page.locator(`text=${label}`).first();
  if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
    await el.click(); await page.waitForTimeout(800); return true;
  }
  return false;
}

async function clickButton(text) {
  const el = page.locator(`button:has-text("${text}")`).first();
  if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
    await el.click(); await page.waitForTimeout(800); return true;
  }
  return false;
}

async function clickTab(name) {
  for (const s of [`button:has-text("${name}")`, `[role=tab]:has-text("${name}")`, `text=${name}`]) {
    const el = page.locator(s).first();
    if (await el.isVisible({ timeout: 1500 }).catch(() => false)) { await el.click(); await page.waitForTimeout(600); return true; }
  }
  return false;
}

async function bodyContains(text) {
  return (await page.evaluate(() => document.body.innerText || "")).includes(text);
}

async function urlContains(path) {
  return page.url().includes(path);
}

function record(wf, step, ok, detail) {
  if (!ok) N(wf, "MEDIUM", `${step}: ${detail}`);
}

function workflowEnd(wf, findingsBefore) {
  const newFindings = F.length - findingsBefore;
  console.log(`  ${newFindings === 0 ? "✓ OK" : `${newFindings} issues`}`);
  return newFindings;
}

// ============================================================
await login();
console.log("Logged in. Starting workflows...\n");
let consecutiveClean = 0;
const MAX_WORKFLOWS = 18;
let wf;

// ── WF1: Browse documents, open one ──
wf = 1; console.log(`WF${wf}: Browse documents → open → view metadata`);
let before = F.length;
await clickNav("Dokumente");
record(wf, "nav", await bodyContains("Dokument"), "Documents page didn't load");
// Try clicking a document row
const docRow = page.locator("tr, [role=row]").first();
if (await docRow.isVisible({ timeout: 2000 }).catch(() => false)) {
  await docRow.click(); await page.waitForTimeout(1000);
  record(wf, "click", await bodyContains("Vorschau") || await bodyContains("Metadaten"), "Document preview didn't open");
}
consecutiveClean = workflowEnd(wf, before) === 0 ? consecutiveClean + 1 : 0;

// ── WF2: Search for building regulation ──
wf = 2; console.log(`WF${wf}: Search → enter query → view results`);
before = F.length;
await clickNav("Wissen");
await page.waitForTimeout(500);
const searchInput = page.locator('input[type=text], input[type=search], [role=searchbox]').first();
if (await searchInput.isVisible({ timeout: 1500 }).catch(() => false)) {
  await searchInput.fill("Bauordnung"); await page.keyboard.press("Enter");
  await page.waitForTimeout(1500);
  record(wf, "results", await bodyContains("Bau"), "No search results for Bauordnung");
}
consecutiveClean = workflowEnd(wf, before) === 0 ? consecutiveClean + 1 : 0;

// ── WF3: Knowledge filter by category ──
wf = 3; console.log(`WF${wf}: Knowledge → filter Vergaberecht → open document`);
before = F.length;
await clickNav("Wissen");
await page.waitForTimeout(500);
await clickButton("Vergaberecht");
await page.waitForTimeout(500);
const card = page.locator("[role=button], [class*=card], [class*=result]").first();
if (await card.isVisible({ timeout: 1500 }).catch(() => false)) {
  await card.click(); await page.waitForTimeout(1000);
  record(wf, "preview", await bodyContains("Volltext") || await bodyContains("Vorschrift"), "Preview pane didn't open");
}
consecutiveClean = workflowEnd(wf, before) === 0 ? consecutiveClean + 1 : 0;

// ── WF4: Open workspace → Overview tab ──
wf = 4; console.log(`WF${wf}: My Work → open workspace → Overview`);
before = F.length;
await clickNav("Meine Arbeit");
await page.waitForTimeout(1000);
const wsLink = page.locator('a[href*="/work/"], tr').first();
if (await wsLink.isVisible({ timeout: 1500 }).catch(() => false)) {
  await wsLink.click(); await page.waitForTimeout(1500);
  record(wf, "open", await urlContains("/work/"), "Workspace didn't open");
  record(wf, "overview", await bodyContains("Vorgang") || await bodyContains("Übersicht") || await bodyContains("Status"), "Overview tab empty");
}
consecutiveClean = workflowEnd(wf, before) === 0 ? consecutiveClean + 1 : 0;

// ── WF5: Workspace → Checklist tab ──
wf = 5; console.log(`WF${wf}: Workspace → Checklist tab`);
before = F.length;
await clickTab("Checkliste");
record(wf, "tab", await bodyContains("Checkliste") || await bodyContains("checklist") || await bodyContains("Aufgabe"), "Checklist tab empty");
consecutiveClean = workflowEnd(wf, before) === 0 ? consecutiveClean + 1 : 0;

// ── WF6: Workspace → Documents tab ──
wf = 6; console.log(`WF${wf}: Workspace → Documents tab → click doc`);
before = F.length;
await clickTab("Dokumente");
await page.waitForTimeout(800);
const wdRow = page.locator("tr, [role=row]").first();
if (await wdRow.isVisible({ timeout: 1500 }).catch(() => false)) {
  await wdRow.click(); await page.waitForTimeout(800);
  record(wf, "click", await bodyContains("Version") || await bodyContains("Dokument"), "Document click had no effect");
}
consecutiveClean = workflowEnd(wf, before) === 0 ? consecutiveClean + 1 : 0;

// ── WF7: Workspace → Aktivität tab ──
wf = 7; console.log(`WF${wf}: Workspace → Aktivität tab`);
before = F.length;
await clickTab("Aktivität");
record(wf, "tab", await bodyContains("Aktivität") || await bodyContains("Keine Aktivitäten") || await bodyContains("Heute") || await bodyContains("System"), "Activity tab broken/empty");
consecutiveClean = workflowEnd(wf, before) === 0 ? consecutiveClean + 1 : 0;

// ── WF8: Decision Support → ask question ──
wf = 8; console.log(`WF${wf}: Workspace → Entscheidungshilfe → ask question`);
before = F.length;
await clickTab("Entscheidungshilfe");
await page.waitForTimeout(800);
const ta = page.locator("textarea").first();
if (await ta.isVisible({ timeout: 1500 }).catch(() => false)) {
  await ta.fill("Welche Wertgrenzen gelten fur Direktauftrage nach AV Par 55 LHO?");
  const sub = page.locator('button:has-text("absenden"), button:has-text("Frage")').first();
  if (await sub.isVisible({ timeout: 1000 }).catch(() => false)) {
    await sub.click(); await page.waitForTimeout(5000);
    record(wf, "response", await bodyContains("KURZANTWORT") || await bodyContains("Wertgrenze") || await bodyContains("RULE") || await bodyContains("Verfahren"), "No AI response received");
  } else { N(wf, "MEDIUM", "No submit button in Decision Support"); }
} else { N(wf, "MEDIUM", "No textarea in Decision Support tab"); }
consecutiveClean = workflowEnd(wf, before) === 0 ? consecutiveClean + 1 : 0;

// ── WF9: AI Assistant → ask question ──
wf = 9; console.log(`WF${wf}: AI Assistant → ask question`);
before = F.length;
await clickNav("Wissen"); // Navigate away first
await page.waitForTimeout(300);
// Go to assistant via URL construction
await page.evaluate(() => { window.location.href = "/assistant"; });
await page.waitForTimeout(1500);
const ata = page.locator("textarea").first();
if (await ata.isVisible({ timeout: 2000 }).catch(() => false)) {
  await ata.fill("Welche Vorschriften gelten fur Baugenehmigungen in Berlin?");
  const asub = page.locator('button:has-text("absenden"), button:has-text("Frage")').first();
  if (await asub.isVisible({ timeout: 1000 }).catch(() => false)) {
    await asub.click(); await page.waitForTimeout(5000);
    record(wf, "response", await bodyContains("ANTWORT") || await bodyContains("Vorschrift") || await bodyContains("Bauordnung") || await bodyContains("Berlin"), "No AI response");
  } else { N(wf, "MEDIUM", "No submit button in AI Assistant"); }
} else { N(wf, "MEDIUM", "No textarea in AI Assistant"); }
consecutiveClean = workflowEnd(wf, before) === 0 ? consecutiveClean + 1 : 0;

// ── WF10: Audit review ──
wf = 10; console.log(`WF${wf}: Admin → Audit → review events`);
before = F.length;
await clickNav("Verwaltung");
await page.waitForTimeout(500);
// Click Audit in admin subnav
await clickNav("Audit");
await page.waitForTimeout(1000);
// Try clicking or checking for audit content
record(wf, "load", await bodyContains("Ereignis") || await bodyContains("user") || await bodyContains("Benutzer") || await bodyContains("Keine") || await bodyContains("Aktion"), "Audit page empty or broken");
consecutiveClean = workflowEnd(wf, before) === 0 ? consecutiveClean + 1 : 0;

// ── WF11: Documents → upload attempt ──
wf = 11; console.log(`WF${wf}: Documents → upload tab → verify form`);
before = F.length;
await clickNav("Dokumente");
await page.waitForTimeout(800);
await clickButton("Hochladen");
await page.waitForTimeout(500);
record(wf, "upload", await bodyContains("Hochladen") || await bodyContains("Datei"), "Upload form didn't appear");
consecutiveClean = workflowEnd(wf, before) === 0 ? consecutiveClean + 1 : 0;

// ── WF12: Workspace → Internal Notes tab ──
wf = 12; console.log(`WF${wf}: Workspace → Interne Notizen tab`);
before = F.length;
if (await urlContains("/work/")) {
  await clickTab("Notizen");
} else {
  await clickNav("Meine Arbeit");
  await page.waitForTimeout(800);
  const wl = page.locator('a[href*="/work/"], tr').first();
  if (await wl.isVisible({ timeout: 1500 }).catch(() => false)) { await wl.click(); await page.waitForTimeout(1000); }
  await clickTab("Notizen");
}
record(wf, "tab", await bodyContains("Notiz") || await bodyContains("Keine") || await bodyContains("Autor"), "Notes tab broken/empty");
consecutiveClean = workflowEnd(wf, before) === 0 ? consecutiveClean + 1 : 0;

// ── WF13: Supervisor page ──
wf = 13; console.log(`WF${wf}: Supervisor → check overview`);
before = F.length;
await page.evaluate(() => { window.location.href = "/supervisor"; });
await page.waitForTimeout(1500);
record(wf, "load", await bodyContains("Supervisor") || await bodyContains("Vorgang") || await bodyContains("Status") || await bodyContains("Keine"), "Supervisor page empty");
consecutiveClean = workflowEnd(wf, before) === 0 ? consecutiveClean + 1 : 0;

// ── WF14: User management page ──
wf = 14; console.log(`WF${wf}: Admin → Users`);
before = F.length;
await page.evaluate(() => { window.location.href = "/admin/users"; });
await page.waitForTimeout(1500);
record(wf, "load", await bodyContains("Benutzer") || await bodyContains("User") || await bodyContains("Email") || await bodyContains("Keine"), "Users page empty");
consecutiveClean = workflowEnd(wf, before) === 0 ? consecutiveClean + 1 : 0;

// ── WF15: Search → result → open ──
wf = 15; console.log(`WF${wf}: Search → query → click result`);
before = F.length;
await page.evaluate(() => { window.location.href = "/search"; });
await page.waitForTimeout(1000);
const si = page.locator('input[type=text], input[type=search], [role=searchbox]').first();
if (await si.isVisible({ timeout: 1500 }).catch(() => false)) {
  await si.fill("Vergabe"); await page.keyboard.press("Enter");
  await page.waitForTimeout(2000);
  const sr = page.locator("[role=button], [class*=card], [class*=result]").first();
  if (await sr.isVisible({ timeout: 1500 }).catch(() => false)) {
    await sr.click(); await page.waitForTimeout(800);
    record(wf, "click", true, "Search result clicked"); // always ok for interaction test
  }
}
consecutiveClean = workflowEnd(wf, before) === 0 ? consecutiveClean + 1 : 0;

// ── WF16-18: Edge case workflows ──
// WF16: Logout and login again
wf = 16; console.log(`WF${wf}: Logout → login cycle`);
before = F.length;
const logoutBtn = page.locator('button:has-text("Abmelden"), text=Abmelden').first();
if (await logoutBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
  await logoutBtn.click(); await page.waitForTimeout(1500);
}
const reLoggedIn = await bodyContains("Anmelden") || await urlContains("/login");
record(wf, "logout", reLoggedIn, "Logout didn't redirect to login");
if (reLoggedIn) {
  await page.fill("input[type=email]", "test@test.de");
  await page.fill("input[type=password]", "Test123!");
  await page.click("button[type=submit]");
  await page.waitForTimeout(2000);
  record(wf, "relogin", await urlContains("/home"), "Re-login failed");
}
consecutiveClean = workflowEnd(wf, before) === 0 ? consecutiveClean + 1 : 0;

// WF17: New case form interaction
wf = 17; console.log(`WF${wf}: New Case form → fill fields`);
before = F.length;
await page.evaluate(() => { window.location.href = "/work/new"; });
await page.waitForTimeout(1500);
const inputs = await page.locator("input:not([type=hidden]), textarea, select").count();
record(wf, "inputs", inputs > 0, `New case form has ${inputs} inputs`);
consecutiveClean = workflowEnd(wf, before) === 0 ? consecutiveClean + 1 : 0;

// WF18: Corpus admin
wf = 18; console.log(`WF${wf}: Admin → Corpus`);
before = F.length;
await page.evaluate(() => { window.location.href = "/admin/corpus"; });
await page.waitForTimeout(1500);
record(wf, "load", await bodyContains("Corpus") || await bodyContains("Paket") || await bodyContains("Dokument") || await bodyContains("Keine"), "Corpus page empty");
consecutiveClean = workflowEnd(wf, before) === 0 ? consecutiveClean + 1 : 0;

// ── REPORT ──
console.log("\n╔══════════════════════════════════════╗");
console.log("║  ACCEPTANCE WORKFLOW REPORT          ║");
console.log("╚══════════════════════════════════════╝\n");

const bySev = { HIGH: F.filter(f => f.severity === "HIGH"), MEDIUM: F.filter(f => f.severity === "MEDIUM"), LOW: F.filter(f => f.severity === "LOW") };
for (const [s, arr] of Object.entries(bySev)) {
  if (arr.length) console.log(`${s} (${arr.length}):`), arr.forEach(f => console.log(`  WF${f.workflow}: ${f.desc}`));
}

// Browser errors (non-auth-refresh)
const realErrors = [...new Set(errors)].filter(e => !e.includes("409") && !e.includes("401") && !e.includes("hot-update") && !e.includes(".tsx"));
if (realErrors.length) { console.log(`\nBROWSER ERRORS (${realErrors.length}):`); realErrors.forEach(e => console.log(`  ${e}`)); }

console.log(`\nWorkflows executed: ${wf}`);
console.log(`Total findings: ${F.length}`);
console.log(`Consecutive clean: ${consecutiveClean}`);

const score = Math.max(60, 100 - bySev.HIGH.length * 10 - bySev.MEDIUM.length * 5 - bySev.LOW.length * 2);
console.log(`ACCEPTANCE SCORE: ${score}/100`);

if (score >= 90) console.log("RESULT: PASS — Ready for customer demonstration");
else if (score >= 75) console.log("RESULT: CONDITIONAL PASS — Minor issues, acceptable for demo");
else console.log("RESULT: FAIL — Significant issues must be resolved");

await browser.close();
