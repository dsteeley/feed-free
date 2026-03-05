import { describe, it, expect } from 'vitest';
import { getRemainingMs, isAccessOpen } from '../platform-utils';

describe('getRemainingMs', () => {
  it('returns 0 when endTime is 0 (no active cooldown)', () => {
    expect(getRemainingMs(0)).toBe(0);
  });

  it('returns remaining ms when cooldown is in progress', () => {
    const fakeNow = 1_000_000;
    const endTime = fakeNow + 3 * 60 * 1000; // expires 3 min from now
    expect(getRemainingMs(endTime, fakeNow)).toBe(3 * 60 * 1000);
  });

  it('returns 0 when cooldown has already expired', () => {
    const fakeNow = 1_000_000;
    const endTime = fakeNow - 1000; // expired 1s ago
    expect(getRemainingMs(endTime, fakeNow)).toBe(0);
  });

  it('returns 0 at exactly the expiry moment', () => {
    const fakeNow = 1_000_000;
    expect(getRemainingMs(fakeNow, fakeNow)).toBe(0);
  });
});

describe('isAccessOpen', () => {
  it('returns false when openUntil is 0', () => {
    expect(isAccessOpen(0)).toBe(false);
  });

  it('returns true when current time is before openUntil', () => {
    const future = Date.now() + 60_000;
    expect(isAccessOpen(future)).toBe(true);
  });

  it('returns false when current time is after openUntil', () => {
    const past = Date.now() - 1000;
    expect(isAccessOpen(past)).toBe(false);
  });

  it('accepts custom now parameter', () => {
    const fakeNow = 1_000_000;
    expect(isAccessOpen(fakeNow + 1, fakeNow)).toBe(true);
    expect(isAccessOpen(fakeNow - 1, fakeNow)).toBe(false);
    expect(isAccessOpen(fakeNow, fakeNow)).toBe(false); // boundary: not strictly >
  });
});
