import { injectCss } from '@/lib/css-builder';
import { buildIgCss } from '@/lib/selectors/instagram';
import { platformInstagram, igPeekUnlockAt, igPeekOpenUntil } from '@/lib/storage';
import { createSpaTracker, createCooldownOverlay } from '@/lib/platform-utils';
import { getIgPage } from '@/lib/page-context-instagram';

const igStore = {
  async getPeekUnlockAt() {
    return igPeekUnlockAt.getValue();
  },
  async setPeekUnlockAt(v: number) {
    await igPeekUnlockAt.setValue(v);
  },
  async getPeekOpenUntil() {
    return igPeekOpenUntil.getValue();
  },
  async setPeekOpenUntil(v: number) {
    await igPeekOpenUntil.setValue(v);
  },
};

export default defineContentScript({
  matches: ['*://*.instagram.com/*'],
  runAt: 'document_start',
  async main(ctx) {
    injectCss(buildIgCss());
    const html = document.documentElement;

    const platformEnabled = await platformInstagram.getValue();
    if (!platformEnabled) return;

    let feedOpen = false;
    let teardownOverlay: (() => void) | null = null;

    function updatePageAttr() {
      const page = getIgPage(location.pathname);
      html.setAttribute('data-feedfree-ig-page', page);
    }

    function applyHiding(enabled: boolean) {
      html.classList.toggle('feedfree-ig-active', enabled && !feedOpen);
    }

    function setupOverlay() {
      teardownOverlay?.();
      teardownOverlay = null;

      const page = getIgPage(location.pathname);
      if (page !== 'home') return;

      teardownOverlay = createCooldownOverlay('Instagram', igStore, (open) => {
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

    const teardownSpa = createSpaTracker(onNavigate);

    const unwatchPlatform = platformInstagram.watch((val) => {
      if (!val) {
        html.classList.remove('feedfree-ig-active');
        html.removeAttribute('data-feedfree-ig-page');
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
      teardownOverlay?.();
      unwatchPlatform();
      html.classList.remove('feedfree-ig-active');
      html.removeAttribute('data-feedfree-ig-page');
    });
  },
});
