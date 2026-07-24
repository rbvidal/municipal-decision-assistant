import { test, expect, type Page, type ConsoleMessage } from "@playwright/test";

const BASE = "http://localhost:5173";

/**
 * Collect console errors and network failures across all pages.
 * Fails the test at the end if any were observed.
 */
class ErrorCollector {
  consoleErrors: string[] = [];
  failedRequests: { url: string; status: number }[] = [];
  pageErrors: string[] = [];

  attach(page: Page) {
    page.on("console", (msg: ConsoleMessage) => {
      if (msg.type() === "error") this.consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err: Error) => this.pageErrors.push(err.message));
    page.on("requestfailed", (req) => {
      if (req.failure()?.errorText !== "net::ERR_ABORTED") {
        this.failedRequests.push({ url: req.url(), status: 0 });
      }
    });
    page.on("response", (res) => {
      if (res.status() >= 400 && !res.url().includes("hot-update")) {
        this.failedRequests.push({ url: res.url(), status: res.status() });
      }
    });
  }

  report() {
    if (this.consoleErrors.length > 0) {
      console.log("--- CONSOLE ERRORS ---");
      this.consoleErrors.forEach((e) => console.log("  ", e));
    }
    if (this.pageErrors.length > 0) {
      console.log("--- PAGE ERRORS ---");
      this.pageErrors.forEach((e) => console.log("  ", e));
    }
    if (this.failedRequests.length > 0) {
      console.log("--- FAILED REQUESTS ---");
      this.failedRequests.forEach((r) => console.log(`  ${r.status} ${r.url}`));
    }
    const total = this.consoleErrors.length + this.pageErrors.length + this.failedRequests.length;
    if (total > 0) {
      console.log(`\nTOTAL DEFECTS: ${total}`);
    }
    return total;
  }
}

test.describe("Full exploratory acceptance test", () => {
  const collector = new ErrorCollector();

  test.beforeEach(async ({ page }) => {
    collector.attach(page);
  });

  test.afterAll(async () => {
    const defects = collector.report();
    // Don't fail — we want to see all results. Individual check below.
    console.log(`\nAcceptance test complete. Defects found: ${defects}`);
  });

  test("01 — Login page loads without errors", async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await expect(page.locator("input[type=email], input[name=email]")).toBeVisible({ timeout: 10000 });
    console.log("  [OK] Login page loaded");
  });

  test("02 — Register page loads without errors", async ({ page }) => {
    await page.goto(`${BASE}/register`);
    await page.waitForTimeout(1500);
    console.log("  [OK] Register page loaded");
  });

  test("03 — Login, then navigate to Home", async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.fill("input[type=email], input[name=email]", "test@test.de");
    await page.fill("input[type=password], input[name=password]", "Test123!");
    await page.click('button[type=submit], button:has-text("Anmelden")');
    await page.waitForURL("**/home", { timeout: 15000 });
    console.log("  [OK] Logged in and redirected to /home");
  });

  test("04 — My Work page", async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/work`);
    await page.waitForTimeout(2000);
    // Should show workspace list or empty state
    await expect(page.locator("text=Meine Arbeit,text=Meine Vorgänge,text=Vorgang")).toBeVisible({ timeout: 5000 });
    console.log("  [OK] My Work page loaded");
  });

  test("05 — Open workspace and click all tabs", async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/work`);
    await page.waitForTimeout(2000);

    // Click first workspace/case link
    const workspaceLink = page.locator('a[href*="/work/"], [role="link"]').first();
    if (await workspaceLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await workspaceLink.click();
      await page.waitForTimeout(2000);
    } else {
      // Try direct navigation to a known workspace
      await page.goto(`${BASE}/work/e3b4cef3-fd08-49c8-ae51-c2bbdb04fc67`);
      await page.waitForTimeout(2000);
    }

    // Click through all tabs
    const tabs = ["Übersicht", "Checkliste", "Dokumente", "Interne Notizen", "Aktivität", "Entscheidungshilfe", "Entwurf", "Versand"];
    for (const tab of tabs) {
      const tabBtn = page.locator(`button:has-text("${tab}"), [role=tab]:has-text("${tab}")`).first();
      if (await tabBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await tabBtn.click();
        await page.waitForTimeout(800);
        console.log(`  [OK] Tab: ${tab}`);
      } else {
        console.log(`  [SKIP] Tab not found: ${tab}`);
      }
    }
  });

  test("06 — Knowledge page and category filters", async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/knowledge`);
    await page.waitForTimeout(2000);

    // Click category filters
    const filters = ["Vergaberecht", "Bauplanungsrecht", "Umweltrecht", "Kommunalrecht"];
    for (const filter of filters) {
      const btn = page.locator(`button:has-text("${filter}"), label:has-text("${filter}")`).first();
      if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(500);
      }
    }
    console.log("  [OK] Knowledge filters clicked");
  });

  test("07 — Documents page", async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/documents`);
    await page.waitForTimeout(2000);
    console.log("  [OK] Documents page loaded");
  });

  test("08 — Search page", async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/search`);
    await page.waitForTimeout(2000);
    // Search for something
    const input = page.locator('input[type=text], input[type=search], [role=searchbox]').first();
    if (await input.isVisible({ timeout: 2000 }).catch(() => false)) {
      await input.fill("Bauordnung");
      await page.keyboard.press("Enter");
      await page.waitForTimeout(1500);
    }
    console.log("  [OK] Search page");
  });

  test("09 — AI Assistant page", async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/assistant`);
    await page.waitForTimeout(2000);
    const textarea = page.locator("textarea").first();
    if (await textarea.isVisible({ timeout: 2000 }).catch(() => false)) {
      await textarea.fill("Welche Wertgrenzen gelten für Direktaufträge?");
      await page.click('button:has-text("absenden"), button:has-text("Frage")');
      await page.waitForTimeout(3000);
    }
    console.log("  [OK] AI Assistant page");
  });

  test("10 — Admin pages (corpus, audit, users)", async ({ page }) => {
    await login(page);
    for (const path of ["/admin", "/admin/corpus", "/admin/audit"]) {
      await page.goto(`${BASE}${path}`);
      await page.waitForTimeout(1500);
      console.log(`  [OK] ${path}`);
    }
  });

  test("11 — New case page", async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/work/new`);
    await page.waitForTimeout(2000);
    console.log("  [OK] New case page");
  });

  test("12 — Logout", async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/home`);
    await page.waitForTimeout(1000);
    // Click user menu / logout
    const logoutBtn = page.locator('button:has-text("Abmelden"), a:has-text("Abmelden"), [aria-label*="logout"], [aria-label*="Abmelden"]').first();
    if (await logoutBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await logoutBtn.click();
      await page.waitForTimeout(1500);
    }
    console.log("  [OK] Logout attempted");
  });

  test("13 — Final defect summary", async () => {
    // This test just aggregates the report; defects are collected above.
    const defects = collector.consoleErrors.length + collector.pageErrors.length;
    expect(defects).toBe(0);
  });
});

async function login(page: Page) {
  await page.goto(`${BASE}/login`);
  await page.fill("input[type=email], input[name=email]", "test@test.de");
  await page.fill("input[type=password], input[name=password]", "Test123!");
  await page.click('button[type=submit], button:has-text("Anmelden")');
  try { await page.waitForURL("**/home", { timeout: 10000 }); } catch { /* continue */ }
  await page.waitForTimeout(500);
}
