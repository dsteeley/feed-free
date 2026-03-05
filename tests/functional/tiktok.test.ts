/**
 * Functional tests for TikTok CSS hiding rules.
 * Uses the generated CSS from buildTtCss().
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { buildTtCss } from '../../lib/selectors/tiktok';

const FIXTURE = readFileSync(resolve(__dirname, '../fixtures/tiktok.html'), 'utf-8');

const EXTENSION_CSS = buildTtCss();

function setup() {
  document.documentElement.innerHTML = '';
  document.write(FIXTURE);
  const style = document.createElement('style');
  style.textContent = EXTENSION_CSS;
  document.head.appendChild(style);
}

describe('TikTok — extension CSS against real fixture', () => {
  beforeEach(setup);

  it('hides For You feed items when active class is set', () => {
    document.documentElement.classList.add('feedfree-tt-active');

    expect(window.getComputedStyle(document.getElementById('foryou-item-1')!).display).toBe('none');
    expect(window.getComputedStyle(document.getElementById('foryou-item-2')!).display).toBe('none');
  });

  it('hides sidebar user cells when active class is set', () => {
    document.documentElement.classList.add('feedfree-tt-active');

    expect(window.getComputedStyle(document.getElementById('sidebar-user-1')!).display).toBe(
      'none'
    );
  });

  it('does NOT hide anything without the active class', () => {
    expect(window.getComputedStyle(document.getElementById('foryou-item-1')!).display).not.toBe(
      'none'
    );
    expect(window.getComputedStyle(document.getElementById('sidebar-user-1')!).display).not.toBe(
      'none'
    );
  });

  it('hides explore page content when on explore route', () => {
    document.documentElement.classList.add('feedfree-tt-active');
    document.documentElement.setAttribute('data-feedfree-tt-page', 'explore');

    const exploreItem = document.createElement('div');
    exploreItem.setAttribute('data-e2e', 'search-common-container');
    exploreItem.id = 'explore-item';
    document.body.appendChild(exploreItem);

    expect(window.getComputedStyle(exploreItem).display).toBe('none');
  });

  it('does NOT hide explore content on home route (wrong page)', () => {
    document.documentElement.classList.add('feedfree-tt-active');
    document.documentElement.setAttribute('data-feedfree-tt-page', 'home');

    const exploreItem = document.createElement('div');
    exploreItem.setAttribute('data-e2e', 'search-common-container');
    document.body.appendChild(exploreItem);

    // explore CSS rule requires data-feedfree-tt-page="explore"
    expect(window.getComputedStyle(exploreItem).display).not.toBe('none');
  });
});
