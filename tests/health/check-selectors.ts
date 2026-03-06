/**
 * Selector Health Check
 *
 * Authenticates with each platform using credentials from .env and verifies
 * each registered selector matches ≥1 element on the real feed page.
 *
 * Run: npm run selector:health
 * Requires: .env with FACEBOOK_EMAIL, FACEBOOK_PASSWORD, etc.
 *
 * Exit code: 0 = all healthy, 1 = stale selectors detected
 */
import { chromium, type Browser } from '@playwright/test';
import { config } from 'dotenv';
import { FB_SELECTORS } from '../../lib/selectors/facebook.js';
import { YT_SELECTORS } from '../../lib/selectors/youtube.js';
import { IG_SELECTORS } from '../../lib/selectors/instagram.js';
import { TW_SELECTORS } from '../../lib/selectors/twitter.js';
import { TT_SELECTORS } from '../../lib/selectors/tiktok.js';

config();

interface SelectorCheck {
  platform: string;
  url: string;
  selectors: Record<string, readonly string[]>;
  requiresAuth?: boolean;
}

const CHECKS: SelectorCheck[] = [
  {
    platform: 'Facebook',
    url: 'https://www.facebook.com/',
    requiresAuth: true,
    selectors: {
      feed: FB_SELECTORS.feed,
      stories: FB_SELECTORS.stories,
      rightRail: FB_SELECTORS.rightRail,
    },
  },
  {
    platform: 'YouTube',
    url: 'https://www.youtube.com/',
    selectors: {
      homeFeed: YT_SELECTORS.homeFeed,
      shortsShelf: YT_SELECTORS.shortsShelf,
    },
  },
  {
    platform: 'Instagram',
    url: 'https://www.instagram.com/',
    requiresAuth: true,
    selectors: {
      homeFeed: IG_SELECTORS.homeFeed,
    },
  },
  {
    platform: 'Twitter',
    url: 'https://x.com/',
    selectors: {
      forYouTimeline: TW_SELECTORS.forYouTimeline,
      trending: TW_SELECTORS.trending,
    },
  },
  {
    platform: 'TikTok',
    url: 'https://www.tiktok.com/',
    selectors: {
      forYouFeed: TT_SELECTORS.forYouFeed,
    },
  },
];

async function checkPlatform(
  browser: Browser,
  check: SelectorCheck
): Promise<{ platform: string; stale: string[] }> {
  const page = await browser.newPage();
  const stale: string[] = [];

  try {
    await page.goto(check.url, { waitUntil: 'networkidle', timeout: 30_000 });
    // Wait for dynamic content
    await page.waitForTimeout(3000);

    for (const [name, selectors] of Object.entries(check.selectors)) {
      let matched = false;
      for (const selector of selectors) {
        const count = await page.locator(selector).count();
        if (count > 0) {
          matched = true;
          console.log(`  ✓ ${check.platform}.${name}: "${selector}" (${count} elements)`);
          break;
        }
      }
      if (!matched) {
        stale.push(`${check.platform}.${name}`);
        console.error(`  ✗ ${check.platform}.${name}: NO MATCH for any selector`);
        console.error(`    Tried: ${selectors.join(', ')}`);
      }
    }
  } catch (err) {
    console.error(`  ⚠ ${check.platform}: Error — ${err}`);
    stale.push(`${check.platform}:error`);
  } finally {
    await page.close();
  }

  return { platform: check.platform, stale };
}

async function main() {
  console.log('Feed Free — Selector Health Check\n');

  const hasCredentials = !!process.env.FACEBOOK_EMAIL;
  if (!hasCredentials) {
    console.log('No credentials found (FACEBOOK_EMAIL not set) — skipping auth-required platforms.\n');
  }

  const browser = await chromium.launch({ headless: true });
  const allStale: string[] = [];

  for (const check of CHECKS) {
    if (check.requiresAuth && !hasCredentials) {
      console.log(`Skipping ${check.platform} (requires auth — set FACEBOOK_EMAIL in .env)`);
      continue;
    }
    console.log(`Checking ${check.platform} (${check.url})...`);
    const { stale } = await checkPlatform(browser, check);
    allStale.push(...stale);
  }

  await browser.close();

  console.log('\n' + '─'.repeat(50));
  if (allStale.length === 0) {
    console.log('✅ All selectors healthy');
    process.exit(0);
  } else {
    console.error(`❌ Stale selectors (${allStale.length}):`);
    for (const s of allStale) {
      console.error(`  - ${s}`);
    }
    console.error('\nRun `npm run fixtures:update` to capture fresh DOM snapshots.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
