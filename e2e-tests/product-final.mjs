// Product Consistency Evaluation — FINAL (corrected)
import { chromium } from "playwright";
const BASE = "http://localhost:5173";
const F = []; // findings
const N = (m, s, d) => { F.push({ module: m, severity: s, desc: d }); };

async function nav(page, path) {
  // Use "load" not "networkidle" — auth refresh retries prevent idle detection
  try { await page.goto(`${BASE}${path}`, { waitUntil: "load", timeout: 12000 }); } catch {}
  await page.waitForTimeout(1500);
}

async function login(page) {
  await nav(page, "/login");
  await page.fill("input[type=email]", "test@test.de");
  await page.fill("input[type=password]", "Test123!");
  await page.click("button[type=submit]");
  await page.waitForTimeout(3000);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

// Collect console errors
const consoleErrors = [];
page.on("console", msg => { if (msg.type() === "error") consoleErrors.push(msg.text().substring(0,120)); });

await login(page);

// ── 1. NAVIGATION ──
console.log("=== 1. NAVIGATION & PAGE STRUCTURE ===\n");
const navTerms = ["Startseite", "Meine Arbeit", "Wissen", "Dokumente", "Verwaltung"];
const routes = [
  ["/home", "Home"], ["/work", "My Work"], ["/knowledge", "Knowledge"],
  ["/documents", "Documents"], ["/search", "Search"], ["/assistant", "AI Asst"],
  ["/supervisor", "Supervisor"], ["/admin", "Admin"], ["/admin/corpus", "Corpus"],
  ["/admin/audit", "Audit"], ["/admin/users", "Users"]
];

let navOk = 0, loggedIn = 0;
for (const [path, label] of routes) {
  await nav(page, path);
  const info = await page.evaluate((n) => {
    const text = document.body.innerText || "";
    const h1s = Array.from(document.querySelectorAll("h1")).map(e => e.textContent?.trim()).filter(Boolean);
    const navPresent = n.some(t => text.includes(t));
    const isLogin = text.includes("Anmelden") && text.includes("Passwort") && !text.includes("Guten Morgen");
    const textLen = text.length;
    return { navPresent, h1: h1s[0] || "", isLogin, textLen };
  }, navTerms);

  navOk += info.navPresent ? 1 : 0;
  loggedIn += info.isLogin ? 0 : 1;
  const state = info.isLogin ? "LOGIN-SHOWN" : info.navPresent ? "OK" : "NO-NAV";
  if (info.isLogin) N(label, "HIGH", "Login page shown instead of actual content — session lost");
  if (!info.navPresent && !info.isLogin) N(label, "MEDIUM", "Navigation bar not visible");

  console.log(`  ${label.padEnd(14)} nav:${info.navPresent} logged-in:${!info.isLogin} h1:"${info.h1.substring(0,50)}" text:${info.textLen}ch → ${state}`);
}
console.log(`  Navigation: ${navOk}/${routes.length}  Logged-in: ${loggedIn}/${routes.length}`);

// ── 2. LANGUAGE ──
console.log("\n=== 2. LANGUAGE ===\n");
const deWords = ["Startseite","Meine Arbeit","Wissen","Dokumente","Verwaltung","Vorgang","Suchen","Abmelden","Anmelden","Registrieren","Vorschau","Vorschrift","Vergabe","Entscheidung","Filter","Zurücksetzen"];
const enWords = ["Search","Upload","Download","Settings","Profile","Logout","Dashboard","Save","Cancel","Delete","Edit","View"];
let de = 0, en = 0;
for (const [path] of routes) {
  await nav(page, path);
  const text = await page.evaluate(() => document.body.innerText || "");
  de += deWords.filter(w => text.includes(w)).length;
  en += enWords.filter(w => text.includes(w)).length;
}
console.log(`  German: ${de}  English: ${en}`);
console.log(`  Language: ${en > de * 0.1 ? "MIXED" : "CONSISTENTLY GERMAN ✓"}`);

// ── 3. WORKSPACE ──
console.log("\n=== 3. WORKSPACE ===\n");
await nav(page, "/work");
const wsLink = page.locator('a[href*="/work/"], tr, [role="link"]').first();
let wsOpen = false;
if (await wsLink.isVisible({ timeout: 2000 }).catch(() => false)) {
  await wsLink.click().catch(() => {});
  await page.waitForTimeout(2000);
  wsOpen = page.url().includes("/work/");
}
if (wsOpen) {
  const tabs = await page.evaluate(() =>
    Array.from(document.querySelectorAll('[role="tab"], button')).map(e => e.textContent?.trim()).filter(t => t && t.length < 25)
  );
  console.log(`  Opened ✓  Tabs: ${tabs.slice(0,10).join(", ")}`);
} else {
  // Try navigating directly to a known workspace
  await nav(page, "/work");
  await page.waitForTimeout(1000);
  const links = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a')).filter(a => a.href.includes('/work/') && a.href.split('/').length > 4).map(a => a.href)
  );
  if (links.length) {
    await nav(page, links[0].replace(BASE, ""));
    wsOpen = page.url().includes("/work/");
    console.log(`  Direct nav to workspace: ${wsOpen ? "OK ✓" : "FAILED"}`);
  } else {
    console.log("  No workspace links found on /work page");
    N("Workspace", "HIGH", "Cannot navigate to workspace");
  }
}

// ── 4. AI MODULES ──
console.log("\n=== 4. AI MODULES ===\n");
await nav(page, "/assistant");
const asst = await page.evaluate(() => ({
  h1: (document.querySelector("h1")?.textContent || "").trim().substring(0,60),
  hasTextarea: !!document.querySelector("textarea"),
  ph: document.querySelector("textarea")?.placeholder || "",
  hasSubmit: !!Array.from(document.querySelectorAll("button")).find(b => (b.textContent||"").includes("absenden") || (b.textContent||"").includes("Frage")),
}));
console.log(`  AI Asst: h1="${asst.h1}" txt=${asst.hasTextarea} sub=${asst.hasSubmit} ph="${asst.ph}"`);

// Decision Support
if (wsOpen) {
  const dsTab = page.locator('button:has-text("Entscheidungshilfe"), [role=tab]:has-text("Entscheidungshilfe")').first();
  if (await dsTab.isVisible({ timeout: 2000 }).catch(() => false)) {
    await dsTab.click();
    await page.waitForTimeout(1500);
  }
  const ds = await page.evaluate(() => ({
    hasTextarea: !!document.querySelector("textarea"),
    ph: document.querySelector("textarea")?.placeholder || "",
    hasSubmit: !!Array.from(document.querySelectorAll("button")).find(b => (b.textContent||"").includes("absenden") || (b.textContent||"").includes("Frage")),
  }));
  console.log(`  Decision: txt=${ds.hasTextarea} sub=${ds.hasSubmit} ph="${ds.ph}"`);
  if (asst.hasTextarea && ds.hasTextarea && asst.ph === ds.ph) console.log("  Both consistent ✓");
  else if (asst.ph !== ds.ph) N("AI", "LOW", `Placeholders differ: "${asst.ph}" vs "${ds.ph}"`);
}

// ── 5. ERROR & EDGE CASES ──
console.log("\n=== 5. ERROR HANDLING ===\n");
await nav(page, "/nonexistent-xyz");
const e404 = await page.evaluate(() => (document.body.innerText || "").includes("nicht gefunden") || (document.body.innerText || "").includes("existiert nicht"));
console.log(`  404: ${e404}`);

const p2 = await browser.newPage();
await p2.goto(`${BASE}/admin/audit`, { waitUntil: "load", timeout: 10000 }).catch(() => {});
await p2.waitForTimeout(1000);
const redirected = p2.url().includes("/login");
console.log(`  Auth guard: ${redirected ? "redirect ✓" : "FAIL"}`);
await p2.close();

// ── 6. CROSS-MODULE FLOW ──
console.log("\n=== 6. FLOW ===\n");
const flowRoutes = ["/home","/search","/knowledge","/documents","/assistant","/admin/audit"];
let flowOk = 0;
for (const p of flowRoutes) {
  await nav(page, p);
  if (page.url().includes(p.replace("/",""))) flowOk++;
}
console.log(`  ${flowOk}/${flowRoutes.length} modules navigated`);

// ── 7. CONSOLE ERRORS ──
console.log("\n=== 7. BROWSER ERRORS ===\n");
const unique = [...new Set(consoleErrors)].filter(e => !e.includes("409") && !e.includes("401") && !e.includes("hot-update") && !e.includes("tsx"));
console.log(`  Total console errors: ${consoleErrors.length}`);
console.log(`  Unique (excl. auth refresh): ${unique.length}`);
unique.forEach(e => console.log(`    ${e}`));
if (unique.length) N("Console", "HIGH", `${unique.length} unique browser console errors — production must have zero`);

// ── FINAL ──
console.log("\n╔══════════════════════════════════╗");
console.log("║  PRODUCT CONSISTENCY SUMMARY     ║");
console.log("╚══════════════════════════════════╝\n");

const H = F.filter(f => f.severity === "HIGH");
const M = F.filter(f => f.severity === "MEDIUM");
const L = F.filter(f => f.severity === "LOW");
if (F.length === 0) console.log("  ✓ No inconsistencies found!");
[["HIGH",H],["MEDIUM",M],["LOW",L]].forEach(([lvl,arr]) => {
  if (arr.length) { console.log(`${lvl} (${arr.length}):`); arr.forEach(f => console.log(`  ${f.module}: ${f.desc}`)); }
});

const score = Math.max(50, 100 - H.length * 12 - M.length * 5 - L.length * 2);
console.log(`\nPRODUCT CONSISTENCY SCORE: ${score}/100`);
await browser.close();
