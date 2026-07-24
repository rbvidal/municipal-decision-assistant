import { chromium } from "playwright";
const BASE = "http://localhost:5173";

const b = await chromium.launch({ headless: true });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const consoleErrors = [];
p.on("console", msg => { if (msg.type() === "error") consoleErrors.push(msg.text()); });

// Login
await p.goto(`${BASE}/login`, { waitUntil: "networkidle", timeout: 15000 });
await p.fill("input[type=email]", "test@test.de");
await p.fill("input[type=password]", "Test123!");
await p.click("button[type=submit]");
await p.waitForTimeout(3000);

console.log("After login URL:", p.url());
const homeBody = await p.evaluate(() => (document.body.innerText || "").substring(0, 200));
console.log("Home body:", homeBody.replace(/\n/g, " | "));

// Try navigating to /work with shorter timeout and different wait strategy
console.log("\n--- Navigating to /work (load event only) ---");
try {
  await p.goto(`${BASE}/work`, { waitUntil: "load", timeout: 10000 });
} catch (e) {
  console.log("Navigation threw:", e.message.substring(0, 100));
}
await p.waitForTimeout(3000);

const workUrl = p.url();
const workBody = await p.evaluate(() => (document.body.innerText || "").substring(0, 300));
console.log("Work URL:", workUrl);
console.log("Work body:", workBody.replace(/\n/g, " | "));

// Check console errors from both navigations
console.log("\n--- Console errors ---");
consoleErrors.forEach(e => console.log("  ", e.substring(0, 150)));

// Try navigating to /knowledge
console.log("\n--- Navigating to /knowledge ---");
try {
  await p.goto(`${BASE}/knowledge`, { waitUntil: "load", timeout: 10000 });
} catch (e) {
  console.log("Navigation threw:", e.message.substring(0, 100));
}
await p.waitForTimeout(2000);
const knowBody = await p.evaluate(() => (document.body.innerText || "").substring(0, 200));
console.log("Knowledge body:", knowBody.replace(/\n/g, " | "));

await b.close();
