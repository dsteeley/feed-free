import { hide } from '../css-builder';

export const TW_SELECTORS = {
  // For You / Home timeline tweets (algorithmic)
  forYouTimeline: [
    '[data-testid="primaryColumn"] article',
    '[aria-label="Timeline: Your Home Timeline"] article',
  ],
  // Trending / What's Happening sidebar section
  trending: [
    '[data-testid="sidebarColumn"] [data-testid="trend"]',
    '[aria-label="Timeline: Trending now"]',
  ],
  // Who to Follow suggestions
  whoToFollow: [
    '[data-testid="sidebarColumn"] [data-testid="UserCell"]',
    '[aria-label="Who to follow"]',
  ],
  // Promoted/Sponsored tweets
  promoted: ['[data-promoted="true"]', 'article:has([data-testid="promotedIndicator"])'],
} as const;

export function buildTwCss(activeClass = 'feedfree-tw-active'): string {
  const on = `html.${activeClass}`;
  const forYou = `html.${activeClass}[data-feedfree-tw-tab="foryou"]`;

  return [
    hide(forYou, TW_SELECTORS.forYouTimeline),
    hide(on, TW_SELECTORS.trending),
    hide(on, TW_SELECTORS.whoToFollow),
    hide(on, TW_SELECTORS.promoted),
    `${on} [data-feedfree-overlay] { display: flex !important; }`,
  ].join('\n');
}
