import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'http://localhost:3001';
const OUT_DIR = join(__dirname, '..', 'screenshots');

const PAGES = [
  { name: '00-home',        path: '/' },
  { name: '01-dashboard',   path: '/dashboard' },

  // Library
  { name: '02-library',         path: '/library' },
  { name: '03-library-new',     path: '/library/new' },

  // Marketing tools
  { name: '04-calendar',    path: '/calendar' },
  { name: '05-templates',   path: '/templates' },
  { name: '06-docs',        path: '/docs' },

  // Pipeline
  { name: '07-enquiries',   path: '/enquiries' },
  { name: '08-deals',       path: '/deals' },
  { name: '09-projects',    path: '/projects' },
  { name: '10-approval',    path: '/approval' },
  { name: '11-development', path: '/development' },
  { name: '12-qc',          path: '/qc' },
  { name: '13-handover',    path: '/handover' },

  // Deliverables
  { name: '14-deliverables', path: '/deliverables' },
];

mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });

console.log(`Saving screenshots to: ${OUT_DIR}\n`);

for (const { name, path } of PAGES) {
  const url = BASE_URL + path;
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
    const file = join(OUT_DIR, `${name}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log(`  [OK] ${name}.png  <-  ${url}`);
  } catch (err) {
    console.log(`  [FAIL] ${name}  <-  ${url}\n        ${err.message}`);
  }
}

await browser.close();
console.log('\nDone!');
