export type TtPage = 'home' | 'explore' | 'following' | 'other';

export function getTtPage(pathname: string): TtPage {
  if (pathname === '/' || pathname === '') return 'home';
  if (pathname.startsWith('/explore') || pathname.startsWith('/discover')) return 'explore';
  if (pathname.startsWith('/following')) return 'following';
  return 'other';
}
