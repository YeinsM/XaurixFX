import { describe, expect, it } from 'vitest';
import { parseReferralUrl } from './broker';

describe('referral link', () => {
  it('accepts an https link and returns it normalized', () => {
    expect(parseReferralUrl(' https://www.puprime.com/register?ref=ABC123 ')).toBe('https://www.puprime.com/register?ref=ABC123');
  });

  it('is absent when not configured', () => {
    expect(parseReferralUrl(undefined)).toBeNull();
    expect(parseReferralUrl('')).toBeNull();
  });

  it('rejects non-https and script schemes', () => {
    for (const bad of ['http://puprime.com/x', 'javascript:alert(1)', 'data:text/html,hi', '//puprime.com/x', 'not a url']) {
      expect(parseReferralUrl(bad)).toBeNull();
    }
  });

  it('rejects links with embedded credentials', () => {
    expect(parseReferralUrl('https://user:pass@puprime.com/x')).toBeNull();
  });
});
