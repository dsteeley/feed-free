import { storage } from '@wxt-dev/storage';

// --- Facebook feature toggles ---
export const blockFeed = storage.defineItem<boolean>('local:blockFeed', {
  fallback: true,
});

export const blockReels = storage.defineItem<boolean>('local:blockReels', {
  fallback: true,
});

export const devMode = storage.defineItem<boolean>('local:devMode', {
  fallback: false,
});

// --- Per-platform master switches (default: all on) ---
export const platformFacebook = storage.defineItem<boolean>('local:platform:facebook', {
  fallback: true,
});

export const platformYouTube = storage.defineItem<boolean>('local:platform:youtube', {
  fallback: true,
});

export const platformInstagram = storage.defineItem<boolean>('local:platform:instagram', {
  fallback: true,
});

export const platformTwitter = storage.defineItem<boolean>('local:platform:twitter', {
  fallback: true,
});

export const platformTikTok = storage.defineItem<boolean>('local:platform:tiktok', {
  fallback: true,
});

// --- Cooldown unlock timestamps per platform (ms since epoch, 0 = inactive) ---
// peekUnlockAt: when the 5-min cooldown timer started (0 = no active cooldown)
// peekOpenUntil: feed visible until this timestamp (0 = not open)
export const fbPeekUnlockAt = storage.defineItem<number>('local:fb:peekUnlockAt', { fallback: 0 });
export const fbPeekOpenUntil = storage.defineItem<number>('local:fb:peekOpenUntil', {
  fallback: 0,
});

export const ytPeekUnlockAt = storage.defineItem<number>('local:yt:peekUnlockAt', { fallback: 0 });
export const ytPeekOpenUntil = storage.defineItem<number>('local:yt:peekOpenUntil', {
  fallback: 0,
});

export const igPeekUnlockAt = storage.defineItem<number>('local:ig:peekUnlockAt', { fallback: 0 });
export const igPeekOpenUntil = storage.defineItem<number>('local:ig:peekOpenUntil', {
  fallback: 0,
});

export const twPeekUnlockAt = storage.defineItem<number>('local:tw:peekUnlockAt', { fallback: 0 });
export const twPeekOpenUntil = storage.defineItem<number>('local:tw:peekOpenUntil', {
  fallback: 0,
});

export const ttPeekUnlockAt = storage.defineItem<number>('local:tt:peekUnlockAt', { fallback: 0 });
export const ttPeekOpenUntil = storage.defineItem<number>('local:tt:peekOpenUntil', {
  fallback: 0,
});
