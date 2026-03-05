import { injectCss } from '@/lib/css-builder';
import { buildYtCss } from '@/lib/selectors/youtube';
import { platformYouTube, ytPeekUnlockAt, ytPeekOpenUntil } from '@/lib/storage';
import { createSpaTracker, createCooldownOverlay } from '@/lib/platform-utils';
import { getYtPage } from '@/lib/page-context-youtube';

const ytStore = {
  async getPeekUnlockAt() {
    return ytPeekUnlockAt.getValue();
  },
  async setPeekUnlockAt(v: number) {
    await ytPeekUnlockAt.setValue(v);
  },
  async getPeekOpenUntil() {
    return ytPeekOpenUntil.getValue();
  },
  async setPeekOpenUntil(v: number) {
    await ytPeekOpenUntil.setValue(v);
  },
};

export default defineContentScript({
  matches: ['*://*.youtube.com/*'],
  runAt: 'document_start',
  async main(ctx) {
    injectCss(buildYtCss());
    const html = document.documentElement;

    const platformEnabled = await platformYouTube.getValue();
    if (!platformEnabled) return;

    let feedOpen = false;
    let teardownOverlay: (() => void) | null = null;

    function applyHiding(enabled: boolean) {
      html.classList.toggle('feedfree-yt-active', enabled && !feedOpen);
    }

    function setupOverlay() {
      teardownOverlay?.();
      teardownOverlay = null;

      const page = getYtPage(location.pathname);
      if (page !== 'home') return;

      teardownOverlay = createCooldownOverlay('YouTube', ytStore, (open) => {
        feedOpen = open;
        applyHiding(true);
      });
    }

    function onNavigate() {
      setupOverlay();
      applyHiding(true);
    }

    applyHiding(true);
    setupOverlay();

    // YouTube fires its own navigation event
    window.addEventListener('yt-navigate-finish', onNavigate);
    const teardownSpa = createSpaTracker(onNavigate);

    const unwatchPlatform = platformYouTube.watch((val) => {
      if (!val) {
        html.classList.remove('feedfree-yt-active');
        teardownOverlay?.();
        teardownOverlay = null;
      } else {
        applyHiding(true);
        setupOverlay();
      }
    });

    ctx.onInvalidated(() => {
      teardownSpa();
      window.removeEventListener('yt-navigate-finish', onNavigate);
      teardownOverlay?.();
      unwatchPlatform();
      html.classList.remove('feedfree-yt-active');
    });
  },
});
