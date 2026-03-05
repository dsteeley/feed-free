import { hide } from '../css-builder';

export const FB_SELECTORS = {
  // Home feed — main content posts
  feed: [
    '[data-pagelet="FeedUnit_0"]',
    '[data-pagelet^="FeedUnit_"]',
    '[role="main"] [data-pagelet="Feed"]',
    '[role="main"] > div > div > div > div',
  ],
  // Stories tray at top of home feed
  stories: ['[data-pagelet="Stories"]', '[data-testid="stories_tray"]', '[aria-label="Stories"]'],
  // Right sidebar (Sponsored, People You May Know, etc.)
  rightRail: ['[data-pagelet="RightRail"]', '[data-pagelet="RightColumn"]'],
  // Reels and Watch page
  reels: ['[data-pagelet="TahoeReels"]'],
  // Links that indicate reel/watch content (for reel-tagger)
  reelHrefs: ['/watch', '/reel'],
  // Articles tagged by reel-tagger MutationObserver
  reelTagged: ['[data-fbfocus-reel="true"]'],
} as const;

export function buildFbCss(): string {
  const home = 'html.fbfocus-hide-feed[data-fbfocus-page="home"]';
  const feed = 'html.fbfocus-hide-feed';
  const reels = 'html.fbfocus-hide-reels';
  const watch = 'html.fbfocus-hide-reels[data-fbfocus-page="watch"]';

  return [
    // Feed — home only (broad hide of main area)
    `${home} [role="main"] > * { display: none !important; }`,
    // Keep cooldown overlay visible
    `${home} [data-feedfree-overlay] { display: flex !important; }`,
    // Stories — home only
    hide(home, FB_SELECTORS.stories),
    // Right rail — everywhere feed class is active
    hide(feed, FB_SELECTORS.rightRail),
    // Reels — articles tagged by MutationObserver
    hide(reels, FB_SELECTORS.reelTagged),
    // Watch/reel pages — broad hide
    `${watch} [role="main"] > * { display: none !important; }`,
  ].join('\n');
}
