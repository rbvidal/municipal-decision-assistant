import { type Page, request } from "@playwright/test";

const FRONTEND = process.env.BASE_URL ?? "http://localhost:5173";
const BACKEND = "http://localhost:8080";

export const TEST_USER = {
  email: `e2e-${Date.now()}@test.municipal.de`,
  password: "Test1234!",
  displayName: "E2E Tester",
};

/**
 * Register user via backend API, then login through the frontend UI
 * so the in-memory access token and localStorage refresh token are both set.
 */
async function authViaUi(page: Page): Promise<void> {
  // Register via backend API
  const ctx = await request.newContext({ baseURL: BACKEND });
  const resp = await ctx.post("/api/auth/register", {
    data: { email: TEST_USER.email, displayName: TEST_USER.displayName, password: TEST_USER.password },
  });
  // 201 = created, 200 = already exists (login will still work)
  await ctx.dispose();

  // Login through frontend UI so in-memory token gets set
  await page.goto(`${FRONTEND}/login`);
  await page.fill("input[type=email], input[name=email]", TEST_USER.email);
  await page.fill("input[type=password], input[name=password]", TEST_USER.password);
  await page.click('button[type=submit], button:has-text("Anmelden")');
  try { await page.waitForURL("**/home", { timeout: 10000 }); } catch { /* may already be logged in */ }
}

let authenticated = false;

/**
 * Ensures the user is authenticated before tests.
 */
export async function ensureAuthenticated(page: Page): Promise<void> {
  if (authenticated) return;
  await authViaUi(page);
  authenticated = true;
}
