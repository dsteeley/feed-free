import { describe, it, expect, beforeEach } from 'vitest';
import { shouldSilence, shouldBlockAllAudioContexts, type SilenceContext } from '../video-silencer';

describe('shouldSilence', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('silences video in main area when feed is hidden', () => {
    document.body.innerHTML = `
      <div role="main" id="main">
        <video id="vid"></video>
      </div>
    `;
    const video = document.getElementById('vid') as HTMLVideoElement;
    const ctx: SilenceContext = {
      feedHidden: true,
      reelsHidden: false,
      mainEl: document.getElementById('main'),
      page: 'home',
    };
    expect(shouldSilence(video, ctx)).toBe(true);
  });

  it('does not silence video in main area when feed is not hidden', () => {
    document.body.innerHTML = `
      <div role="main" id="main">
        <video id="vid"></video>
      </div>
    `;
    const video = document.getElementById('vid') as HTMLVideoElement;
    const ctx: SilenceContext = {
      feedHidden: false,
      reelsHidden: false,
      mainEl: document.getElementById('main'),
      page: 'home',
    };
    expect(shouldSilence(video, ctx)).toBe(false);
  });

  it('silences video inside a tagged reel article when reels hidden', () => {
    document.body.innerHTML = `
      <div role="article" data-fbfocus-reel="true">
        <video id="vid"></video>
      </div>
    `;
    const video = document.getElementById('vid') as HTMLVideoElement;
    const ctx: SilenceContext = {
      feedHidden: false,
      reelsHidden: true,
      mainEl: null,
      page: 'home',
    };
    expect(shouldSilence(video, ctx)).toBe(true);
  });

  it('does not silence video in reel article when reels not hidden', () => {
    document.body.innerHTML = `
      <div role="article" data-fbfocus-reel="true">
        <video id="vid"></video>
      </div>
    `;
    const video = document.getElementById('vid') as HTMLVideoElement;
    const ctx: SilenceContext = {
      feedHidden: false,
      reelsHidden: false,
      mainEl: null,
      page: 'home',
    };
    expect(shouldSilence(video, ctx)).toBe(false);
  });

  it('does not silence video outside main when only feed is hidden', () => {
    document.body.innerHTML = `
      <div role="main" id="main"></div>
      <div id="sidebar"><video id="vid"></video></div>
    `;
    const video = document.getElementById('vid') as HTMLVideoElement;
    const ctx: SilenceContext = {
      feedHidden: true,
      reelsHidden: false,
      mainEl: document.getElementById('main'),
      page: 'home',
    };
    expect(shouldSilence(video, ctx)).toBe(false);
  });
});

describe('shouldBlockAllAudioContexts', () => {
  it('blocks all audio contexts on home when feed is hidden', () => {
    const ctx: SilenceContext = {
      feedHidden: true,
      reelsHidden: false,
      mainEl: null,
      page: 'home',
    };
    expect(shouldBlockAllAudioContexts(ctx)).toBe(true);
  });

  it('blocks all audio contexts on watch when reels are hidden', () => {
    const ctx: SilenceContext = {
      feedHidden: false,
      reelsHidden: true,
      mainEl: null,
      page: 'watch',
    };
    expect(shouldBlockAllAudioContexts(ctx)).toBe(true);
  });

  it('does not block all audio contexts on groups when reels are hidden', () => {
    const ctx: SilenceContext = {
      feedHidden: false,
      reelsHidden: true,
      mainEl: null,
      page: 'groups',
    };
    expect(shouldBlockAllAudioContexts(ctx)).toBe(false);
  });
});
