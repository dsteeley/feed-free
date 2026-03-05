export type PageContext = 'home' | 'groups' | 'marketplace' | 'messages' | 'watch' | 'other';

export function getPageContext(pathname: string): PageContext {
  if (pathname === '/' || pathname.startsWith('/home')) return 'home';
  if (pathname.startsWith('/groups')) return 'groups';
  if (pathname.startsWith('/marketplace')) return 'marketplace';
  if (pathname.startsWith('/messages')) return 'messages';
  if (pathname.startsWith('/watch') || pathname.startsWith('/reel')) return 'watch';
  return 'other';
}
