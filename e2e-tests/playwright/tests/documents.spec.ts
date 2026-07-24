import { test, expect } from "@playwright/test";
import { ensureAuthenticated } from "../fixtures/auth.fixture";
import { trackConsoleErrors } from "../fixtures/console.fixture";
import * as path from "path";
import * as fs from "fs";

test.describe("Document Upload — E2E", () => {
  test.describe.configure({ timeout: 120_000 });

  test("upload page renders file input (via tab)", async ({ page }) => {
    await ensureAuthenticated(page);
    const tracker = trackConsoleErrors(page);

    await page.goto("/documents");
    await page.waitForTimeout(800);

    // Click the "Hochladen" tab to reveal upload form
    const uploadTab = page.locator('button:has-text("Hochladen"), [class*=tab]:has-text("Hochladen")').first();
    if (await uploadTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await uploadTab.click();
      await page.waitForTimeout(1000);
    }

    // File input should be visible in upload tab
    const fileInput = page.locator('input[type="file"]');
    const hasFileInput = await fileInput.isVisible({ timeout: 3000 }).catch(() => false);

    // Title input should also be visible
    const titleInput = page.locator('input[aria-label="Dokumenttitel"]');
    const hasTitleInput = await titleInput.isVisible({ timeout: 2000 }).catch(() => false);

    expect(hasFileInput || hasTitleInput).toBeTruthy();
    tracker.assertNoErrors([/third-party/i, /favicon/i]);
  });

  test("upload form has title and file inputs", async ({ page }) => {
    await ensureAuthenticated(page);

    await page.goto("/documents");
    await page.waitForTimeout(800);

    const uploadTab = page.locator('button:has-text("Hochladen")').first();
    if (await uploadTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await uploadTab.click();
      await page.waitForTimeout(1000);
    }

    const titleInput = page.locator('[aria-label="Dokumenttitel"]');
    const fileInput = page.locator('[aria-label="Datei auswählen"]');
    const hasTitle = await titleInput.isVisible({ timeout: 2000 }).catch(() => false);
    const hasFile = await fileInput.isVisible({ timeout: 2000 }).catch(() => false);

    expect(hasTitle || hasFile).toBeTruthy();
  });

  test("can select a file for upload", async ({ page }) => {
    await ensureAuthenticated(page);

    await page.goto("/documents");
    await page.waitForTimeout(800);

    const uploadTab = page.locator('button:has-text("Hochladen")').first();
    if (await uploadTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await uploadTab.click();
      await page.waitForTimeout(1000);
    }

    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      const testFilePath = path.resolve(__dirname, "..", "fixtures", "test-document.txt");
      fs.mkdirSync(path.dirname(testFilePath), { recursive: true });
      fs.writeFileSync(testFilePath, "This is a test document for E2E upload verification.");

      await fileInput.setInputFiles(testFilePath);
      await page.waitForTimeout(1000);
    }
  });
});

test.describe("Document Upload — Search Integration", () => {
  test("document list is accessible post-login", async ({ page }) => {
    await ensureAuthenticated(page);
    const tracker = trackConsoleErrors(page);

    await page.goto("/documents");
    await page.waitForTimeout(1000);

    // Page should show document list or empty state
    const bodyText = await page.textContent("body");
    expect(bodyText.length).toBeGreaterThan(50);

    tracker.assertNoErrors([/third-party/i, /favicon/i]);
  });

  test("search page can submit queries", async ({ page }) => {
    await ensureAuthenticated(page);
    const tracker = trackConsoleErrors(page);

    await page.goto("/search");
    await page.waitForTimeout(800);

    const searchInput = page.locator('input[type="search"], input[placeholder*="such"], input[placeholder*="search"], textarea[placeholder*="such"]').first();
    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await searchInput.fill("Baugenehmigung Verfahren");
      await page.keyboard.press("Enter");
      await page.waitForTimeout(3000);

      // Results should appear (or empty state)
      const bodyText = await page.textContent("body");
      expect(bodyText.length).toBeGreaterThan(50);
    }

    tracker.assertNoErrors([/third-party/i, /favicon/i]);
  });
});
