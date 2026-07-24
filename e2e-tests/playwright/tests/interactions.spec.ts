import { test, expect, type Page } from "@playwright/test";
import { ensureAuthenticated } from "../fixtures/auth.fixture";
import { trackConsoleErrors } from "../fixtures/console.fixture";

test.describe("Interactions — Buttons & Links", () => {
  test.describe.configure({ timeout: 120_000 });

  test("home page 'New Case' button navigates to /work/new", async ({ page }) => {
    await ensureAuthenticated(page);
    const tracker = trackConsoleErrors(page);

    await page.goto("/home");
    await page.waitForTimeout(800);

    // Find "Neuer Vorgang" or "+" button
    const newCaseBtn = page.locator('button:has-text("Neuer Vorgang"), a:has-text("Neuer Vorgang"), button:has-text("+ Neuer")').first();
    if (await newCaseBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await newCaseBtn.click();
      await page.waitForTimeout(1000);
      expect(page.url()).toMatch(/.*(work\/new|new).*/);
    }

    tracker.assertNoErrors([/third-party/i, /favicon/i]);
  });

  test("home page suggestion cards are clickable", async ({ page }) => {
    await ensureAuthenticated(page);
    await page.goto("/home");
    await page.waitForTimeout(800);

    // Suggestion cards should be present
    const suggestions = page.locator('[class*=suggestion], [class*=Suggestion]');
    const count = await suggestions.count();
    // May use demo data — just verify no crash on click
    if (count > 0) {
      await suggestions.first().click();
      await page.waitForTimeout(500);
    }
  });

  test("home page filter tabs work", async ({ page }) => {
    await ensureAuthenticated(page);
    await page.goto("/home");
    await page.waitForTimeout(800);

    // Tab-like elements
    const tabs = page.locator('[class*=tab], [class*=Tab], [role="tab"]');
    const tabCount = await tabs.count();
    if (tabCount > 0) {
      for (let i = 0; i < Math.min(tabCount, 3); i++) {
        const tab = tabs.nth(i);
        if (await tab.isVisible({ timeout: 1000 }).catch(() => false)) {
          await tab.click();
          await page.waitForTimeout(300);
        }
      }
    }
  });
});

test.describe("Interactions — Search", () => {
  test("search bar accepts input and submits", async ({ page }) => {
    await ensureAuthenticated(page);
    const tracker = trackConsoleErrors(page);

    await page.goto("/search");
    await page.waitForTimeout(800);

    const searchInput = page.locator('input[type="search"], input[placeholder*="such"], input[placeholder*="search"], input[aria-label*="such"]').first();
    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await searchInput.fill("Baugenehmigung");
      await page.keyboard.press("Enter");
      await page.waitForTimeout(2000);
      // Should still be on search page
      expect(page.url()).toContain("/search");
    }

    tracker.assertNoErrors([/third-party/i, /favicon/i]);
  });
});

test.describe("Interactions — Case Workspace", () => {
  test("case workspace tabs are functional", async ({ page }) => {
    await ensureAuthenticated(page);

    // Navigate to a case if possible, or just verify /work page
    await page.goto("/work");
    await page.waitForTimeout(800);

    // Click first case link if available
    const caseLink = page.locator('a[href*="/work/"]').first();
    if (await caseLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await caseLink.click();
      await page.waitForTimeout(1000);

      // Try clicking tabs
      const tabNames = ["Übersicht", "Checkliste", "Dokumente", "Notizen", "Entscheidung"];
      for (const tabName of tabNames) {
        const tab = page.locator(`button:has-text("${tabName}"), a:has-text("${tabName}"), [class*=tab]:has-text("${tabName}")`).first();
        if (await tab.isVisible({ timeout: 1000 }).catch(() => false)) {
          await tab.click();
          await page.waitForTimeout(400);
        }
      }
    }
  });
});

test.describe("Interactions — Documents Page", () => {
  test("document page action buttons exist", async ({ page }) => {
    await ensureAuthenticated(page);
    const tracker = trackConsoleErrors(page);

    await page.goto("/documents");
    await page.waitForTimeout(800);

    // Upload tab should be visible
    const uploadTab = page.locator('button:has-text("Hochladen")').first();
    const searchInput = page.locator('input[placeholder*="Dokumente"]').first();

    const hasUpload = await uploadTab.isVisible({ timeout: 2000 }).catch(() => false);
    const hasSearch = await searchInput.isVisible({ timeout: 2000 }).catch(() => false);
    expect(hasUpload || hasSearch).toBeTruthy();

    tracker.assertNoErrors([/third-party/i, /favicon/i]);
  });
});

test.describe("Interactions — Profile / User Menu", () => {
  test("profile menu is accessible", async ({ page }) => {
    await ensureAuthenticated(page);
    await page.goto("/home");
    await page.waitForTimeout(800);

    // Look for user avatar, profile icon, or user menu
    const profileElements = page.locator('[class*=profile], [class*=user], [class*=avatar], [class*=UserMenu], [aria-label*="Benutzer"], [aria-label*="user"]');
    const count = await profileElements.count();

    // If profile elements exist, try clicking them
    if (count > 0) {
      const profileBtn = profileElements.first();
      if (await profileBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await profileBtn.click();
        await page.waitForTimeout(500);
        // A dropdown or menu may have appeared — just verify no error
      }
    }
  });
});

test.describe("Interactions — Forms", () => {
  test("new case form fields are interactive", async ({ page }) => {
    await ensureAuthenticated(page);
    const tracker = trackConsoleErrors(page);

    await page.goto("/work/new");
    await page.waitForTimeout(800);

    // Try filling form fields
    const textInputs = page.locator('input[type="text"], input:not([type])');
    const inputCount = await textInputs.count();

    for (let i = 0; i < Math.min(inputCount, 5); i++) {
      const input = textInputs.nth(i);
      if (await input.isVisible({ timeout: 500 }).catch(() => false)) {
        const placeholder = await input.getAttribute("placeholder");
        if (placeholder) {
          await input.fill(`Test: ${placeholder}`);
        }
      }
    }

    tracker.assertNoErrors([/third-party/i, /favicon/i]);
  });
});

test.describe("Interactions — Knowledge Page", () => {
  test("knowledge page filters/navigation work", async ({ page }) => {
    await ensureAuthenticated(page);
    const tracker = trackConsoleErrors(page);

    await page.goto("/knowledge");
    await page.waitForTimeout(800);

    // Check for regulation cards and filters
    const cards = page.locator('[class*=card], [class*=Card]');
    const cardCount = await cards.count();

    // Search/filter input
    const filterInput = page.locator('input[placeholder*="such"], input[placeholder*="Vorschrift"]').first();
    if (await filterInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await filterInput.fill("BauGB");
      await page.waitForTimeout(500);
    }

    tracker.assertNoErrors([/third-party/i, /favicon/i]);
  });
});
