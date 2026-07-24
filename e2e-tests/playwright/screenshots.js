const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:8080';
const SCREENSHOT_DIR = path.resolve(__dirname, '..', '..', 'docs', 'screenshots');
const USER = 'gaga@mailinator.com';
const PASS = 'gaga';

const PAGES = [
  { name: '01-home', label: 'Home', path: '/home' },
  { name: '02-my-work', label: 'My Work', path: '/work' },
  { name: '03-knowledge', label: 'Knowledge Base', path: '/knowledge' },
  { name: '04-documents', label: 'Documents', path: '/documents' },
  { name: '05-search', label: 'Search', path: '/search' },
  { name: '06-admin', label: 'Administration', path: '/admin' },
  { name: '07-admin-corpus', label: 'Corpus', path: '/admin/corpus' },
  { name: '08-admin-audit', label: 'Audit Log', path: '/admin/audit' },
  { name: '09-new-case', label: 'New Case', path: '/work/new' },
];

async function screenshot(page, name) {
  const filePath = path.join(SCREENSHOT_DIR, name + '.png');
  await page.screenshot({ path: filePath, fullPage: true });
  const stat = fs.statSync(filePath);
  console.log('  [OK] ' + name + ' (' + Math.round(stat.size / 1024) + ' KB)');
}

async function run() {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'en-US',
  });
  const page = await context.newPage();

  // Register via the form page (most reliable)
  console.log('Registering via form...');
  await page.goto(BASE_URL + '/register', { waitUntil: 'networkidle' });
  await page.fill('input[name="email"]', USER);
  await page.fill('input[name="displayName"]', 'Demo User');
  await page.fill('input[name="password"]', PASS);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);

  // Check if registration redirected to login
  let url = page.url();
  console.log('  After register: ' + url);

  // Try to register once more if it didn't redirect (might already exist)
  if (!url.includes('/login')) {
    // User might already exist — go to login directly
    console.log('  User may already exist, going to login...');
  }

  // Login
  console.log('Logging in...');
  await page.goto(BASE_URL + '/login', { waitUntil: 'networkidle' });
  await page.fill('input[name="username"]', USER);
  await page.fill('input[name="password"]', PASS);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);

  url = page.url();
  console.log('  After login: ' + url);

  // Try patching credentials if login failed with an error on page
  let bodyText = await page.textContent('body').catch(() => '');
  if (url.includes('/login') && bodyText.includes('Invalid')) {
    console.log('  Bad credentials, re-registering...');
    await page.goto(BASE_URL + '/register', { waitUntil: 'networkidle' });
    // Clear and retype with a different variant
    await page.fill('input[name="email"]', USER);
    await page.fill('input[name="displayName"]', 'Gaga Demo');
    await page.fill('input[name="password"]', PASS + '1234!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    await page.goto(BASE_URL + '/login', { waitUntil: 'networkidle' });
    await page.fill('input[name="username"]', USER);
    await page.fill('input[name="password"]', PASS + '1234!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
  }

  // Final check: are we on the dashboard?
  await page.goto(BASE_URL + '/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  url = page.url();
  bodyText = await page.textContent('body').catch(() => '');

  if (url.includes('/login')) {
    console.log('ERROR: Login failed. Credentials may be wrong or auth is misconfigured.');
    console.log('Page text preview: ' + bodyText.substring(0, 200));
    await browser.close();
    process.exit(1);
  }

  console.log('Logged in successfully. Taking screenshots...\n');

  for (const pg of PAGES) {
    console.log('  ' + pg.label + ' → ' + pg.path);
    await page.goto(BASE_URL + pg.path, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    if (page.url().includes('/login')) {
      console.log('  [SKIP] Redirected to login');
      continue;
    }

    if (pg.action === 'query') {
      try {
        const textarea = page.locator('textarea[name="question"]');
        if (await textarea.isVisible({ timeout: 2000 })) {
          await textarea.fill('Welches Baugenehmigungsverfahren gilt fur ein Einfamilienhaus in Berlin?');
          // Use the form's submit button specifically, not the nav logout
          await page.locator('#queryForm button[type="submit"]').click();
          console.log('    Waiting for AI response...');
          await page.waitForTimeout(10000);
        }
      } catch (e) {
        console.log('    Query submission failed: ' + e.message);
      }
    }

    await screenshot(page, pg.name);
  }

  await browser.close();
  console.log('\nAll screenshots saved to ' + SCREENSHOT_DIR);
}

run().catch(err => {
  console.error('FATAL:', err.message);
  process.exit(1);
});
