import { chromium } from "playwright";
const BASE = "http://localhost:5173";

const b = await chromium.launch({ headless: true });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });

p.on("console", msg => { if (msg.type() === "error") console.log("CONSOLE:", msg.text().substring(0, 120)); });
p.on("pageerror", err => console.log("PAGE:", err.message));

// Login
await p.goto(`${BASE}/login`, { waitUntil: "networkidle", timeout: 15000 });
console.log("1. Login page URL:", p.url());

await p.fill("input[type=email]", "test@test.de");
await p.fill("input[type=password]", "Test123!");
await p.click("button[type=submit]");
await p.waitForTimeout(3000);
console.log("2. After login URL:", p.url());

// Check session state
const state = await p.evaluate(() => ({
  url: window.location.href,
  refreshToken: !!localStorage.getItem("refreshToken"),
  bodyText: (document.body.innerText || "").substring(0, 120).replace(/\n/g, " | ")
}));
console.log("3. Home state:", JSON.stringify(state, null, 2));

// Navigate to /work via SPA link click
await p.goto(`${BASE}/work`, { waitUntil: "networkidle", timeout: 15000 });
await p.waitForTimeout(2000);
const workState = await p.evaluate(() => ({
  url: window.location.href,
  refreshToken: !!localStorage.getItem("refreshToken"),
  bodyText: (document.body.innerText || "").substring(0, 200).replace(/\n/g, " | ")
}));
console.log("4. /work state:", JSON.stringify(workState, null, 2));

// Check if page shows login form
const isLoginPage = workState.bodyText.includes("Anmelden") || workState.bodyText.includes("name@verwaltung.de");
console.log("5. Is login page shown on /work?", isLoginPage);

if (isLoginPage) {
  // Try refreshing the token
  const refreshed = await p.evaluate(async () => {
    const rt = localStorage.getItem("refreshToken");
    if (!rt) return "no refresh token in storage";
    try {
      const r = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: rt })
      });
      const d = await r.json();
      if (d.accessToken) {
        return "refreshed OK, got new token: " + d.accessToken.substring(0, 20) + "...";
      }
      return "refresh failed: HTTP " + r.status + " " + JSON.stringify(d).substring(0, 80);
    } catch(e) {
      return "refresh error: " + e.message;
    }
  });
  console.log("6. Token refresh:", refreshed);
}

await b.close();
