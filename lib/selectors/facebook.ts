import { hide } from '../css-builder';

export const FB_SELECTORS = {
  // Home feed — individual post units and feed container (targeted, preserves left nav)
  feed: ['[data-pagelet^="FeedUnit_"]', '[role="main"] [data-pagelet="Feed"]'],
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

  return [
    // Feed units — home only, targeted (preserves left nav / Groups / Marketplace / Messenger)
    hide(home, FB_SELECTORS.feed),
    // Keep cooldown overlay visible
    `${home} [data-feedfree-overlay] { display: flex !important; }`,
    // Stories — home only
    hide(home, FB_SELECTORS.stories),
    // Right rail — everywhere feed class is active
    hide(feed, FB_SELECTORS.rightRail),
    // Reels inline in feed — articles tagged by MutationObserver
    hide(reels, FB_SELECTORS.reelTagged),
    // Reels/Watch dedicated pages
    hide(reels, FB_SELECTORS.reels),
  ].join('\n');
}
