/**
 * Fixture Update Script
 *
 * Authenticates with each platform, captures the feed page DOM,
 * strips PII, and saves fresh fixtures to tests/fixtures/.
 *
 * Run: npm run fixtures:update
 * Requires: .env with credentials
 */
import { chromium } from '@playwright/test';
import { config } from 'dotenv';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

config();

const FIXTURES_DIR = resolve(import.meta.dirname ?? '.', '../fixtures');

interface PlatformConfig {
  name: string;
  filename: string;
  url: string;
  waitFor?: string;
  stripSelectors?: string[];
}

const PLATFORMS: PlatformConfig[] = [
  {
    name: 'YouTube (no auth needed)',
    filename: 'youtube.html',
    url: 'https://www.youtube.com/',
    waitFor: 'ytd-rich-item-renderer',
    stripSelectors: ['script', 'style[nonce]'],
  },
  {
    name: 'Twitter/X (no auth needed)',
    filename: 'twitter.html',
    url: 'https://x.com/',
    waitFor: '[data-testid="primaryColumn"]',
    stripSelectors: ['script'],
  },
  {
    name: 'TikTok (no auth needed)',
    filename: 'tiktok.html',
    url: 'https://www.tiktok.com/',
    waitFor: '[data-e2e="recommend-list-item-container"]',
    stripSelectors: ['script'],
  },
];

async function captureFixture(platform: PlatformConfig): Promise<void> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log(`Capturing ${platform.name}...`);
  await page.goto(platform.url, { waitUntil: 'networkidle', timeout: 30_000 });

  if (platform.waitFor) {
    await page.waitForSelector(platform.waitFor, { timeout: 15_000 }).catch(() => {
      console.warn(`  ⚠ Selector "${platform.waitFor}" not found, capturing anyway`);
    });
  }

  await page.waitForTimeout(2000);

  // Strip PII and unwanted elements
  let html = await page.content();

  // Strip script tags (security + PII)
  html = html.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    '<!-- script removed -->'
  );

  // Strip email-like patterns
  html = html.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[email]');

  const outPath = resolve(FIXTURES_DIR, platform.filename);
  writeFileSync(outPath, html, 'utf-8');
  console.log(`  ✓ Saved to ${outPath}`);

  await browser.close();
}

async function main() {
  console.log('Feed Free — Fixture Update\n');
  console.log('Note: Authenticated platforms (FB, IG) require manual session setup.\n');

  for (const platform of PLATFORMS) {
    try {
      await captureFixture(platform);
    } catch (err) {
      console.error(`  ✗ Failed: ${err}`);
    }
  }

  console.log('\nDone. Review the updated fixtures before committing.');
  console.log('Then update selectors in lib/selectors/ if needed and run npm test.');
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
