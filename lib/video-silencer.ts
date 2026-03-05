export interface SilenceContext {
  feedHidden: boolean;
  reelsHidden: boolean;
  mainEl: Element | null;
  page: 'home' | 'groups' | 'marketplace' | 'messages' | 'watch' | 'other';
}

export function shouldSilence(media: Element, ctx: SilenceContext): boolean {
  if (ctx.feedHidden && ctx.mainEl?.contains(media)) return true;
  if (ctx.reelsHidden && media.closest('[data-fbfocus-reel="true"]')) return true;
  return false;
}

export function shouldBlockAllAudioContexts(ctx: SilenceContext): boolean {
  if (ctx.feedHidden && ctx.page === 'home') return true;
  if (ctx.reelsHidden && ctx.page === 'watch') return true;
  return false;
}
