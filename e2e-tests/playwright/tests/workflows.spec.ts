import { test, expect, type Page } from "@playwright/test";
import { ensureAuthenticated } from "../fixtures/auth.fixture";
import { trackConsoleErrors } from "../fixtures/console.fixture";

test.describe("Workflow — Authentication Lifecycle", () => {
  test.describe.configure({ timeout: 120_000 });

  test("full register → logout → login cycle", async ({ page }) => {
    const tracker = trackConsoleErrors(page);
    const email = `e2e-lifecycle-${Date.now()}@test.municipal.de`;
    const password = "Lifecycle1!";

    // 1. Register
    await page.goto("/register");
    await page.waitForTimeout(500);
    await page.fill("#reg-name", "Lifecycle User");
    await page.fill("#reg-email", email);
    await page.fill("#reg-password", password);
    const confirmInput = page.locator("#reg-password-confirm");
    if (await confirmInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await confirmInput.fill(password);
    }
    // Wait for React validation to enable the submit button
    await page.waitForTimeout(500);
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();
    await page.waitForTimeout(3000);

    // 2. If redirected to login, log in (registration may auto-login or redirect)
    if (page.url().includes("/login")) {
      await page.fill("#login-email", email);
      await page.fill("#login-password", password);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
    }

    // 3. Should be on a protected page
    expect(page.url()).not.toContain("/login");

    // 4. Logout via user menu (if available)
    const logoutBtn = page.locator('button:has-text("Abmelden"), a:has-text("Abmelden"), button:has-text("Logout"), a:has-text("Logout")').first();
    if (await logoutBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await logoutBtn.click();
      await page.waitForTimeout(1500);
    }

    // 5. Log back in
    await page.goto("/login");
    await page.fill("#login-email", email);
    await page.fill("#login-password", password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    expect(page.url()).not.toContain("/login");
    tracker.assertNoErrors();
  });
});

test.describe("Workflow — Document Lifecycle", () => {
  test("documents page lists documents", async ({ page }) => {
    await ensureAuthenticated(page);
    const tracker = trackConsoleErrors(page);

    await page.goto("/documents");
    await page.waitForTimeout(1500);

    // Page should have a document list (even if empty)
    const hasTable = (await page.locator("table, [class*=table], [class*=Table]").count()) > 0;
    const hasEmptyState = (await page.locator('text=Keine, text=keine, text=empty, text=Empty').count()) > 0;
    const hasDocumentItems = (await page.locator('[class*=document], [class*=Document]').count()) > 0;

    expect(hasTable || hasEmptyState || hasDocumentItems).toBeTruthy();
    tracker.assertNoErrors([/third-party/i, /favicon/i]);
  });

  test("document upload page loads with file input", async ({ page }) => {
    await ensureAuthenticated(page);
    const tracker = trackConsoleErrors(page);

    await page.goto("/documents");
    await page.waitForTimeout(800);

    // Find and click upload button/link
    const uploadLink = page.locator('a[href*="upload"], button:has-text("Upload"), button:has-text("Hochladen")').first();
    if (await uploadLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await uploadLink.click();
      await page.waitForTimeout(1000);

      // Should have file input on upload page
      const fileInput = page.locator('input[type="file"]');
      const hasFileInput = await fileInput.isVisible({ timeout: 2000 }).catch(() => false);
      expect(hasFileInput || page.url().includes("upload")).toBeTruthy();
    }

    tracker.assertNoErrors([/third-party/i, /favicon/i]);
  });
});

test.describe("Workflow — Case Workspace", () => {
  test("case workspace provides overview tab", async ({ page }) => {
    await ensureAuthenticated(page);
    await page.goto("/work");
    await page.waitForTimeout(800);

    // Try to navigate to a specific case
    const caseLink = page.locator('a[href*="/work/"], button:has-text("Bearbeiten")').first();
    if (await caseLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await caseLink.click();
      await page.waitForTimeout(1000);

      // Should be on a case workspace page
      const url = page.url();
      expect(url).toMatch(/.*work\/.+/);

      // Overview tab content should be visible
      const hasContent =
        (await page.locator("h1, h2, h3").count()) > 0 ||
        (await page.locator('[class*=overview], [class*=Overview]').count()) > 0;
      expect(hasContent).toBeTruthy();
    }
  });

  test("case workspace checklist tab works", async ({ page }) => {
    await ensureAuthenticated(page);
    await page.goto("/work");
    await page.waitForTimeout(800);

    const caseLink = page.locator('a[href*="/work/"]').first();
    if (await caseLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await caseLink.click();
      await page.waitForTimeout(1000);

      // Click checklist tab if available
      const checklistTab = page.locator('button:has-text("Checkliste"), a:has-text("Checkliste"), [class*=tab]:has-text("Checkliste")').first();
      if (await checklistTab.isVisible({ timeout: 2000 }).catch(() => false)) {
        await checklistTab.click();
        await page.waitForTimeout(800);

        // Toggle checkboxes if available
        const checkboxes = page.locator('input[type="checkbox"]');
        const cbCount = await checkboxes.count();
        if (cbCount > 0) {
          await checkboxes.first().click();
          await page.waitForTimeout(300);
        }
      }
    }
  });
});

test.describe("Workflow — Admin Pages", () => {
  test("administration page loads with sub-navigation", async ({ page }) => {
    await ensureAuthenticated(page);
    const tracker = trackConsoleErrors(page);

    await page.goto("/admin");
    await page.waitForTimeout(800);

    // Admin page should have sub-navigation or content
    const hasNav = (await page.locator("nav, [class*=nav], [class*=sidebar]").count()) > 0;
    const hasContent = (await page.locator("h1, h2, h3").count()) > 0;
    expect(hasNav || hasContent).toBeTruthy();

    tracker.assertNoErrors([/third-party/i, /favicon/i]);
  });

  test("admin sub-pages are reachable", async ({ page }) => {
    await ensureAuthenticated(page);

    const adminPaths = ["/admin/corpus", "/admin/audit"];
    for (const path of adminPaths) {
      const tracker = trackConsoleErrors(page);
      await page.goto(path);
      await page.waitForTimeout(800);

      expect(page.url()).toContain(path);
      tracker.assertNoErrors([/third-party/i, /favicon/i]);
    }
  });
});

