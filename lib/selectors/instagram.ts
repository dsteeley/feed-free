import { hide } from '../css-builder';

export const IG_SELECTORS = {
  // Home feed posts (article elements)
  homeFeed: ['main[role="main"] article', 'main article'],
  // Explore page grid
  exploreFeed: [
    'main[role="main"] > div',
    'main[role="main"] div[style*="flex-direction"]',
    '._aabd._aa8k._aanf',
  ],
  // Reels tab full content
  reelsFeed: ['main[role="main"] > div'],
  // Suggested accounts in sidebar
  suggestedAccounts: ['div[role="listitem"]', 'aside div[class*="sidebar"]'],
} as const;

export function buildIgCss(activeClass = 'feedfree-ig-active'): string {
  const on = `html.${activeClass}`;
  const explore = `html.${activeClass}[data-feedfree-ig-page="explore"]`;
  const reels = `html.${activeClass}[data-feedfree-ig-page="reels"]`;

  return [
    hide(on, IG_SELECTORS.homeFeed),
    hide(explore, IG_SELECTORS.exploreFeed),
    hide(reels, IG_SELECTORS.reelsFeed),
    `${on} [data-feedfree-overlay] { display: flex !important; }`,
  ].join('\n');
}
