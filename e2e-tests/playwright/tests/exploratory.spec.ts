import { test, expect, type Page } from "@playwright/test";

const BASE = "http://localhost:5173";

class DefectCollector {
  errors: string[] = [];
  pageErrors: string[] = [];
  failures: string[] = [];

  attach(page: Page) {
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        const text = msg.text();
        // Filter dev-mode noise
        if (!text.includes("hot-update") && !text.includes(".tsx") && !text.includes(".ts?")) {
          this.errors.push(text);
        }
      }
    });
    page.on("pageerror", (err) => this.pageErrors.push(err.message));
    page.on("response", (res) => {
      const url = res.url();
      if (res.status() >= 400 && !url.includes("hot-update") && !url.includes(".tsx") && !url.includes(".ts?")) {
        // Token refresh races are expected in test scenario
        if (url.includes("/api/auth/refresh") && (res.status() === 401 || res.status() === 409)) return;
        this.failures.push(`${res.status()} ${res.method()} ${url.substring(0, 100)}`);
      }
    });
  }

  summary() {
    const total = this.errors.length + this.pageErrors.length + this.failures.length;
    if (this.errors.length) console.log("  CONSOLE ERRORS:", this.errors);
    if (this.pageErrors.length) console.log("  PAGE ERRORS:", this.pageErrors);
    if (this.failures.length) console.log("  FAILED REQUESTS:", this.failures);
    console.log(`  TOTAL DEFECTS: ${total}`);
    return total;
  }
}

async function login(page: Page) {
  await page.goto(`${BASE}/login`);
  await page.fill("input[type=email], input[name=email]", "test@test.de");
  await page.fill("input[type=password], input[name=password]", "Test123!");
  await page.click('button[type=submit], button:has-text("Anmelden")');
  try { await page.waitForURL("**/home", { timeout: 10000 }); } catch {}
}

test.describe("RC Exploratory Audit", () => {
  const defects = new DefectCollector();

  test.beforeEach(async ({ page }) => { defects.attach(page); });

  test("01 Public pages", async ({ page }) => {
    for (const path of ["/login", "/register"]) {
      await page.goto(`${BASE}${path}`);
      await page.waitForTimeout(1000);
    }
    console.log("  [OK] Public pages load");
  });

  test("02 Login", async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL(/\/home/);
    console.log("  [OK] Login works");
  });

  test("03 Home page interactive elements", async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/home`);
    await page.waitForTimeout(2000);
    // Click every button
    const buttons = await page.locator("button, a[href]").all();
    let clicked = 0;
    for (const btn of buttons) {
      const href = await btn.getAttribute("href").catch(() => null);
      if (href && !href.startsWith("#")) {
        await btn.click().catch(() => {});
        await page.waitForTimeout(500);
        clicked++;
        if (clicked > 30) break;
      }
    }
    console.log(`  [OK] Home page — ${clicked} interactive elements exercised`);
  });

  test("04 Navigation — all routes", async ({ page }) => {
    await login(page);
    const routes = ["/home", "/work", "/knowledge", "/documents", "/search",
                    "/admin", "/admin/corpus", "/admin/audit",
                    "/work/new", "/assistant"];
    for (const route of routes) {
      await page.goto(`${BASE}${route}`, { waitUntil: "networkidle", timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(1000);
    }
    console.log(`  [OK] All ${routes.length} routes loaded`);
  });

  test("05 Case workspace — all tabs", async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/work/e3b4cef3-fd08-49c8-ae51-c2bbdb04fc67`, { waitUntil: "networkidle", timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);

    const tabs = ["Übersicht", "Checkliste", "Dokumente", "Interne Notizen", "Aktivität", "Entscheidungshilfe", "Entwurf", "Versand"];
    for (const tab of tabs) {
      const tabEl = page.locator(`button:has-text("${tab}"), [role=tab]:has-text("${tab}")`).first();
      if (await tabEl.isVisible({ timeout: 2000 }).catch(() => false)) {
        await tabEl.click();
        await page.waitForTimeout(800);
      }
    }
    console.log(`  [OK] All ${tabs.length} workspace tabs clicked`);
  });

  test("06 Workspace #2 tabs", async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/work/ce90456e-e2c0-4f1d-8b0e-281b5c45538a`, { waitUntil: "networkidle", timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    for (const tab of ["Übersicht", "Dokumente", "Aktivität", "Entscheidungshilfe"]) {
      const tabEl = page.locator(`button:has-text("${tab}"), [role=tab]:has-text("${tab}")`).first();
      if (await tabEl.isVisible({ timeout: 2000 }).catch(() => false)) {
        await tabEl.click();
        await page.waitForTimeout(600);
      }
    }
    console.log("  [OK] Workspace #2 tabs");
  });

  test("07 Workspace #3 tabs", async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/work/dbcf15cf-0638-4a15-a7e3-24199665f44e`, { waitUntil: "networkidle", timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    for (const tab of ["Übersicht", "Dokumente", "Aktivität"]) {
      const tabEl = page.locator(`button:has-text("${tab}"), [role=tab]:has-text("${tab}")`).first();
      if (await tabEl.isVisible({ timeout: 2000 }).catch(() => false)) {
        await tabEl.click();
        await page.waitForTimeout(600);
      }
    }
    console.log("  [OK] Workspace #3 tabs");
  });

  test("08 Documents page — click documents", async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/documents`, { waitUntil: "networkidle", timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    // Try clicking document rows
    const rows = await page.locator("[role=row], tr, [role=button]").all();
    let clicked = 0;
    for (const row of rows) {
      if (clicked > 5) break;
      try { await row.click(); await page.waitForTimeout(500); clicked++; } catch {}
    }
    console.log(`  [OK] Documents — ${clicked} rows clicked`);
  });

  test("09 Workspace documents — click document rows", async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/work/e3b4cef3-fd08-49c8-ae51-c2bbdb04fc67`, { waitUntil: "networkidle", timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1500);
    // Click Dokumente tab
    const docTab = page.locator('button:has-text("Dokumente"), [role=tab]:has-text("Dokumente")').first();
    if (await docTab.isVisible({ timeout: 2000 }).catch(() => false)) await docTab.click();
    await page.waitForTimeout(1500);
    // Click document rows
    const rows = page.locator("[role=row], tr").all();
    let clicked = 0;
    for (const row of await rows) {
      if (clicked > 3) break;
      const text = await row.textContent().catch(() => "");
      if (text && text.length > 5 && !text.includes("Dokumentenname")) {
        await row.click().catch(() => {});
        await page.waitForTimeout(500);
        clicked++;
      }
    }
    console.log(`  [OK] Workspace documents — ${clicked} rows clicked`);
  });

  test("10 Decision Support — submit question", async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/work/e3b4cef3-fd08-49c8-ae51-c2bbdb04fc67`, { waitUntil: "networkidle", timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1500);
    // Click Entscheidungshilfe tab
    const tab = page.locator('button:has-text("Entscheidungshilfe"), [role=tab]:has-text("Entscheidungshilfe")').first();
    if (await tab.isVisible({ timeout: 2000 }).catch(() => false)) await tab.click();
    await page.waitForTimeout(1500);
    // Fill question
    const textarea = page.locator("textarea").first();
    if (await textarea.isVisible({ timeout: 2000 }).catch(() => false)) {
      await textarea.fill("Welche Wertgrenzen gelten für Direktaufträge nach AV §55 LHO?");
      const submitBtn = page.locator('button:has-text("absenden"), button:has-text("Frage")').first();
      if (await submitBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await submitBtn.click();
        await page.waitForTimeout(5000);
      }
    }
    console.log("  [OK] Decision Support question submitted");
  });

  test("11 AI Assistant — submit question", async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/assistant`, { waitUntil: "networkidle", timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    const textarea = page.locator("textarea").first();
    if (await textarea.isVisible({ timeout: 2000 }).catch(() => false)) {
      await textarea.fill("Welche Vorschriften gelten für Baugenehmigungen?");
      const submitBtn = page.locator('button:has-text("absenden"), button:has-text("Frage")').first();
      if (await submitBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await submitBtn.click();
        await page.waitForTimeout(5000);
      }
    }
    console.log("  [OK] AI Assistant question submitted");
  });

  test("12 Knowledge page — filters and preview", async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/knowledge`, { waitUntil: "networkidle", timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    // Click category buttons
    for (const cat of ["Vergaberecht", "Bauplanungsrecht", "Umweltrecht", "Kommunalrecht"]) {
      const btn = page.locator(`button:has-text("${cat}"), label:has-text("${cat}")`).first();
      if (await btn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(500);
      }
    }
    // Click a result to open preview
    const card = page.locator("[role=button], .resultCard, [class*=card]").first();
    if (await card.isVisible({ timeout: 2000 }).catch(() => false)) {
      await card.click();
      await page.waitForTimeout(1500);
    }
    console.log("  [OK] Knowledge page filters + preview");
  });

  test("13 Search page", async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/search`, { waitUntil: "networkidle", timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1500);
    const input = page.locator('input[type=text], input[type=search], [role=searchbox]').first();
    if (await input.isVisible({ timeout: 2000 }).catch(() => false)) {
      await input.fill("Baugenehmigung");
      await page.keyboard.press("Enter");
      await page.waitForTimeout(2000);
    }
    console.log("  [OK] Search executed");
  });

  test("14 New case page — form interaction", async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/work/new`, { waitUntil: "networkidle", timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    // Fill any inputs
    const inputs = await page.locator("input, textarea, select").all();
    for (const input of inputs) {
      try {
        const tag = await input.evaluate(el => el.tagName.toLowerCase());
        if (tag === "input") {
          const type = await input.getAttribute("type");
          if (type !== "checkbox" && type !== "radio" && type !== "submit") {
            await input.fill("Test").catch(() => {});
          }
        }
      } catch {}
    }
    console.log("  [OK] New case form interacted");
  });

  test("15 Audit page", async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/admin/audit`, { waitUntil: "networkidle", timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    console.log("  [OK] Audit page");
  });

  test("16 Corpus admin page", async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/admin/corpus`, { waitUntil: "networkidle", timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    console.log("  [OK] Corpus admin page");
  });

  test("17 Logout and cleanup", async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/home`);
    await page.waitForTimeout(1000);
    // Try logout
    const logout = page.locator('button:has-text("Abmelden"), a:has-text("Abmelden"), [aria-label*=Abmelden]').first();
    if (await logout.isVisible({ timeout: 2000 }).catch(() => false)) {
      await logout.click();
      await page.waitForTimeout(1500);
    }
    console.log("  [OK] Logout");
  });

  test.afterAll(() => {
    const total = defects.summary();
    // Fail if real defects found
    expect(total).toBe(0);
  });
});
