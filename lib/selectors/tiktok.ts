import { hide } from '../css-builder';

export const TT_SELECTORS = {
  // For You feed main scroll container
  forYouFeed: [
    '[data-e2e="recommend-list-item-container"]',
    '[class*="DivItemContainerForSearch"]',
    'div[class*="feed-item"]',
  ],
  // Explore / Discover page
  exploreFeed: ['[data-e2e="search-common-container"]', '[class*="DivExploreItemContainer"]'],
  // Suggested accounts / LIVE sidebar
  suggestedAccounts: ['[data-e2e="sidebar-user-cell"]', '[class*="DivSideNavUser"]'],
} as const;

export function buildTtCss(activeClass = 'feedfree-tt-active'): string {
  const on = `html.${activeClass}`;
  const explore = `html.${activeClass}[data-feedfree-tt-page="explore"]`;

  return [
    hide(on, TT_SELECTORS.forYouFeed),
    hide(explore, TT_SELECTORS.exploreFeed),
    hide(on, TT_SELECTORS.suggestedAccounts),
    `${on} [data-feedfree-overlay] { display: flex !important; }`,
  ].join('\n');
}
