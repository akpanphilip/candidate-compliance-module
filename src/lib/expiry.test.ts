import { describe, expect, it } from 'vitest';
import { isExpiringSoon } from './utils';

describe('isExpiringSoon', () => {
  it('returns true when a document expires within 30 days', () => {
    const today = new Date();
    const soon = new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000);

    expect(isExpiringSoon(soon, 30)).toBe(true);
  });

  it('returns false when expiry is beyond 30 days', () => {
    const today = new Date();
    const later = new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000);

    expect(isExpiringSoon(later, 30)).toBe(false);
  });

  it('returns true for today', () => {
    const today = new Date();
    expect(isExpiringSoon(today, 30)).toBe(true);
  });
});
