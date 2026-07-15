const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:8080';
const SCREENSHOT_DIR = path.resolve(__dirname, '..', '..', 'screenshots');
const CREDENTIALS = { email: 'test@municipal.de', password: 'test123' };

async function screenshot(page, name) {
  const filepath = path.join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`  ✓ ${name}.png`);
  return filepath;
}

(async () => {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  console.log(`Screenshots will be saved to: ${SCREENSHOT_DIR}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: 'de-DE'
  });
  const page = await context.newPage();

  // ── AUTH ──
  console.log('Authenticating...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.fill('input[name="username"], input[type="email"], input#username', CREDENTIALS.email);
  // Try to find email field by common patterns
  const emailInput = await page.$('input[type="email"]') || await page.$('input[name="email"]');
  const passwordInput = await page.$('input[type="password"]') || await page.$('input[name="password"]');
  if (emailInput) await emailInput.fill(CREDENTIALS.email);
  if (passwordInput) await passwordInput.fill(CREDENTIALS.password);
  // Click submit
  const submitBtn = await page.$('button[type="submit"]') || await page.$('input[type="submit"]');
  if (submitBtn) {
    await submitBtn.click();
    await page.waitForTimeout(3000);
  }

  // Check if login succeeded by looking for known elements
  const loggedIn = await page.$('nav') || await page.$('.app-shell') || await page.$('.nav');
  console.log(`  Login ${loggedIn ? 'SUCCEEDED' : 'may have failed — continuing anyway'}\n`);

  // ── CAPTURE EVERY PAGE ──
  const pages = [
    // Auth pages (before login)
    { url: '/login', name: '01-login', label: 'Login Page' },
    { url: '/register', name: '02-register', label: 'Register Page' },

    // Main pages
    { url: '/home', name: '03-home', label: 'Home / Dashboard' },
    { url: '/decision', name: '04-decision', label: 'Decision Assistant' },
    { url: '/regulations', name: '05-regulations', label: 'Regulations & Procedures' },
    { url: '/cases', name: '06-cases', label: 'My Cases' },

    // Admin pages
    { url: '/admin', name: '07-admin', label: 'Administration' },
    { url: '/admin/corpus-health', name: '08-corpus-health', label: 'Corpus Health Dashboard' },
    { url: '/admin/corpus-inventory', name: '09-corpus-inventory', label: 'Corpus Inventory' },
    { url: '/graph', name: '10-graph', label: 'Knowledge Graph' },
    { url: '/analytics', name: '11-analytics', label: 'System Analytics' },

    // Document pages
    { url: '/documents', name: '12-documents-list', label: 'Documents List' },
    { url: '/documents/upload', name: '13-document-upload', label: 'Document Upload' },
    { url: '/search', name: '14-search', label: 'Document Search' },
    { url: '/chunks', name: '15-chunks', label: 'Text Chunks' },

    // Workspace pages
    { url: '/workspaces', name: '16-workspaces', label: 'Workspaces List' },
    { url: '/workspaces/new', name: '17-workspace-new', label: 'New Workspace' },

    // Operations pages
    { url: '/audit', name: '18-audit', label: 'Audit Log' },
    { url: '/jobs', name: '19-jobs', label: 'Processing Jobs' },

    // Error page
    { url: '/nonexistent-page-404', name: '20-error', label: 'Error Page' },

    // Decision with a query (to show results)
    { url: '/decision?workspace=procurement', name: '21-decision-procurement', label: 'Decision — Procurement Workspace' },
  ];

  // Re-login for auth-required pages (session may have expired during page listing)
  for (const { url, name, label } of pages) {
    // Auth pages don't need login
    if (url === '/login' || url === '/register') {
      console.log(`${label}:`);
      await page.goto(`${BASE_URL}${url}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      await screenshot(page, name);
      continue;
    }

    console.log(`${label}:`);
    try {
      await page.goto(`${BASE_URL}${url}`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1000);

      // Check if we got redirected to login
      const currentUrl = page.url();
      if (currentUrl.includes('/login')) {
        console.log('  (redirected to login — re-authenticating)');
        const emailF = await page.$('input[type="email"]') || await page.$('input[name="email"]');
        const passF = await page.$('input[type="password"]') || await page.$('input[name="password"]');
        if (emailF) await emailF.fill(CREDENTIALS.email);
        if (passF) await passF.fill(CREDENTIALS.password);
        const btn = await page.$('button[type="submit"]') || await page.$('input[type="submit"]');
        if (btn) { await btn.click(); await page.waitForTimeout(2000); }
        // Re-navigate
        await page.goto(`${BASE_URL}${url}`, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(1000);
      }

      await screenshot(page, name);
    } catch (e) {
      console.log(`  WARNING: ${e.message.substring(0, 100)}`);
      // Try to take screenshot anyway
      try { await screenshot(page, name); } catch {}
    }
  }

  // ── Decision with actual query (submit and capture result) ──
  console.log('Decision with query result:');
  try {
    await page.goto(`${BASE_URL}/decision?workspace=procurement`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // If redirected to login, re-auth
    if (page.url().includes('/login')) {
      const ef = await page.$('input[type="email"]') || await page.$('input[name="email"]');
      const pf = await page.$('input[type="password"]') || await page.$('input[name="password"]');
      if (ef) await ef.fill(CREDENTIALS.email);
      if (pf) await pf.fill(CREDENTIALS.password);
      const btn = await page.$('button[type="submit"]') || await page.$('input[type="submit"]');
      if (btn) { await btn.click(); await page.waitForTimeout(2000); }
      await page.goto(`${BASE_URL}/decision?workspace=procurement`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
    }

    // Find the question textarea and submit button
    const textarea = await page.$('textarea');
    const submitBtn = await page.$('button[type="submit"]') || await page.$('input[type="submit"]');

    if (textarea) {
      await textarea.fill('Kann ich einen IT-Auftrag über 8.000 Euro freihändig vergeben?');
      if (submitBtn) {
        await submitBtn.click();
        console.log('  (query submitted, waiting for response...)');
        await page.waitForTimeout(15000); // Wait for AI inference
      }
    }
    await screenshot(page, '22-decision-result');
  } catch (e) {
    console.log(`  WARNING: ${e.message.substring(0, 100)}`);
    try { await screenshot(page, '22-decision-result'); } catch {}
  }

  // ── Document viewer (first document from list) ──
  console.log('Document Viewer:');
  try {
    await page.goto(`${BASE_URL}/documents`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);
    if (page.url().includes('/login')) {
      const ef = await page.$('input[type="email"]') || await page.$('input[name="email"]');
      const pf = await page.$('input[type="password"]') || await page.$('input[name="password"]');
      if (ef) await ef.fill(CREDENTIALS.email);
      if (pf) await pf.fill(CREDENTIALS.password);
      const btn = await page.$('button[type="submit"]') || await page.$('input[type="submit"]');
      if (btn) { await btn.click(); await page.waitForTimeout(2000); }
      await page.goto(`${BASE_URL}/documents`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1000);
    }
    // Find first document link
    const firstDocLink = await page.$('a[href*="/documents/"]');
    if (firstDocLink) {
      const href = await firstDocLink.getAttribute('href');
      await page.goto(`${BASE_URL}${href}`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1000);
    }
    await screenshot(page, '23-document-viewer');
  } catch (e) {
    console.log(`  WARNING: ${e.message.substring(0, 100)}`);
    try { await screenshot(page, '23-document-viewer'); } catch {}
  }

  // ── Workspace view ──
  console.log('Workspace View:');
  try {
    await page.goto(`${BASE_URL}/workspaces`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);
    if (page.url().includes('/login')) {
      const ef = await page.$('input[type="email"]') || await page.$('input[name="email"]');
      const pf = await page.$('input[type="password"]') || await page.$('input[name="password"]');
      if (ef) await ef.fill(CREDENTIALS.email);
      if (pf) await pf.fill(CREDENTIALS.password);
      const btn = await page.$('button[type="submit"]') || await page.$('input[type="submit"]');
      if (btn) { await btn.click(); await page.waitForTimeout(2000); }
      await page.goto(`${BASE_URL}/workspaces`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1000);
    }
    await screenshot(page, '24-workspaces-view');
  } catch (e) {
    console.log(`  WARNING: ${e.message.substring(0, 100)}`);
    try { await screenshot(page, '24-workspaces-view'); } catch {}
  }

  await browser.close();
  console.log(`\nDone! ${fs.readdirSync(SCREENSHOT_DIR).length} screenshots saved to ${SCREENSHOT_DIR}`);
})();
