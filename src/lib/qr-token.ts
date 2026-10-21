/**
 * QR access tokens are bearer credentials for a user's emergency profile,
 * so they must be unguessable and must not embed any user identifier.
 *
 * 16 random bytes (128 bits) encoded as base64url → 22 characters.
 * The short length keeps the QR code low-density and easy to scan.
 */
export function generateQrAccessToken(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Public URL a responder opens after scanning the QR code. */
export function qrProfileUrl(token: string, origin: string = window.location.origin): string {
  return `${origin}/profile/${token}`;
}
