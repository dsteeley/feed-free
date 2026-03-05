import { injectCss } from '@/lib/css-builder';
import { buildFbCss } from '@/lib/selectors/facebook';
import {
  blockFeed,
  blockReels,
  devMode,
  platformFacebook,
  fbPeekUnlockAt,
  fbPeekOpenUntil,
} from '@/lib/storage';
import { getPageContext } from '@/lib/page-context';
import { tagReelAncestors } from '@/lib/reel-tagger';
import { shouldSilence, shouldBlockAllAudioContexts } from '@/lib/video-silencer';
import { createCooldownOverlay } from '@/lib/platform-utils';

const AUDIO_POLICY_EVENT = 'fbfocus:audio-policy';

const fbStore = {
  async getPeekUnlockAt() {
    return fbPeekUnlockAt.getValue();
  },
  async setPeekUnlockAt(v: number) {
    await fbPeekUnlockAt.setValue(v);
  },
  async getPeekOpenUntil() {
    return fbPeekOpenUntil.getValue();
  },
  async setPeekOpenUntil(v: number) {
    await fbPeekOpenUntil.setValue(v);
  },
};

export default defineContentScript({
  matches: ['*://*.facebook.com/*'],
  runAt: 'document_start',
  async main(ctx) {
    injectCss(buildFbCss());
    const html = document.documentElement;

    // Check platform master switch first
    const platformEnabled = await platformFacebook.getValue();
    if (!platformEnabled) return;

    let isDevMode = await devMode.getValue();
    let debugBadge: HTMLDivElement | null = null;
    let feedCurrentlyHidden = false;

    function debugLog(message: string, data?: unknown) {
      if (!isDevMode) return;
      if (typeof data === 'undefined') {
        console.log('[fbfocus]', message);
        return;
      }
      console.log('[fbfocus]', message, data);
    }

    function ensureDebugBadge() {
      if (!isDevMode) {
        debugBadge?.remove();
        debugBadge = null;
        return;
      }

      if (debugBadge?.isConnected) return;

      debugBadge = document.createElement('div');
      debugBadge.setAttribute('data-fbfocus-debug-badge', 'true');
      debugBadge.style.position = 'fixed';
      debugBadge.style.right = '12px';
      debugBadge.style.bottom = '12px';
      debugBadge.style.zIndex = '2147483647';
      debugBadge.style.background = 'rgba(0, 0, 0, 0.82)';
      debugBadge.style.color = '#fff';
      debugBadge.style.padding = '8px 10px';
      debugBadge.style.borderRadius = '8px';
      debugBadge.style.font =
        '12px/1.35 -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif';
      debugBadge.style.maxWidth = '260px';
      debugBadge.style.whiteSpace = 'pre-line';
      debugBadge.style.pointerEvents = 'none';
      (document.body || document.documentElement).appendChild(debugBadge);
    }

    function renderDebugBadge() {
      ensureDebugBadge();
      if (!debugBadge) return;

      const sctx = getSilenceContext();
      const blockAllAudioContexts = shouldBlockAllAudioContexts(sctx);
      debugBadge.textContent = [
        'Feed Free (Dev)',
        `page: ${sctx.page}`,
        `feedHidden: ${sctx.feedHidden}`,
        `reelsHidden: ${sctx.reelsHidden}`,
        `audioContextBlocked: ${blockAllAudioContexts}`,
        `feedCurrentlyHidden: ${feedCurrentlyHidden}`,
      ].join('\n');
    }

    function installPageAudioContextHook() {
      const script = document.createElement('script');
      script.setAttribute('data-fbfocus-audio-hook', 'true');
      script.textContent = `
        (() => {
          if ((window).__fbfocusAudioHookInstalled) return;
          (window).__fbfocusAudioHookInstalled = true;

          let blockAll = false;
          const tracked = new Set();

          const syncContexts = () => {
            for (const audioContext of tracked) {
              if (!audioContext) continue;
              if (blockAll) {
                audioContext.suspend?.().catch(() => {});
              } else if (audioContext.state === 'suspended') {
                audioContext.resume?.().catch(() => {});
              }
            }
          };

          const wrapCtor = (CtorName) => {
            const Ctor = window[CtorName];
            if (typeof Ctor !== 'function') return;

            const Wrapped = class extends Ctor {
              constructor(...args) {
                super(...args);
                tracked.add(this);
                if (blockAll) {
                  this.suspend?.().catch(() => {});
                }
              }
            };
            Object.defineProperty(window, CtorName, {
              configurable: true,
              writable: true,
              value: Wrapped,
            });

            const originalResume = Ctor.prototype.resume;
            if (typeof originalResume === 'function') {
              Ctor.prototype.resume = function (...args) {
                if (blockAll) return Promise.resolve(this.state);
                return originalResume.apply(this, args);
              };
            }
          };

          wrapCtor('AudioContext');
          wrapCtor('webkitAudioContext');

          window.addEventListener('${AUDIO_POLICY_EVENT}', (event) => {
            blockAll = Boolean(event?.detail?.blockAll);
            syncContexts();
          });
        })();
      `;

      const parent = document.head || document.documentElement;
      parent?.appendChild(script);
      script.remove();

      return () => {
        window.dispatchEvent(new CustomEvent(AUDIO_POLICY_EVENT, { detail: { blockAll: false } }));
      };
    }

    const teardownAudioHook = installPageAudioContextHook();

    // --- Apply initial toggle state ---
    const [feedEnabled, reelsEnabled] = await Promise.all([
      blockFeed.getValue(),
      blockReels.getValue(),
    ]);
    feedCurrentlyHidden = feedEnabled;
    if (feedEnabled) html.classList.add('fbfocus-hide-feed');
    if (reelsEnabled) html.classList.add('fbfocus-hide-reels');

    // --- Cooldown overlay for feed ---
    let teardownOverlay: (() => void) | null = null;

    function setupOverlay() {
      teardownOverlay?.();
      teardownOverlay = null;

      if (!feedCurrentlyHidden) return;

      const page = html.getAttribute('data-fbfocus-page');
      if (page !== 'home') return;

      teardownOverlay = createCooldownOverlay('Facebook', fbStore, (open) => {
        if (open) {
          html.classList.remove('fbfocus-hide-feed');
        } else {
          if (feedCurrentlyHidden) html.classList.add('fbfocus-hide-feed');
        }
        silenceAllVideos();
        syncPageAudioPolicy();
        renderDebugBadge();
      });
    }

    // --- URL-aware page context ---
    function updatePageContext() {
      html.setAttribute('data-fbfocus-page', getPageContext(location.pathname));
      setupOverlay();
      silenceAllVideos();
      syncPageAudioPolicy();
      renderDebugBadge();
    }
    updatePageContext();

    // SPA navigation detection
    const titleObserver = new MutationObserver(updatePageContext);
    const titleEl = document.querySelector('title');
    if (titleEl) {
      titleObserver.observe(titleEl, { childList: true });
    }
    window.addEventListener('popstate', updatePageContext);

    // --- Video silencing ---
    function getSilenceContext() {
      const page = html.getAttribute('data-fbfocus-page');
      return {
        feedHidden: html.classList.contains('fbfocus-hide-feed') && page === 'home',
        reelsHidden: html.classList.contains('fbfocus-hide-reels'),
        mainEl: document.querySelector('[role="main"]'),
        page:
          page === 'home' ||
          page === 'groups' ||
          page === 'marketplace' ||
          page === 'messages' ||
          page === 'watch'
            ? page
            : 'other',
      } as const;
    }

    function silenceMedia(media: HTMLMediaElement) {
      debugLog('Silencing media element', {
        tag: media.tagName,
        src: media.currentSrc || media.getAttribute('src') || null,
      });
      media.pause();
      media.muted = true;
      media.volume = 0;
      media.autoplay = false;
    }

    function syncPageAudioPolicy() {
      const blockAll = shouldBlockAllAudioContexts(getSilenceContext());
      debugLog('Sync audio policy', { blockAll, path: location.pathname });
      window.dispatchEvent(new CustomEvent(AUDIO_POLICY_EVENT, { detail: { blockAll } }));
      renderDebugBadge();
    }

    function silenceAllVideos() {
      const sctx = getSilenceContext();
      debugLog('Sweep media elements', {
        page: sctx.page,
        feedHidden: sctx.feedHidden,
        reelsHidden: sctx.reelsHidden,
      });
      for (const media of document.querySelectorAll('video, audio')) {
        if (media instanceof HTMLMediaElement && shouldSilence(media, sctx)) {
          silenceMedia(media);
        }
      }
      renderDebugBadge();
    }

    // Intercept video play events — capture phase because 'play' doesn't bubble
    function onVideoPlay(e: Event) {
      const media = e.target;
      if (media instanceof HTMLMediaElement && shouldSilence(media, getSilenceContext())) {
        debugLog('Intercepted play/playing event', { type: e.type, tag: media.tagName });
        silenceMedia(media);
      }
    }
    document.addEventListener('play', onVideoPlay, true);
    document.addEventListener('playing', onVideoPlay, true);

    // Also intercept volumechange to catch unmuting
    function onVolumeChange(e: Event) {
      const media = e.target;
      if (
        media instanceof HTMLMediaElement &&
        (!media.muted || media.volume > 0) &&
        shouldSilence(media, getSilenceContext())
      ) {
        debugLog('Re-applying mute on volumechange', { tag: media.tagName, volume: media.volume });
        media.muted = true;
        media.volume = 0;
      }
    }
    document.addEventListener('volumechange', onVolumeChange, true);

    // --- MutationObserver for reels/watch content + video silencing ---
    const bodyObserver = new MutationObserver((mutations) => {
      let hasNewNodes = false;
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          hasNewNodes = true;
          tagReelAncestors(node);
        }
      }
      if (hasNewNodes) silenceAllVideos();
    });
    bodyObserver.observe(document.body, { childList: true, subtree: true });

    tagReelAncestors(document.body);
    silenceAllVideos();

    // --- Live toggle response from popup ---
    const unwatchFeed = blockFeed.watch((val) => {
      feedCurrentlyHidden = val;
      html.classList.toggle('fbfocus-hide-feed', val);
      debugLog('Feed toggle changed', { value: val });
      setupOverlay();
      silenceAllVideos();
      syncPageAudioPolicy();
      renderDebugBadge();
    });
    const unwatchReels = blockReels.watch((val) => {
      html.classList.toggle('fbfocus-hide-reels', val);
      debugLog('Reels toggle changed', { value: val });
      silenceAllVideos();
      syncPageAudioPolicy();
      renderDebugBadge();
    });
    const unwatchDevMode = devMode.watch((val) => {
      isDevMode = val;
      debugLog('Developer mode enabled');
      if (!val) {
        console.log('[fbfocus]', 'Developer mode disabled');
      }
      renderDebugBadge();
    });
    const unwatchPlatform = platformFacebook.watch((val) => {
      if (!val) {
        html.classList.remove('fbfocus-hide-feed', 'fbfocus-hide-reels');
        teardownOverlay?.();
        teardownOverlay = null;
      } else {
        if (feedCurrentlyHidden) html.classList.add('fbfocus-hide-feed');
        blockReels.getValue().then((v) => {
          if (v) html.classList.add('fbfocus-hide-reels');
        });
        setupOverlay();
      }
    });

    // --- Cleanup on context invalidation ---
    ctx.onInvalidated(() => {
      titleObserver.disconnect();
      bodyObserver.disconnect();
      document.removeEventListener('play', onVideoPlay, true);
      document.removeEventListener('playing', onVideoPlay, true);
      document.removeEventListener('volumechange', onVolumeChange, true);
      window.removeEventListener('popstate', updatePageContext);
      unwatchFeed();
      unwatchReels();
      unwatchDevMode();
      unwatchPlatform();
      teardownOverlay?.();
      teardownAudioHook();
      debugBadge?.remove();
      debugBadge = null;
      html.classList.remove('fbfocus-hide-feed', 'fbfocus-hide-reels');
      html.removeAttribute('data-fbfocus-page');
    });
  },
});
