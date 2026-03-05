import { describe, it, expect, beforeEach } from 'vitest';
import { tagReelAncestors } from '../reel-tagger';

describe('tagReelAncestors', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('tags an article ancestor of a /watch link', () => {
    document.body.innerHTML = `
      <div role="article" id="post">
        <div><a href="https://facebook.com/watch/123">Watch</a></div>
      </div>
    `;
    tagReelAncestors(document.body);
    expect(document.getElementById('post')!.getAttribute('data-fbfocus-reel')).toBe('true');
  });

  it('tags an article ancestor of a /reel link', () => {
    document.body.innerHTML = `
      <div role="article" id="post">
        <a href="https://facebook.com/reel/456">Reel</a>
      </div>
    `;
    tagReelAncestors(document.body);
    expect(document.getElementById('post')!.getAttribute('data-fbfocus-reel')).toBe('true');
  });

  it('does not tag elements without an article ancestor', () => {
    document.body.innerHTML = `
      <nav id="nav">
        <a href="https://facebook.com/watch/?ref=tab">Watch</a>
      </nav>
    `;
    tagReelAncestors(document.body);
    expect(document.getElementById('nav')!.hasAttribute('data-fbfocus-reel')).toBe(false);
  });

  it('does not tag articles without watch/reel links', () => {
    document.body.innerHTML = `
      <div role="article" id="post">
        <a href="https://facebook.com/groups/123">Group post</a>
      </div>
    `;
    tagReelAncestors(document.body);
    expect(document.getElementById('post')!.hasAttribute('data-fbfocus-reel')).toBe(false);
  });

  it('tags multiple articles independently', () => {
    document.body.innerHTML = `
      <div role="article" id="reel1">
        <a href="/watch/1">Watch 1</a>
      </div>
      <div role="article" id="normal">
        <a href="/groups/1">Normal</a>
      </div>
      <div role="article" id="reel2">
        <a href="/reel/2">Reel 2</a>
      </div>
    `;
    tagReelAncestors(document.body);
    expect(document.getElementById('reel1')!.getAttribute('data-fbfocus-reel')).toBe('true');
    expect(document.getElementById('normal')!.hasAttribute('data-fbfocus-reel')).toBe(false);
    expect(document.getElementById('reel2')!.getAttribute('data-fbfocus-reel')).toBe('true');
  });
});
