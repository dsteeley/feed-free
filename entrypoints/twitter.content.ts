import { injectCss } from '@/lib/css-builder';
import { buildTwCss } from '@/lib/selectors/twitter';
import { platformTwitter, twPeekUnlockAt, twPeekOpenUntil } from '@/lib/storage';
import { createSpaTracker, createCooldownOverlay } from '@/lib/platform-utils';
import { getTwPage, detectActiveTab } from '@/lib/page-context-twitter';

const twStore = {
  async getPeekUnlockAt() {
    return twPeekUnlockAt.getValue();
  },
  async setPeekUnlockAt(v: number) {
    await twPeekUnlockAt.setValue(v);
  },
  async getPeekOpenUntil() {
    return twPeekOpenUntil.getValue();
  },
  async setPeekOpenUntil(v: number) {
    await twPeekOpenUntil.setValue(v);
  },
};

export default defineContentScript({
  matches: ['*://*.twitter.com/*', '*://*.x.com/*'],
  runAt: 'document_start',
  async main(ctx) {
    injectCss(buildTwCss());
    const html = document.documentElement;

    const platformEnabled = await platformTwitter.getValue();
    if (!platformEnabled) return;

    let feedOpen = false;
    let teardownOverlay: (() => void) | null = null;
    let tabCheckInterval: ReturnType<typeof setInterval> | null = null;

    function updateTabAttr() {
      const tab = detectActiveTab();
      html.setAttribute('data-feedfree-tw-tab', tab);
    }

    function applyHiding(enabled: boolean) {
      html.classList.toggle('feedfree-tw-active', enabled && !feedOpen);
    }

    function setupOverlay() {
      teardownOverlay?.();
      teardownOverlay = null;

      const page = getTwPage(location.pathname);
      if (page !== 'home') return;

      teardownOverlay = createCooldownOverlay('Twitter/X', twStore, (open) => {
        feedOpen = open;
        applyHiding(true);
      });
    }

    function onNavigate() {
      updateTabAttr();
      setupOverlay();
      applyHiding(true);
    }

    updateTabAttr();
    applyHiding(true);
    setupOverlay();

    // Poll for tab changes (Twitter updates tabs dynamically after navigation)
    tabCheckInterval = setInterval(updateTabAttr, 1000);

    const teardownSpa = createSpaTracker(onNavigate);

    const unwatchPlatform = platformTwitter.watch((val) => {
      if (!val) {
        html.classList.remove('feedfree-tw-active');
        html.removeAttribute('data-feedfree-tw-tab');
        teardownOverlay?.();
        teardownOverlay = null;
      } else {
        updateTabAttr();
        applyHiding(true);
        setupOverlay();
      }
    });

    ctx.onInvalidated(() => {
      teardownSpa();
      teardownOverlay?.();
      unwatchPlatform();
      if (tabCheckInterval) clearInterval(tabCheckInterval);
      html.classList.remove('feedfree-tw-active');
      html.removeAttribute('data-feedfree-tw-tab');
    });
  },
});
