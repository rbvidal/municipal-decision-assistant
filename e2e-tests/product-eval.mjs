// Product Consistency Evaluation — focused, rapid
import { chromium } from "playwright";
const BASE = "http://localhost:5173";
const F = []; // findings
const N = (m, s, d) => { F.push({ module: m, severity: s, desc: d }); };

async function login(page) {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle", timeout: 15000 });
  await page.fill("input[type=email]", "test@test.de");
  await page.fill("input[type=password]", "Test123!");
  await page.click('button[type=submit]');
  await page.waitForURL("**/home", { timeout: 10000 });
  await page.waitForTimeout(1000);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await login(page);

// ── 1. NAVIGATION & PAGE STRUCTURE ──
console.log("=== 1. NAVIGATION & PAGE STRUCTURE ===\n");
const navTerms = ["Startseite", "Meine Arbeit", "Wissen", "Dokumente", "Verwaltung"];
const routes = [
  ["/home", "Home"], ["/work", "My Work"], ["/knowledge", "Knowledge"],
  ["/documents", "Documents"], ["/search", "Search"], ["/assistant", "AI Asst"],
  ["/supervisor", "Supervisor"], ["/admin", "Admin"], ["/admin/corpus", "Corpus"],
  ["/admin/audit", "Audit"], ["/admin/users", "Users"]
];

let navOk = 0;
const headings = {};
for (const [path, label] of routes) {
  await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded", timeout: 12000 }).catch(() => {});
  await page.waitForTimeout(1500);

  const info = await page.evaluate((navs) => {
    const text = document.body.innerText || "";
    const h1s = Array.from(document.querySelectorAll("h1")).map(e => e.textContent?.trim()).filter(Boolean);
    const h2s = Array.from(document.querySelectorAll("h2")).map(e => e.textContent?.trim()).filter(Boolean);
    const navPresent = navs.some(n => text.includes(n));
    return { navPresent, h1: h1s[0] || "", h2: h2s[0] || "", textLen: text.length };
  }, navTerms);

  headings[label] = info.h1 || info.h2 || "(none)";
  if (info.navPresent) navOk++;
  else N(label, "HIGH", "Navigation bar not visible on page");

  console.log(`  ${label.padEnd(14)} nav:${info.navPresent} h1:"${info.h1.substring(0,40)}" h2:"${info.h2.substring(0,40)}" text:${info.textLen}ch`);
}
console.log(`  Navigation present on ${navOk}/${routes.length} pages`);

// Check heading uniqueness
const uniqueH1s = new Set(Object.values(headings));
if (uniqueH1s.size <= 2) N("Pages", "MEDIUM", `Only ${uniqueH1s.size} unique h1 headings across ${routes.length} pages — pages lack distinct titles`);

// ── 2. LANGUAGE CONSISTENCY ──
console.log("\n=== 2. LANGUAGE ===\n");
const deWords = ["Startseite","Meine Arbeit","Wissen","Dokumente","Verwaltung","Vorgang","Suchen","Abmelden","Anmelden","Registrieren","Vorschau","Vorschrift","Vergabe","Entscheidung","Übersicht","Checkliste","Aktivität","Notizen","Benutzer","Speichern","Löschen","Bearbeiten","Filter","Zurücksetzen"];
const enWords = ["Search","Upload","Download","Settings","Profile","Logout","Dashboard","Save","Cancel","Delete","Edit","View","Help"];

let de = 0, en = 0;
for (const [path] of routes) {
  await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded", timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(800);
  const text = await page.evaluate(() => document.body.innerText || "");
  de += deWords.filter(w => text.includes(w)).length;
  en += enWords.filter(w => text.includes(w)).length;
}
console.log(`  German terms: ${de}  English terms: ${en}`);
if (en > de * 0.1) N("Language", "MEDIUM", `Mixed language: ${en} English vs ${de} German terms`);
else console.log("  Language is consistently German ✓");

// ── 3. WORKSPACE ──
console.log("\n=== 3. WORKSPACE ===\n");
await page.goto(`${BASE}/work`, { waitUntil: "domcontentloaded", timeout: 10000 }).catch(() => {});
await page.waitForTimeout(2000);

// Try multiple strategies to open a workspace
let wsOpened = false;
const wsSelectors = ['a[href*="/work/"]', '[role="link"]', 'tr', '[class*=card]', '[class*=item]'];
for (const sel of wsSelectors) {
  const el = page.locator(sel).first();
  if (await el.isVisible({ timeout: 1000 }).catch(() => false)) {
    const href = await el.getAttribute("href").catch(() => null);
    if (href && href.includes("/work/")) {
      await el.click();
      wsOpened = true;
      break;
    }
    // Try clicking anyway
    await el.click().catch(() => {});
    await page.waitForTimeout(1500);
    if (page.url().includes("/work/")) {
      wsOpened = true;
      break;
    }
  }
}

if (wsOpened) {
  await page.waitForTimeout(1500);
  const tabs = await page.evaluate(() =>
    Array.from(document.querySelectorAll('[role="tab"], button'))
      .map(e => e.textContent?.trim()).filter(t => t && t.length < 25)
  );
  console.log(`  Workspace opened ✓  Tabs: ${tabs.join(", ")}`);
  const expectedTabs = ["Übersicht", "Checkliste", "Dokumente", "Aktivität", "Entscheidungshilfe"];
  const missing = expectedTabs.filter(t => !tabs.some(tt => tt.includes(t)));
  if (missing.length) N("Workspace", "MEDIUM", `Missing tabs: ${missing.join(", ")}`);
} else {
  N("Workspace", "HIGH", "Cannot open workspace from My Work page");
  console.log("  Workspace NOT opened — link not found");
}

// ── 4. AI MODULE CONSISTENCY ──
console.log("\n=== 4. AI MODULES ===\n");
// AI Assistant
await page.goto(`${BASE}/assistant`, { waitUntil: "domcontentloaded", timeout: 10000 }).catch(() => {});
await page.waitForTimeout(1500);
const asst = await page.evaluate(() => ({
  hasTextarea: !!document.querySelector("textarea"),
  placeholder: document.querySelector("textarea")?.placeholder || "",
  h1: document.querySelector("h1")?.textContent?.trim() || "",
  hasSubmitBtn: !!Array.from(document.querySelectorAll("button")).find(b => b.textContent?.includes("absenden") || b.textContent?.includes("Frage")),
}));
console.log(`  AI Asst: h1="${asst.h1}" textarea=${asst.hasTextarea} submit=${asst.hasSubmitBtn} ph="${asst.placeholder}"`);

// Decision Support (if workspace is open)
if (wsOpened) {
  const dsTab = page.locator('button:has-text("Entscheidungshilfe")').first();
  if (await dsTab.isVisible({ timeout: 2000 }).catch(() => false)) {
    await dsTab.click();
    await page.waitForTimeout(1500);
  }
  const ds = await page.evaluate(() => ({
    hasTextarea: !!document.querySelector("textarea"),
    placeholder: document.querySelector("textarea")?.placeholder || "",
    hasSubmitBtn: !!Array.from(document.querySelectorAll("button")).find(b => b.textContent?.includes("absenden") || b.textContent?.includes("Frage")),
  }));
  console.log(`  Decision: textarea=${ds.hasTextarea} submit=${ds.hasSubmitBtn} ph="${ds.placeholder}"`);

  // Compare
  if (asst.hasTextarea && ds.hasTextarea) {
    if (asst.placeholder !== ds.placeholder) N("AI", "LOW", `Placeholder differs: "${asst.placeholder}" vs "${ds.placeholder}"`);
    else console.log("  Both AI modules consistent ✓");
  }
  if (asst.hasTextarea !== ds.hasTextarea) N("AI", "MEDIUM", "AI Assistant and Decision Support have different input patterns");
}

// ── 5. ERROR HANDLING ──
console.log("\n=== 5. ERROR HANDLING ===\n");
// 404
await page.goto(`${BASE}/nonexistent-xyz-page`, { waitUntil: "domcontentloaded", timeout: 8000 }).catch(() => {});
await page.waitForTimeout(1000);
const e404 = await page.evaluate(() => document.body.innerText || "");
const has404 = e404.includes("nicht gefunden") || e404.includes("existiert nicht") || e404.includes("404");
console.log(`  404 page: ${has404} "${e404.substring(0,100).replace(/\\s+/g,' ')}"`);
if (!has404) N("Error", "HIGH", "No proper 404 page for unknown routes");

// Auth redirect
const page2 = await browser.newPage();
await page2.goto(`${BASE}/admin/audit`, { waitUntil: "domcontentloaded", timeout: 10000 }).catch(() => {});
await page2.waitForTimeout(1000);
const redirected = page2.url().includes("/login");
console.log(`  Auth guard: ${redirected ? "redirected to /login ✓" : "NO REDIRECT"}`);
if (!redirected) N("Auth", "HIGH", "Unauthenticated access not redirected to login");
await page2.close();

// ── 6. CROSS-MODULE FLOW ──
console.log("\n=== 6. CROSS-MODULE FLOW ===\n");
const flow = ["/home", "/search", "/knowledge", "/documents", "/assistant", "/admin/audit"];
let flowOk = 0;
for (const p of flow) {
  await page.goto(`${BASE}${p}`, { waitUntil: "domcontentloaded", timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(800);
  if (page.url().includes(p.replace("/",""))) flowOk++;
}
console.log(`  ${flowOk}/${flow.length} modules navigated successfully`);
if (flowOk < flow.length) N("Navigation", "MEDIUM", `${flow.length - flowOk} navigation failures in cross-module flow`);

// ── 7. TABLE / DATA DISPLAY ──
console.log("\n=== 7. TABLE & DATA DISPLAY ===\n");
for (const [path, label] of [["/documents","Documents"],["/admin/audit","Audit"]]) {
  await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded", timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(1500);
  const info = await page.evaluate(() => ({
    hasTable: !!document.querySelector("table"),
    hasRows: document.querySelectorAll("tr").length,
    hasCards: document.querySelectorAll("[class*=card],[class*=Card],[class*=result]").length,
  }));
  console.log(`  ${label.padEnd(14)} table:${info.hasTable} rows:${info.hasRows} cards:${info.hasCards}`);
}

// ── FINAL ──
console.log("\n╔══════════════════════════════════╗");
console.log("║  PRODUCT CONSISTENCY SUMMARY     ║");
console.log("╚══════════════════════════════════╝\n");

const H = F.filter(f => f.severity === "HIGH");
const M = F.filter(f => f.severity === "MEDIUM");
const L = F.filter(f => f.severity === "LOW");

[["HIGH", H], ["MEDIUM", M], ["LOW", L]].forEach(([lvl, arr]) => {
  if (arr.length) { console.log(`${lvl} (${arr.length}):`); arr.forEach(f => console.log(`  ${f.module}: ${f.desc}`)); }
});
if (F.length === 0) console.log("  No inconsistencies found!");

const score = Math.max(45, 100 - H.length * 12 - M.length * 5 - L.length * 2);
console.log(`\nPRODUCT CONSISTENCY SCORE: ${score}/100`);

await browser.close();
