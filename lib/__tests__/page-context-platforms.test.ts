import { describe, it, expect, beforeEach } from 'vitest';
import { getYtPage } from '../page-context-youtube';
import { getIgPage } from '../page-context-instagram';
import { getTwPage, detectActiveTab } from '../page-context-twitter';
import { getTtPage } from '../page-context-tiktok';

// ─── YouTube ──────────────────────────────────────────────────────────────────

describe('getYtPage', () => {
  it('returns "home" for root path', () => {
    expect(getYtPage('/')).toBe('home');
  });

  it('returns "home" for empty string', () => {
    expect(getYtPage('')).toBe('home');
  });

  it('returns "watch" for /watch paths', () => {
    expect(getYtPage('/watch')).toBe('watch');
    expect(getYtPage('/watch?v=abc123')).toBe('watch');
  });

  it('returns "shorts" for /shorts paths', () => {
    expect(getYtPage('/shorts')).toBe('shorts');
    expect(getYtPage('/shorts/abc123')).toBe('shorts');
  });

  it('returns "other" for channel, search, subscriptions', () => {
    expect(getYtPage('/results?search_query=cats')).toBe('other');
    expect(getYtPage('/feed/subscriptions')).toBe('other');
    expect(getYtPage('/@SomeChannel')).toBe('other');
    expect(getYtPage('/playlist?list=abc')).toBe('other');
  });
});

// ─── Instagram ────────────────────────────────────────────────────────────────

describe('getIgPage', () => {
  it('returns "home" for root path', () => {
    expect(getIgPage('/')).toBe('home');
  });

  it('returns "home" for empty string', () => {
    expect(getIgPage('')).toBe('home');
  });

  it('returns "explore" for /explore paths', () => {
    expect(getIgPage('/explore')).toBe('explore');
    expect(getIgPage('/explore/tags/cats')).toBe('explore');
  });

  it('returns "reels" for /reels paths', () => {
    expect(getIgPage('/reels')).toBe('reels');
    expect(getIgPage('/reels/abc123')).toBe('reels');
  });

  it('returns "other" for profile, DMs, stories', () => {
    expect(getIgPage('/username')).toBe('other');
    expect(getIgPage('/direct/inbox')).toBe('other');
    expect(getIgPage('/stories/username/123')).toBe('other');
  });
});

// ─── Twitter/X ────────────────────────────────────────────────────────────────

describe('getTwPage', () => {
  it('returns "home" for root path', () => {
    expect(getTwPage('/')).toBe('home');
  });

  it('returns "home" for /home', () => {
    expect(getTwPage('/home')).toBe('home');
  });

  it('returns "other" for profiles, search, notifications', () => {
    expect(getTwPage('/username')).toBe('other');
    expect(getTwPage('/search?q=cats')).toBe('other');
    expect(getTwPage('/notifications')).toBe('other');
    expect(getTwPage('/messages')).toBe('other');
    expect(getTwPage('/i/trending')).toBe('other');
  });
});

describe('detectActiveTab', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('returns "foryou" when For You tab is selected', () => {
    document.body.innerHTML = `
      <div role="tablist">
        <div role="tab" aria-selected="true">For you</div>
        <div role="tab" aria-selected="false">Following</div>
      </div>
    `;
    expect(detectActiveTab()).toBe('foryou');
  });

  it('returns "following" when Following tab is selected', () => {
    document.body.innerHTML = `
      <div role="tablist">
        <div role="tab" aria-selected="false">For you</div>
        <div role="tab" aria-selected="true">Following</div>
      </div>
    `;
    expect(detectActiveTab()).toBe('following');
  });

  it('returns "other" when no tab is selected', () => {
    document.body.innerHTML = `
      <div role="tablist">
        <div role="tab" aria-selected="false">For you</div>
        <div role="tab" aria-selected="false">Following</div>
      </div>
    `;
    expect(detectActiveTab()).toBe('other');
  });

  it('returns "other" when no tab elements exist', () => {
    document.body.innerHTML = '<div>no tabs here</div>';
    expect(detectActiveTab()).toBe('other');
  });

  it('accepts a custom root element for scoped querying', () => {
    document.body.innerHTML = `
      <div id="scoped">
        <div role="tab" aria-selected="true">Following</div>
      </div>
      <div role="tab" aria-selected="true">For you</div>
    `;
    const scoped = document.getElementById('scoped')!;
    expect(detectActiveTab(scoped)).toBe('following');
    expect(detectActiveTab(document)).toBe('following'); // first match wins
  });

  it('is case-insensitive for tab text', () => {
    document.body.innerHTML = `
      <div role="tab" aria-selected="true">FOR YOU</div>
    `;
    expect(detectActiveTab()).toBe('foryou');
  });
});

// ─── TikTok ───────────────────────────────────────────────────────────────────

describe('getTtPage', () => {
  it('returns "home" for root path', () => {
    expect(getTtPage('/')).toBe('home');
  });

  it('returns "home" for empty string', () => {
    expect(getTtPage('')).toBe('home');
  });

  it('returns "explore" for /explore paths', () => {
    expect(getTtPage('/explore')).toBe('explore');
    expect(getTtPage('/explore/page')).toBe('explore');
  });

  it('returns "explore" for /discover paths', () => {
    expect(getTtPage('/discover')).toBe('explore');
    expect(getTtPage('/discover/trending')).toBe('explore');
  });

  it('returns "following" for /following paths', () => {
    expect(getTtPage('/following')).toBe('following');
  });

  it('returns "other" for profiles, DMs, live', () => {
    expect(getTtPage('/@creator')).toBe('other');
    expect(getTtPage('/messages')).toBe('other');
    expect(getTtPage('/live')).toBe('other');
    expect(getTtPage('/video/123')).toBe('other');
  });
});
