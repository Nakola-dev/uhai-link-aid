/** Translate Supabase Auth errors into plain, actionable language. */
export function describeAuthError(error: unknown, fallback: string): string {
  const message = error instanceof Error ? error.message : '';
  const text = message.toLowerCase();

  if (!navigator.onLine) return "You're offline. Reconnect and try again.";
  if (text.includes('invalid login credentials')) return 'That email and password don\'t match. Check them and try again.';
  if (text.includes('email not confirmed')) return 'Please confirm your email first — check your inbox for the link we sent.';
  if (text.includes('already registered') || text.includes('already exists')) {
    return 'An account with this email already exists. Sign in instead, or reset your password.';
  }
  if (text.includes('password should be') || text.includes('weak password')) {
    return 'That password is too weak. Use at least 8 characters with an uppercase letter, a number and a symbol.';
  }
  if (text.includes('same password') || text.includes('different from the old')) {
    return 'Choose a password you haven\'t used before.';
  }
  if (text.includes('rate limit') || text.includes('security purposes') || text.includes('too many')) {
    return 'Too many attempts. Please wait a minute and try again.';
  }
  if (text.includes('failed to fetch') || text.includes('network')) {
    return 'We couldn\'t reach UhaiLink. Check your connection and try again.';
  }
  return message || fallback;
}
