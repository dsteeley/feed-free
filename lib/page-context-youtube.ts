export type YtPage = 'home' | 'watch' | 'shorts' | 'other';

export function getYtPage(pathname: string): YtPage {
  if (pathname === '/' || pathname === '') return 'home';
  if (pathname.startsWith('/watch')) return 'watch';
  if (pathname.startsWith('/shorts')) return 'shorts';
  return 'other';
}
