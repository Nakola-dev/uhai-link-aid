import { supabase } from '@/integrations/supabase/client';

export const CONSENT_VERSION = '1.0.0';
export const REQUIRED_CONSENTS = ['terms_of_service', 'privacy_policy', 'medical_data_processing'] as const;

/**
 * Consent is given before an account (and therefore an RLS-authorised session) exists —
 * e.g. when email confirmation is required or the user leaves for Google sign-in.
 * The decision is held locally (flags and a timestamp only, no personal data) and
 * written to user_consents as soon as a session is available.
 */
const PENDING_KEY = 'uhailink.pending-consent';

interface PendingConsent {
  version: string;
  grantedAt: string;
}

export function storePendingConsent(): void {
  try {
    const pending: PendingConsent = { version: CONSENT_VERSION, grantedAt: new Date().toISOString() };
    localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
  } catch {
    // Storage blocked — onboarding will ask for consent again.
  }
}

function readPendingConsent(): PendingConsent | null {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    return raw ? (JSON.parse(raw) as PendingConsent) : null;
  } catch {
    return null;
  }
}

export function clearPendingConsent(): void {
  try {
    localStorage.removeItem(PENDING_KEY);
  } catch {
    // ignore
  }
}

/** Insert one granted record per required consent type. Throws on any failure. */
export async function recordConsents(userId: string, grantedAt = new Date().toISOString()): Promise<void> {
  const { error } = await supabase.from('user_consents').insert(
    REQUIRED_CONSENTS.map((consent_type) => ({
      user_id: userId,
      consent_type,
      consent_version: CONSENT_VERSION,
      granted: true,
      granted_at: grantedAt,
      user_agent: navigator.userAgent,
    }))
  );
  if (error) throw error;
}

export async function hasRequiredConsents(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_consents')
    .select('consent_type')
    .eq('user_id', userId)
    .eq('consent_version', CONSENT_VERSION)
    .eq('granted', true)
    .is('revoked_at', null);
  if (error) throw error;
  const granted = new Set((data ?? []).map((row) => row.consent_type));
  return REQUIRED_CONSENTS.every((type) => granted.has(type));
}

/** Write a locally held consent decision, if any. Returns true when consent is now on record. */
export async function syncPendingConsent(userId: string): Promise<boolean> {
  const pending = readPendingConsent();
  if (!pending || pending.version !== CONSENT_VERSION) return false;
  await recordConsents(userId, pending.grantedAt);
  clearPendingConsent();
  return true;
}
