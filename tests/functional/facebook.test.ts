/**
 * Functional tests for Facebook CSS hiding rules.
 *
 * Uses the generated CSS from buildFbCss() — the selector constants in
 * lib/selectors/facebook.ts are the single source of truth.
 *
 * Assertions use getComputedStyle (visibility), not data-* markers.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { buildFbCss } from '../../lib/selectors/facebook';

const FIXTURE = readFileSync(resolve(__dirname, '../fixtures/facebook.html'), 'utf-8');

const EXTENSION_CSS = buildFbCss();

function setup() {
  document.documentElement.innerHTML = '';
  document.write(FIXTURE);
  const style = document.createElement('style');
  style.textContent = EXTENSION_CSS;
  document.head.appendChild(style);
}

describe('Facebook — extension CSS against real fixture', () => {
  beforeEach(setup);

  it('hides all [role=main] children on home page when feed class is set', () => {
    document.documentElement.classList.add('fbfocus-hide-feed');
    document.documentElement.setAttribute('data-fbfocus-page', 'home');

    expect(window.getComputedStyle(document.getElementById('feed-unit-0')!).display).toBe('none');
    expect(window.getComputedStyle(document.getElementById('feed-unit-1')!).display).toBe('none');
  });

  it('does NOT hide feed on non-home pages', () => {
    document.documentElement.classList.add('fbfocus-hide-feed');
    document.documentElement.setAttribute('data-fbfocus-page', 'groups');

    expect(window.getComputedStyle(document.getElementById('feed-unit-0')!).display).not.toBe(
      'none'
    );
  });

  it('hides stories bar on home page when feed class is set', () => {
    document.documentElement.classList.add('fbfocus-hide-feed');
    document.documentElement.setAttribute('data-fbfocus-page', 'home');

    expect(window.getComputedStyle(document.getElementById('stories')!).display).toBe('none');
  });

  it('does NOT hide stories on non-home pages', () => {
    document.documentElement.classList.add('fbfocus-hide-feed');
    document.documentElement.setAttribute('data-fbfocus-page', 'groups');

    expect(window.getComputedStyle(document.getElementById('stories')!).display).not.toBe('none');
  });

  it('hides right sidebar regardless of page when feed class is set', () => {
    document.documentElement.classList.add('fbfocus-hide-feed');
    // No page attribute needed — right rail hidden on all pages when feed blocked

    expect(window.getComputedStyle(document.getElementById('right-rail')!).display).toBe('none');
  });

  it('hides tagged reel articles when reels class is set', () => {
    document.documentElement.classList.add('fbfocus-hide-reels');

    expect(window.getComputedStyle(document.getElementById('reel-post')!).display).toBe('none');
  });

  it('does NOT hide normal posts when only reels class is set', () => {
    document.documentElement.classList.add('fbfocus-hide-reels');

    expect(window.getComputedStyle(document.getElementById('post-1')!).display).not.toBe('none');
  });

  it('overlay div is visible when feed is hidden (overlay exception rule)', () => {
    document.documentElement.classList.add('fbfocus-hide-feed');
    document.documentElement.setAttribute('data-fbfocus-page', 'home');

    // Simulate the overlay being present inside [role="main"]
    const main = document.querySelector('[role="main"]')!;
    const overlay = document.createElement('div');
    overlay.setAttribute('data-feedfree-overlay', 'true');
    overlay.style.display = 'flex';
    main.appendChild(overlay);

    // The overlay-exception CSS rule gives it display:flex !important
    expect(window.getComputedStyle(overlay).display).toBe('flex');
  });

  it('nothing is hidden when neither class is set', () => {
    // No classes added — baseline: nothing hidden
    expect(window.getComputedStyle(document.getElementById('feed-unit-0')!).display).not.toBe(
      'none'
    );
    expect(window.getComputedStyle(document.getElementById('stories')!).display).not.toBe('none');
    expect(window.getComputedStyle(document.getElementById('right-rail')!).display).not.toBe(
      'none'
    );
    expect(window.getComputedStyle(document.getElementById('reel-post')!).display).not.toBe('none');
  });
});
