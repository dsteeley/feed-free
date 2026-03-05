/**
 * Functional tests for Twitter/X CSS hiding rules.
 * Uses the generated CSS from buildTwCss().
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { buildTwCss } from '../../lib/selectors/twitter';

const FIXTURE = readFileSync(resolve(__dirname, '../fixtures/twitter.html'), 'utf-8');

const EXTENSION_CSS = buildTwCss();

function setup() {
  document.documentElement.innerHTML = '';
  document.write(FIXTURE);
  const style = document.createElement('style');
  style.textContent = EXTENSION_CSS;
  document.head.appendChild(style);
}

describe('Twitter/X — extension CSS against real fixture', () => {
  beforeEach(setup);

  it('hides For You timeline tweets when on foryou tab', () => {
    document.documentElement.classList.add('feedfree-tw-active');
    document.documentElement.setAttribute('data-feedfree-tw-tab', 'foryou');

    expect(window.getComputedStyle(document.getElementById('tweet-1')!).display).toBe('none');
    expect(window.getComputedStyle(document.getElementById('tweet-2')!).display).toBe('none');
  });

  it('does NOT hide tweets when on following tab', () => {
    document.documentElement.classList.add('feedfree-tw-active');
    document.documentElement.setAttribute('data-feedfree-tw-tab', 'following');

    expect(window.getComputedStyle(document.getElementById('tweet-1')!).display).not.toBe('none');
  });

  it('does NOT hide tweets without the active class', () => {
    document.documentElement.setAttribute('data-feedfree-tw-tab', 'foryou');
    expect(window.getComputedStyle(document.getElementById('tweet-1')!).display).not.toBe('none');
  });

  it('hides trending topics in sidebar', () => {
    document.documentElement.classList.add('feedfree-tw-active');
    document.documentElement.setAttribute('data-feedfree-tw-tab', 'foryou');

    expect(window.getComputedStyle(document.getElementById('trend-1')!).display).toBe('none');
  });

  it('hides Who to Follow suggestions in sidebar', () => {
    document.documentElement.classList.add('feedfree-tw-active');
    document.documentElement.setAttribute('data-feedfree-tw-tab', 'foryou');

    expect(window.getComputedStyle(document.getElementById('who-to-follow-1')!).display).toBe(
      'none'
    );
  });

  it('hides promoted tweets', () => {
    document.documentElement.classList.add('feedfree-tw-active');
    document.documentElement.setAttribute('data-feedfree-tw-tab', 'foryou');

    expect(window.getComputedStyle(document.getElementById('promoted-tweet')!).display).toBe(
      'none'
    );
  });

  it('hides nothing without the active class', () => {
    expect(window.getComputedStyle(document.getElementById('tweet-1')!).display).not.toBe('none');
    expect(window.getComputedStyle(document.getElementById('trend-1')!).display).not.toBe('none');
    expect(window.getComputedStyle(document.getElementById('who-to-follow-1')!).display).not.toBe(
      'none'
    );
  });
});
