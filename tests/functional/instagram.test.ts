/**
 * Functional tests for Instagram CSS hiding rules.
 * Uses the generated CSS from buildIgCss().
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { buildIgCss } from '../../lib/selectors/instagram';

const FIXTURE = readFileSync(resolve(__dirname, '../fixtures/instagram.html'), 'utf-8');

const EXTENSION_CSS = buildIgCss();

function setup() {
  document.documentElement.innerHTML = '';
  document.write(FIXTURE);
  const style = document.createElement('style');
  style.textContent = EXTENSION_CSS;
  document.head.appendChild(style);
}

describe('Instagram — extension CSS against real fixture', () => {
  beforeEach(setup);

  it('hides home feed articles when active class is set', () => {
    document.documentElement.classList.add('feedfree-ig-active');
    expect(window.getComputedStyle(document.getElementById('post-1')!).display).toBe('none');
    expect(window.getComputedStyle(document.getElementById('post-2')!).display).toBe('none');
  });

  it('does NOT hide articles without the active class', () => {
    expect(window.getComputedStyle(document.getElementById('post-1')!).display).not.toBe('none');
  });

  it('does NOT hide the sidebar (not inside main article)', () => {
    document.documentElement.classList.add('feedfree-ig-active');
    // sidebar is an <aside>, not inside main[role="main"] article
    expect(window.getComputedStyle(document.getElementById('sidebar')!).display).not.toBe('none');
  });

  it('hides explore page main content when on explore route', () => {
    document.documentElement.classList.add('feedfree-ig-active');
    document.documentElement.setAttribute('data-feedfree-ig-page', 'explore');

    // Inject an explore-style div into main to test that rule
    const main = document.querySelector('main[role="main"]')!;
    const exploreDiv = document.createElement('div');
    exploreDiv.id = 'explore-content';
    main.appendChild(exploreDiv);

    expect(window.getComputedStyle(exploreDiv).display).toBe('none');
  });

  it('does NOT hide main content on explore route when class is absent', () => {
    document.documentElement.setAttribute('data-feedfree-ig-page', 'explore');

    const main = document.querySelector('main[role="main"]')!;
    const exploreDiv = document.createElement('div');
    main.appendChild(exploreDiv);

    expect(window.getComputedStyle(exploreDiv).display).not.toBe('none');
  });
});
