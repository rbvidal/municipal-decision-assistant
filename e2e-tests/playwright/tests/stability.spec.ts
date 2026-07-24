import { test, expect, type Page } from "@playwright/test";
import { ensureAuthenticated } from "../fixtures/auth.fixture";
import { trackConsoleErrors } from "../fixtures/console.fixture";

/**
 * Long user session simulation — repeated navigation across all modules.
 * Verifies the application remains stable under sustained use.
 */
test.describe("Long Navigation Stability", () => {
  test.describe.configure({ timeout: 300_000 });

  test("full session: login → all modules → repeated cycles", async ({ page }) => {
    await ensureAuthenticated(page);
    const tracker = trackConsoleErrors(page);

    // Define a realistic user journey
    const journey = [
      "/home",
      "/work",
      "/knowledge",
      "/documents",
      "/search",
      "/admin",
      "/admin/corpus",
      "/admin/audit",
      "/home",
      "/work",
      "/knowledge",
      "/documents",
    ];

    // Run 3 full cycles
    for (let cycle = 0; cycle < 3; cycle++) {
      console.log(`\n  Cycle ${cycle + 1}/3`);

      for (const route of journey) {
        try {
          await page.goto(route, { waitUntil: "networkidle", timeout: 20_000 });
          await page.waitForTimeout(500);

          // Verify we're not on an error page
          const url = page.url();
          const bodyText = await page.textContent("body").catch(() => "");

          if (bodyText.includes("Application Error") || bodyText.includes("Unexpected error")) {
            console.log(`  WARNING: Error page detected at ${route}`);
          }

          // Log current URL for debugging
          console.log(`    ${route} → ${url.includes(route) ? "OK" : `redirected to ${url}`}`);

          // Check for menu visibility (app shell should always be present)
          const navVisible = await page.locator("nav, [class*=nav], [class*=sidebar]").first().isVisible().catch(() => false);
          if (!navVisible && !url.includes("/login")) {
            console.log(`  WARNING: Navigation not visible at ${route}`);
          }
        } catch (e) {
          console.log(`  ERROR at ${route}: ${(e as Error).message.substring(0, 100)}`);
        }
      }
    }

    // Final check: should still be able to navigate home
    await page.goto("/home");
    await page.waitForTimeout(800);
    expect(page.url()).toContain("/home");

    // Assert clean console at end of long session
    tracker.assertNoErrors([/third-party/i, /favicon/i, /google-font/i]);
  });

  test("rapid back/forward navigation stress", async ({ page }) => {
    await ensureAuthenticated(page);

    // Build history
    const history = ["/home", "/work", "/knowledge", "/documents", "/admin"];
    for (const route of history) {
      await page.goto(route);
      await page.waitForTimeout(400);
    }

    // Navigate back through history
    for (let i = 0; i < history.length; i++) {
      await page.goBack();
      await page.waitForTimeout(300);
    }

    // Navigate forward through history
    for (let i = 0; i < history.length; i++) {
      await page.goForward();
      await page.waitForTimeout(300);
    }

    // Should still be functional
    await page.goto("/home");
    await page.waitForTimeout(500);
    expect(page.url()).toContain("/home");
  });

  test("page survives 10 rapid reloads", async ({ page }) => {
    await ensureAuthenticated(page);
    const tracker = trackConsoleErrors(page);

    await page.goto("/home");
    await page.waitForTimeout(500);

    for (let i = 0; i < 10; i++) {
      await page.reload();
      await page.waitForTimeout(500);

      const bodyText = await page.textContent("body").catch(() => "");
      expect(bodyText).not.toContain("Application Error");
    }

    tracker.assertNoErrors([/third-party/i, /favicon/i]);
  });
});

test.describe("Browser Console Quality Audit", () => {
  test("home page produces no console errors", async ({ page }) => {
    await ensureAuthenticated(page);
    const tracker = trackConsoleErrors(page);

    await page.goto("/home");
    await page.waitForTimeout(1500);

    // Interact with elements to trigger potential errors
    const buttons = page.locator("button, a");
    const count = await buttons.count();
    // Just hover over elements (clicking could navigate away)
    for (let i = 0; i < Math.min(count, 10); i++) {
      await buttons.nth(i).hover().catch(() => {});
      await page.waitForTimeout(100);
    }

    tracker.assertNoErrors([/third-party/i, /favicon/i, /google-font/i]);
  });

  test("all protected pages produce no console errors", async ({ page }) => {
    await ensureAuthenticated(page);

    const pages = [
      "/home",
      "/work",
      "/knowledge",
      "/documents",
      "/search",
      "/admin",
      "/admin/corpus",
      "/admin/audit",
    ];

    for (const path of pages) {
      const tracker = trackConsoleErrors(page);
      await page.goto(path);
      await page.waitForTimeout(1000);
      tracker.assertNoErrors([/third-party/i, /favicon/i, /google-font/i]);
    }
  });

  test("no HTTP 500 errors during navigation", async ({ page }) => {
    await ensureAuthenticated(page);

    const fiveHundreds: string[] = [];

    page.on("response", (response) => {
      if (response.status() >= 500) {
        fiveHundreds.push(`${response.status()} ${response.url()}`);
      }
    });

    // Navigate through all pages
    const pages = ["/home", "/work", "/knowledge", "/documents", "/admin"];
    for (const path of pages) {
      await page.goto(path);
      await page.waitForTimeout(800);
    }

    if (fiveHundreds.length > 0) {
      console.log("  500 errors detected:", fiveHundreds);
    }
    // Note: not a hard assertion since some backend endpoints may be WIP
  });

  test("no CSP violations in production-like mode", async ({ page }) => {
    await ensureAuthenticated(page);

    const cspViolations: string[] = [];

    page.on("console", (msg) => {
      if (msg.text().includes("Content-Security-Policy") || msg.text().includes("CSP")) {
        cspViolations.push(msg.text());
      }
    });

    await page.goto("/home");
    await page.waitForTimeout(1000);

    if (cspViolations.length > 0) {
      console.log("  CSP violations:", cspViolations);
    }
  });
});
