import { hide } from '../css-builder';

export const YT_SELECTORS = {
  // Home page feed grid items
  homeFeed: ['ytd-rich-item-renderer', 'ytd-rich-grid-renderer'],
  // Sidebar recommendations on watch pages
  watchSidebar: ['#secondary', 'ytd-watch-next-secondary-results-renderer'],
  // End screen video recommendations
  endScreens: ['.ytp-endscreen-content', 'ytd-endscreen-element-renderer'],
  // Shorts shelf on home/search
  shortsShelf: [
    'ytd-reel-shelf-renderer',
    'ytd-shorts',
    'ytd-rich-section-renderer:has(ytd-reel-shelf-renderer)',
  ],
  // Autoplay next video card
  autoplayNext: ['ytd-compact-autoplay-renderer'],
  // Masthead ad
  mastheadAd: ['.ytd-masthead-ad', 'ytd-primetime-promo-renderer'],
} as const;

export function buildYtCss(activeClass = 'feedfree-yt-active'): string {
  const on = `html.${activeClass}`;
  return [
    hide(on, YT_SELECTORS.homeFeed),
    hide(on, YT_SELECTORS.watchSidebar),
    hide(on, YT_SELECTORS.endScreens),
    hide(on, YT_SELECTORS.shortsShelf),
    hide(on, YT_SELECTORS.autoplayNext),
    hide(on, YT_SELECTORS.mastheadAd),
    `${on} [data-feedfree-overlay] { display: flex !important; }`,
  ].join('\n');
}
