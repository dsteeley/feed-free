import { injectCss } from '@/lib/css-builder';
import { buildTtCss } from '@/lib/selectors/tiktok';
import { platformTikTok, ttPeekUnlockAt, ttPeekOpenUntil } from '@/lib/storage';
import { createSpaTracker, createCooldownOverlay, createMediaSilencer } from '@/lib/platform-utils';
import { getTtPage } from '@/lib/page-context-tiktok';

const ttStore = {
  async getPeekUnlockAt() {
    return ttPeekUnlockAt.getValue();
  },
  async setPeekUnlockAt(v: number) {
    await ttPeekUnlockAt.setValue(v);
  },
  async getPeekOpenUntil() {
    return ttPeekOpenUntil.getValue();
  },
  async setPeekOpenUntil(v: number) {
    await ttPeekOpenUntil.setValue(v);
  },
};

export default defineContentScript({
  matches: ['*://*.tiktok.com/*'],
  runAt: 'document_start',
  async main(ctx) {
    injectCss(buildTtCss());
    const html = document.documentElement;

    const platformEnabled = await platformTikTok.getValue();
    if (!platformEnabled) return;

    let feedOpen = false;
    let teardownOverlay: (() => void) | null = null;

    function updatePageAttr() {
      const page = getTtPage(location.pathname);
      html.setAttribute('data-feedfree-tt-page', page);
    }

    function applyHiding(enabled: boolean) {
      html.classList.toggle('feedfree-tt-active', enabled && !feedOpen);
    }

    function setupOverlay() {
      teardownOverlay?.();
      teardownOverlay = null;

      const page = getTtPage(location.pathname);
      if (page !== 'home') return;

      teardownOverlay = createCooldownOverlay('TikTok', ttStore, (open) => {
        feedOpen = open;
        applyHiding(true);
      });
    }

    function onNavigate() {
      updatePageAttr();
      setupOverlay();
      applyHiding(true);
    }

    updatePageAttr();
    applyHiding(true);
    setupOverlay();

    // Silence autoplay videos on For You / Explore feeds
    const teardownSilencer = createMediaSilencer((media) => {
      if (feedOpen) return false;
      const page = getTtPage(location.pathname);
      if (page !== 'home' && page !== 'explore') return false;
      // Only silence if not on a profile/following page
      return !media.closest('[data-e2e="user-post-item"]');
    });

    const teardownSpa = createSpaTracker(onNavigate);

    const unwatchPlatform = platformTikTok.watch((val) => {
      if (!val) {
        html.classList.remove('feedfree-tt-active');
        html.removeAttribute('data-feedfree-tt-page');
        teardownOverlay?.();
        teardownOverlay = null;
      } else {
        updatePageAttr();
        applyHiding(true);
        setupOverlay();
      }
    });

    ctx.onInvalidated(() => {
      teardownSpa();
      teardownSilencer();
      teardownOverlay?.();
      unwatchPlatform();
      html.classList.remove('feedfree-tt-active');
      html.removeAttribute('data-feedfree-tt-page');
    });
  },
});
