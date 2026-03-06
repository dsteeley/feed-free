/**
 * Shared utilities for platform content scripts.
 * Pure functions and factory functions — no platform-specific knowledge here.
 */

// ─── Cooldown Math ────────────────────────────────────────────────────────────

/**
 * Returns ms remaining until the cooldown end time. 0 if expired or not started.
 * @param endTime - the stored end timestamp (Date.now() + COOLDOWN_MS), or 0 if inactive
 */
export function getRemainingMs(endTime: number, now = Date.now()): number {
  if (endTime === 0) return 0;
  return Math.max(0, endTime - now);
}

/** Returns true if the peek access window is currently open. */
export function isAccessOpen(openUntil: number, now = Date.now()): boolean {
  return openUntil > 0 && now < openUntil;
}

// ─── SPA Tracker ─────────────────────────────────────────────────────────────

/**
 * Fires onNavigate whenever the page URL changes (SPA navigation).
 * Returns a teardown function.
 */
export function createSpaTracker(onNavigate: () => void): () => void {
  // Title changes reliably fire after SPA navigation on most platforms
  const titleEl = document.querySelector('title');
  const titleObserver = new MutationObserver(onNavigate);
  if (titleEl) {
    titleObserver.observe(titleEl, { childList: true });
  }

  window.addEventListener('popstate', onNavigate);

  // Intercept history.pushState for frameworks that don't fire popstate
  const originalPushState = history.pushState.bind(history);
  history.pushState = function (...args) {
    originalPushState(...args);
    onNavigate();
  };
  const originalReplaceState = history.replaceState.bind(history);
  history.replaceState = function (...args) {
    originalReplaceState(...args);
    onNavigate();
  };

  return () => {
    titleObserver.disconnect();
    window.removeEventListener('popstate', onNavigate);
    history.pushState = originalPushState;
    history.replaceState = originalReplaceState;
  };
}

// ─── Media Silencer ───────────────────────────────────────────────────────────

/**
 * Pauses and mutes a media element.
 */
function silenceMedia(media: HTMLMediaElement): void {
  media.pause();
  media.muted = true;
  media.volume = 0;
  media.autoplay = false;
}

/**
 * Creates a media silencer that pauses/mutes media elements matching the predicate.
 * Returns a teardown function.
 */
export function createMediaSilencer(
  shouldSilenceFn: (media: HTMLMediaElement) => boolean
): () => void {
  function sweepMedia() {
    for (const el of document.querySelectorAll('video, audio')) {
      if (el instanceof HTMLMediaElement && shouldSilenceFn(el)) {
        silenceMedia(el);
      }
    }
  }

  function onPlay(e: Event) {
    if (e.target instanceof HTMLMediaElement && shouldSilenceFn(e.target)) {
      silenceMedia(e.target);
    }
  }

  function onVolumeChange(e: Event) {
    const media = e.target;
    if (
      media instanceof HTMLMediaElement &&
      (!media.muted || media.volume > 0) &&
      shouldSilenceFn(media)
    ) {
      media.muted = true;
      media.volume = 0;
    }
  }

  document.addEventListener('play', onPlay, true);
  document.addEventListener('playing', onPlay, true);
  document.addEventListener('volumechange', onVolumeChange, true);

  sweepMedia();

  return () => {
    document.removeEventListener('play', onPlay, true);
    document.removeEventListener('playing', onPlay, true);
    document.removeEventListener('volumechange', onVolumeChange, true);
  };
}

// ─── Cooldown Overlay ─────────────────────────────────────────────────────────

export interface CooldownStorage {
  getPeekUnlockAt(): Promise<number>;
  setPeekUnlockAt(v: number): Promise<void>;
  getPeekOpenUntil(): Promise<number>;
  setPeekOpenUntil(v: number): Promise<void>;
}

const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes
const ACCESS_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Creates and manages the cooldown overlay UI.
 * The overlay is appended to document.body (or documentElement).
 * Returns a teardown function.
 */
export function createCooldownOverlay(
  platformLabel: string,
  store: CooldownStorage,
  onStateChange: (open: boolean) => void
): () => void {
  let overlay: HTMLDivElement | null = null;
  let tickInterval: ReturnType<typeof setInterval> | null = null;

  function removeOverlay() {
    overlay?.remove();
    overlay = null;
    if (tickInterval) {
      clearInterval(tickInterval);
      tickInterval = null;
    }
  }

  function formatCountdown(ms: number): string {
    const totalSec = Math.ceil(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  }

  function renderOverlay(remainingMs: number) {
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.setAttribute('data-feedfree-overlay', 'true');
      overlay.style.cssText = [
        'position:fixed',
        'inset:0',
        'z-index:2147483646',
        'display:flex',
        'flex-direction:column',
        'align-items:center',
        'justify-content:center',
        'background:rgba(255,255,255,0.97)',
        'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
        'padding:24px',
        'text-align:center',
      ].join(';');
      (document.body || document.documentElement).appendChild(overlay);
    }

    // Clear previous contents safely
    while (overlay.firstChild) overlay.removeChild(overlay.firstChild);

    function node<K extends keyof HTMLElementTagNameMap>(
      tag: K,
      style: string,
      text?: string,
      attrs?: Record<string, string>
    ): HTMLElementTagNameMap[K] {
      const el = document.createElement(tag);
      el.style.cssText = style;
      if (text) el.textContent = text;
      if (attrs) for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
      return el;
    }

    if (remainingMs > 0) {
      overlay.appendChild(node('div', 'font-size:48px;margin-bottom:16px', '⏳'));
      overlay.appendChild(
        node('h2', 'font-size:22px;font-weight:700;margin:0 0 8px', `${platformLabel} feed locked`)
      );
      overlay.appendChild(
        node(
          'p',
          'font-size:15px;color:#555;margin:0 0 24px;max-width:320px',
          'You started a mindfulness pause. The feed will unlock in:'
        )
      );
      overlay.appendChild(
        node(
          'div',
          'font-size:56px;font-weight:700;font-variant-numeric:tabular-nums;letter-spacing:-2px;color:#1877f2',
          formatCountdown(remainingMs),
          { 'data-feedfree-countdown': '' }
        )
      );
      overlay.appendChild(
        node(
          'p',
          'font-size:13px;color:#999;margin-top:16px',
          'Refresh the page to cancel the timer.'
        )
      );
    } else {
      overlay.appendChild(node('div', 'font-size:48px;margin-bottom:16px', '🔒'));
      overlay.appendChild(
        node(
          'h2',
          'font-size:22px;font-weight:700;margin:0 0 8px',
          `${platformLabel} feed is hidden`
        )
      );
      overlay.appendChild(
        node(
          'p',
          'font-size:15px;color:#555;margin:0 0 24px;max-width:320px',
          "Need to check it? Start a 5-minute mindfulness pause, then it'll open for 30 minutes."
        )
      );
      const btn = node(
        'button',
        'background:#1877f2;color:#fff;border:none;border-radius:8px;padding:14px 28px;font-size:16px;font-weight:600;cursor:pointer',
        'Start 5-minute timer',
        { 'data-feedfree-start': '' }
      );
      btn.addEventListener('click', startCooldown);
      overlay.appendChild(btn);
    }
  }

  async function startCooldown() {
    const now = Date.now();
    await store.setPeekUnlockAt(now + COOLDOWN_MS);
    tick();
  }

  async function tick() {
    const [unlockAt, openUntil] = await Promise.all([
      store.getPeekUnlockAt(),
      store.getPeekOpenUntil(),
    ]);

    const now = Date.now();

    // Access window already open
    if (isAccessOpen(openUntil, now)) {
      removeOverlay();
      onStateChange(true);
      // Schedule re-lock
      const msLeft = openUntil - now;
      setTimeout(async () => {
        await store.setPeekOpenUntil(0);
        onStateChange(false);
        check();
      }, msLeft);
      return;
    }

    // No timer started
    if (unlockAt === 0) {
      renderOverlay(0);
      return;
    }

    const remainingMs = getRemainingMs(unlockAt, now);

    if (remainingMs === 0) {
      // Cooldown complete — open access
      const openUntilTs = now + ACCESS_MS;
      await store.setPeekUnlockAt(0);
      await store.setPeekOpenUntil(openUntilTs);
      removeOverlay();
      onStateChange(true);
      setTimeout(async () => {
        await store.setPeekOpenUntil(0);
        onStateChange(false);
        check();
      }, ACCESS_MS);
      return;
    }

    renderOverlay(remainingMs);
    if (!tickInterval) {
      tickInterval = setInterval(tick, 1000);
    }
  }

  async function check() {
    const openUntil = await store.getPeekOpenUntil();
    const now = Date.now();
    if (isAccessOpen(openUntil, now)) {
      onStateChange(true);
    } else {
      tick();
    }
  }

  check();

  return () => {
    removeOverlay();
  };
}
