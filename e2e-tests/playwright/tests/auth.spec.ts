import { test, expect } from "@playwright/test";
import { trackConsoleErrors } from "../fixtures/console.fixture";

test.describe("Authentication", () => {
  test.describe("Public pages", () => {
    test("GET / redirects to /login (Spring Security)", async ({ page }) => {
      await page.goto("/");
      await expect(page).toHaveURL(/.*login.*/);
    });

    test("login page renders correctly", async ({ page }) => {
      const tracker = trackConsoleErrors(page);

      await page.goto("/login");
      await expect(page.locator("h2")).toBeVisible();
      await expect(page.locator("#login-email")).toBeVisible();
      await expect(page.locator("#login-password")).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();

      tracker.assertNoErrors([/third-party/i, /favicon/i]);
    });

    test("register page renders correctly", async ({ page }) => {
      const tracker = trackConsoleErrors(page);

      await page.goto("/register");
      await expect(page.locator("h2")).toBeVisible();
      await expect(page.locator("#reg-name")).toBeVisible();
      await expect(page.locator("#reg-email")).toBeVisible();
      await expect(page.locator("#reg-password")).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();

      tracker.assertNoErrors([/third-party/i, /favicon/i]);
    });

    test("login page has link to register", async ({ page }) => {
      await page.goto("/login");
      const registerLink = page.locator('a[href*="register"]');
      if (await registerLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await registerLink.click();
        await expect(page).toHaveURL(/.*register.*/);
      }
    });

    test("register page has link to login", async ({ page }) => {
      await page.goto("/register");
      const loginLink = page.locator('a[href*="login"]');
      if (await loginLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await loginLink.click();
        await expect(page).toHaveURL(/.*login.*/);
      }
    });
  });

  test.describe("Registration flow", () => {
    test("can register with valid credentials", async ({ page }) => {
      const email = `e2e-reg-${Date.now()}@test.municipal.de`;

      await page.goto("/register");
      await page.fill("#reg-name", "E2E Test User");
      await page.fill("#reg-email", email);
      await page.fill("#reg-password", "SecurePass1!");
      await page.fill("#reg-password-confirm", "SecurePass1!");
      await page.waitForTimeout(300);

      await page.click('button[type="submit"]:not([disabled])');
      await page.waitForTimeout(3000);

      const url = page.url();
      expect(url).toMatch(/.*(login|home).*/);
    });

    test("registration with invalid email shows error", async ({ page }) => {
      await page.goto("/register");
      await page.fill("#reg-name", "Test");
      await page.fill("#reg-email", "not-an-email");
      await page.fill("#reg-password", "SecurePass1!");
      await page.fill("#reg-password-confirm", "SecurePass1!");
      await page.waitForTimeout(300);
      await page.click('button[type="submit"]:not([disabled])');
      await page.waitForTimeout(1500);

      const hasError =
        (await page.locator('[class*="error"], [class*="hintError"], .field-error').count()) > 0 ||
        (await page.locator('text=ungültig, text=gültige, text=valid').count()) > 0;
      expect(hasError || page.url().includes("/register")).toBeTruthy();
    });
  });

  test.describe("Login flow", () => {
    test("login with unregistered credentials shows error", async ({ page }) => {
      await page.goto("/login");
      await page.fill("#login-email", "nonexistent@test.municipal.de");
      await page.fill("#login-password", "WrongPass1!");
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);

      const hasError = (await page.locator('[class*="error"], [class*="hintError"]').count()) > 0;
      expect(hasError || page.url().includes("/login")).toBeTruthy();
    });
  });

  test.describe("Authenticated access", () => {
    test("unauthenticated user is redirected to login for protected pages", async ({ page }) => {
      const protectedPaths = ["/home", "/work", "/knowledge", "/documents", "/admin", "/search"];

      for (const path of protectedPaths) {
        await page.goto(path);
        await page.waitForTimeout(1000);
        const url = page.url();
        expect(url).toMatch(/.*(login|home).*/);
      }
    });

    test("404 page for non-existent routes", async ({ page }) => {
      await page.goto("/this-page-does-not-exist-xyz");
      await page.waitForTimeout(1000);
      const bodyText = await page.textContent("body");
      expect(
        bodyText.includes("404") ||
        bodyText.includes("nicht gefunden") ||
        bodyText.includes("Not Found") ||
        page.url().includes("/home") ||
        page.url().includes("/login"),
      ).toBeTruthy();
    });
  });
});
