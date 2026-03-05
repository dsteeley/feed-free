export type IgPage = 'home' | 'explore' | 'reels' | 'other';

export function getIgPage(pathname: string): IgPage {
  if (pathname === '/' || pathname === '') return 'home';
  if (pathname.startsWith('/explore')) return 'explore';
  if (pathname.startsWith('/reels')) return 'reels';
  return 'other';
}
