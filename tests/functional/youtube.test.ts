/**
 * Functional tests for YouTube CSS hiding rules.
 * Uses the generated CSS from buildYtCss().
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { buildYtCss } from '../../lib/selectors/youtube';

const FIXTURE = readFileSync(resolve(__dirname, '../fixtures/youtube.html'), 'utf-8');

const EXTENSION_CSS = buildYtCss();

function setup() {
  document.documentElement.innerHTML = '';
  document.write(FIXTURE);
  const style = document.createElement('style');
  style.textContent = EXTENSION_CSS;
  document.head.appendChild(style);
}

describe('YouTube — extension CSS against real fixture', () => {
  beforeEach(setup);

  it('hides feed grid when active class is set', () => {
    document.documentElement.classList.add('feedfree-yt-active');
    expect(window.getComputedStyle(document.getElementById('feed-grid')!).display).toBe('none');
  });

  it('hides individual feed items when active class is set', () => {
    document.documentElement.classList.add('feedfree-yt-active');
    expect(window.getComputedStyle(document.getElementById('feed-item-1')!).display).toBe('none');
    expect(window.getComputedStyle(document.getElementById('feed-item-2')!).display).toBe('none');
  });

  it('hides watch sidebar (#secondary) when active class is set', () => {
    document.documentElement.classList.add('feedfree-yt-active');
    expect(window.getComputedStyle(document.getElementById('secondary')!).display).toBe('none');
  });

  it('hides shorts shelf when active class is set', () => {
    document.documentElement.classList.add('feedfree-yt-active');
    expect(window.getComputedStyle(document.getElementById('shorts-shelf')!).display).toBe('none');
  });

  it('hides autoplay next when active class is set', () => {
    document.documentElement.classList.add('feedfree-yt-active');
    expect(window.getComputedStyle(document.getElementById('autoplay-next')!).display).toBe('none');
  });

  it('hides end screens when active class is set', () => {
    document.documentElement.classList.add('feedfree-yt-active');
    expect(window.getComputedStyle(document.getElementById('end-screens')!).display).toBe('none');
  });

  it('hides nothing without the active class', () => {
    expect(window.getComputedStyle(document.getElementById('feed-grid')!).display).not.toBe('none');
    expect(window.getComputedStyle(document.getElementById('secondary')!).display).not.toBe('none');
    expect(window.getComputedStyle(document.getElementById('shorts-shelf')!).display).not.toBe(
      'none'
    );
  });

  it('overlay div remains visible when active class is set', () => {
    document.documentElement.classList.add('feedfree-yt-active');
    const overlay = document.createElement('div');
    overlay.setAttribute('data-feedfree-overlay', 'true');
    overlay.style.display = 'flex';
    document.body.appendChild(overlay);
    expect(window.getComputedStyle(overlay).display).toBe('flex');
  });
});
