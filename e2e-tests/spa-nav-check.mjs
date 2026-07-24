// Test SPA navigation (click links, don't reload)
import { chromium } from "playwright";
const BASE = "http://localhost:5173";

const b = await chromium.launch({ headless: true });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });

// Login
await p.goto(`${BASE}/login`, { waitUntil: "load", timeout: 12000 });
await p.fill("input[type=email]", "test@test.de");
await p.fill("input[type=password]", "Test123!");
await p.click("button[type=submit]");
await p.waitForTimeout(3000);
console.log("1. After login:", p.url());

// Check refreshToken
const rt1 = await p.evaluate(() => !!localStorage.getItem("refreshToken"));
console.log("2. Has refreshToken:", rt1);

// Navigate via SPA by clicking nav links (not page.goto)
// Click "Meine Arbeit" nav link
const navLinkSelectors = [
  'a[href="/work"]',
  'a:has-text("Meine Arbeit")',
  'text=Meine Arbeit',
];

let navigated = false;
for (const sel of navLinkSelectors) {
  const el = p.locator(sel).first();
  if (await el.isVisible({ timeout: 1000 }).catch(() => false)) {
    console.log("3. Clicking nav:", sel);
    await el.click();
    await p.waitForTimeout(2000);
    navigated = true;
    break;
  }
}

if (navigated) {
  const workState = await p.evaluate(() => ({
    url: window.location.href,
    body: (document.body.innerText || "").substring(0, 200).replace(/\n/g, " | ")
  }));
  console.log("4. After SPA nav:", JSON.stringify(workState, null, 2));
  const isLogin = workState.body.includes("Anmelden") && !workState.body.includes("Meine Arbeit");
  console.log("5. Login page shown:", isLogin);
} else {
  console.log("3. Nav link not found — cannot test SPA navigation");
  // Try direct page.goto with the current URL as referrer
  await p.goto(`${BASE}/work`, { waitUntil: "load", timeout: 10000, referer: `${BASE}/home` }).catch(() => {});
  await p.waitForTimeout(2000);
  const fallbackState = await p.evaluate(() => ({
    url: window.location.href,
    body: (document.body.innerText || "").substring(0, 200).replace(/\n/g, " | ")
  }));
  console.log("4. Fallback goto:", JSON.stringify(fallbackState, null, 2));
}

// Check session across SPA navs
const spaRoutes = ["/knowledge", "/documents", "/search", "/assistant"];
for (const route of spaRoutes) {
  const el = p.locator(`a[href="${route}"]`).first();
  if (await el.isVisible({ timeout: 1000 }).catch(() => false)) {
    await el.click();
    await p.waitForTimeout(1000);
    const isLogin = await p.evaluate(() => (document.body.innerText || "").includes("Anmelden") && !(document.body.innerText || "").includes("Meine Arbeit"));
    console.log(`  ${route}: ${isLogin ? "SESSION LOST" : "OK"}`);
  }
}

await b.close();
