import { chromium } from "playwright";
const BASE = "http://localhost:5173";
const findings = [];
function note(m, s, d) { findings.push({ module: m, severity: s, desc: d }); console.log(`  [${s}] ${m}: ${d}`); }

async function login(page) {
  await page.goto(`${BASE}/login`);
  await page.fill("input[type=email]", "test@test.de");
  await page.fill("input[type=password]", "Test123!");
  await page.click('button[type=submit]');
  try { await page.waitForURL("**/home", { timeout: 10000 }); } catch {}
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await login(page);

const navLabels = ["Startseite", "Meine Arbeit", "Wissen", "Dokumente", "Verwaltung"];
const routes = { "/home":"Home","/work":"My Work","/knowledge":"Knowledge","/documents":"Documents","/search":"Search","/assistant":"AI Asst","/supervisor":"Supervisor","/admin":"Admin","/admin/corpus":"Corpus","/admin/audit":"Audit","/admin/users":"Users" };

// 1. NAVIGATION
console.log("=== 1. NAVIGATION PRESENCE ===");
let navCount = 0;
for (const [path, label] of Object.entries(routes)) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(600);
  const body = await page.locator("body").textContent().catch(() => "");
  const hasNav = navLabels.some(l => body.includes(l));
  if (hasNav) navCount++;
  if (!hasNav) note(label, "HIGH", "Navigation bar missing");
}
console.log(`  Navigation present on ${navCount}/${Object.keys(routes).length} pages`);

// 2. PAGE STRUCTURE
console.log("\n=== 2. PAGE STRUCTURE ===");
const titles = {};
for (const [path, label] of Object.entries(routes)) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(500);
  const h1 = await page.locator("h1, h2").first().textContent().catch(() => "(none)");
  titles[label] = (h1 || "").trim().substring(0, 50);
  console.log(`  ${label.padEnd(14)} "${titles[label]}"`);
}

// 3. GERMAN CONSISTENCY
console.log("\n=== 3. LANGUAGE ===");
const deTerms = ["Startseite","Meine Arbeit","Wissen","Dokumente","Verwaltung","Vorgang","Suchen","Abmelden","Anmelden","Registrieren","Vorschau","Vorschrift","Vergabe","Entscheidung","Ubersicht","Checkliste","Aktivitat","Notizen","Benutzer"];
const enTerms = ["Search","Upload","Download","Settings","Profile","Logout","Dashboard","Save","Cancel","Delete","Edit","View"];
let de = 0, en = 0;
for (const [path] of Object.entries(routes)) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(400);
  const body = await page.locator("body").textContent().catch(() => "");
  de += deTerms.filter(t => body.toLowerCase().includes(t.toLowerCase())).length;
  en += enTerms.filter(t => body.includes(t)).length;
}
console.log(`  German terms: ${de}  English terms: ${en}`);
if (en > de * 0.15) note("Language", "MEDIUM", `Mixed language: ${en} English vs ${de} German terms`);

// 4. WORKSPACE
console.log("\n=== 4. WORKSPACE TABS ===");
await page.goto(`${BASE}/work`, { waitUntil: "networkidle", timeout: 10000 }).catch(() => {});
await page.waitForTimeout(1500);
const wsLink = page.locator('a[href*="/work/"]').first();
let wsOpen = false;
if (await wsLink.isVisible({ timeout: 2000 }).catch(() => false)) { await wsLink.click(); await page.waitForTimeout(2000); wsOpen = true; }
const tabs = await page.locator('[role=tab], button').all();
const tabTexts = [];
for (const t of tabs) { const txt = (await t.textContent().catch(() => "")).trim(); if (txt && txt.length < 25) tabTexts.push(txt); }
console.log(`  Workspace opened: ${wsOpen}  Tabs: ${tabTexts.join(", ")}`);
const expected = ["Ubersicht","Checkliste","Dokumente","Aktivitat","Entscheidungshilfe","Entwurf","Versand"];
const missing = expected.filter(t => !tabTexts.some(tt => tt.includes(t) || tt.includes(t.replace(/a/g,"ä").replace(/u/g,"ü").replace(/o/g,"ö"))));
if (missing.length) note("Workspace", "MEDIUM", `Missing tabs: ${missing.join(", ")}`);

// 5. AI CONSISTENCY
console.log("\n=== 5. AI MODULES ===");
await page.goto(`${BASE}/assistant`, { waitUntil: "networkidle", timeout: 10000 }).catch(() => {});
await page.waitForTimeout(1200);
const asstTA = await page.locator("textarea").first().isVisible().catch(() => false);
const asstPH = await page.locator("textarea").first().getAttribute("placeholder").catch(() => "");
const asstH1 = await page.locator("h1").first().textContent().catch(() => "(none)");
console.log(`  AI Assistant:  h1="${asstH1}" textarea=${asstTA} placeholder="${asstPH}"`);

// Decision Support
if (wsOpen) {
  const dsTab = page.locator('button:has-text("Entscheidungshilfe")').first();
  if (await dsTab.isVisible({ timeout: 2000 }).catch(() => false)) { await dsTab.click(); await page.waitForTimeout(1000); }
  const dsTA = await page.locator("textarea").first().isVisible().catch(() => false);
  const dsPH = await page.locator("textarea").first().getAttribute("placeholder").catch(() => "");
  console.log(`  Decision Supp: textarea=${dsTA} placeholder="${dsPH}"`);
  if (dsTA && asstTA) {
    if (dsPH !== asstPH) note("AI", "LOW", `Different placeholder text: DS="${dsPH}" vs Asst="${asstPH}"`);
  }
}

// 6. ERROR HANDLING
console.log("\n=== 6. ERROR HANDLING ===");
await page.goto(`${BASE}/no-such-page-xyz`, { waitUntil: "networkidle", timeout: 5000 }).catch(() => {});
await page.waitForTimeout(1000);
const e404 = await page.locator("body").textContent().catch(() => "");
const is404 = e404.includes("nicht gefunden") || e404.includes("existiert nicht");
console.log(`  404: ${is404} "${e404.substring(0, 100).replace(/\s+/g, ' ')}"`);
if (!is404) note("Error", "HIGH", "No proper 404 page");

const page2 = await browser.newPage();
await page2.goto(`${BASE}/admin/audit`, { waitUntil: "networkidle", timeout: 10000 }).catch(() => {});
await page2.waitForTimeout(1000);
const redirected = page2.url().includes("/login");
console.log(`  Auth redirect: ${redirected}`);
if (!redirected) note("Auth", "HIGH", "Unauthenticated access not redirected");
await page2.close();

// 7. CROSS-MODULE WORKFLOW
console.log("\n=== 7. CROSS-MODULE FLOW ===");
const flow = ["/home","/search","/knowledge","/documents","/assistant","/admin/audit"];
let fail = 0;
for (const p of flow) {
  await page.goto(`${BASE}${p}`, { waitUntil: "networkidle", timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(400);
  if (!page.url().includes(p.replace("/",""))) fail++;
}
console.log(`  ${flow.length} modules navigated: ${fail} failures`);

// 8. OUTPUT SUMMARY
console.log("\n========================================");
const h = findings.filter(f => f.severity === "HIGH");
const m = findings.filter(f => f.severity === "MEDIUM");
const l = findings.filter(f => f.severity === "LOW");
console.log(`HIGH (${h.length}):`); h.forEach(f => console.log(`  ${f.module}: ${f.desc}`));
console.log(`MEDIUM (${m.length}):`); m.forEach(f => console.log(`  ${f.module}: ${f.desc}`));
console.log(`LOW (${l.length}):`); l.forEach(f => console.log(`  ${f.module}: ${f.desc}`));
const score = Math.max(40, 100 - h.length * 12 - m.length * 5 - l.length * 2);
console.log(`\nCONSISTENCY SCORE: ${score}/100`);

await browser.close();
