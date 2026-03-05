export type TwPage = 'home' | 'other';
export type TwTab = 'foryou' | 'following' | 'other';

export function getTwPage(pathname: string): TwPage {
  if (pathname === '/' || pathname === '/home') return 'home';
  return 'other';
}

export function detectActiveTab(root: ParentNode = document): TwTab {
  const tabs = root.querySelectorAll('[role="tab"]');
  for (const tab of tabs) {
    if (tab.getAttribute('aria-selected') !== 'true') continue;
    const text = tab.textContent?.toLowerCase() ?? '';
    if (text.includes('for you')) return 'foryou';
    if (text.includes('following')) return 'following';
  }
  return 'other';
}
