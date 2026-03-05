import { describe, it, expect } from 'vitest';
import { getPageContext } from '../page-context';

describe('getPageContext', () => {
  it('returns "home" for root path', () => {
    expect(getPageContext('/')).toBe('home');
  });

  it('returns "home" for /home', () => {
    expect(getPageContext('/home')).toBe('home');
    expect(getPageContext('/home/')).toBe('home');
  });

  it('returns "groups" for /groups paths', () => {
    expect(getPageContext('/groups')).toBe('groups');
    expect(getPageContext('/groups/123456')).toBe('groups');
    expect(getPageContext('/groups/feed')).toBe('groups');
  });

  it('returns "marketplace" for /marketplace paths', () => {
    expect(getPageContext('/marketplace')).toBe('marketplace');
    expect(getPageContext('/marketplace/item/123')).toBe('marketplace');
  });

  it('returns "messages" for /messages paths', () => {
    expect(getPageContext('/messages')).toBe('messages');
    expect(getPageContext('/messages/t/123')).toBe('messages');
  });

  it('returns "watch" for /watch paths', () => {
    expect(getPageContext('/watch')).toBe('watch');
    expect(getPageContext('/watch/')).toBe('watch');
    expect(getPageContext('/watch/?ref=tab')).toBe('watch');
  });

  it('returns "watch" for /reel paths', () => {
    expect(getPageContext('/reel/12345')).toBe('watch');
  });

  it('returns "other" for unrecognized paths', () => {
    expect(getPageContext('/profile')).toBe('other');
    expect(getPageContext('/events')).toBe('other');
    expect(getPageContext('/notifications')).toBe('other');
  });
});
