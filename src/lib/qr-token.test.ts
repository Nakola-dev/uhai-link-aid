import { describe, expect, it } from 'vitest';
import { generateQrAccessToken, qrProfileUrl } from './qr-token';

describe('generateQrAccessToken', () => {
  it('produces 22-character URL-safe tokens', () => {
    const token = generateQrAccessToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]{22}$/);
  });

  it('does not repeat across many generations', () => {
    const tokens = new Set(Array.from({ length: 5000 }, generateQrAccessToken));
    expect(tokens.size).toBe(5000);
  });

  it('builds the public responder URL', () => {
    expect(qrProfileUrl('abc', 'https://uhailink.com')).toBe('https://uhailink.com/profile/abc');
  });
});
