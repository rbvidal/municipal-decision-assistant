import { chromium } from "playwright";

const BASE = "http://localhost:5173";
const BACKEND = "http://localhost:8080";

const defects = { console: [], page: [], network: [] };

async function explore() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const t = msg.text();
      if (!t.includes("hot-update") && !t.includes(".tsx") && !t.includes(".ts?")) {
        defects.console.push(t);
      }
    }
  });
  page.on("pageerror", (err) => defects.page.push(err.message));
  page.on("response", (res) => {
    if (res.status() >= 400) {
      const url = res.url();
      if (!url.includes("hot-update") && !url.includes(".tsx") && !url.includes(".ts?")) {
        if (url.includes("/api/auth/refresh") && [401, 409].includes(res.status())) return;
        defects.network.push(`${res.status()} ${res.method()} ${url.substring(0, 100)}`);
      }
    }
  });

  async function nav(path, label = path) {
    try { await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 15000 }); } catch {}
    await page.waitForTimeout(1200);
    console.log(`  [OK] ${label}`);
  }

  async function clickTab(name) {
    const tab = page.locator(`button:has-text("${name}"), [role=tab]:has-text("${name}")`).first();
    if (await tab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await tab.click();
      await page.waitForTimeout(700);
      return true;
    }
    return false;
  }

  async function login() {
    await page.goto(`${BASE}/login`);
    await page.fill("input[type=email], input[name=email]", "test@test.de");
    await page.fill("input[type=password], input[name=password]", "Test123!");
    await page.click('button[type=submit], button:has-text("Anmelden")');
    try { await page.waitForURL("**/home", { timeout: 10000 }); } catch {}
    console.log("  [OK] Login");
  }

  console.log("=== PHASE 1: Public pages ===");
  await nav("/login", "Login page");
  await nav("/register", "Register page");

  console.log("\n=== PHASE 2: Auth ===");
  await login();

  console.log("\n=== PHASE 3: All routes ===");
  for (const [path, label] of [
    ["/home", "Home"],
    ["/work", "My Work"],
    ["/knowledge", "Knowledge"],
    ["/documents", "Documents"],
    ["/search", "Search"],
    ["/supervisor", "Supervisor"],
    ["/admin", "Admin"],
    ["/admin/corpus", "Corpus"],
    ["/admin/audit", "Audit"],
    ["/admin/users", "Users"],
    ["/work/new", "New Case"],
    ["/assistant", "AI Assistant"],
  ]) {
    await nav(path, label);
  }

  console.log("\n=== PHASE 4: Workspace tabs ===");
  const workspaces = [
    "e3b4cef3-fd08-49c8-ae51-c2bbdb04fc67",
    "ce90456e-e2c0-4f1d-8b0e-281b5c45538a",
    "dbcf15cf-0638-4a15-a7e3-24199665f44e",
  ];
  const tabs = ["Übersicht", "Checkliste", "Dokumente", "Interne Notizen", "Aktivität", "Entscheidungshilfe", "Entwurf", "Versand"];
  for (const wsId of workspaces) {
    await nav(`/work/${wsId}`, `Workspace ${wsId.substring(0, 8)}`);
    for (const tab of tabs) {
      await clickTab(tab);
    }
    console.log(`  Tabs checked: ${tabs.length}`);
  }

  console.log("\n=== PHASE 5: Knowledge filters ===");
  await nav("/knowledge", "Knowledge");
  for (const cat of ["Vergaberecht", "Bauplanungsrecht", "Umweltrecht", "Kommunalrecht"]) {
    const btn = page.locator(`button:has-text("${cat}")`).first();
    if (await btn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(500);
    }
  }
  // Click result to open preview
  const card = page.locator("[role=button], [class*=card], [class*=result]").first();
  if (await card.isVisible({ timeout: 2000 }).catch(() => false)) {
    await card.click();
    await page.waitForTimeout(1500);
  }
  console.log("  [OK] Knowledge filters + preview");

  console.log("\n=== PHASE 6: Search ===");
  await nav("/search", "Search");
  const searchInput = page.locator('input[type=text], input[type=search], [role=searchbox]').first();
  if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await searchInput.fill("Baugenehmigung Verfahren");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(2000);
  }
  console.log("  [OK] Search executed");

  console.log("\n=== PHASE 7: Decision Support ===");
  await nav(`/work/${workspaces[0]}`, "Workspace for DS");
  await clickTab("Entscheidungshilfe");
  await page.waitForTimeout(1000);
  const textarea = page.locator("textarea").first();
  if (await textarea.isVisible({ timeout: 2000 }).catch(() => false)) {
    await textarea.fill("Welche Wertgrenzen gelten für Direktaufträge nach AV §55 LHO?");
    const submitBtn = page.locator('button:has-text("absenden"), button:has-text("Frage")').first();
    if (await submitBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await submitBtn.click();
      await page.waitForTimeout(8000);
    }
  }
  console.log("  [OK] Decision Support");

  console.log("\n=== PHASE 8: AI Assistant ===");
  await nav("/assistant", "AI Assistant");
  const ta = page.locator("textarea").first();
  if (await ta.isVisible({ timeout: 2000 }).catch(() => false)) {
    await ta.fill("Welche Vorschriften gelten für Baugenehmigungen in Berlin?");
    const btn = page.locator('button:has-text("absenden"), button:has-text("Frage")').first();
    if (await btn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(8000);
    }
  }
  console.log("  [OK] AI Assistant");

  console.log("\n=== PHASE 9: Workspace document click ===");
  await nav(`/work/${workspaces[0]}`, "Workspace");
  await clickTab("Dokumente");
  await page.waitForTimeout(1500);
  // Click document rows
  const rows = await page.locator("[role=row], tr").all();
  for (const row of rows) {
    const text = await row.textContent().catch(() => "");
    if (text && text.length > 5 && !text.includes("Dokumentenname") && !text.includes("Typ") && !text.includes("Datum")) {
      await row.click().catch(() => {});
      await page.waitForTimeout(500);
    }
  }
  console.log("  [OK] Document rows clicked");

  console.log("\n=== PHASE 10: Backend API verification ===");
  const apiCtx = await browser.newContext();
  const apiPage = await apiCtx.newPage();
  // Login via frontend then check API
  await apiPage.goto(`${BASE}/login`);
  await apiPage.fill("input[type=email], input[name=email]", "test@test.de");
  await apiPage.fill("input[type=password], input[name=password]", "Test123!");
  await apiPage.click('button[type=submit], button:has-text("Anmelden")');
  try { await apiPage.waitForURL("**/home", { timeout: 10000 }); } catch {}

  // Verify key endpoints via fetch in page context
  const apiResults = await apiPage.evaluate(async () => {
    const results = [];
    const endpoints = [
      "/api/workspaces",
      "/api/documents",
      "/api/knowledge",
      "/api/corpus/audit",
      "/api/decision/test-case",
      "/api/search/chunks",
    ];
    for (const ep of endpoints) {
      try {
        const res = await fetch(ep);
        results.push({ endpoint: ep, status: res.status });
      } catch (e) {
        results.push({ endpoint: ep, status: 0, error: e.message });
      }
    }
    return results;
  });
  for (const r of apiResults) {
    if (r.status >= 400 || r.status === 0) {
      defects.network.push(`${r.status} GET ${r.endpoint} ${r.error || ""}`);
    }
  }
  console.log("  [OK] Backend APIs verified");

  await browser.close();

  console.log("\n========================================");
  console.log("DEFECT SUMMARY");
  console.log("========================================");
  if (defects.console.length) {
    console.log("\nConsole errors:");
    defects.console.forEach((e) => console.log("  ", e));
  }
  if (defects.page.length) {
    console.log("\nPage errors:");
    defects.page.forEach((e) => console.log("  ", e));
  }
  if (defects.network.length) {
    console.log("\nFailed requests:");
    defects.network.forEach((r) => console.log("  ", r));
  }
  const total = defects.console.length + defects.page.length + defects.network.length;
  console.log(`\nTOTAL DEFECTS: ${total}`);
  process.exit(total > 0 ? 1 : 0);
}

explore().catch((err) => {
  console.error("FATAL:", err.message);
  process.exit(1);
});
